import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { AppSelect } from '@/components/common/AppSelect'
import { SearchInput } from '@/components/common/SearchInput'
import { Button } from '@/components/ui/button'
import { UserTable } from '@/components/admin/users/UserTable'
import { UserDialog } from '@/components/admin/users/UserDialog'
import { useUsers, useDeactivateUser, useReactivateUser } from '@/hooks/useUsers'
import { ROLES } from '@/constants/roles'
import type { User } from '@/types/entities'
import type { Role } from '@/constants/roles'

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 300)
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL')

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null)
  const [reactivateTarget, setReactivateTarget] = useState<User | null>(null)

  const { data: usersData, isLoading } = useUsers()
  const { mutate: deactivate } = useDeactivateUser()
  const { mutate: reactivate } = useReactivateUser()

  const allUsers = usersData?.data ?? []

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: allUsers.length,
      [ROLES.ADMIN]: 0,
      [ROLES.CASHIER]: 0,
      [ROLES.WAITER]: 0,
      [ROLES.KITCHEN]: 0,
    }
    allUsers.forEach((u) => counts[u.role]++)
    return counts
  }, [allUsers])

  const roleOptions = useMemo(() => [
    { value: 'ALL', label: `ທັງໝົດ (${roleCounts.ALL ?? 0})` },
    { value: ROLES.ADMIN, label: `ADMIN (${roleCounts[ROLES.ADMIN] ?? 0})` },
    { value: ROLES.CASHIER, label: `CASHIER (${roleCounts[ROLES.CASHIER] ?? 0})` },
    { value: ROLES.WAITER, label: `WAITER (${roleCounts[ROLES.WAITER] ?? 0})` },
    { value: ROLES.KITCHEN, label: `KITCHEN (${roleCounts[ROLES.KITCHEN] ?? 0})` },
  ], [roleCounts])

  const filtered = useMemo(() => {
    const lower = debouncedSearch.toLowerCase()
    return allUsers.filter((u) => {
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter
      const matchSearch = !lower ||
        u.first_name.toLowerCase().includes(lower) ||
        u.last_name.toLowerCase().includes(lower) ||
        u.username.toLowerCase().includes(lower) ||
        u.phone.includes(lower)
      return matchRole && matchSearch
    })
  }, [allUsers, roleFilter, debouncedSearch])

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SearchInput
            value={search}
            placeholder="ຄົ້ນຫາຊື່, username, ເບີໂທ..."
            onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
            onClear={() => setSearch('')}
            className="w-72 bg-white"
          />
          <AppSelect
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as Role | 'ALL')}
            options={roleOptions}
            triggerClassName="w-52 border-ink-300 bg-paper"
          />
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
        >
          <Plus size={15} />
          ເພີ່ມພະນັກງານ
        </Button>
      </div>

      {/* Table */}
      <UserTable
        isLoading={isLoading}
        data={filtered}
        onEdit={setEditTarget}
        onDeactivate={setDeactivateTarget}
        onReactivate={setReactivateTarget}
      />

      {/* Dialogs */}
      <UserDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editTarget && (
        <UserDialog
          user={editTarget}
          open={!!editTarget}
          onOpenChange={(v) => { if (!v) setEditTarget(null) }}
        />
      )}
      <ConfirmDialog
        open={!!deactivateTarget}
        onOpenChange={(v) => { if (!v) setDeactivateTarget(null) }}
        title="ປິດໃຊ້ງານບັນຊີ"
        description={`ທ່ານຕ້ອງການປິດໃຊ້ງານບັນຊີ "@${deactivateTarget?.username}" ແທ້ ຫຼື ບໍ່?`}
        variant="destructive"
        confirmLabel="ປິດໃຊ້ງານ"
        onConfirm={() => {
          if (deactivateTarget) deactivate(deactivateTarget.id, { onSuccess: () => setDeactivateTarget(null) })
        }}
      />
      <ConfirmDialog
        open={!!reactivateTarget}
        onOpenChange={(v) => { if (!v) setReactivateTarget(null) }}
        title="ເປີດໃຊ້ງານບັນຊີ"
        description={`ທ່ານຕ້ອງການເປີດໃຊ້ງານບັນຊີ "@${reactivateTarget?.username}" ແທ້ ຫຼື ບໍ່?`}
        variant="default"
        confirmLabel="ເປີດໃຊ້ງານ"
        onConfirm={() => {
          if (reactivateTarget) reactivate(reactivateTarget.id, { onSuccess: () => setReactivateTarget(null) })
        }}
      />
    </div>
  )
}
