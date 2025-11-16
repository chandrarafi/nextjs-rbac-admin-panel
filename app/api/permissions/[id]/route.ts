import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updatePermissionSchema } from "@/lib/validations/permission";
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
    const validatedData = updatePermissionSchema.parse(body);

    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!existingPermission) {
      return NextResponse.json(
        { error: "Permission tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check for duplicate name or module+action
    if (validatedData.name || validatedData.module || validatedData.action) {
      const duplicate = await prisma.permission.findFirst({
        where: {
          id: { not: id },
          OR: [
            validatedData.name ? { name: validatedData.name } : {},
            validatedData.module && validatedData.action
              ? {
                  module: validatedData.module,
                  action: validatedData.action,
                }
              : {},
          ].filter((condition) => Object.keys(condition).length > 0),
        },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            error: "Permission dengan nama atau modul+aksi tersebut sudah ada",
          },
          { status: 400 }
        );
      }
    }

    const permission = await prisma.permission.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(permission);
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

    console.error("Error updating permission:", error);
    return NextResponse.json(
      { error: "Failed to update permission" },
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

    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
      include: {
        _count: {
          select: { roles: true },
        },
      },
    });

    if (!existingPermission) {
      return NextResponse.json(
        { error: "Permission tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if permission is being used
    if (existingPermission._count.roles > 0) {
      return NextResponse.json(
        {
          error: `Permission tidak dapat dihapus karena masih digunakan oleh ${existingPermission._count.roles} role`,
        },
        { status: 400 }
      );
    }

    await prisma.permission.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Permission berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting permission:", error);
    return NextResponse.json(
      { error: "Failed to delete permission" },
      { status: 500 }
    );
  }
}
