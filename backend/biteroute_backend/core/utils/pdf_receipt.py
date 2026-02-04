from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from datetime import datetime
import os


def generate_receipt_pdf(order):
    """
    order = {
        order_id: str,
        name: str,
        email: str,
        mobile: str,
        address: str,
        payment_method: str,
        total: str,
        items: [
            { name: str, qty: int, price: float }
        ]
    }
    """

    # 📁 Create receipts folder if not exists
    os.makedirs("media/receipts", exist_ok=True)

    file_path = f"media/receipts/receipt_{order['order_id']}.pdf"

    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    # ================= HEADER =================
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width / 2, height - 50, "BiteRoute 🍽️")

    c.setFont("Helvetica", 12)
    c.drawCentredString(width / 2, height - 80, "Order Receipt")

    c.line(40, height - 95, width - 40, height - 95)

    # ================= ORDER INFO =================
    y = height - 130

    c.setFont("Helvetica", 10)
    c.drawString(40, y, f"Order ID: {order['order_id']}")
    c.drawRightString(
        width - 40,
        y,
        f"Date: {datetime.now().strftime('%d %b %Y, %I:%M %p')}"
    )

    y -= 22
    c.drawString(40, y, f"Customer Name: {order['name']}")

    y -= 18
    c.drawString(40, y, f"Registered Email: {order['email']}")

    y -= 18
    c.drawString(40, y, f"Mobile Number: {order['mobile']}")

    # ================= ADDRESS =================
    y -= 30
    c.setFont("Helvetica-Bold", 11)
    c.drawString(40, y, "Delivery Address:")

    y -= 18
    c.setFont("Helvetica", 10)

    for line in order["address"].split(","):
        c.drawString(45, y, line.strip())
        y -= 15

    # ================= ITEMS TABLE =================
    y -= 20
    c.setFont("Helvetica-Bold", 11)
    c.drawString(40, y, "Order Items")

    y -= 10
    c.line(40, y, width - 40, y)
    y -= 18

    c.setFont("Helvetica-Bold", 10)
    c.drawString(40, y, "Item Name")
    c.drawString(320, y, "Qty")
    c.drawRightString(width - 40, y, "Price")

    y -= 8
    c.line(40, y, width - 40, y)
    y -= 18

    c.setFont("Helvetica", 10)

    for item in order["items"]:
        # Draw Hotel Name
        c.setFont("Helvetica-BoldOblique", 8)
        c.drawString(40, y + 2, f"Hotel: {item.get('hotel_name', 'BiteRoute Partner')}")
        
        # Draw Food Item details
        c.setFont("Helvetica", 10)
        c.drawString(40, y - 10, item["name"])
        c.drawString(320, y - 10, str(item["qty"]))
        c.drawRightString(
            width - 40,
            y - 10,
            f"₹ {item['price'] * item['qty']}"
        )
        y -= 30  # Increased spacing to accommodate hotel name

        # 📄 New page if space is less
        if y < 120:
            c.showPage()
            c.setFont("Helvetica", 10)
            y = height - 80

    # ================= PAYMENT DETAILS =================
    y -= 10
    c.line(40, y, width - 40, y)

    y -= 25
    c.setFont("Helvetica-Bold", 11)
    c.drawString(40, y, "Payment Details")

    y -= 18
    c.setFont("Helvetica", 10)
    c.drawString(40, y, f"Payment Method: {order['payment_method']}")

    y -= 15
    c.drawString(40, y, f"Total Amount Paid: ₹ {order['total']}")

    # ================= FOOTER =================
    y -= 40
    c.line(40, y, width - 40, y)

    y -= 20
    c.setFont("Helvetica", 10)
    c.drawCentredString(
        width / 2,
        y,
        "Thank you for ordering with BiteRoute 🍕"
    )

    y -= 15
    c.drawCentredString(
        width / 2,
        y,
        "We hope to serve you again soon!"
    )

    # ✅ Save PDF
    c.save()

    return file_path
