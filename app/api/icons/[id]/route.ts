import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateIconSchema } from "@/lib/validations/icon";
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
    const validatedData = updateIconSchema.parse(body);

    // Check if icon exists
    const existingIcon = await prisma.icon.findUnique({
      where: { id },
    });

    if (!existingIcon) {
      return NextResponse.json(
        { error: "Icon tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check for duplicate name
    if (validatedData.name) {
      const duplicate = await prisma.icon.findFirst({
        where: {
          id: { not: id },
          name: validatedData.name,
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Icon dengan nama tersebut sudah ada" },
          { status: 400 }
        );
      }
    }

    const icon = await prisma.icon.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(icon);
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

    console.error("Error updating icon:", error);
    return NextResponse.json(
      { error: "Failed to update icon" },
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

    // Check if icon exists
    const existingIcon = await prisma.icon.findUnique({
      where: { id },
    });

    if (!existingIcon) {
      return NextResponse.json(
        { error: "Icon tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.icon.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Icon berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting icon:", error);
    return NextResponse.json(
      { error: "Failed to delete icon" },
      { status: 500 }
    );
  }
}
