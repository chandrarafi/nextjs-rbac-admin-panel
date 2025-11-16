import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPermissionSchema } from "@/lib/validations/permission";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { action: "asc" }],
      include: {
        _count: {
          select: { roles: true },
        },
      },
    });

    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPermissionSchema.parse(body);

    // Check if permission already exists
    const existingPermission = await prisma.permission.findFirst({
      where: {
        OR: [
          { name: validatedData.name },
          {
            module: validatedData.module,
            action: validatedData.action,
          },
        ],
      },
    });

    if (existingPermission) {
      return NextResponse.json(
        { error: "Permission sudah ada" },
        { status: 400 }
      );
    }

    const permission = await prisma.permission.create({
      data: validatedData,
    });

    return NextResponse.json(permission, { status: 201 });
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

    console.error("Error creating permission:", error);
    return NextResponse.json(
      { error: "Failed to create permission" },
      { status: 500 }
    );
  }
}
