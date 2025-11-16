import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPermissionSchema } from "@/lib/validations/permission";
import { ZodError } from "zod";
import { checkPermission } from "@/lib/check-permission";
import { formatZodError } from "@/lib/format-zod-error";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission for read action
    const hasPermission = await checkPermission(
      session.user.role || "",
      "permissions",
      "read"
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to read permissions" },
        { status: 403 }
      );
    }

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { module: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        orderBy: [{ module: "asc" }, { action: "asc" }],
        include: {
          _count: {
            select: { roles: true },
          },
        },
        take: limit,
        skip: skip,
      }),
      prisma.permission.count({ where }),
    ]);

    return NextResponse.json({
      data: permissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
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

    // Check permission for create action
    const hasPermission = await checkPermission(
      session.user.role || "",
      "permissions",
      "create"
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to create permissions" },
        { status: 403 }
      );
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
          details: formatZodError(error),
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
