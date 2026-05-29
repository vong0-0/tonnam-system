import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type * as UserService from '@/services/user.service.js'

jest.unstable_mockModule('mongoose', () => ({
  default: {
    Types: {
      ObjectId: {
        isValid: jest.fn(),
      },
    },
  },
}))

jest.unstable_mockModule('bcrypt', () => ({
  default: { hash: jest.fn() },
}))

jest.unstable_mockModule('@/models/user.model.js', () => ({
  UserModel: {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
  },
}))

let listUsers: typeof UserService.listUsers
let getUserById: typeof UserService.getUserById
let createUser: typeof UserService.createUser
let updateUser: typeof UserService.updateUser
let deactivateUser: typeof UserService.deactivateUser

let mockFind: jest.Mock
let mockFindOne: jest.Mock
let mockFindById: jest.Mock
let mockFindByIdAndUpdate: jest.Mock
let mockCountDocuments: jest.Mock
let mockCreate: jest.Mock
let mockIsValid: jest.Mock
let mockHash: jest.Mock

// find chain — set up in beforeAll, re-linked in beforeEach
let mockLean: jest.Mock
let mockLimit: jest.Mock
let mockSkip: jest.Mock

beforeAll(async () => {
  const bcryptMod = await import('bcrypt')
  const mongooseMod = await import('mongoose')
  const modelMod = await import('@/models/user.model.js')
  const serviceMod = await import('@/services/user.service.js')

  mockHash = (bcryptMod.default as { hash: jest.Mock }).hash
  mockIsValid = (
    mongooseMod.default as { Types: { ObjectId: { isValid: jest.Mock } } }
  ).Types.ObjectId.isValid

  const UserModel = modelMod.UserModel as {
    find: jest.Mock
    findOne: jest.Mock
    findById: jest.Mock
    findByIdAndUpdate: jest.Mock
    countDocuments: jest.Mock
    create: jest.Mock
  }

  mockFind = UserModel.find
  mockFindOne = UserModel.findOne
  mockFindById = UserModel.findById
  mockFindByIdAndUpdate = UserModel.findByIdAndUpdate
  mockCountDocuments = UserModel.countDocuments
  mockCreate = UserModel.create

  mockLean = jest.fn()
  mockLimit = jest.fn().mockReturnValue({ lean: mockLean })
  mockSkip = jest.fn().mockReturnValue({ limit: mockLimit })

  listUsers = serviceMod.listUsers
  getUserById = serviceMod.getUserById
  createUser = serviceMod.createUser
  updateUser = serviceMod.updateUser
  deactivateUser = serviceMod.deactivateUser
})

beforeEach(() => {
  jest.clearAllMocks()
  // Re-link find chain after clearAllMocks resets call tracking
  mockFind.mockReturnValue({ skip: mockSkip })
  mockSkip.mockReturnValue({ limit: mockLimit })
  mockLimit.mockReturnValue({ lean: mockLean })
})

