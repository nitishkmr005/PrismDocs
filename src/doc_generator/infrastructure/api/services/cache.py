"""Cache service for generated documents."""

import hashlib
import json
import time
from pathlib import Path
from typing import Optional

from ..models.requests import GenerateRequest


class CacheService:
    """Content-based cache for generated documents."""

    def __init__(
        self,
        cache_dir: Path = Path("src/output/cache"),
        ttl_seconds: int = 86400,  # 24 hours
    ):
        """Initialize cache service.

        Args:
            cache_dir: Directory for cache metadata
            ttl_seconds: Time-to-live for cache entries
        """
        self.cache_dir = Path(cache_dir)
        self.ttl_seconds = ttl_seconds
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def generate_cache_key(self, request: GenerateRequest) -> str:
        """Generate cache key from request.

        The key is a SHA256 hash of the normalized request content.

        Args:
            request: Generate request

        Returns:
            64-character hex string cache key
        """
        # Build canonical representation
        canonical = {
            "output_format": request.output_format.value,
            "sources": self._normalize_sources(request.sources),
            "provider": request.provider.value,
            "model": request.model,
            "image_model": request.image_model,
            "preferences": {
                "audience": request.preferences.audience.value,
                "image_style": request.preferences.image_style.value,
                "temperature": request.preferences.temperature,
                "max_tokens": request.preferences.max_tokens,
                "max_slides": request.preferences.max_slides,
                "max_summary_points": request.preferences.max_summary_points,
            },
        }

        # Generate hash
        canonical_json = json.dumps(canonical, sort_keys=True)
        return hashlib.sha256(canonical_json.encode()).hexdigest()

    def _normalize_sources(self, sources) -> dict:
        """Normalize sources for hashing."""
        result = {
            "primary": [self._normalize_source(s) for s in sources.primary],
            "supporting": [self._normalize_source(s) for s in sources.supporting],
            "reference": [self._normalize_source(s) for s in sources.reference],
            "data": [self._normalize_source(s) for s in sources.data],
            "other": {
                k: [self._normalize_source(s) for s in v]
                for k, v in sources.other.items()
            },
        }
        return result

    def _normalize_source(self, source) -> dict:
        """Normalize a single source for hashing."""
        if source.type == "text":
            return {"type": "text", "content": source.content}
        elif source.type == "url":
            return {"type": "url", "url": source.url}
        elif source.type == "file":
            return {"type": "file", "file_id": source.file_id}
        return {}

    def get(self, request: GenerateRequest) -> Optional[dict]:
        """Get cached result for request.

        Args:
            request: Generate request

        Returns:
            Cache entry dict or None if not found/expired
        """
        key = self.generate_cache_key(request)
        cache_file = self.cache_dir / f"{key}.json"

        if not cache_file.exists():
            return None

        try:
            data = json.loads(cache_file.read_text())

            # Check if expired
            if time.time() - data["created_at"] > self.ttl_seconds:
                cache_file.unlink()
                return None

            return data
        except (json.JSONDecodeError, KeyError):
            return None

    def set(
        self,
        request: GenerateRequest,
        output_path: Path,
        metadata: dict,
    ) -> str:
        """Store cache entry.

        Args:
            request: Generate request
            output_path: Path to generated output
            metadata: Generation metadata

        Returns:
            Cache key
        """
        key = self.generate_cache_key(request)
        cache_file = self.cache_dir / f"{key}.json"

        data = {
            "key": key,
            "output_path": str(output_path),
            "metadata": metadata,
            "created_at": time.time(),
        }

        cache_file.write_text(json.dumps(data))
        return key

    def invalidate(self, request: GenerateRequest) -> bool:
        """Invalidate cache entry.

        Args:
            request: Generate request

        Returns:
            True if entry was removed, False if not found
        """
        key = self.generate_cache_key(request)
        cache_file = self.cache_dir / f"{key}.json"

        if cache_file.exists():
            cache_file.unlink()
            return True
        return False
