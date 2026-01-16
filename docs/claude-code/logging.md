# Logging Guidelines

## Workflow Header Format

```
================================================================================
🚀 [WORKFLOW NAME] STARTED
================================================================================
Input:  [input details]
Output: [output details]
================================================================================
```

## Loguru Configuration

```yaml
# config/settings.yaml
logging:
  level: "INFO"
  format: "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
```

## Step-Based Progress

```
================================================================================
STEP 1/N: [Step Name]
================================================================================
→ [Action description]
  [Metric 1]: [value]
  [Metric 2]: [value]
✓ [Step Name] COMPLETED
[Optional result summary]
················································································

================================================================================
STEP 2/N: [Next Step]
================================================================================
→ [Action description]
  [Details]
✓ [Step Name] COMPLETED
················································································
```

## LLM Observability (Opik)

> [!IMPORTANT]
> ALL LLM calls MUST use Opik for observability.

```python
import opik
from opik.integrations.langchain import OpikTracer

opik.configure(use_local=False)
tracer = OpikTracer()
```

Log: input tokens, output tokens, latency, purpose.

## JSON Logging

Store in `src/data/logging/YYYY-MM-DD_HH-MM-SS_llm_calls.json`:

```json
{
  "timestamp": "2025-01-13T19:01:24",
  "purpose": "content_summarization",
  "model": "gemini-2.5-pro",
  "input_tokens": 1234,
  "output_tokens": 456,
  "latency_seconds": 2.34,
  "prompt": "[truncated to 4k]",
  "response": "[truncated to 4k]"
}
```

## Summary Table (End of Run)

Include an LLM call summary table when available:

```
┌──────────────────────┬─────────┬──────────┬─────────┬──────────┐
│ Purpose              │ Model   │ Tokens   │ Latency │ Status   │
├──────────────────────┼─────────┼──────────┼─────────┼──────────┤
│ Content Summary      │ gemini  │ 1.2k/450 │ 2.34s   │ ✅       │
│ Slide Generation     │ gemini  │ 2.1k/890 │ 4.56s   │ ✅       │
│ Image Prompt         │ gemini  │ 456/123  │ 1.23s   │ ✅       │
└──────────────────────┴─────────┴──────────┴─────────┴──────────┘
```

## Supabase Logging & User Stats

### User Stats Tracking

The `user_profiles` table tracks per-user statistics:

```sql
total_documents_generated INTEGER  -- Incremented on each successful generation
total_tokens_used BIGINT           -- Sum of all tokens (input + output) used
```

These are automatically updated via the `update_user_stats()` stored function when a generation completes.

### Generation Events

The `app_events` table logs generation lifecycle events:

| Event Type             | Description                       | Data Fields                                                          |
| ---------------------- | --------------------------------- | -------------------------------------------------------------------- |
| `generation_started`   | Generation workflow begins        | input_format, output_format, source_count, provider, model           |
| `generation_completed` | Generation completes successfully | pages, slides, images_generated, duration_seconds, total_tokens_used |
| `generation_failed`    | Generation encounters an error    | error_message, error_code, output_format, duration_seconds           |

### Usage Example

```python
from doc_generator.infrastructure.supabase.logging_service import get_logging_service

# Initialize with user_id for authenticated logging
logger = get_logging_service(user_id="user-uuid")

# Log generation start
logger.log_generation_started(
    input_format="markdown",
    output_format="pdf",
    source_count=3,
    provider="gemini",
    model="gemini-2.5-pro"
)

# Log generation completion (automatically updates user stats)
logger.log_generation_completed(
    output_format="pdf",
    output_path="/path/to/output.pdf",
    pages=10,
    images_generated=5,
    duration_seconds=45.2,
    total_llm_calls=8,
    total_image_calls=5,
    total_tokens_used=logger.get_session_tokens_used()
)
```

### Frontend User ID Passing

The frontend sends `X-User-Id` header with authenticated requests:

```typescript
// In generate.ts
headers["X-User-Id"] = userId; // From Supabase auth
```
