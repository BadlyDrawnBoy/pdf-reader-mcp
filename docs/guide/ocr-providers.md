# OCR Providers

Use OCR when a page renders as images or when embedded text is unreliable. The MCP server supports multiple OCR providers with flexible configuration.

## Capabilities

- `pdf_ocr_page` — Renders a page to PNG (respecting `scale`) and performs OCR; returns `text`, provider metadata, and `from_cache`.
- `pdf_ocr_image` — OCRs an embedded image (by index) without re-rendering the page; same request shape as `pdf_ocr_page`.
- Both tools accept `provider` configs (`type`, `api_key`, `model`, `language`, `extras`) and support caching with `cache: true`.

## Provider Types

### Built-in Providers

#### 1. `mistral` - Mistral Vision API
**Best for:** Semantic understanding, document classification, diagram descriptions

```typescript
{
  type: "mistral",
  api_key: process.env.MISTRAL_API_KEY, // or provide directly
  model: "mistral-large-2512",           // optional, default
  extras: {
    prompt: "Describe this technical diagram",  // optional custom prompt
    temperature: 0,                              // optional, default 0
    max_tokens: 4000                             // optional, default 4000
  }
}
```

**Features:**
- Uses Vision-capable LLM for semantic understanding
- Custom prompts for specific tasks
- Good for classification and description
- Not optimized for precise text extraction

**Use cases:**
- Document type classification
- Diagram/chart description
- Semantic page understanding
- Content summarization

#### 2. `mistral-ocr` - Mistral OCR API (Dedicated)
**Best for:** Precise text extraction, tables, complex layouts

```typescript
{
  type: "mistral-ocr",
  api_key: process.env.MISTRAL_API_KEY, // or provide directly
  model: "mistral-ocr-latest",           // optional, default
  extras: {
    tableFormat: "html" // or "markdown" (default)
  }
}
```

**Features:**
- Dedicated OCR model (higher accuracy)
- Structured table extraction (HTML or Markdown)
- Preserves document structure and hierarchy
- Returns markdown with formatting

**Use cases:**
- Scanned documents
- Tables and complex layouts
- Forms and invoices
- Precise text extraction

**Current Limitations** (see [BACKLOG.md](../../BACKLOG.md)):
- Only returns markdown text (images, tables, hyperlinks discarded)
- No header/footer extraction
- No image base64 support
- No structured annotations

#### 3. `mock` - Mock Provider
**Best for:** Testing and development

```typescript
{
  type: "mock"
}
```

Returns a placeholder message. Useful for testing without API costs.

### Generic HTTP Provider

#### 4. `http` - Custom OCR Endpoint
**Best for:** Custom OCR services, third-party APIs

```typescript
{
  type: "http",
  endpoint: "https://your-ocr-service.com/v1/ocr",
  api_key: "your-api-key",  // optional, sent as Bearer token
  model: "custom-model",     // optional
  language: "en",            // optional
  extras: {                  // optional, provider-specific
    // ... custom parameters
  }
}
```

**Request Format:**
The server POSTs this JSON to your endpoint:
```json
{
  "image": "<base64 PNG or data URI>",
  "model": "...",
  "language": "...",
  "extras": { ... }
}
```

**Expected Response:**
```json
{
  "text": "<extracted text>",
  "ocr": "<alternative text field>" // fallback
}
```

**Use cases:**
- Custom OCR services
- Third-party OCR APIs
- Self-hosted OCR solutions
- Legacy systems integration

## Configuration Examples

### Mistral Vision (Semantic Understanding)

```typescript
const result = await client.tools.pdf_ocr_page({
  source: { path: "diagram.pdf" },
  page: 1,
  provider: {
    type: "mistral",
    api_key: process.env.MISTRAL_API_KEY,
    extras: {
      prompt: "Analyze this timing diagram and describe the signal flow"
    }
  },
  scale: 1.5,
  cache: true
});
```

### Mistral OCR (Precise Extraction)

```typescript
const result = await client.tools.pdf_ocr_page({
  source: { path: "invoice.pdf" },
  page: 1,
  provider: {
    type: "mistral-ocr",
    api_key: process.env.MISTRAL_API_KEY,
    extras: {
      tableFormat: "html"  // Extract tables as HTML
    }
  },
  scale: 2.0,  // Higher scale for better accuracy
  cache: true
});
```

### Environment Variables

If you don't provide `api_key` in the provider config, the server looks for:
- `MISTRAL_API_KEY` for `mistral` and `mistral-ocr` providers

Add to your `.env` file:
```bash
MISTRAL_API_KEY=your-api-key-here
```

## Smart OCR Decision

The server includes a Smart OCR feature (opt-in) that automatically decides whether OCR is needed:

```typescript
const result = await client.tools.pdf_ocr_page({
  source: { path: "document.pdf" },
  page: 1,
  provider: { type: "mistral-ocr" },
  smart_ocr: true  // Enable smart decision
});
```

**Heuristics:**
- Text length analysis
- Non-ASCII ratio check
- Image-to-text ratio
- Decision cached per page

**Benefits:**
- Saves API costs (skip OCR on text-heavy pages)
- Faster processing
- Consistent decisions (cached)

See [3-Stage OCR Workflow](./three-stage-ocr-workflow.md) for advanced usage patterns.

## Caching

OCR results are cached using document fingerprint + page number + provider configuration:

```typescript
// First call - API request
const result1 = await pdf_ocr_page({
  source: { path: "doc.pdf" },
  page: 1,
  provider: { type: "mistral-ocr" },
  cache: true
});
// result1.data.from_cache === false

// Second call - cache hit
const result2 = await pdf_ocr_page({
  source: { path: "doc.pdf" },
  page: 1,
  provider: { type: "mistral-ocr" },
  cache: true
});
// result2.data.from_cache === true
```

**Cache Management:**
```typescript
// View cache stats
await client.tools.pdf_cache_stats();

// Clear OCR cache
await client.tools.pdf_cache_clear({ scope: "ocr" });

// Clear all caches
await client.tools.pdf_cache_clear({ scope: "all" });
```

## Provider Comparison

| Feature | `mistral` (Vision) | `mistral-ocr` (OCR) | `http` (Custom) |
|---------|-------------------|---------------------|-----------------|
| **Speed** | Medium | Medium | Varies |
| **Accuracy** | Good (semantic) | Excellent (text) | Varies |
| **Tables** | Basic | Excellent (HTML/MD) | Varies |
| **Diagrams** | Description | Text only | Varies |
| **Cost** | Higher | Lower | Varies |
| **Best for** | Understanding | Extraction | Custom needs |

## Troubleshooting

### "Mistral OCR provider requires MISTRAL_API_KEY"
- Set `MISTRAL_API_KEY` in `.env` file, or
- Pass `api_key` directly in provider config

### "OCR provider response missing text field"
- For `http` provider: ensure your endpoint returns `{"text": "..."}` or `{"ocr": "..."}`

### Poor OCR Quality
- Increase `scale` parameter (try 2.0 or 2.5)
- Use `mistral-ocr` instead of `mistral` for text extraction
- Check if page has native text (use `pdf_read_pages` first)

### Cache Not Working
- Ensure `cache: true` is set
- Different provider configs create separate cache entries
- Use `pdf_cache_stats` to inspect cache

## Related Documentation

- [3-Stage OCR Workflow](./three-stage-ocr-workflow.md) - Recommended workflow
- [Mistral OCR Capabilities](./mistral-ocr-capabilities.md) - Full API reference
- [Getting Started](./getting-started.md) - Basic usage
- [BACKLOG.md](../../BACKLOG.md) - Planned enhancements
