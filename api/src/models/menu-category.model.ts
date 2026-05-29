import { Schema, model, type Document } from 'mongoose'

export interface IMenuCategory extends Document {
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

const menuCategorySchema = new Schema<IMenuCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const MenuCategoryModel = model<IMenuCategory>('MenuCategory', menuCategorySchema)
