import mongoose from 'mongoose'
import { MenuCategoryModel } from '@/models/menu-category.model.js'
import { type IMenuItem, MenuItemModel } from '@/models/menu-item.model.js'
import {
  type CreateMenuItemInput,
  type UpdateMenuItemAvailabilityInput,
  type UpdateMenuItemInput,
} from '@/schemas/menu-item.schema.js'
import { type Pagination } from '@/types/index.js'
import logger from '@/utils/logger.js'
import { problem } from '@/utils/problem.js'
import { successList, type SuccessListResponse } from '@/utils/response.js'
import { io } from '@/websocket/handlers.js'
import { WS_EVENTS } from '@/websocket/events.js'

interface ListMenuItemsQuery {
  page?: number
  limit?: number
  search?: string
  category_id?: string
  is_available?: boolean
  is_sold_out?: boolean
}

async function verifyCategory(categoryId: string, instance: string): Promise<void> {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'The specified menu category was not found.',
      instance,
    })
  }
  const category = await MenuCategoryModel.findById(categoryId).lean()
  if (!category) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'The specified menu category was not found.',
      instance,
    })
  }
}

export async function listMenuItems(
  query: ListMenuItemsQuery,
): Promise<SuccessListResponse<IMenuItem>> {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const { search, category_id, is_available, is_sold_out } = query

  const filter: Record<string, unknown> = {}
  if (search !== undefined) filter['name'] = new RegExp(search, 'i')
  if (category_id !== undefined) filter['category_id'] = category_id
  if (is_available !== undefined) filter['is_available'] = is_available
  if (is_sold_out !== undefined) filter['is_sold_out'] = is_sold_out

  const skip = (page - 1) * limit
  const [rawItems, total] = await Promise.all([
    MenuItemModel.find(filter).skip(skip).limit(limit).lean(),
    MenuItemModel.countDocuments(filter),
  ])

  const items = rawItems as IMenuItem[]
  const totalPages = Math.ceil(total / limit)
  const pagination: Pagination = { page, limit, total, totalPages }

  return successList(items, pagination, 'Menu items retrieved successfully')
}

export async function getMenuItemById(id: string): Promise<IMenuItem> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Menu item not found.',
      instance: `/v1/menu-items/${id}`,
    })
  }

  const item = (await MenuItemModel.findById(id).lean()) as IMenuItem | null
  if (!item) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Menu item not found.',
      instance: `/v1/menu-items/${id}`,
    })
  }

  return item
}

export async function createMenuItem(input: CreateMenuItemInput): Promise<IMenuItem> {
  await verifyCategory(input.category_id, '/v1/menu-items')

  const dup = await MenuItemModel.findOne({
    category_id: input.category_id,
    name: input.name,
  }).lean()
  if (dup) {
    throw problem({
      type: 'conflict',
      title: 'Conflict',
      status: 409,
      detail: 'A menu item with this name already exists in the selected category.',
      instance: '/v1/menu-items',
    })
  }

  const item = await MenuItemModel.create({ ...input, is_sold_out: false })

  io.to('menu').emit('message', JSON.stringify({
    event: WS_EVENTS.MENU_ITEM_CREATED,
    channel: 'menu',
    data: { item_id: String(item._id) },
    timestamp: new Date().toISOString(),
  }))

  logger.info('Menu item created', { itemId: String(item._id), name: item.name })
  return item
}

export async function updateMenuItem(id: string, input: UpdateMenuItemInput): Promise<IMenuItem> {
  const existing = await getMenuItemById(id)

  if (input.category_id !== undefined) {
    await verifyCategory(input.category_id, `/v1/menu-items/${id}`)
  }

  if (input.name !== undefined) {
    const targetCategoryId = input.category_id ?? String(existing.category_id)
    const dup = await MenuItemModel.findOne({
      category_id: targetCategoryId,
      name: input.name,
      _id: { $ne: id },
    }).lean()
    if (dup) {
      throw problem({
        type: 'conflict',
        title: 'Conflict',
        status: 409,
        detail: 'A menu item with this name already exists in the selected category.',
        instance: `/v1/menu-items/${id}`,
      })
    }
  }

  const updated = await MenuItemModel.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  })
  if (!updated) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Menu item not found.',
      instance: `/v1/menu-items/${id}`,
    })
  }

  io.to('menu').emit('message', JSON.stringify({
    event: WS_EVENTS.MENU_ITEM_UPDATED,
    channel: 'menu',
    data: { item_id: id },
    timestamp: new Date().toISOString(),
  }))

  return updated
}

export async function deleteMenuItem(id: string): Promise<null> {
  await getMenuItemById(id)
  await MenuItemModel.findByIdAndDelete(id)

  io.to('menu').emit('message', JSON.stringify({
    event: WS_EVENTS.MENU_ITEM_DELETED,
    channel: 'menu',
    data: { item_id: id },
    timestamp: new Date().toISOString(),
  }))

  logger.info('Menu item deleted', { itemId: id })
  return null
}

export async function updateMenuItemAvailability(
  id: string,
  input: UpdateMenuItemAvailabilityInput,
): Promise<IMenuItem> {
  await getMenuItemById(id)

  const updated = await MenuItemModel.findByIdAndUpdate(id, input, { new: true })
  if (!updated) {
    throw problem({
      type: 'not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Menu item not found.',
      instance: `/v1/menu-items/${id}`,
    })
  }

  io.to('menu').emit('message', JSON.stringify({
    event: WS_EVENTS.MENU_ITEM_AVAILABILITY_UPDATED,
    channel: 'menu',
    data: {
      item_id: id,
      is_available: updated.is_available,
      is_sold_out: updated.is_sold_out,
    },
    timestamp: new Date().toISOString(),
  }))

  logger.info('Menu item availability updated', {
    itemId: id,
    is_available: input.is_available,
    is_sold_out: input.is_sold_out,
  })

  return updated
}
