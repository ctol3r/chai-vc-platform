generated-by: Claude 2025-09-26T00:00:00Z
# Documentation Style Guide

## Headers
- Use `# H1` for document title
- Use `## H2` for main sections
- Use `### H3` for subsections
- Include "generated-by: Claude YYYY-MM-DDTHH:MM:SSZ" at top

## Code Blocks
```bash
# Use specific language identifiers
# Include comments for clarity
curl -X POST http://localhost:3000/api/credentials
```

## Tone
- **Concise**: Get to the point quickly
- **Command-first**: Start with actionable instructions
- **Reviewer-friendly**: Easy to scan and verify
- **Technical**: Assume developer audience

## Structure
1. **Purpose/Intent** - Why this document exists
2. **Steps/How-to** - Actionable instructions
3. **Examples** - Working code/commands
4. **Owners** - Who maintains this
5. **Risks/Notes** - Important caveats

## Formatting
- Use `**bold**` for important concepts
- Use `code` for filenames, commands, variables
- Use > blockquotes for important warnings
- Use ✅ ❌ 🔄 for status indicators

## Links
- Use relative paths: `docs/api/README.md`
- Include anchor links for long documents
- Verify all links work before committing