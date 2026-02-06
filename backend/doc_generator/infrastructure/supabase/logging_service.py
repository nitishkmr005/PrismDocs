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
        # Track tokens used in this session for aggregation
        self._session_tokens_used: int = 0

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
        # Track tokens for session aggregation
        if input_tokens:
            self._session_tokens_used += input_tokens
        if output_tokens:
            self._session_tokens_used += output_tokens

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

    def log_generation_started(
        self,
        *,
        input_format: str,
        output_format: str,
        source_count: int,
        provider: str | None = None,
        model: str | None = None,
    ) -> bool:
        """
        Log a generation_started event.

        Args:
            input_format: Input file format (e.g., 'markdown', 'pdf')
            output_format: Output format (e.g., 'pdf', 'pptx')
            source_count: Number of source files/urls
            provider: LLM provider name
            model: Model identifier

        Returns:
            True if logging succeeded, False otherwise
        """
        return self.log_event(
            event_type="generation_started",
            event_data={
                "input_format": input_format,
                "output_format": output_format,
                "source_count": source_count,
                "provider": provider,
                "model": model,
            },
            severity="info",
        )

    def log_generation_completed(
        self,
        *,
        output_format: str,
        output_path: str,
        pages: int = 0,
        slides: int = 0,
        images_generated: int = 0,
        duration_seconds: float,
        total_llm_calls: int = 0,
        total_image_calls: int = 0,
        total_tokens_used: int | None = None,
    ) -> bool:
        """
        Log a generation_completed event and update user stats.

        Args:
            output_format: Output format (e.g., 'pdf', 'pptx')
            output_path: Path to generated output file
            pages: Number of pages (for PDF)
            slides: Number of slides (for PPTX)
            images_generated: Number of images generated
            duration_seconds: Total generation duration
            total_llm_calls: Total number of LLM API calls
            total_image_calls: Total number of image generation calls
            total_tokens_used: Total tokens used (input + output)

        Returns:
            True if logging succeeded, False otherwise
        """
        # Use session tokens if not provided
        tokens = (
            total_tokens_used
            if total_tokens_used is not None
            else self._session_tokens_used
        )

        event_logged = self.log_event(
            event_type="generation_completed",
            event_data={
                "output_format": output_format,
                "output_path": output_path,
                "pages": pages,
                "slides": slides,
                "images_generated": images_generated,
                "duration_seconds": round(duration_seconds, 2),
                "total_llm_calls": total_llm_calls,
                "total_image_calls": total_image_calls,
                "total_tokens_used": tokens,
            },
            severity="info",
        )

        # Update user stats if user_id is available
        if self.user_id:
            self.update_user_stats(tokens_used=tokens)

        return event_logged

    def log_generation_failed(
        self,
        *,
        error_message: str,
        error_code: str | None = None,
        output_format: str | None = None,
        duration_seconds: float | None = None,
    ) -> bool:
        """
        Log a generation_failed event.

        Args:
            error_message: Error message describing the failure
            error_code: Optional error code
            output_format: Target output format
            duration_seconds: Duration before failure

        Returns:
            True if logging succeeded, False otherwise
        """
        return self.log_event(
            event_type="generation_failed",
            event_data={
                "error_message": error_message,
                "error_code": error_code,
                "output_format": output_format,
                "duration_seconds": (
                    round(duration_seconds, 2) if duration_seconds else None
                ),
            },
            severity="error",
        )

    def update_user_stats(self, tokens_used: int = 0) -> bool:
        """
        Update user statistics (total_documents_generated, total_tokens_used).

        Calls the Supabase stored function `update_user_stats` which increments
        the user's document count and adds tokens used.

        Args:
            tokens_used: Number of tokens used in this generation

        Returns:
            True if update succeeded, False otherwise
        """
        if not self.user_id:
            logger.debug("Cannot update user stats: no user_id provided")
            return False

        client = get_supabase_service_client()
        if client is None:
            return False

        try:
            # Call the stored function to update user stats
            client.rpc(
                "update_user_stats",
                {
                    "p_user_id": self.user_id,
                    "p_tokens_used": tokens_used,
                },
            ).execute()

            logger.info(
                f"Updated user stats: user_id={self.user_id}, "
                f"tokens_used={tokens_used}"
            )
            return True

        except Exception as exc:
            logger.error(f"Failed to update user stats: {exc}")
            return False

    def get_session_tokens_used(self) -> int:
        """Get total tokens used in this session."""
        return self._session_tokens_used

    def reset_session_tokens(self) -> None:
        """Reset session token counter."""
        self._session_tokens_used = 0

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
