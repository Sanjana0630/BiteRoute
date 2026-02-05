from rest_framework.decorators import api_view
from rest_framework.response import Response
import os
import requests
import uuid
from django.conf import settings
from dotenv import load_dotenv
from .utils.pdf_receipt import generate_receipt_pdf
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import permission_classes, authentication_classes
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny, IsAuthenticated
from .authentication import JWTAuthentication
from django.core.mail import EmailMessage
from .models import User, Hotel, HotelOwner,Food,FoodMenu,CartItem,Cart,Order,OrderItem
from .serializers import (
    UserSerializer, HotelSerializer, HotelOwnerSerializer,
    FoodSerializer,FoodMenuSerializer,CartItemSerializer,CartSerializer,
    OrderSerializer, OrderItemSerializer
)
from .auth_utils import hash_password, check_password, generate_token


# ================= ADMIN =================

@api_view(["POST"])
def admin_login(request):
    contact = request.data.get("contact")
    password = request.data.get("password")

    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not contact or not password:
        return Response({"message": "All fields are required"}, status=400)

    if contact == admin_email and password == admin_password:
        token = generate_token(0, "admin") # 0 as dummy ID for admin
        return Response({
            "message": "Admin login successful",
            "role": "admin",
            "token": token
        })

    return Response({"message": "Invalid admin credentials"}, status=401)


@api_view(["GET"])
def admin_dashboard_counts(request):
    total = Hotel.objects.count()
    approved = Hotel.objects.filter(approved=True, rejected=False).count()
    pending = Hotel.objects.filter(approved=False, rejected=False).count()
    rejected = Hotel.objects.filter(rejected=True).count()

    return Response({
        "total": total,
        "approved": approved,
        "pending": pending,
        "rejected": rejected,
    })


