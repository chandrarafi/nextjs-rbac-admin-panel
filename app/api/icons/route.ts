import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createIconSchema } from "@/lib/validations/icon";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 200);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { category: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [icons, total] = await Promise.all([
      prisma.icon.findMany({
        where,
        orderBy: [{ category: "asc" }, { name: "asc" }],
        take: limit,
        skip: skip,
      }),
      prisma.icon.count({ where }),
    ]);

    return NextResponse.json({
      data: icons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching icons:", error);
    return NextResponse.json(
      { error: "Failed to fetch icons" },
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
    const validatedData = createIconSchema.parse(body);

    // Check if icon already exists
    const existingIcon = await prisma.icon.findUnique({
      where: { name: validatedData.name },
    });

    if (existingIcon) {
      return NextResponse.json(
        { error: "Icon dengan nama tersebut sudah ada" },
        { status: 400 }
      );
    }

    const icon = await prisma.icon.create({
      data: validatedData,
    });

    return NextResponse.json(icon, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.issues.map((err: any) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Error creating icon:", error);
    return NextResponse.json(
      { error: "Failed to create icon" },
      { status: 500 }
    );
  }
}
