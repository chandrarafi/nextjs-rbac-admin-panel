import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateRoleSchema } from "@/lib/validations/role";
import { ZodError } from "zod";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateRoleSchema.parse(body);

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "Role tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check for duplicate name
    if (validatedData.name) {
      const duplicate = await prisma.role.findFirst({
        where: {
          id: { not: id },
          name: validatedData.name,
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Role dengan nama tersebut sudah ada" },
          { status: 400 }
        );
      }
    }

    const { permissionIds, ...roleData } = validatedData;

    // Update role and permissions
    const role = await prisma.role.update({
      where: { id },
      data: {
        ...roleData,
        permissions:
          permissionIds !== undefined
            ? {
                deleteMany: {},
                create: permissionIds.map((permissionId) => ({
                  permissionId,
                })),
              }
            : undefined,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return NextResponse.json(role);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "Role tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if role is being used
    if (existingRole._count.users > 0) {
      return NextResponse.json(
        {
          error: `Role tidak dapat dihapus karena masih digunakan oleh ${existingRole._count.users} user`,
        },
        { status: 400 }
      );
    }

    await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Role berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 }
    );
  }
}
