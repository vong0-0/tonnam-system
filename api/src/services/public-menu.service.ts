import { MenuCategoryModel } from '@/models/menu-category.model.js'
import { MenuItemModel, type IMenuItem } from '@/models/menu-item.model.js'
import { successList, type SuccessListResponse } from '@/utils/response.js'

interface PublicMenuQuery {
  page?: number
  limit?: number
  search?: string
  category_id?: string
}

export interface PublicMenuItem {
  _id: string
  category_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
}

export interface PublicMenuCategory {
  _id: string
  name: string
  item_count: number
}

const SELLABLE_FILTER = { is_available: true, is_sold_out: false }

export async function listPublicMenuItems(
  query: PublicMenuQuery,
): Promise<SuccessListResponse<PublicMenuItem>> {
  const page = Math.max(1, query.page ?? 1)
  const limit = Math.min(50, Math.max(1, query.limit ?? 24))
  const filter: Record<string, unknown> = { ...SELLABLE_FILTER }
  if (query.search) filter['name'] = new RegExp(query.search, 'i')
  if (query.category_id) filter['category_id'] = query.category_id

  const [items, total] = await Promise.all([
    MenuItemModel.find(filter)
      .select('category_id name description price image_url')
      .sort({ name: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean() as Promise<IMenuItem[]>,
    MenuItemModel.countDocuments(filter),
  ])

  return successList(
    items.map((item) => ({
      _id: String(item._id),
      category_id: String(item.category_id),
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url,
    })),
    { page, limit, total, totalPages: Math.ceil(total / limit) },
    'Public menu items retrieved successfully',
  )
}

export async function listPublicMenuCategories(): Promise<PublicMenuCategory[]> {
  const [categories, counts] = await Promise.all([
    MenuCategoryModel.find().select('name').sort({ name: 1 }).lean(),
    MenuItemModel.aggregate<{ _id: unknown; item_count: number }>([
      { $match: SELLABLE_FILTER },
      { $group: { _id: '$category_id', item_count: { $sum: 1 } } },
    ]),
  ])
  const countByCategory = new Map(counts.map((count) => [String(count._id), count.item_count]))

  return categories.flatMap((category) => {
    const item_count = countByCategory.get(String(category._id)) ?? 0
    return item_count > 0 ? [{ _id: String(category._id), name: category.name, item_count }] : []
  })
}
