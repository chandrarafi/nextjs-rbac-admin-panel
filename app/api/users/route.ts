import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { createUserSchema } from "@/lib/validations/user";
import { ZodError } from "zod";

// GET - List all users
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    // Check if user has permission to read users
    const userRole = await prisma.role.findUnique({
      where: { name: session.user.role },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const hasReadPermission =
      session.user.role === "admin" ||
      userRole?.permissions.some(
        (rp: any) =>
          rp.permission.module === "users" && rp.permission.action === "read"
      );

    if (!hasReadPermission) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to create users
    const userRole = await prisma.role.findUnique({
      where: { name: session.user.role },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const hasCreatePermission =
      session.user.role === "admin" ||
      userRole?.permissions.some(
        (rp: any) =>
          rp.permission.module === "users" && rp.permission.action === "create"
      );

    if (!hasCreatePermission) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Validate with Zod
    const validatedData = createUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Get roleId from role name if provided
    let roleId = validatedData.roleId;
    if (!roleId && validatedData.role) {
      const role = await prisma.role.findUnique({
        where: { name: validatedData.role },
      });
      roleId = role?.id;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name || null,
        password: hashedPassword,
        roleId: roleId || undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: error.issues.map((e: any) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
