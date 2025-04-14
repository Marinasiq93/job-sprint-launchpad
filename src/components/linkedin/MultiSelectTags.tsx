
import React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

interface Option {
  value: string
  label: string
}

interface MultiSelectTagsProps {
  options: Option[]
  selected: string[]
  onSelect: (value: string) => void
  onRemove: (value: string) => void
  placeholder: string
  label: string
}

export const MultiSelectTags = ({
  options,
  selected,
  onSelect,
  onRemove,
  placeholder,
  label
}: MultiSelectTagsProps) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
        {selected.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (
          selected.map((value) => {
            const option = options.find((opt) => opt.value === value)
            return (
              <div
                key={value}
                className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1"
              >
                <span className="text-sm">{option?.label}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-secondary-foreground/20"
                  onClick={() => onRemove(value)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {option?.label}</span>
                </Button>
              </div>
            )
          })
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {label}
            <X className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selected.includes(option.value)}
              onCheckedChange={() => onSelect(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
