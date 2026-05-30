import mongoose from 'mongoose'
import { type IMenuCategory, MenuCategoryModel } from '@/models/menu-category.model.js'
import { MenuItemModel } from '@/models/menu-item.model.js'
import {
  type CreateMenuCategoryInput,
  type UpdateMenuCategoryInput,
} from '@/schemas/menu-category.schema.js'
import { type Pagination } from '@/types/index.js'
import logger from '@/utils/logger.js'
import { problem } from '@/utils/problem.js'
import { successList } from '@/utils/response.js'

interface ListMenuCategoriesQuery {
  page?: number
  limit?: number
  search?: string
}

async function withItemCount(category: IMenuCategory) {
  const item_count = await MenuItemModel.countDocuments({ category_id: category._id })
  return { ...category.toObject(), item_count }
}

type CategoryWithCount = Awaited<ReturnType<typeof withItemCount>>

function notFoundError(id: string): never {
  throw problem({
    type: 'not-found',
    title: 'Not Found',
    status: 404,
    detail: 'Menu category not found.',
    instance: `/v1/menu-categories/${id}`,
  })
}

function validateObjectId(id: string): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw problem({
      type: 'validation-error',
      title: 'Validation Error',
      status: 400,
      detail: 'Invalid menu category ID format.',
      instance: `/v1/menu-categories/${id}`,
    })
  }
}

export async function listMenuCategories(
  query: ListMenuCategoriesQuery,
): Promise<ReturnType<typeof successList<CategoryWithCount>>> {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const { search } = query

  const filter: Record<string, unknown> = {}
  if (search !== undefined) filter['name'] = new RegExp(search, 'i')

  const skip = (page - 1) * limit
  const [categories, total] = await Promise.all([
    MenuCategoryModel.find(filter).skip(skip).limit(limit),
    MenuCategoryModel.countDocuments(filter),
  ])

  const categoriesWithCount = await Promise.all(categories.map(withItemCount))
  const totalPages = Math.ceil(total / limit)
  const pagination: Pagination = { page, limit, total, totalPages }

  return successList(categoriesWithCount, pagination, 'Menu categories retrieved successfully')
}

export async function getMenuCategoryById(id: string): Promise<CategoryWithCount> {
  validateObjectId(id)

  const category = await MenuCategoryModel.findById(id)
  if (!category) notFoundError(id)

  return withItemCount(category)
}

export async function createMenuCategory(
  input: CreateMenuCategoryInput,
): Promise<CategoryWithCount> {
  const existing = await MenuCategoryModel.findOne({ name: new RegExp(`^${input.name}$`, 'i') })
  if (existing) {
    throw problem({
      type: 'conflict',
      title: 'Conflict',
      status: 409,
      detail: 'A menu category with this name already exists.',
      instance: '/v1/menu-categories',
    })
  }

  const category = await MenuCategoryModel.create(input)
  logger.info('Menu category created', { categoryId: String(category._id), name: category.name })
  return withItemCount(category)
}

export async function updateMenuCategory(
  id: string,
  input: UpdateMenuCategoryInput,
): Promise<CategoryWithCount> {
  validateObjectId(id)

  const existing = await MenuCategoryModel.findById(id)
  if (!existing) notFoundError(id)

  const dup = await MenuCategoryModel.findOne({
    name: new RegExp(`^${input.name}$`, 'i'),
    _id: { $ne: id },
  })
  if (dup) {
    throw problem({
      type: 'conflict',
      title: 'Conflict',
      status: 409,
      detail: 'A menu category with this name already exists.',
      instance: `/v1/menu-categories/${id}`,
    })
  }

  const updated = await MenuCategoryModel.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  })
  if (!updated) notFoundError(id)

  return withItemCount(updated)
}

export async function deleteMenuCategory(id: string): Promise<null> {
  const category = await getMenuCategoryById(id)

  if (category.item_count > 0) {
    throw problem({
      type: 'conflict',
      title: 'Conflict',
      status: 409,
      detail: 'Cannot delete a category that still has menu items assigned.',
      instance: `/v1/menu-categories/${id}`,
    })
  }

  await MenuCategoryModel.findByIdAndDelete(id)
  logger.info('Menu category deleted', { categoryId: id })
  return null
}
