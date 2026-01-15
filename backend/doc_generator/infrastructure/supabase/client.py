"""Supabase client initialization and configuration."""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Any

from loguru import logger

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None

_client: Client | None = None


def is_supabase_configured() -> bool:
    """
    Check if Supabase credentials are configured.

    Returns:
        True if SUPABASE_URL and SUPABASE_KEY are set
    """
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    return bool(url and key)


@lru_cache(maxsize=1)
def get_supabase_client() -> Client | None:
    """
    Get or create a Supabase client instance.

    Uses environment variables:
    - SUPABASE_URL: Your Supabase project URL
    - SUPABASE_KEY or SUPABASE_ANON_KEY: Your Supabase anon/public key

    Returns:
        Supabase client instance or None if not configured
    """
    global _client

    if _client is not None:
        return _client

    if create_client is None:
        logger.debug("Supabase package not installed")
        return None

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")

    if not url or not key:
        logger.debug("Supabase not configured: SUPABASE_URL or SUPABASE_KEY missing")
        return None

    try:
        _client = create_client(url, key)
        logger.info("Supabase client initialized successfully")
        return _client
    except Exception as exc:
        logger.error(f"Failed to initialize Supabase client: {exc}")
        return None


def get_supabase_service_client() -> Client | None:
    """
    Get a Supabase client with service role key for admin operations.

    Uses environment variables:
    - SUPABASE_URL: Your Supabase project URL
    - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key

    Returns:
        Supabase client with service role or None if not configured
    """
    if create_client is None:
        logger.debug("Supabase package not installed")
        return None

    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not service_key:
        logger.debug("Supabase service role not configured")
        return None

    try:
        return create_client(url, service_key)
    except Exception as exc:
        logger.error(f"Failed to initialize Supabase service client: {exc}")
        return None
