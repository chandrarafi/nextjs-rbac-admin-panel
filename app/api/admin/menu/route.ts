import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";

// GET - List all menus (Admin only)
export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission for read action
    const hasPermission = await checkPermission(
      session.user.role || "",
      "menus",
      "read"
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to read menus" },
        { status: 403 }
      );
    }

    // Get pagination params
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50"),
      100
    );
    const search = url.searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          title: { contains: search, mode: "insensitive" as const },
        }
      : {};

    const [menus, total] = await Promise.all([
      prisma.menu.findMany({
        where,
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
        take: limit,
        skip: skip,
      }),
      prisma.menu.count({ where }),
    ]);

    return NextResponse.json({
      data: menus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
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

    // Check permission for create action
    const hasPermission = await checkPermission(
      session.user.role || "",
      "menus",
      "create"
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to create menus" },
        { status: 403 }
      );
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
