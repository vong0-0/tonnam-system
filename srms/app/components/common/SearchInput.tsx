import * as React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  onClear?: () => void
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, ...props }, ref) => {
    const hasValue = value !== undefined ? String(value).length > 0 : false

    return (
      <div className={cn('relative flex items-center', className)}>
        <Search
          size={14}
          className="text-zinc-500 pointer-events-none absolute left-2.5 text-ink-400"
        />
        <Input
          ref={ref}
          type="search"
          value={value}
          className="pl-8 pr-7 h-auto py-2 [&::-webkit-search-cancel-button]:hidden"
          {...props}
        />
        {hasValue && !props.disabled && (
          <button
            type="button"
            tabIndex={-1}
            onClick={onClear}
            className="absolute right-2 text-ink-400 hover:text-ink-700 focus:outline-none"
          >
            <X size={13} />
          </button>
        )}
      </div>
    )
  },
)
SearchInput.displayName = 'SearchInput'

export { SearchInput }
