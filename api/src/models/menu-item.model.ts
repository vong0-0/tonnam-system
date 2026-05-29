import { Schema, model, type Document, type Types } from 'mongoose'

export interface IMenuItem extends Document {
  category_id: Types.ObjectId
  name: string
  price: number
  description: string | null
  image_url: string | null
  is_available: boolean
  is_sold_out: boolean
  createdAt: Date
  updatedAt: Date
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    category_id: { type: Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: null },
    image_url: { type: String, default: null },
    is_available: { type: Boolean, required: true, default: true },
    is_sold_out: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

menuItemSchema.index({ category_id: 1, name: 1 }, { unique: true })
menuItemSchema.index({ is_available: 1 })
menuItemSchema.index({ is_sold_out: 1 })

export const MenuItemModel = model<IMenuItem>('MenuItem', menuItemSchema)
