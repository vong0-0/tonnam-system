import { ROLES } from '@/constants/roles'
import type { User } from '@/types/entities'

export const mockUsers: User[] = [
  {
    id: 'u-001',
    username: 'admin01',
    first_name: 'ສົມຊາຍ',
    last_name: 'ວົງໄຊ',
    phone: '020-5555-0001',
    email: 'somchai@tonnam.la',
    role: ROLES.ADMIN,
    is_active: true,
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-01T08:00:00.000Z',
  },
  {
    id: 'u-002',
    username: 'waiter01',
    first_name: 'ນາງ ມາລີ',
    last_name: 'ພົມມະສັກ',
    phone: '020-5555-0002',
    email: null,
    role: ROLES.WAITER,
    is_active: true,
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'u-003',
    username: 'cashier01',
    first_name: 'ວິໄລ',
    last_name: 'ສີທອງ',
    phone: '020-5555-0003',
    email: null,
    role: ROLES.CASHIER,
    is_active: true,
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'u-004',
    username: 'kitchen01',
    first_name: 'ບຸນມີ',
    last_name: 'ແກ້ວມະນີ',
    phone: '020-5555-0004',
    email: null,
    role: ROLES.KITCHEN,
    is_active: true,
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'u-005',
    username: 'waiter02',
    first_name: 'ຄຳຜົງ',
    last_name: 'ດວງດີ',
    phone: '020-5555-0005',
    email: null,
    role: ROLES.WAITER,
    is_active: false,
    createdAt: '2026-02-01T08:00:00.000Z',
    updatedAt: '2026-05-10T14:30:00.000Z',
  },
]

export const mockWaiterUser = mockUsers[1]
export const mockAdminUser = mockUsers[0]
export const mockCashierUser = mockUsers[2]
export const mockKitchenUser = mockUsers[3]
