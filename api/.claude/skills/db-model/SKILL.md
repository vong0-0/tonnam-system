---
name: db-model
description: Create a new Mongoose model for TonNam. Use when adding a new MongoDB collection, defining a new entity schema, or creating model with indexes and virtuals.
---

# New Mongoose Model — TonNam

Create a complete Mongoose model for: **$ARGUMENTS**

## Template
`api/src/models/<resource>.model.ts`:

```ts
import { Schema, model, Document, Types } from 'mongoose'
import { <Resource>Status } from '../types'  // import from types barrel

export interface I<Resource> extends Document {
  // define all fields with correct TS types
  // use Types.ObjectId for references
  status: <Resource>Status
  createdAt: Date
  updatedAt: Date
}

const <resource>Schema = new Schema<I<Resource>>(
  {
    // field definitions
    // always include ref for ObjectId fields:
    // tableId: { type: Schema.Types.ObjectId, ref: 'Table', required: true }
  },
  {
    timestamps: true,        // auto createdAt + updatedAt
    versionKey: false,       // remove __v
  }
)

// Indexes — always think about query patterns
<resource>Schema.index({ tableId: 1, status: 1 })

// Export model
export const <Resource>Model = model<I<Resource>>('<Resource>', <resource>Schema)
```

## Checklist
- [ ] Interface extends Document
- [ ] All status fields use type from `types/` barrel
- [ ] All ObjectId references have `ref` string
- [ ] `timestamps: true` set
- [ ] `versionKey: false` set
- [ ] Indexes defined for common query patterns
- [ ] Model exported with PascalCase name
- [ ] File added — verify with `npx tsc --noEmit`
