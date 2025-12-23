# Documentation Audit & Update Plan

**Date:** 2025-12-23
**Purpose:** Identify and fix inconsistencies in documentation

## Current State Analysis

### ✅ Up-to-Date Documentation

1. **docs/sessions/** - Session logs (current)
   - ✅ 2025-12-22-pdf-rendering-fix.md
   - ✅ 2025-12-23-vision-vs-ocr-api-testing.md

2. **docs/guide/** - Recently updated guides
   - ✅ three-stage-ocr-workflow.md (rewritten 2025-12-23)
   - ✅ mistral-ocr-capabilities.md (created 2025-12-23)
   - ✅ ocr-providers.md (updated 2025-12-23)

3. **Root Documentation**
   - ✅ OCR_COMPARISON_TEST.md (created 2025-12-23)
   - ✅ BACKLOG.md (updated 2025-12-23)

### ⚠️ Needs Review/Update

1. **docs/guide/getting-started.md**
   - Status: Unknown - needs review
   - Potential issues: OCR examples may be outdated

2. **docs/guide/installation.md**
   - Status: Unknown - needs review
   - Potential issues: Environment variable docs

3. **docs/guide/index.md**
   - Status: Unknown - needs review
   - Potential issues: Overview may reference old workflow

4. **docs/index.md**
   - Status: Unknown - needs review
   - Potential issues: Main landing page

5. **docs/comparison/index.md**
   - Status: Unknown - needs review
   - Potential issues: May duplicate OCR_COMPARISON_TEST.md

6. **docs/design/index.md**
   - Status: Unknown - needs review
   - Potential issues: Architecture docs

7. **docs/performance/index.md**
   - Status: Unknown - needs review
   - Potential issues: Benchmark data

### ❌ Known Issues

1. **README.md**
   - Issues found:
     - OCR configuration examples may be outdated
     - Environment variables section needs Vision vs OCR clarity
     - Examples should distinguish Vision API from OCR API
   - Last major update: Unknown

2. **CHANGELOG.md**
   - Needs: v2.2.0 entry for enhanced Mistral OCR
   - Needs: Documentation of Vision vs OCR API distinction

3. **package.json**
   - Version: 2.2.0 ✅
   - Scripts: Need review

## Key Inconsistencies to Fix

### 1. OCR API Usage Examples

**Problem:** Many docs likely show OCR API for diagrams (wrong)

**Locations to check:**
- README.md examples
- docs/guide/getting-started.md
- docs/guide/index.md

**Fix needed:**
```typescript
// ❌ OLD (wrong for diagrams)
provider: { type: "mistral-ocr" }

// ✅ NEW (correct for diagrams)
provider: { type: "mistral" }
```

### 2. Environment Variables

**Problem:** Incomplete docs on PDF_ALLOWED_PATHS, PDF_BASE_DIR

**Locations to check:**
- README.md
- docs/guide/installation.md
- docs/guide/getting-started.md

**Fix needed:**
- Clear explanation of cwd vs PDF_BASE_DIR
- Security model (allowed roots)
- Multi-directory configuration

### 3. Full Response Structure

**Problem:** Docs may show old response format without pages/model/usage_info

**Locations to check:**
- README.md examples
- docs/guide/mistral-ocr-capabilities.md (already updated)
- API reference sections

**Fix needed:**
- Show `includeFullResponse: "true"` parameter
- Document full response structure
- Explain backward compatibility

### 4. 3-Stage Workflow References

**Problem:** Other docs may reference old 3-stage workflow

**Locations to check:**
- README.md
- docs/guide/index.md
- docs/guide/getting-started.md

**Fix needed:**
- Update to reflect Vision API for Stage 2
- Clarify OCR API for Stage 3

### 5. Cost/Performance Claims

**Problem:** Cost analysis may be outdated

**Locations to check:**
- README.md
- docs/performance/index.md
- docs/comparison/index.md

**Fix needed:**
- Update with Vision API costs (~$0.003/image)
- Update with OCR API costs (~$0.002/page)
- Remove or update old cost claims

## Update Priority

### 🔴 High Priority (User-Facing)

1. **README.md** - Main entry point, most visible
   - Fix OCR examples (Vision vs OCR)
   - Update environment variables section
   - Add Vision API examples
   - Update cost claims

2. **docs/guide/getting-started.md** - First-time user experience
   - Fix OCR examples
   - Add Vision API quick start
   - Update environment setup

3. **docs/guide/index.md** - Documentation index
   - Update overview
   - Link to new docs (OCR_COMPARISON_TEST.md)
   - Update workflow description

### 🟡 Medium Priority (Reference Docs)

4. **docs/guide/installation.md**
   - Complete environment variables docs
   - Add Claude Desktop config examples
   - Security model explanation

5. **docs/comparison/index.md**
   - Check for redundancy with OCR_COMPARISON_TEST.md
   - Update or redirect

6. **CHANGELOG.md**
   - Add v2.2.0 entry
   - Document major changes

### 🟢 Low Priority (Internal/Technical)

7. **docs/design/index.md**
   - Update architecture if needed
   - Add handler flow diagrams

8. **docs/performance/index.md**
   - Update benchmarks if available
   - Add OCR performance data

9. **package.json**
   - Review scripts
   - Update keywords if needed

## Verification Checklist

After updates, verify:

- [ ] All code examples work with current version
- [ ] Environment variables documented consistently
- [ ] Vision vs OCR API distinction clear everywhere
- [ ] Cost claims accurate
- [ ] Links between docs work
- [ ] No contradictory information
- [ ] Examples follow best practices (from OCR_COMPARISON_TEST.md)

## Documentation Standards

### Code Examples

**Always show:**
1. Which API to use (mistral vs mistral-ocr)
2. When to use it (diagrams vs text)
3. Full configuration (including extras)

**Example format:**
```typescript
// For technical diagrams (Vision API)
const result = await client.tools.pdf_ocr_image({
  source: { path: "diagram.pdf" },
  page: 1,
  index: 0,
  provider: {
    type: "mistral",  // Vision API
    extras: {
      prompt: "Analyze this diagram..."
    }
  }
});

// For text documents (OCR API)
const result = await client.tools.pdf_ocr_page({
  source: { path: "invoice.pdf" },
  page: 1,
  provider: {
    type: "mistral-ocr",  // OCR API
    extras: {
      tableFormat: "html",
      includeFullResponse: "true"
    }
  }
});
```

### Configuration Examples

**Always show:**
1. Config file location per OS
2. Complete config block
3. Environment variables if relevant

**Example format:**
```json
// ~/.config/Claude/claude_desktop_config.json (Linux)
{
  "mcpServers": {
    "pdf-reader": {
      "command": "npx",
      "args": ["@sylphx/pdf-reader-mcp"],
      "cwd": "/path/to/pdfs",
      "env": {
        "MISTRAL_API_KEY": "your-key-here"
      }
    }
  }
}
```

## Next Steps

1. Review each file in priority order
2. Identify specific outdated sections
3. Update with consistent examples
4. Cross-reference between docs
5. Test all code examples
6. Commit updates with clear messages

## Notes

- Keep backward compatibility notes where relevant
- Link to OCR_COMPARISON_TEST.md for detailed comparison
- Link to session logs for historical context
- Maintain consistent terminology throughout
