---
name: create-schema
description: Create a new reusable schema in openapi/components/schemas/. Use when defining a new data model, request body, or response object.
when_to_use: Use when the user asks to define a schema, add a data model, or create a reusable component for request or response objects.
allowed-tools: Read Write
---

# Create Schema

When creating a new schema in openapi/components/schemas/:

1. Filename must match schema name in PascalCase (e.g. MenuCategory.yaml)
2. Always include:
   - type: object
   - required: [] with all required fields listed
   - properties: with every field defined
   - description for each property
   - example values using realistic data
3. For monetary fields always use:
   type: number
   format: decimal
4. For timestamps always use:
   type: string
   format: date-time
5. For IDs always use:
   type: string
   example: "64f1a2b3c4d5e6f7a8b9c0d1"
6. Use $ref for nested objects that have their own schema
7. Check existing schemas for consistency before creating new ones
