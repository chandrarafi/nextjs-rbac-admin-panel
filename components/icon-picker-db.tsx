"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface IconPickerProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function IconPickerDB({ value, onValueChange }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [icons, setIcons] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchIcons();
  }, []);

  const fetchIcons = async () => {
    try {
      const response = await fetch("/api/icons");
      if (response.ok) {
        const data = await response.json();
        setIcons(data);
      }
    } catch (error) {
      console.error("Error fetching icons:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="h-4 w-4" />;
  };

  // Group icons by category
  const groupedIcons = icons.reduce((acc, icon) => {
    if (!acc[icon.category]) {
      acc[icon.category] = [];
    }
    acc[icon.category].push(icon);
    return acc;
  }, {} as Record<string, any[]>);

  const selectedIcon = icons.find((icon) => icon.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? (
            <div className="flex items-center gap-2">
              {renderIcon(value)}
              <span>{value}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Pilih icon...</span>
          )}
          <div className="flex items-center gap-1">
            {value && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onValueChange("");
                }}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari icon..." />
          <CommandList>
            <CommandEmpty>
              {loading ? "Loading icons..." : "Icon tidak ditemukan."}
            </CommandEmpty>
            {Object.entries(groupedIcons).map(
              ([category, categoryIcons]: [string, any]) => (
                <CommandGroup
                  key={category}
                  heading={category}
                  className="capitalize"
                >
                  {(categoryIcons as any[]).map((icon: any) => (
                    <CommandItem
                      key={icon.id}
                      value={icon.name}
                      onSelect={(currentValue) => {
                        onValueChange(
                          currentValue === value ? "" : currentValue
                        );
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === icon.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {renderIcon(icon.name)}
                      <span className="ml-2">{icon.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
