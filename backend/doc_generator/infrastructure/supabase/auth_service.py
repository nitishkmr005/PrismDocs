"""Authentication service using Supabase Auth."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from loguru import logger

from .client import get_supabase_client, is_supabase_configured


@dataclass
class AuthenticatedUser:
    """Represents an authenticated user from Supabase."""

    id: str
    email: str | None
    display_name: str | None
    is_authenticated: bool = True
    metadata: dict[str, Any] | None = None


class AuthService:
    """
    Authentication service using Supabase Auth.

    Provides methods for:
    - Validating JWT tokens from requests
    - Getting user information from tokens
    - Managing user sessions
    """

    @staticmethod
    def is_available() -> bool:
        """Check if authentication service is available."""
        return is_supabase_configured()

    @staticmethod
    def get_user_from_token(access_token: str) -> AuthenticatedUser | None:
        """
        Validate an access token and return the authenticated user.

        Args:
            access_token: JWT access token from the Authorization header

        Returns:
            AuthenticatedUser if valid, None otherwise
        """
        if not access_token:
            return None

        client = get_supabase_client()
        if client is None:
            return None

        try:
            # Get user from token
            user_response = client.auth.get_user(access_token)

            if user_response and user_response.user:
                user = user_response.user
                return AuthenticatedUser(
                    id=user.id,
                    email=user.email,
                    display_name=user.user_metadata.get("display_name", user.email),
                    metadata=user.user_metadata,
                )
        except Exception as exc:
            logger.debug(f"Failed to validate token: {exc}")

        return None

    @staticmethod
    def extract_token_from_header(authorization: str | None) -> str | None:
        """
        Extract the JWT token from an Authorization header.

        Args:
            authorization: The Authorization header value (e.g., "Bearer <token>")

        Returns:
            The token string or None
        """
        if not authorization:
            return None

        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            return parts[1]

        return None


# Convenience function for request handling
def authenticate_request(authorization: str | None) -> AuthenticatedUser | None:
    """
    Authenticate a request using the Authorization header.

    Args:
        authorization: The Authorization header value

    Returns:
        AuthenticatedUser if authenticated, None otherwise
    """
    token = AuthService.extract_token_from_header(authorization)
    if not token:
        return None

    return AuthService.get_user_from_token(token)
