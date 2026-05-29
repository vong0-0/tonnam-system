import { Schema, model, type Document } from 'mongoose'
import { type Role, ROLES } from '@/types/index.js'

export interface IUser extends Document {
  username: string
  first_name: string
  last_name: string
  phone: string
  email?: string
  password: string
  role: Role
  is_active: boolean
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: Object.values(ROLES) },
    is_active: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    Reflect.deleteProperty(ret, 'password')
    return ret
  },
})

export const UserModel = model<IUser>('User', userSchema)
