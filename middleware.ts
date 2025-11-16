import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Middleware sederhana tanpa Prisma
  // Auth check dilakukan di level page/component
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
