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

    const icons = await prisma.icon.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(icons);
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
