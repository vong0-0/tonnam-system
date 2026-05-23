---
name: create-path
description: Create a new path file in openapi/paths/ for a given resource. Use when adding a new API endpoint or resource group to the spec.
when_to_use: Use when the user asks to add a new endpoint, create a path file, or define operations for a resource like users, tables, or bills.
allowed-tools: Read Write
---

# Create Path File

When creating a new path file in openapi/paths/:

1. Create file named after the resource (e.g. users.yaml, tables.yaml)
2. Include all relevant HTTP methods per the API spec:
   - GET (list) with pagination query params and filters
   - POST (create) with request body schema
   - GET /{id} for single resource
   - PATCH /{id} for partial update
   - DELETE /{id} only if spec allows it
3. Every operation must include:
   - summary
   - tags (exactly one, matching index.yaml tags)
   - security: [{BearerAuth: []}]
   - parameters (if applicable via $ref)
   - requestBody (if applicable via $ref)
   - responses: 200/201, 400, 401, 403, 404, 409 as applicable
4. Always use $ref to reference components
5. Reference schemas from /components/schemas/
6. Reference error responses from /components/responses/errors.yaml
