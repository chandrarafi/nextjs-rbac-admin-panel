import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking icons...\n");

  const icons = await prisma.icon.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  console.log(`Total icons: ${icons.length}\n`);

  // Group by category
  const grouped = icons.reduce((acc, icon) => {
    if (!acc[icon.category]) {
      acc[icon.category] = [];
    }
    acc[icon.category].push(icon.name);
    return acc;
  }, {} as Record<string, string[]>);

  Object.entries(grouped).forEach(([category, names]) => {
    console.log(`${category} (${names.length}):`);
    console.log(`  ${names.join(", ")}`);
    console.log();
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
