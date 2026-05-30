import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type * as MenuCategoryService from '@/services/menu-category.service.js'

jest.unstable_mockModule('@/models/menu-category.model.js', () => ({
  MenuCategoryModel: {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
  },
}))

jest.unstable_mockModule('@/models/menu-item.model.js', () => ({
  MenuItemModel: {
    countDocuments: jest.fn(),
  },
}))

jest.unstable_mockModule('@/utils/problem.js', () => ({
  problem: jest.fn((opts: Record<string, unknown>) => ({ ...opts, message: opts['detail'] })),
}))

let listMenuCategories: typeof MenuCategoryService.listMenuCategories
let getMenuCategoryById: typeof MenuCategoryService.getMenuCategoryById
let createMenuCategory: typeof MenuCategoryService.createMenuCategory
let updateMenuCategory: typeof MenuCategoryService.updateMenuCategory
let deleteMenuCategory: typeof MenuCategoryService.deleteMenuCategory

let mockFind: jest.Mock
let mockFindById: jest.Mock
let mockFindOne: jest.Mock
let mockFindByIdAndUpdate: jest.Mock
let mockFindByIdAndDelete: jest.Mock
let mockCategoryCountDocuments: jest.Mock
let mockCreate: jest.Mock
let mockItemCountDocuments: jest.Mock

// find chain: find → skip → limit (no lean — service needs documents for toObject())
let mockLimit: jest.Mock
let mockSkip: jest.Mock

beforeAll(async () => {
  const categoryModelMod = await import('@/models/menu-category.model.js')
  const itemModelMod = await import('@/models/menu-item.model.js')
  const serviceMod = await import('@/services/menu-category.service.js')

  const MenuCategoryModel = categoryModelMod.MenuCategoryModel as {
    find: jest.Mock
    findById: jest.Mock
    findOne: jest.Mock
    findByIdAndUpdate: jest.Mock
    findByIdAndDelete: jest.Mock
    countDocuments: jest.Mock
    create: jest.Mock
  }
  const MenuItemModel = itemModelMod.MenuItemModel as { countDocuments: jest.Mock }

  mockFind = MenuCategoryModel.find
  mockFindById = MenuCategoryModel.findById
  mockFindOne = MenuCategoryModel.findOne
  mockFindByIdAndUpdate = MenuCategoryModel.findByIdAndUpdate
  mockFindByIdAndDelete = MenuCategoryModel.findByIdAndDelete
  mockCategoryCountDocuments = MenuCategoryModel.countDocuments
  mockCreate = MenuCategoryModel.create
  mockItemCountDocuments = MenuItemModel.countDocuments

  mockLimit = jest.fn()
  mockSkip = jest.fn().mockReturnValue({ limit: mockLimit })

  listMenuCategories = serviceMod.listMenuCategories
  getMenuCategoryById = serviceMod.getMenuCategoryById
  createMenuCategory = serviceMod.createMenuCategory
  updateMenuCategory = serviceMod.updateMenuCategory
  deleteMenuCategory = serviceMod.deleteMenuCategory
})

beforeEach(() => {
  jest.clearAllMocks()
  mockFind.mockReturnValue({ skip: mockSkip })
  mockSkip.mockReturnValue({ limit: mockLimit })
})

const mockCategory = {
  _id: '64f1a2b3c4d5e6f7a8b9c0d1',
  name: 'Main Course',
  description: 'Signature dishes from our chef.',
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01'),
  toObject: jest.fn().mockReturnValue({
    _id: '64f1a2b3c4d5e6f7a8b9c0d1',
    name: 'Main Course',
    description: 'Signature dishes from our chef.',
  }),
}

const categoryId = '64f1a2b3c4d5e6f7a8b9c0d1'

// ─── listMenuCategories() ─────────────────────────────────────────────────────

describe('listMenuCategories()', () => {
  it('returns paginated list with item_count on each category', async () => {
    mockLimit.mockResolvedValue([mockCategory])
    mockCategoryCountDocuments.mockResolvedValue(1)
    mockItemCountDocuments.mockResolvedValue(3)

    const result = await listMenuCategories({ page: 1, limit: 20 })

    expect(mockFind).toHaveBeenCalledWith({})
    expect(mockSkip).toHaveBeenCalledWith(0)
    expect(mockLimit).toHaveBeenCalledWith(20)
    expect(result.data[0]).toMatchObject({ name: 'Main Course', item_count: 3 })
    expect(result.pagination).toMatchObject({ page: 1, limit: 20, total: 1, totalPages: 1 })
  })

  it('filters by search (regex on name) when provided', async () => {
    mockLimit.mockResolvedValue([mockCategory])
    mockCategoryCountDocuments.mockResolvedValue(1)
    mockItemCountDocuments.mockResolvedValue(3)

    await listMenuCategories({ page: 1, limit: 20, search: 'Main' })

    const filter = mockFind.mock.calls[0]?.[0] as Record<string, unknown>
    expect(filter['name']).toBeInstanceOf(RegExp)
    expect((filter['name'] as RegExp).flags).toContain('i')
  })

  it('returns empty list when no categories match', async () => {
    mockLimit.mockResolvedValue([])
    mockCategoryCountDocuments.mockResolvedValue(0)

    const result = await listMenuCategories({ page: 1, limit: 20, search: 'Nonexistent' })

    expect(result.data).toEqual([])
    expect(result.pagination).toMatchObject({ total: 0, totalPages: 0 })
  })
})

