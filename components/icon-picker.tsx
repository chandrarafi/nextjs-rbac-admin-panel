"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

// Popular icons untuk menu
const popularIcons = [
  "LayoutDashboard",
  "Users",
  "Shield",
  "Key",
  "Menu",
  "Settings",
  "FileText",
  "Folder",
  "Home",
  "BarChart3",
  "PieChart",
  "TrendingUp",
  "Package",
  "ShoppingCart",
  "CreditCard",
  "DollarSign",
  "Mail",
  "MessageSquare",
  "Bell",
  "Calendar",
  "Clock",
  "MapPin",
  "Image",
  "Video",
  "Music",
  "Book",
  "Bookmark",
  "Tag",
  "Star",
  "Heart",
  "ThumbsUp",
  "Flag",
  "AlertCircle",
  "Info",
  "HelpCircle",
  "Search",
  "Filter",
  "Download",
  "Upload",
  "Share2",
  "Link",
  "ExternalLink",
  "Eye",
  "EyeOff",
  "Lock",
  "Unlock",
];

interface IconPickerProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function IconPicker({ value, onValueChange }: IconPickerProps) {
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <Select
      value={value || "none"}
      onValueChange={(val) => onValueChange(val === "none" ? "" : val)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Pilih icon">
          {value && value !== "none" ? (
            <div className="flex items-center gap-2">
              {renderIcon(value)}
              <span>{value}</span>
            </div>
          ) : (
            <span>Pilih icon (opsional)</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <ScrollArea className="h-[300px]">
          <SelectItem value="none">
            <span className="text-muted-foreground">Tidak ada icon</span>
          </SelectItem>
          {popularIcons.map((iconName) => (
            <SelectItem key={iconName} value={iconName}>
              <div className="flex items-center gap-2">
                {renderIcon(iconName)}
                <span>{iconName}</span>
              </div>
            </SelectItem>
          ))}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}
