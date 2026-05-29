import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import { type IUser, UserModel } from '@/models/user.model.js'
import { type CreateUserInput, type UpdateUserInput } from '@/schemas/user.schema.js'
import { type Pagination, type Role } from '@/types/index.js'
import { createHttpError } from '@/utils/errors.js'
import logger from '@/utils/logger.js'

interface ListUsersParams {
  page: number
  limit: number
  search?: string
  role?: Role
  is_active?: boolean
}

export async function listUsers(
  params: ListUsersParams,
): Promise<{ items: IUser[]; pagination: Pagination }> {
  const { page, limit, search, role, is_active } = params
  const filter: Record<string, unknown> = {}

  if (search !== undefined) {
    const regex = new RegExp(search, 'i')
    filter['$or'] = [
      { first_name: regex },
      { last_name: regex },
      { username: regex },
      { phone: regex },
      { email: regex },
    ]
  }

  if (role !== undefined) filter['role'] = role
  if (is_active !== undefined) filter['is_active'] = is_active

  const skip = (page - 1) * limit
  const [rawItems, total] = await Promise.all([
    UserModel.find(filter).skip(skip).limit(limit).lean(),
    UserModel.countDocuments(filter),
  ])

  const items = rawItems as IUser[]
  const totalPages = Math.ceil(total / limit)
  return { items, pagination: { page, limit, total, totalPages } }
}

export async function getUserById(id: string): Promise<IUser> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(400, 'Invalid user ID format')
  }

  const user = (await UserModel.findById(id).lean()) as IUser | null
  if (!user) throw createHttpError(404, 'User not found')

  return user
}

export async function createUser(input: CreateUserInput): Promise<IUser> {
  const existingUsername = await UserModel.findOne({ username: input.username })
  if (existingUsername) throw createHttpError(409, 'Username already taken')

  const existingPhone = await UserModel.findOne({ phone: input.phone })
  if (existingPhone) throw createHttpError(409, 'Phone number already registered')

  if (input.email !== undefined) {
    const existingEmail = await UserModel.findOne({ email: input.email })
    if (existingEmail) throw createHttpError(409, 'Email already registered')
  }

  const hashedPassword = await bcrypt.hash(input.password, 10)
  const user = await UserModel.create({
    username: input.username,
    first_name: input.first_name,
    last_name: input.last_name,
    phone: input.phone,
    role: input.role,
    password: hashedPassword,
    ...(input.email !== undefined ? { email: input.email } : {}),
  })

  logger.info('User created', { userId: String(user._id), role: user.role })
  return user
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<IUser> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(400, 'Invalid user ID format')
  }

  const existing = await UserModel.findById(id)
  if (!existing) throw createHttpError(404, 'User not found')

  if (input.phone !== undefined) {
    const dup = await UserModel.findOne({ phone: input.phone, _id: { $ne: id } })
    if (dup) throw createHttpError(409, 'Phone number already registered')
  }

  if (input.email !== undefined) {
    const dup = await UserModel.findOne({ email: input.email, _id: { $ne: id } })
    if (dup) throw createHttpError(409, 'Email already registered')
  }

  const updated = await UserModel.findByIdAndUpdate(id, input, { new: true, runValidators: true })
  if (!updated) throw createHttpError(404, 'User not found')

  return updated
}

export async function deactivateUser(id: string): Promise<IUser> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(400, 'Invalid user ID format')
  }

  const user = await UserModel.findById(id)
  if (!user) throw createHttpError(404, 'User not found')

  if (!user.is_active) throw createHttpError(409, 'User is already deactivated')

  const updated = await UserModel.findByIdAndUpdate(id, { is_active: false }, { new: true })
  if (!updated) throw createHttpError(404, 'User not found')

  return updated
}
