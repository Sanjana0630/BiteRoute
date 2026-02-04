
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'biteroute_backend.settings')
django.setup()

from core.models import Food, CartItem, OrderItem

print("Deleting all Food items...")
# Delete related items first if cascade doesn't handle it (Django usually does, but good to be safe)
deleted_count, _ = Food.objects.all().delete()
print(f"Deleted {deleted_count} items (including cascaded deletions).")
