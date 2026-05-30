import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type * as MenuItemService from '@/services/menu-item.service.js'

jest.unstable_mockModule('@/models/menu-item.model.js', () => ({
  MenuItemModel: {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
  },
}))

jest.unstable_mockModule('@/models/menu-category.model.js', () => ({
  MenuCategoryModel: {
    findById: jest.fn(),
  },
}))

jest.unstable_mockModule('@/utils/problem.js', () => ({
  problem: jest.fn((opts: Record<string, unknown>) => ({ ...opts, message: opts['detail'] })),
}))

let listMenuItems: typeof MenuItemService.listMenuItems
let getMenuItemById: typeof MenuItemService.getMenuItemById
let createMenuItem: typeof MenuItemService.createMenuItem
let updateMenuItem: typeof MenuItemService.updateMenuItem
let deleteMenuItem: typeof MenuItemService.deleteMenuItem
let updateMenuItemAvailability: typeof MenuItemService.updateMenuItemAvailability

let mockItemFind: jest.Mock
let mockItemFindById: jest.Mock
let mockItemFindOne: jest.Mock
let mockItemFindByIdAndDelete: jest.Mock
let mockItemFindByIdAndUpdate: jest.Mock
let mockItemCreate: jest.Mock
let mockCategoryFindById: jest.Mock

// find chain — set up in beforeAll, re-linked in beforeEach
let mockLean: jest.Mock
let mockLimit: jest.Mock
let mockSkip: jest.Mock

beforeAll(async () => {
  const itemModelMod = await import('@/models/menu-item.model.js')
  const categoryModelMod = await import('@/models/menu-category.model.js')
  const serviceMod = await import('@/services/menu-item.service.js')

  const MenuItemModel = itemModelMod.MenuItemModel as {
    find: jest.Mock
    findById: jest.Mock
    findOne: jest.Mock
    findByIdAndDelete: jest.Mock
    findByIdAndUpdate: jest.Mock
    create: jest.Mock
    countDocuments: jest.Mock
  }
  const MenuCategoryModel = categoryModelMod.MenuCategoryModel as { findById: jest.Mock }

  mockItemFind = MenuItemModel.find
  mockItemFindById = MenuItemModel.findById
  mockItemFindOne = MenuItemModel.findOne
  mockItemFindByIdAndDelete = MenuItemModel.findByIdAndDelete
  mockItemFindByIdAndUpdate = MenuItemModel.findByIdAndUpdate
  mockItemCreate = MenuItemModel.create
  mockCategoryFindById = MenuCategoryModel.findById

  mockLean = jest.fn()
  mockLimit = jest.fn().mockReturnValue({ lean: mockLean })
  mockSkip = jest.fn().mockReturnValue({ limit: mockLimit })

  listMenuItems = serviceMod.listMenuItems
  getMenuItemById = serviceMod.getMenuItemById
  createMenuItem = serviceMod.createMenuItem
  updateMenuItem = serviceMod.updateMenuItem
  deleteMenuItem = serviceMod.deleteMenuItem
  updateMenuItemAvailability = serviceMod.updateMenuItemAvailability
})

beforeEach(() => {
  jest.clearAllMocks()
  mockItemFind.mockReturnValue({ skip: mockSkip })
  mockSkip.mockReturnValue({ limit: mockLimit })
  mockLimit.mockReturnValue({ lean: mockLean })
})

const mockCategory = {
  _id: '64f1a2b3c4d5e6f7a8b9c0d2',
  name: 'Main Course',
}

const mockItem = {
  _id: '64f1a2b3c4d5e6f7a8b9c0d1',
  category_id: '64f1a2b3c4d5e6f7a8b9c0d2',
  name: 'Pad Thai',
  price: 120,
  description: 'Stir-fried rice noodles with shrimp.',
  image_url: null,
  is_available: true,
  is_sold_out: false,
  save: jest.fn(),
}

const itemId = '64f1a2b3c4d5e6f7a8b9c0d1'
const categoryId = '64f1a2b3c4d5e6f7a8b9c0d2'

// ─── listMenuItems() ──────────────────────────────────────────────────────────

describe('listMenuItems()', () => {
  it('returns paginated list with default page/limit', async () => {
    mockLean.mockResolvedValue([mockItem])

    const result = await listMenuItems({ page: 1, limit: 20 })

    expect(mockItemFind).toHaveBeenCalledWith({})
    expect(mockSkip).toHaveBeenCalledWith(0)
    expect(mockLimit).toHaveBeenCalledWith(20)
    expect(result.data).toEqual([mockItem])
  })

  it('filters by category_id when provided', async () => {
    mockLean.mockResolvedValue([mockItem])

    await listMenuItems({ page: 1, limit: 20, category_id: categoryId })

    expect(mockItemFind).toHaveBeenCalledWith({ category_id: categoryId })
  })

  it('filters by is_available when provided', async () => {
    mockLean.mockResolvedValue([mockItem])

    await listMenuItems({ page: 1, limit: 20, is_available: true })

    expect(mockItemFind).toHaveBeenCalledWith({ is_available: true })
  })

  it('filters by is_sold_out when provided', async () => {
    mockLean.mockResolvedValue([])

    await listMenuItems({ page: 1, limit: 20, is_sold_out: true })

    expect(mockItemFind).toHaveBeenCalledWith({ is_sold_out: true })
  })

  it('filters by search (regex on name) when provided', async () => {
    mockLean.mockResolvedValue([mockItem])

    await listMenuItems({ page: 1, limit: 20, search: 'Pad' })

    const filter = mockItemFind.mock.calls[0]?.[0] as Record<string, unknown>
    expect(filter['name']).toBeInstanceOf(RegExp)
    expect((filter['name'] as RegExp).flags).toContain('i')
  })
})

