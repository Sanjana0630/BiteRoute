
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .auth_utils import decode_token
from .models import User, HotelOwner

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return None

        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ")[1]
        payload = decode_token(token)

        if not payload:
            raise AuthenticationFailed("Invalid or expired token")

        user_id = payload.get("user_id")
        role = payload.get("role")

        if role == "user":
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                raise AuthenticationFailed("User not found")
            return (user, payload)

        elif role == "owner":
            try:
                user = HotelOwner.objects.get(id=user_id)
            except HotelOwner.DoesNotExist:
                raise AuthenticationFailed("Owner not found")
            return (user, payload)

        elif role == "admin":
             # Admin is stateless in current impl but we can mock it
             # Or just pass a dict
             return ({"id": "admin", "role": "admin"}, payload)

        return None
