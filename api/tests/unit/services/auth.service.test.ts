import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type * as AuthService from '../../../src/services/auth.service.js'

// Register mocks BEFORE dynamic imports — jest.unstable_mockModule is the ESM-safe API
jest.unstable_mockModule('node:crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid-1234'),
}))

jest.unstable_mockModule('bcrypt', () => ({
  default: { compare: jest.fn() },
}))

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { sign: jest.fn(), verify: jest.fn() },
}))

jest.unstable_mockModule('../../../src/models/user.model.js', () => ({
  UserModel: { findOne: jest.fn() },
}))

// Dynamically import modules AFTER mocks are registered to get mocked versions
let login: typeof AuthService.login
let refreshAccessToken: typeof AuthService.refreshAccessToken
let logout: typeof AuthService.logout
let generateWsTicket: typeof AuthService.generateWsTicket
let validateWsTicket: typeof AuthService.validateWsTicket
let ticketStore: typeof AuthService.ticketStore

let mockFindOne: jest.Mock
let mockCompare: jest.Mock
let mockSign: jest.Mock
let mockVerify: jest.Mock

beforeAll(async () => {
  const bcryptMod = await import('bcrypt')
  const jwtMod = await import('jsonwebtoken')
  const modelMod = await import('../../../src/models/user.model.js')
  const serviceMod = await import('../../../src/services/auth.service.js')

  mockCompare = (bcryptMod.default as { compare: jest.Mock }).compare
  mockSign = (jwtMod.default as { sign: jest.Mock; verify: jest.Mock }).sign
  mockVerify = (jwtMod.default as { sign: jest.Mock; verify: jest.Mock }).verify
  mockFindOne = (modelMod.UserModel as { findOne: jest.Mock }).findOne

  login = serviceMod.login
  refreshAccessToken = serviceMod.refreshAccessToken
  logout = serviceMod.logout
  generateWsTicket = serviceMod.generateWsTicket
  validateWsTicket = serviceMod.validateWsTicket
  ticketStore = serviceMod.ticketStore

  process.env['JWT_SECRET'] = 'test-jwt-secret'
  process.env['JWT_EXPIRES_IN'] = '15m'
  process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret'
  process.env['JWT_REFRESH_EXPIRES_IN'] = '7d'
  process.env['WS_TICKET_EXPIRES_IN'] = '30'
})

beforeEach(() => {
  jest.clearAllMocks()
  ticketStore.clear()
})

const mockUser = {
  _id: '64f1a2b3c4d5e6f7a8b9c0d1',
  userId: '64f1a2b3c4d5e6f7a8b9c0d1',
  username: 'admin01',
  first_name: 'Somsak',
  last_name: 'Jaidee',
  role: 'ADMIN',
  name: 'Somsak Jaidee',
  is_active: true,
  password: '$2b$10$hashedpassword',
}

// ─── login() ──────────────────────────────────────────────────────────────────

