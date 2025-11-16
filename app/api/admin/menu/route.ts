import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - List all menus (Admin only)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const menus = await prisma.menu.findMany({
      orderBy: [{ order: "asc" }],
      include: {
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        children: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(menus);
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new menu (Admin only)
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, url, icon, order, parentId, roles, isActive } = body;

    // Validation
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Validate parent exists if parentId provided
    if (parentId) {
      const parent = await prisma.menu.findUnique({
        where: { id: parentId },
        include: {
          parent: true,
        },
      });

      if (!parent) {
        return NextResponse.json(
          { error: "Parent menu not found" },
          { status: 404 }
        );
      }

      // Check depth - max 3 levels
      if (parent.parentId) {
        const grandParent = await prisma.menu.findUnique({
          where: { id: parent.parentId },
          include: { parent: true },
        });

        if (grandParent?.parentId) {
          return NextResponse.json(
            { error: "Maximum menu depth is 3 levels" },
            { status: 400 }
          );
        }
      }
    }

    // Create menu
    const menu = await prisma.menu.create({
      data: {
        title,
        url: url || null,
        icon: icon || null,
        order: order || 0,
        parentId: parentId || null,
        roles: roles || "user,admin",
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(menu, { status: 201 });
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