// ─── getMenuCategoryById() ────────────────────────────────────────────────────

describe('getMenuCategoryById()', () => {
  it('returns category with item_count when found', async () => {
    mockFindById.mockResolvedValue(mockCategory)
    mockItemCountDocuments.mockResolvedValue(3)

    const result = await getMenuCategoryById(categoryId)

    expect(result).toMatchObject({ name: 'Main Course', item_count: 3 })
    expect(mockItemCountDocuments).toHaveBeenCalledWith({ category_id: mockCategory._id })
  })

  it('throws 404 when not found', async () => {
    mockFindById.mockResolvedValue(null)

    await expect(getMenuCategoryById(categoryId)).rejects.toMatchObject({
      status: 404,
      detail: 'Menu category not found.',
    })
  })
})

// ─── createMenuCategory() ─────────────────────────────────────────────────────

describe('createMenuCategory()', () => {
  it('creates and returns category with item_count when name is unique', async () => {
    mockFindOne.mockResolvedValue(null)
    mockCreate.mockResolvedValue(mockCategory)
    mockItemCountDocuments.mockResolvedValue(3)

    const result = await createMenuCategory({ name: 'Main Course' })

    expect(mockCreate).toHaveBeenCalledWith({ name: 'Main Course' })
    expect(result).toMatchObject({ name: 'Main Course', item_count: 3 })
  })

  it('throws 409 when name already exists', async () => {
    mockFindOne.mockResolvedValue(mockCategory)

    await expect(createMenuCategory({ name: 'Main Course' })).rejects.toMatchObject({
      status: 409,
      detail: 'A menu category with this name already exists.',
    })
    expect(mockCreate).not.toHaveBeenCalled()
  })
})

// ─── updateMenuCategory() ─────────────────────────────────────────────────────

describe('updateMenuCategory()', () => {
  it('updates and returns category with item_count when valid', async () => {
    const updatedCategory = {
      ...mockCategory,
      name: 'Appetizers',
      toObject: jest.fn().mockReturnValue({
        _id: categoryId,
        name: 'Appetizers',
        description: 'Signature dishes from our chef.',
      }),
    }
    mockFindById.mockResolvedValue(mockCategory)
    mockFindOne.mockResolvedValue(null)
    mockFindByIdAndUpdate.mockResolvedValue(updatedCategory)
    mockItemCountDocuments.mockResolvedValue(3)

    const result = await updateMenuCategory(categoryId, { name: 'Appetizers' })

    expect(result).toMatchObject({ name: 'Appetizers', item_count: 3 })
  })

  it('throws 404 when category not found', async () => {
    mockFindById.mockResolvedValue(null)

    await expect(updateMenuCategory(categoryId, { name: 'Appetizers' })).rejects.toMatchObject({
      status: 404,
      detail: 'Menu category not found.',
    })
  })

  it('throws 409 when new name already taken', async () => {
    mockFindById.mockResolvedValue(mockCategory)
    mockFindOne.mockResolvedValue({ _id: 'another-id', name: 'Appetizers' })

    await expect(updateMenuCategory(categoryId, { name: 'Appetizers' })).rejects.toMatchObject({
      status: 409,
      detail: 'A menu category with this name already exists.',
    })
    expect(mockFindByIdAndUpdate).not.toHaveBeenCalled()
  })
})

// ─── deleteMenuCategory() ─────────────────────────────────────────────────────

describe('deleteMenuCategory()', () => {
  it('deletes category when item_count is 0', async () => {
    mockFindById.mockResolvedValue(mockCategory)
    mockItemCountDocuments.mockResolvedValue(0)
    mockFindByIdAndDelete.mockResolvedValue(mockCategory)

    const result = await deleteMenuCategory(categoryId)

    expect(result).toBeNull()
    expect(mockFindByIdAndDelete).toHaveBeenCalledWith(categoryId)
  })

  it('throws 404 when category not found', async () => {
    mockFindById.mockResolvedValue(null)

    await expect(deleteMenuCategory(categoryId)).rejects.toMatchObject({
      status: 404,
      detail: 'Menu category not found.',
    })
  })

  it('throws 409 when item_count > 0 (has menu items assigned)', async () => {
    mockFindById.mockResolvedValue(mockCategory)
    mockItemCountDocuments.mockResolvedValue(3)

    await expect(deleteMenuCategory(categoryId)).rejects.toMatchObject({
      status: 409,
      detail: 'Cannot delete a category that still has menu items assigned.',
    })
    expect(mockFindByIdAndDelete).not.toHaveBeenCalled()
  })
})
