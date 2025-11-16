import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";

// GET - Get single menu
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
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

    const { id } = await params;

    const menu = await prisma.menu.findUnique({
      where: { id },
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

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update menu
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    // Check permission for update action
    const hasPermission = await checkPermission(
      session.user.role || "",
      "menus",
      "update"
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to update menus" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { title, url, icon, order, parentId, roles, isActive } = body;

    // Check if menu exists
    const existingMenu = await prisma.menu.findUnique({
      where: { id },
    });

    if (!existingMenu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Validate parent if changing
    if (parentId !== undefined && parentId !== existingMenu.parentId) {
      // Prevent circular reference
      if (parentId === id) {
        return NextResponse.json(
          { error: "Menu cannot be its own parent" },
          { status: 400 }
        );
      }

      // Check if new parent exists
      if (parentId) {
        const parent = await prisma.menu.findUnique({
          where: { id: parentId },
          include: { parent: true },
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

        // Check if this menu has children - if so, can't move to level 2
        const hasChildren = await prisma.menu.count({
          where: { parentId: id },
        });

        if (hasChildren > 0 && parent.parentId) {
          return NextResponse.json(
            { error: "Cannot move menu with children to level 3" },
            { status: 400 }
          );
        }
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (url !== undefined) updateData.url = url;
    if (icon !== undefined) updateData.icon = icon;
    if (order !== undefined) updateData.order = order;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (roles !== undefined) updateData.roles = roles;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update menu
    const menu = await prisma.menu.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete menu
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    // Check permission for delete action
    const hasPermission = await checkPermission(
      session.user.role || "",
      "menus",
      "delete"
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to delete menus" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if menu exists
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Check if menu has children
    if (menu.children.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete menu with children. Delete children first." },
        { status: 400 }
      );
    }

    // Delete menu
    await prisma.menu.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Menu berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
