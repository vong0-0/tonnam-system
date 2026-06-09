import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Select as SelectPrimitive } from 'radix-ui'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type SelectOptionGroup = {
  label: string
  options: SelectOption[]
}

interface AppSelectProps extends React.ComponentProps<typeof SelectPrimitive.Root> {
  options?: SelectOption[]
  groups?: SelectOptionGroup[]
  placeholder?: string
  className?: string
  triggerClassName?: string
  size?: 'sm' | 'default'
}

export function AppSelect({
  options,
  groups,
  placeholder = 'เลือก...',
  className,
  triggerClassName,
  size = 'default',
  ...props
}: AppSelectProps) {
  return (
    <div className={cn(className)}>
    <Select {...props}>
      <SelectTrigger size={size} className={cn('w-full', triggerClassName)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper">
        {options && options.length > 0 && (
          <SelectGroup>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        )}

        {options && options.length > 0 && groups && groups.length > 0 && (
          <SelectSeparator />
        )}

        {groups?.map((group, i) => (
          <SelectGroup key={i}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
    </div>
  )
}
