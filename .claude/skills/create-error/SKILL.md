---
name: create-error
description: Add RFC 9457 compliant error responses to an endpoint. Use when defining error cases for a path operation.
when_to_use: Use when the user asks to add error responses, define failure cases, or ensure an endpoint has proper error handling.
allowed-tools: Read Write
---

# Create Error Response

When adding error responses to an endpoint:

1. Always reuse from /components/responses/errors.yaml where possible:
   - $ref: '../components/responses/errors.yaml#/Unauthorized'
   - $ref: '../components/responses/errors.yaml#/Forbidden'
   - $ref: '../components/responses/errors.yaml#/NotFound'
   - $ref: '../components/responses/errors.yaml#/Conflict'
   - $ref: '../components/responses/errors.yaml#/RateLimitExceeded'

2. For 400 Validation Error always include errors array:
   errors:
   - field: string
   - message: string
   - code: string (e.g. REQUIRED_FIELD, INVALID_VALUE, INVALID_ENUM)

3. All type URIs must follow pattern:
   https://api.hostname.com/problems/{type}

4. All error responses must include:
   - type: URI string
   - title: string
   - status: integer
   - detail: string
   - instance: string (request path)
   - traceId: string
   - timestamp: date-time
   - errors: array or null