describe('login()', () => {
  it('returns token pair on successful login', async () => {
    mockFindOne.mockResolvedValue(mockUser)
    mockCompare.mockResolvedValue(true)
    mockSign.mockReturnValueOnce('mock-access-token').mockReturnValueOnce('mock-refresh-token')

    const result = await login('admin01', 'P@ssw0rd')

    expect(result).toEqual({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' })
    expect(mockSign).toHaveBeenCalledTimes(2)

    const firstPayload = mockSign.mock.calls[0]![0] as Record<string, unknown>
    expect(firstPayload).toMatchObject({ userId: mockUser._id, role: 'ADMIN', name: 'Somsak Jaidee' })

    const secondPayload = mockSign.mock.calls[1]![0] as Record<string, unknown>
    expect(secondPayload).toEqual({ userId: mockUser._id })
  })

  it('throws 401 when username is not found', async () => {
    mockFindOne.mockResolvedValue(null)

    await expect(login('wronguser', 'P@ssw0rd')).rejects.toMatchObject({
      status: 401,
      message: 'Invalid username or password',
    })
    expect(mockCompare).not.toHaveBeenCalled()
  })

  it('throws 401 when password is wrong', async () => {
    mockFindOne.mockResolvedValue(mockUser)
    mockCompare.mockResolvedValue(false)

    await expect(login('admin01', 'wrongpassword')).rejects.toMatchObject({
      status: 401,
      message: 'Invalid username or password',
    })
  })

  it('throws 401 with same message when user is inactive', async () => {
    mockFindOne.mockResolvedValue(null) // is_active filter causes findOne to return null

    await expect(login('admin01', 'P@ssw0rd')).rejects.toMatchObject({
      status: 401,
      message: 'Invalid username or password',
    })
  })
})

// ─── refreshAccessToken() ─────────────────────────────────────────────────────

describe('refreshAccessToken()', () => {
  it('returns new token pair and rotates refresh token', async () => {
    mockVerify.mockReturnValue({ userId: mockUser._id })
    mockFindOne.mockResolvedValue(mockUser)
    mockSign.mockReturnValueOnce('new-access-token').mockReturnValueOnce('new-refresh-token')

    const result = await refreshAccessToken('valid-refresh-token')

    expect(result).toEqual({ accessToken: 'new-access-token', refreshToken: 'new-refresh-token' })
    expect(mockSign).toHaveBeenCalledTimes(2)
  })

  it('throws 401 when token is invalid', async () => {
    mockVerify.mockImplementation(() => {
      throw new Error('invalid signature')
    })

    await expect(refreshAccessToken('invalid-token')).rejects.toMatchObject({
      status: 401,
      message: 'Invalid or expired refresh token',
    })
  })

  it('throws 401 when token is expired', async () => {
    mockVerify.mockImplementation(() => {
      throw new Error('jwt expired')
    })

    await expect(refreshAccessToken('expired-token')).rejects.toMatchObject({
      status: 401,
      message: 'Invalid or expired refresh token',
    })
  })

  it('throws 401 when user is not found in database', async () => {
    mockVerify.mockReturnValue({ userId: mockUser._id })
    mockFindOne.mockResolvedValue(null)

    await expect(refreshAccessToken('valid-refresh-token')).rejects.toMatchObject({
      status: 401,
    })
  })
})

// ─── logout() ─────────────────────────────────────────────────────────────────

describe('logout()', () => {
  it('resolves without throwing', async () => {
    await expect(logout('64f1a2b3c4d5e6f7a8b9c0d1')).resolves.toBeUndefined()
  })
})

// ─── generateWsTicket() ───────────────────────────────────────────────────────

describe('generateWsTicket()', () => {
  it('returns ticket payload and stores entry in ticketStore', async () => {
    const result = await generateWsTicket(mockUser._id, 'ADMIN', 'Somsak Jaidee')

    expect(result).toEqual({ ticket: 'test-uuid-1234', expiresIn: 30 })
    expect(ticketStore.has('test-uuid-1234')).toBe(true)
    expect(ticketStore.get('test-uuid-1234')).toMatchObject({
      userId: mockUser._id,
      role: 'ADMIN',
      name: 'Somsak Jaidee',
    })
  })
})

// ─── validateWsTicket() ───────────────────────────────────────────────────────

describe('validateWsTicket()', () => {
  it('returns user info and removes ticket after validation (one-time use)', async () => {
    await generateWsTicket(mockUser._id, 'ADMIN', 'Somsak Jaidee')

    const result = validateWsTicket('test-uuid-1234')

    expect(result).toEqual({ userId: mockUser._id, role: 'ADMIN', name: 'Somsak Jaidee' })
    expect(ticketStore.has('test-uuid-1234')).toBe(false)
  })

  it('returns null for non-existent ticket', () => {
    expect(validateWsTicket('non-existent-ticket')).toBeNull()
  })

  it('returns null and removes expired ticket', () => {
    ticketStore.set('expired-ticket', {
      userId: mockUser._id,
      role: 'ADMIN',
      name: 'Somsak Jaidee',
      expiresAt: Date.now() - 1000,
    })

    expect(validateWsTicket('expired-ticket')).toBeNull()
    expect(ticketStore.has('expired-ticket')).toBe(false)
  })
})