@api_view(["GET"])
def admin_pending_hotels(request):
    hotels = Hotel.objects.filter(approved=False, rejected=False)
    serializer = HotelSerializer(hotels, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def admin_approved_hotels(request):
    hotels = Hotel.objects.filter(approved=True, rejected=False)
    serializer = HotelSerializer(hotels, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def admin_rejected_hotels(request):
    hotels = Hotel.objects.filter(rejected=True)
    serializer = HotelSerializer(hotels, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def admin_all_hotels(request):
    hotels = Hotel.objects.all()
    serializer = HotelSerializer(hotels, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def approve_hotel(request):
    hotel_id = request.data.get("hotel_id")

    if not hotel_id:
        return Response({"message": "Hotel ID is required"}, status=400)

    try:
        hotel = Hotel.objects.get(id=hotel_id)
        hotel.approved = True
        hotel.rejected = False
        hotel.save()

        return Response({"message": "Hotel approved ✅"})
    except Hotel.DoesNotExist:
        return Response({"message": "Hotel not found"}, status=404)


@api_view(["POST"])
def reject_hotel(request):
    hotel_id = request.data.get("hotel_id")

    if not hotel_id:
        return Response({"message": "Hotel ID is required"}, status=400)

    try:
        hotel = Hotel.objects.get(id=hotel_id)
        hotel.rejected = True
        hotel.approved = False
        hotel.save()

        return Response({"message": "Hotel rejected ❌"})
    except Hotel.DoesNotExist:
        return Response({"message": "Hotel not found"}, status=404)


@api_view(["POST"])
def delete_hotel(request):
    hotel_id = request.data.get("hotel_id")

    if not hotel_id:
        return Response({"message": "Hotel ID is required"}, status=400)

    try:
        hotel = Hotel.objects.get(id=hotel_id)
        hotel.delete()

        return Response({"message": "Hotel deleted 🗑️"})
    except Hotel.DoesNotExist:
        return Response({"message": "Hotel not found"}, status=404)


# ================= USER =================

@api_view(["POST"])
def register(request):
    data = request.data.copy()
    if 'password' in data:
        data['password'] = hash_password(data['password'])
        
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully"})
    return Response(serializer.errors, status=400)


@api_view(["POST"])
def login(request):
    contact = request.data.get("contact")
    password = request.data.get("password")

    if not contact or not password:
        return Response({"message": "All fields are required"}, status=400)

    try:
        user = User.objects.get(contact=contact)
        
        # Check password (hashed)
        if not check_password(password, user.password):
            return Response({"message": "Invalid credentials"}, status=401)
            
        token = generate_token(user.id, "user")
            
        return Response({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "contact": user.contact
            }
        })
    except User.DoesNotExist:
        return Response({"message": "Invalid credentials"}, status=401)


# ================= HOTEL OWNER =================

@api_view(["POST"])
def hotel_owner_signup(request):
    data = request.data.copy()
    if 'password' in data:
        data['password'] = hash_password(data['password'])
    
    serializer = HotelOwnerSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Hotel owner account created successfully"},
            status=201
        )

    return Response(serializer.errors, status=400)


@api_view(["POST"])
def hotel_login(request):
    contact = request.data.get("contact")
    password = request.data.get("password")

    if not contact or not password:
        return Response({"message": "All fields are required"}, status=400)

    try:
        owner = HotelOwner.objects.get(contact=contact)
        
        if not check_password(password, owner.password):
            return Response({"message": "Invalid credentials"}, status=401)

        token = generate_token(owner.id, "owner")

        return Response({
            "message": "Login successful",
            "token": token,
            "owner": {
                "id": owner.id,
                "username": owner.username,
                "contact": owner.contact
            }
        })

    except HotelOwner.DoesNotExist:
        return Response({"message": "Invalid credentials"}, status=401)



# ================= COMMON LOGIN =================

@api_view(["POST"])
@permission_classes([AllowAny])
def common_login(request):
    contact = request.data.get("contact")
    password = request.data.get("password")

    if not contact or not password:
        return Response({"message": "All fields are required"}, status=400)

    # 1. Check Admin
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    

    if contact == admin_email and password == admin_password:
        token = generate_token(999, "admin")  # Generate token for admin
        return Response({
            "message": "Admin login successful",
            "role": "admin",
            "token": token,
            "user": {"name": "Admin", "id": 999}
        })

    # 2. Check User
    try:
        # Case insensitive contact match
        user = User.objects.get(contact__iexact=contact)
        
        # Verify password (hashed)
        # Assuming plain text check first based on previous D: drive code, 
        # BUT C: drive code uses hash_password/check_password.
        # Let's check if password matches hashed.
        if check_password(password, user.password):
             token = generate_token(user.id, "user")
             return Response({
                "message": "Login successful",
                "role": "user",
                "token": token,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "contact": user.contact
                }
            })
        print("❌ User found but password mismatch")
        
    except User.DoesNotExist:
        print("❌ User not found")
        pass

    # 3. Check Hotel Owner
    try:
        owner = HotelOwner.objects.get(contact__iexact=contact)
        
        if check_password(password, owner.password):
            token = generate_token(owner.id, "owner")
            return Response({
                "message": "Login successful",
                "role": "hotel",
                "token": token,
                "owner": {
                    "id": owner.id,
                    "username": owner.username,
                    "contact": owner.contact
                }
            })
        print("❌ HotelOwner found but password mismatch")

    except HotelOwner.DoesNotExist:
        print("❌ HotelOwner not found")
        pass

    return Response({"message": "Invalid credentials found"}, status=401)


# ================= HOTEL DETAILS (Register hotel for approval) =================


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def add_hotel_details(request):
    # owner_id retrieval from data is removed as we use the authenticated user
    if not isinstance(request.user, HotelOwner):
        return Response({"message": "Only hotel owners can register hotel details"}, status=403)
    
    owner = request.user

    Hotel.objects.create(
        owner=owner,   # 🔥 MOST IMPORTANT LINE
        hotel_name=request.data["hotel_name"],
        location=request.data["location"],
        food_type=request.data["food_type"],
        open_time=request.data["open_time"],
        close_time=request.data["close_time"],
        description=request.data.get("description", "")
    )

    return Response({"message": "Hotel registered successfully"})


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def hotel_count(request):
    # ✅ Use request.user directly (more secure than owner_id from params)
    count = Hotel.objects.filter(owner=request.user).count()
    return Response({"count": count})

# ✅ Search hotel names for suggestions (typeahead)
@api_view(["GET"])
def search_hotel(request):
    query = request.GET.get("q", "")

    if len(query) < 1:
        return Response([])

    hotels = Hotel.objects.filter(hotel_name__icontains=query)[:10]

    data = []
    for h in hotels:
        status = "approved" if h.approved and not h.rejected else "rejected" if h.rejected else "pending"

        data.append({
            "id": h.id,
            "hotel_name": h.hotel_name,
            "status": status
        })

    return Response(data)


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def check_hotel_status(request):
    hotel_name = request.GET.get("hotel_name", "").strip()

    if not hotel_name:
        return Response(
            {"status": "error", "message": "Hotel name is required"},
            status=400
        )

    try:
        # ✅ Ensure it belongs to the logged-in owner
        hotel = Hotel.objects.get(hotel_name__iexact=hotel_name, owner=request.user)

        if hotel.rejected:
            return Response({
                "status": "rejected",
                "message": "❌ Hotel rejected by admin"
            })

        if hotel.approved:
            return Response({
                "status": "approved",
                "message": "✅ Your hotel is approved by admin"
            })

        return Response({
            "status": "pending",
            "message": "⏳ Your hotel approval is pending"
        })

    except Hotel.DoesNotExist:
        return Response({
            "status": "not_found",
            "message": "Hotel not found. Please register your hotel first"
        }, status=404)


#to add food item
@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def add_food(request):
    hotel_name = request.data.get("hotel_name")
    category = request.data.get("category")
    food_name = request.data.get("food_name")
    price = request.data.get("price")
    description = request.data.get("description", "")

    # ✅ Validation
    if not hotel_name or not category or not food_name or price in [None, ""]:
        return Response({"message": "All fields are required"}, status=400)

    # ✅ Convert price to number
    try:
        price = int(price)
    except:
        return Response({"message": "Price must be a number"}, status=400)

    # ✅ Hotel must exist, belong to owner, and be approved
    try:
        hotel = Hotel.objects.get(hotel_name__iexact=hotel_name, owner=request.user)
    except Hotel.DoesNotExist:
        return Response({"message": "Hotel not found or you don't have permission"}, status=404)

    if hotel.approved == False:
        return Response({"message": "Hotel is not approved yet"}, status=403)

    # ✅ Save Food in DB
    food = Food.objects.create(
        hotel=hotel,
        category=category,
        food_name=food_name,
        price=price,
        description=description
    )

    return Response(
        {"message": "Food added successfully ✅", "food_id": food.id},
        status=201
    )

#to serach food item
@api_view(["GET"])
def user_search_food(request):
    food_type = request.GET.get("type")
    food_name = request.GET.get("food")
    location = request.GET.get("location")

    if not food_type or not food_name or not location:
        return Response({"message": "type, food, location required"}, status=400)

    # ✅ only approved hotels + location match
    hotels = Hotel.objects.filter(
        approved=True,
        rejected=False,
        location__icontains=location
    )

    results = []

    for hotel in hotels:
        foods = Food.objects.filter(
            hotel=hotel,
            category__iexact=food_type,      # ✅ category is your type
            food_name__icontains=food_name
        )

        for f in foods:
            results.append({
                "food_id": f.id,                 # 🔥 ADD THIS
                "hotel_id": hotel.id,
                "hotel_name": hotel.hotel_name,
                "location": hotel.location,
                "food_name": f.food_name,
                "food_type": f.category,      # ✅ show category
                "price": f.price,
                "description": f.description,
            })

    return Response(results, status=200)

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    user_id = request.data.get("user_id")
    food_id = request.data.get("food_id")

    if not user_id or not food_id:
        return Response({"message": "user_id and food_id required"}, status=400)

    # get user cart or create
    cart, created = Cart.objects.get_or_create(user_id=user_id)

    # check if item already exists
    item = CartItem.objects.filter(cart=cart, food_id=food_id).first()

    if item:
        item.quantity += 1
        item.save()
    else:
        CartItem.objects.create(cart=cart, food_id=food_id, quantity=1)

    return Response({"message": "Added to cart ✅"})


# ✅ Get cart items
@api_view(["GET"])
def get_cart(request, user_id):
    cart = Cart.objects.filter(user_id=user_id).first()

    if not cart:
        return Response({"items": []})

    serializer = CartSerializer(cart)
    return Response(serializer.data)


# ✅ Update quantity
@api_view(["POST"])
def update_cart_item(request):
    item_id = request.data.get("item_id")
    quantity = request.data.get("quantity")

    try:
        item = CartItem.objects.get(id=item_id)
        item.quantity = quantity
        item.save()
        return Response({"message": "Updated ✅"})
    except CartItem.DoesNotExist:
        return Response({"message": "Item not found"}, status=404)


# ✅ Remove item
@api_view(["POST"])
def remove_cart_item(request):
    item_id = request.data.get("item_id")

    try:
        CartItem.objects.get(id=item_id).delete()
        return Response({"message": "Removed ✅"})
    except CartItem.DoesNotExist:
        return Response({"message": "Item not found"}, status=404)


def send_email_in_background(email_obj):
    email_obj.send()
    
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def send_receipt_to_email(request):
    try:
        order = request.data
        user_id = order.get("user_id")

        if not user_id:
            return Response({"message": "user_id required"}, status=400)

        # Get user
        user = User.objects.get(id=user_id)
        registered_email = user.contact

        pdf_path = generate_receipt_pdf({
            "order_id": f"BR-{user_id}",
            "name": order["name"],
            "email": registered_email,
            "mobile": order["mobile"],
            "address": order["address"],
            "payment_method": order["payment_method"],
            "total": order["total"],
            "items": order["items"],
        })

        email = EmailMessage(
            subject="BiteRoute Order Receipt 🍽️",
            body=(
                f"Hello {order['name']},\n\n"
                "Thank you for ordering with BiteRoute.\n"
                "Your receipt is attached.\n\n"
                "Happy eating! 🍕"
            ),
            to=[registered_email],
        )

        email.attach_file(pdf_path)
        email.send()

        return Response({
            "status": True,
            "message": "Receipt sent to registered email"
        })

    except Exception as e:
        print("❌ ERROR:", str(e))
        return Response(
            {"message": "Failed to send receipt"},
            status=500
        )


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def my_hotels(request):
    # ✅ Use request.user directly
    hotels = Hotel.objects.filter(owner=request.user)
    serializer = HotelSerializer(hotels, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def cashfree_create_order(request):
    amount = request.data.get("amount")

    if not amount:
        return Response(
            {"status": False, "message": "Amount required"},
            status=400
        )

    order_id = f"BR_TEST_{uuid.uuid4().hex[:8]}"

    return Response({
        "status": True,
        "order_id": order_id,
        "payment_status": "SUCCESS",
        "mode": "TEST"
    })


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_hotel_food_items(request, hotel_id):
    try:
        hotel = Hotel.objects.get(id=hotel_id, owner=request.user)
        
        if hotel.rejected:
            return Response({"message": "❌ Hotel rejected by admin"}, status=403)

        if not hotel.approved:
            return Response({"message": "⏳ Your hotel approval is pending"}, status=403)
            
        foods = Food.objects.filter(hotel=hotel)
        serializer = FoodSerializer(foods, many=True)
        return Response({
            "hotel_name": hotel.hotel_name,
            "food_type": hotel.food_type,
            "foods": serializer.data
        })
    except Hotel.DoesNotExist:
        return Response({"message": "Hotel not found or permission denied"}, status=404)


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def place_order(request):
    try:
        data = request.data
        user = request.user
        
        # Create Order
        order = Order.objects.create(
            user=user,
            name=data["name"],
            mobile=data["mobile"],
            address=data["address"],
            payment_method=data["payment_method"],
            total_amount=float(data["total"])
        )
        
        # Create Order Items
        items = data["items"]
        for item in items:
            food = Food.objects.get(id=item["food_id"])
            OrderItem.objects.create(
                order=order,
                food=food,
                quantity=item["qty"],
                price_at_time=item["price"]
            )
            
        return Response({"status": True, "message": "Order saved to DB", "order_id": order.id})
    except Exception as e:
        print("❌ ERROR PLACING ORDER:", str(e))
        return Response({"status": False, "message": str(e)}, status=500)


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_hotel_analytics(request, hotel_id):
    from django.db.models import Sum, Count
    from django.db.models.functions import TruncMonth

    try:
        hotel = Hotel.objects.get(id=hotel_id, owner=request.user)
        
        # Get all order items for this hotel
        order_items = OrderItem.objects.filter(food__hotel=hotel)
        
        # Total Revenue
        total_revenue = order_items.aggregate(total=Sum('price_at_time'))['total'] or 0
        total_orders = order_items.values('order').distinct().count()
        total_items_sold = order_items.aggregate(total=Sum('quantity'))['total'] or 0
        
        # Monthly Revenue for Graph
        monthly_data = order_items.annotate(
            month=TruncMonth('order__created_at')
        ).values('month').annotate(
            revenue=Sum('price_at_time'),
            orders=Count('order', distinct=True)
        ).order_by('month')
        
        # Format monthly data for chart
        chart_data = []
        for entry in monthly_data:
            chart_data.append({
                "month": entry['month'].strftime("%b %Y"),
                "revenue": entry['revenue'],
                "orders": entry['orders']
            })
            
        # Best selling items
        best_sellers = order_items.values('food__food_name').annotate(
            sold_count=Sum('quantity')
        ).order_by('-sold_count')[:5]
        
        best_sellers_data = []
        for item in best_sellers:
            best_sellers_data.append({
                "name": item['food__food_name'],
                "sold": item['sold_count']
            })

        return Response({
            "hotel_name": hotel.hotel_name,
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "total_items_sold": total_items_sold,
            "chart_data": chart_data,
            "best_sellers": best_sellers_data
        })
    except Hotel.DoesNotExist:
        return Response({"message": "Hotel not found or permission denied"}, status=404)
    except Exception as e:
        print("❌ ERROR FETCHING ANALYTICS:", str(e))
        return Response({"status": False, "message": str(e)}, status=500)


@api_view(["DELETE"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_food(request, food_id):
    try:
        food = Food.objects.get(id=food_id)
        # Check if the hotel belongs to the logged-in owner
        if food.hotel.owner != request.user:
            return Response({"message": "Permission denied. You do not own this hotel."}, status=403)
        
        food.delete()
        return Response({"message": "Food item deleted successfully 🗑️"}, status=200)

    except Food.DoesNotExist:
        return Response({"message": "Food item not found"}, status=404)