const mockUser = {
  _id: '64f1a2b3c4d5e6f7a8b9c0d1',
  username: 'waiter01',
  first_name: 'Malee',
  last_name: 'Srisuk',
  phone: '02012345678',
  email: 'malee@tonnam.com',
  role: 'WAITER',
  is_active: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const mockPagination = {
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
}

// ─── listUsers() ──────────────────────────────────────────────────────────────

describe('listUsers()', () => {
  it('returns items and pagination with no filters', async () => {
    mockLean.mockResolvedValue([mockUser])
    mockCountDocuments.mockResolvedValue(1)

    const result = await listUsers({ page: 1, limit: 20 })

    expect(result).toEqual({ items: [mockUser], pagination: mockPagination })
    expect(mockFind).toHaveBeenCalledWith({})
    expect(mockSkip).toHaveBeenCalledWith(0)
    expect(mockLimit).toHaveBeenCalledWith(20)
    expect(mockLean).toHaveBeenCalled()
  })

  it('applies $or regex filter for each field when search is provided', async () => {
    mockLean.mockResolvedValue([mockUser])
    mockCountDocuments.mockResolvedValue(1)

    await listUsers({ page: 1, limit: 20, search: 'Malee' })

    const filter = mockFind.mock.calls[0]?.[0] as Record<string, unknown>
    expect(filter).toHaveProperty('$or')
    const or = filter['$or'] as Array<Record<string, RegExp>>
    const fields = or.map((clause) => Object.keys(clause)[0])
    expect(fields).toEqual(
      expect.arrayContaining(['first_name', 'last_name', 'username', 'phone', 'email']),
    )
    or.forEach((clause) => {
      const regex = Object.values(clause)[0]
      expect(regex).toBeInstanceOf(RegExp)
      expect(regex.flags).toContain('i')
    })
  })

  it('applies role filter', async () => {
    mockLean.mockResolvedValue([mockUser])
    mockCountDocuments.mockResolvedValue(1)

    await listUsers({ page: 1, limit: 20, role: 'WAITER' })

    expect(mockFind).toHaveBeenCalledWith({ role: 'WAITER' })
  })

  it('applies is_active filter and returns empty result set', async () => {
    mockLean.mockResolvedValue([])
    mockCountDocuments.mockResolvedValue(0)

    const result = await listUsers({ page: 1, limit: 20, is_active: false })

    expect(mockFind).toHaveBeenCalledWith({ is_active: false })
    expect(result).toEqual({
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    })
  })

  it('calculates skip(20) and totalPages 2 on page 2 with 25 results', async () => {
    mockLean.mockResolvedValue([mockUser])
    mockCountDocuments.mockResolvedValue(25)

    const result = await listUsers({ page: 2, limit: 20 })

    expect(mockSkip).toHaveBeenCalledWith(20)
    expect(result.pagination.totalPages).toBe(2)
    expect(result.pagination.page).toBe(2)
  })
})

// ─── getUserById() ────────────────────────────────────────────────────────────

describe('getUserById()', () => {
  it('returns user and calls lean() when found', async () => {
    mockIsValid.mockReturnValue(true)
    const leanMock = jest.fn().mockResolvedValue(mockUser)
    mockFindById.mockReturnValue({ lean: leanMock })

    const result = await getUserById('64f1a2b3c4d5e6f7a8b9c0d1')

    expect(result).toEqual(mockUser)
    expect(leanMock).toHaveBeenCalled()
  })

  it('throws 400 and never calls findById for invalid ObjectId', async () => {
    mockIsValid.mockReturnValue(false)

    await expect(getUserById('invalid-id')).rejects.toMatchObject({
      status: 400,
      message: 'Invalid user ID format',
    })
    expect(mockFindById).not.toHaveBeenCalled()
  })

  it('throws 404 when user is not found', async () => {
    mockIsValid.mockReturnValue(true)
    const leanMock = jest.fn().mockResolvedValue(null)
    mockFindById.mockReturnValue({ lean: leanMock })

    await expect(getUserById('64f1a2b3c4d5e6f7a8b9c0d1')).rejects.toMatchObject({
      status: 404,
      message: 'User not found',
    })
  })
})

// ─── createUser() ─────────────────────────────────────────────────────────────

describe('createUser()', () => {
  const createInput = {
    username: 'waiter01',
    first_name: 'Malee',
    last_name: 'Srisuk',
    phone: '02012345678',
    email: 'malee@tonnam.com',
    password: 'P@ssw0rd',
    role: 'WAITER' as const,
  }

  it('hashes password and returns created user on success', async () => {
    mockFindOne.mockResolvedValue(null)
    mockHash.mockResolvedValue('$2b$10$hashedpassword')
    mockCreate.mockResolvedValue(mockUser)

    const result = await createUser(createInput)

    expect(mockHash).toHaveBeenCalledWith('P@ssw0rd', 10)
    const createArg = mockCreate.mock.calls[0]?.[0] as Record<string, unknown>
    expect(createArg['password']).toBe('$2b$10$hashedpassword')
    expect(createArg['password']).not.toBe('P@ssw0rd')
    expect(result).toEqual(mockUser)
  })

  it('throws 409 and never hashes password when username is taken', async () => {
    mockFindOne.mockResolvedValue(mockUser)

    await expect(createUser(createInput)).rejects.toMatchObject({
      status: 409,
      message: 'Username already taken',
    })
    expect(mockHash).not.toHaveBeenCalled()
  })

  it('throws 409 when phone is already registered', async () => {
    mockFindOne.mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser)

    await expect(createUser(createInput)).rejects.toMatchObject({
      status: 409,
      message: 'Phone number already registered',
    })
  })

  it('throws 409 when email is already registered', async () => {
    mockFindOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockUser)

    await expect(createUser(createInput)).rejects.toMatchObject({
      status: 409,
      message: 'Email already registered',
    })
  })
})

// ─── updateUser() ─────────────────────────────────────────────────────────────

describe('updateUser()', () => {
  const userId = '64f1a2b3c4d5e6f7a8b9c0d1'

  it('updates and returns user on success', async () => {
    const updatedUser = { ...mockUser, first_name: 'Mali' }
    mockIsValid.mockReturnValue(true)
    mockFindById.mockResolvedValue(mockUser)
    mockFindOne.mockResolvedValue(null)
    mockFindByIdAndUpdate.mockResolvedValue(updatedUser)

    const result = await updateUser(userId, { first_name: 'Mali' })

    expect(result).toEqual(updatedUser)
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      { first_name: 'Mali' },
      { new: true, runValidators: true },
    )
  })

  it('throws 409 when phone belongs to a different user', async () => {
    mockIsValid.mockReturnValue(true)
    mockFindById.mockResolvedValue(mockUser)
    mockFindOne.mockResolvedValue({ _id: 'another-user-id', phone: '0899999999' })

    await expect(updateUser(userId, { phone: '0899999999' })).rejects.toMatchObject({
      status: 409,
      message: 'Phone number already registered',
    })
  })

  it('throws 404 when user does not exist', async () => {
    mockIsValid.mockReturnValue(true)
    mockFindById.mockResolvedValue(null)

    await expect(updateUser(userId, { first_name: 'Mali' })).rejects.toMatchObject({
      status: 404,
      message: 'User not found',
    })
  })
})

// ─── deactivateUser() ─────────────────────────────────────────────────────────

describe('deactivateUser()', () => {
  const userId = '64f1a2b3c4d5e6f7a8b9c0d1'

  it('sets is_active to false and returns updated user', async () => {
    const deactivatedUser = { ...mockUser, is_active: false }
    mockIsValid.mockReturnValue(true)
    mockFindById.mockResolvedValue(mockUser)
    mockFindByIdAndUpdate.mockResolvedValue(deactivatedUser)

    const result = await deactivateUser(userId)

    expect(result).toMatchObject({ is_active: false })
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      { is_active: false },
      { new: true },
    )
  })

  it('throws 409 when user is already deactivated', async () => {
    mockIsValid.mockReturnValue(true)
    mockFindById.mockResolvedValue({ ...mockUser, is_active: false })

    await expect(deactivateUser(userId)).rejects.toMatchObject({
      status: 409,
      message: 'User is already deactivated',
    })
  })

  it('throws 404 when user does not exist', async () => {
    mockIsValid.mockReturnValue(true)
    mockFindById.mockResolvedValue(null)

    await expect(deactivateUser(userId)).rejects.toMatchObject({
      status: 404,
      message: 'User not found',
    })
  })
})
