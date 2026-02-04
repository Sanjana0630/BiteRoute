from django.urls import path
from . import views 
from .views import hotel_count,send_receipt_to_email,my_hotels,cashfree_create_order

urlpatterns = [

    # USER
    path("users/register/", views.register),
    path("users/login/", views.login),
    path("user/search-food/", views.user_search_food),
    path("common/login/", views.common_login),


    # HOTEL OWNER AUTH
    path("hotels/signup/", views.hotel_owner_signup),
    path("hotels/login/", views.hotel_login),

    # HOTEL OWNER DASHBOARD
    path("hotel/count/", hotel_count),
    
    path("hotels/details/", views.add_hotel_details),
    path("hotels/search/", views.search_hotel),
    path("hotels/check-status/", views.check_hotel_status),
    path("hotel/my-hotels/", views.my_hotels),
    path("hotels/<int:hotel_id>/foods/", views.get_hotel_food_items),
    path("orders/place/", views.place_order),
    path("hotels/<int:hotel_id>/analytics/", views.get_hotel_analytics),

    # FOOD
    path("foods/add/", views.add_food),
    path("foods/<int:food_id>/delete/", views.delete_food),

    # ADMIN
    path("admin/login/", views.admin_login),
    path("admin/dashboard-counts/", views.admin_dashboard_counts),
    path("admin/pending-hotels/", views.admin_pending_hotels),
    path("admin/approved-hotels/", views.admin_approved_hotels),
    path("admin/rejected-hotels/", views.admin_rejected_hotels),
    path("admin/all-hotels/", views.admin_all_hotels),
    path("admin/approve-hotel/", views.approve_hotel),
    path("admin/reject-hotel/", views.reject_hotel),
    path("admin/delete-hotel/", views.delete_hotel),

    # CART
    path("cart/add/", views.add_to_cart),
    path("cart/<int:user_id>/", views.get_cart),
    path("cart/update/", views.update_cart_item),
    path("cart/remove/", views.remove_cart_item),

    path("send-receipt/", send_receipt_to_email),
    path(
    "cashfree/create-order/",
    cashfree_create_order,
    name="cashfree-create-order"
),
]
