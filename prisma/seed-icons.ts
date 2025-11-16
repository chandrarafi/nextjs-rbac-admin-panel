import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const icons = [
  // Navigation
  { name: "LayoutDashboard", category: "navigation" },
  { name: "Home", category: "navigation" },
  { name: "Menu", category: "navigation" },
  { name: "Folder", category: "navigation" },
  { name: "FolderOpen", category: "navigation" },

  // Users & Auth
  { name: "Users", category: "general" },
  { name: "User", category: "general" },
  { name: "UserPlus", category: "general" },
  { name: "Shield", category: "general" },
  { name: "Key", category: "general" },
  { name: "Lock", category: "general" },
  { name: "Unlock", category: "general" },

  // Settings
  { name: "Settings", category: "general" },
  { name: "Sliders", category: "general" },
  { name: "Tool", category: "general" },

  // Content
  { name: "FileText", category: "media" },
  { name: "File", category: "media" },
  { name: "Files", category: "media" },
  { name: "Image", category: "media" },
  { name: "Video", category: "media" },
  { name: "Music", category: "media" },

  // Business
  { name: "BarChart3", category: "business" },
  { name: "PieChart", category: "business" },
  { name: "TrendingUp", category: "business" },
  { name: "Package", category: "business" },
  { name: "ShoppingCart", category: "business" },
  { name: "CreditCard", category: "business" },
  { name: "DollarSign", category: "business" },

  // Communication
  { name: "Mail", category: "social" },
  { name: "MessageSquare", category: "social" },
  { name: "Bell", category: "social" },
  { name: "Phone", category: "social" },

  // Actions
  { name: "Plus", category: "action" },
  { name: "Minus", category: "action" },
  { name: "Edit", category: "action" },
  { name: "Trash2", category: "action" },
  { name: "Save", category: "action" },
  { name: "Download", category: "action" },
  { name: "Upload", category: "action" },
  { name: "Search", category: "action" },
  { name: "Filter", category: "action" },

  // Status
  { name: "AlertCircle", category: "general" },
  { name: "Info", category: "general" },
  { name: "HelpCircle", category: "general" },
  { name: "CheckCircle", category: "general" },
  { name: "XCircle", category: "general" },
];

async function main() {
  console.log("Seeding icons...");

  for (const icon of icons) {
    await prisma.icon.upsert({
      where: { name: icon.name },
      update: {},
      create: icon,
    });
  }

  console.log(`Seeded ${icons.length} icons successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
