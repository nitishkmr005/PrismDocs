"""Supabase logging service for persisting LLM call logs to database."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from loguru import logger

from .client import get_supabase_service_client


class SupabaseLoggingService:
    """
    Service for logging LLM calls and application events to Supabase.

    Stores logs in the 'llm_logs' table with the following schema:
    - id: UUID (auto-generated)
    - created_at: TIMESTAMPTZ (auto-generated)
    - purpose: TEXT (name/purpose of the LLM call)
    - provider: TEXT (e.g., 'gemini', 'openai', 'anthropic')
    - model: TEXT (model identifier)
    - prompt: TEXT (input prompt, truncated)
    - response: TEXT (output response, truncated)
    - input_tokens: INTEGER
    - output_tokens: INTEGER
    - latency_seconds: FLOAT
    - metadata: JSONB (additional metadata)
    - user_id: UUID (optional, for authenticated users)
    - session_id: TEXT (optional, for tracking sessions)
    """

    TABLE_NAME = "llm_logs"

    def __init__(self, user_id: str | None = None, session_id: str | None = None):
        """
        Initialize the logging service.

        Args:
            user_id: Optional user ID for authenticated logging
            session_id: Optional session ID for tracking related calls
        """
        self.user_id = user_id
        self.session_id = session_id or str(uuid4())

    @staticmethod
    def is_available() -> bool:
        """Check if Supabase logging is available (requires service role key)."""
        import os

        url = os.getenv("SUPABASE_URL")
        service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        return bool(url and service_key)

    def log_llm_call(
        self,
        name: str,
        prompt: str,
        response: str,
        *,
        provider: str | None = None,
        model: str | None = None,
        input_tokens: int | None = None,
        output_tokens: int | None = None,
        duration_ms: int | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> bool:
        """
        Log an LLM call to Supabase.

        Args:
            name: Purpose/name of the LLM call
            prompt: Input prompt (will be truncated if too long)
            response: Output response (will be truncated if too long)
            provider: LLM provider name
            model: Model identifier
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            duration_ms: Call duration in milliseconds
            metadata: Additional metadata to store

        Returns:
            True if logging succeeded, False otherwise
        """
        client = get_supabase_service_client()
        if client is None:
            return False

        try:
            record = {
                "purpose": name,
                "provider": provider,
                "model": model or "",
                "prompt": self._truncate(prompt),
                "response": self._truncate(response),
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "latency_seconds": (
                    duration_ms / 1000.0 if duration_ms is not None else None
                ),
                "metadata": metadata or {},
                "session_id": self.session_id,
            }

            if self.user_id:
                record["user_id"] = self.user_id

            result = client.table(self.TABLE_NAME).insert(record).execute()

            if result.data:
                logger.debug(f"Logged LLM call to Supabase: {name}")
                return True
            else:
                logger.warning(f"Supabase insert returned no data for: {name}")
                return False

        except Exception as exc:
            logger.error(f"Failed to log LLM call to Supabase: {exc}")
            return False

    def log_event(
        self,
        event_type: str,
        event_data: dict[str, Any],
        *,
        severity: str = "info",
    ) -> bool:
        """
        Log a general application event to Supabase.

        Args:
            event_type: Type of event (e.g., 'generation_started', 'error')
            event_data: Event data to store
            severity: Event severity ('debug', 'info', 'warning', 'error')

        Returns:
            True if logging succeeded, False otherwise
        """
        client = get_supabase_service_client()
        if client is None:
            return False

        try:
            record = {
                "event_type": event_type,
                "severity": severity,
                "event_data": event_data,
                "session_id": self.session_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

            if self.user_id:
                record["user_id"] = self.user_id

            result = client.table("app_events").insert(record).execute()
            return bool(result.data)

        except Exception as exc:
            logger.debug(f"Failed to log event to Supabase: {exc}")
            return False

    @staticmethod
    def _truncate(text: str | None, limit: int = 10000) -> str:
        """Truncate text to a maximum length."""
        if not text:
            return ""
        text = str(text)
        if len(text) <= limit:
            return text
        return f"{text[:limit]}...[truncated]"


# Global instance for convenience
_logging_service: SupabaseLoggingService | None = None


def get_logging_service(
    user_id: str | None = None,
    session_id: str | None = None,
) -> SupabaseLoggingService:
    """
    Get or create a Supabase logging service instance.

    Args:
        user_id: Optional user ID for authenticated logging
        session_id: Optional session ID for tracking related calls

    Returns:
        SupabaseLoggingService instance
    """
    global _logging_service

    if _logging_service is None or user_id or session_id:
        _logging_service = SupabaseLoggingService(
            user_id=user_id,
            session_id=session_id,
        )

    return _logging_service