// ─── getMenuItemById() ────────────────────────────────────────────────────────

describe('getMenuItemById()', () => {
  it('returns item when found', async () => {
    const leanMock = jest.fn().mockResolvedValue(mockItem)
    mockItemFindById.mockReturnValue({ lean: leanMock })

    const result = await getMenuItemById(itemId)

    expect(result).toEqual(mockItem)
    expect(leanMock).toHaveBeenCalled()
  })

  it('throws 404 when not found', async () => {
    const leanMock = jest.fn().mockResolvedValue(null)
    mockItemFindById.mockReturnValue({ lean: leanMock })

    await expect(getMenuItemById(itemId)).rejects.toMatchObject({
      status: 404,
      detail: 'Menu item not found.',
    })
  })
})

// ─── createMenuItem() ─────────────────────────────────────────────────────────

describe('createMenuItem()', () => {
  const createInput = {
    category_id: categoryId,
    name: 'Pad Thai',
    price: 120,
    description: 'Stir-fried rice noodles with shrimp.' as string | null,
    image_url: null as string | null,
  }

  it('creates and returns item with is_sold_out: false when valid', async () => {
    mockCategoryFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockCategory) })
    mockItemFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })
    mockItemCreate.mockResolvedValue(mockItem)

    const result = await createMenuItem(createInput)

    const createArg = mockItemCreate.mock.calls[0]?.[0] as Record<string, unknown>
    expect(createArg['is_sold_out']).toBe(false)
    expect(result).toEqual(mockItem)
  })

  it('throws 404 when category_id does not exist', async () => {
    mockCategoryFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

    await expect(createMenuItem(createInput)).rejects.toMatchObject({
      status: 404,
      detail: 'The specified menu category was not found.',
    })
    expect(mockItemCreate).not.toHaveBeenCalled()
  })

  it('throws 409 when name already exists in same category', async () => {
    mockCategoryFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockCategory) })
    mockItemFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockItem) })

    await expect(createMenuItem(createInput)).rejects.toMatchObject({
      status: 409,
      detail: 'A menu item with this name already exists in the selected category.',
    })
    expect(mockItemCreate).not.toHaveBeenCalled()
  })
})

// ─── updateMenuItem() ─────────────────────────────────────────────────────────

describe('updateMenuItem()', () => {
  it('updates and returns item when valid', async () => {
    const updatedItem = { ...mockItem, price: 150 }
    mockItemFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockItem) })
    mockItemFindByIdAndUpdate.mockResolvedValue(updatedItem)

    const result = await updateMenuItem(itemId, { price: 150 })

    expect(result).toEqual(updatedItem)
    expect(mockItemFindByIdAndUpdate).toHaveBeenCalledWith(
      itemId,
      { price: 150 },
      { new: true, runValidators: true },
    )
  })

  it('throws 404 when item not found', async () => {
    mockItemFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

    await expect(updateMenuItem(itemId, { price: 150 })).rejects.toMatchObject({
      status: 404,
      detail: 'Menu item not found.',
    })
  })

  it('throws 404 when new category_id does not exist', async () => {
    mockItemFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockItem) })
    mockCategoryFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

    await expect(updateMenuItem(itemId, { category_id: categoryId })).rejects.toMatchObject({
      status: 404,
      detail: 'The specified menu category was not found.',
    })
  })

  it('throws 409 when new name already taken in target category', async () => {
    mockItemFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockItem) })
    mockItemFindOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: 'other-id', name: 'Pad Thai' }) })

    await expect(updateMenuItem(itemId, { name: 'Pad Thai' })).rejects.toMatchObject({
      status: 409,
      detail: 'A menu item with this name already exists in the selected category.',
    })
    expect(mockItemFindByIdAndUpdate).not.toHaveBeenCalled()
  })
})

// ─── deleteMenuItem() ─────────────────────────────────────────────────────────

describe('deleteMenuItem()', () => {
  it('deletes item and returns null', async () => {
    mockItemFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockItem) })
    mockItemFindByIdAndDelete.mockResolvedValue(mockItem)

    const result = await deleteMenuItem(itemId)

    expect(result).toBeNull()
    expect(mockItemFindByIdAndDelete).toHaveBeenCalledWith(itemId)
  })

  it('throws 404 when item not found', async () => {
    mockItemFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

    await expect(deleteMenuItem(itemId)).rejects.toMatchObject({
      status: 404,
      detail: 'Menu item not found.',
    })
  })
})

// ─── updateMenuItemAvailability() ─────────────────────────────────────────────

describe('updateMenuItemAvailability()', () => {
  it('updates is_available and returns item', async () => {
    const updatedItem = { ...mockItem, is_available: false }
    mockItemFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockItem) })
    mockItemFindByIdAndUpdate.mockResolvedValue(updatedItem)

    const result = await updateMenuItemAvailability(itemId, { is_available: false, is_sold_out: false })

    expect(result).toEqual(updatedItem)
    expect(mockItemFindByIdAndUpdate).toHaveBeenCalledWith(
      itemId,
      { is_available: false, is_sold_out: false },
      { new: true },
    )
  })

  it('updates is_sold_out and returns item', async () => {
    const updatedItem = { ...mockItem, is_sold_out: true }
    mockItemFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockItem) })
    mockItemFindByIdAndUpdate.mockResolvedValue(updatedItem)

    const result = await updateMenuItemAvailability(itemId, { is_available: true, is_sold_out: true })

    expect(result).toEqual(updatedItem)
  })

  it('throws 404 when item not found', async () => {
    mockItemFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

    await expect(
      updateMenuItemAvailability(itemId, { is_available: false, is_sold_out: false }),
    ).rejects.toMatchObject({
      status: 404,
      detail: 'Menu item not found.',
    })
  })
})
