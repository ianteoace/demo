import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const legacyPrefixes = [
  "/propiedad",
  "/propiedades",
  "/dashboard/properties",
  "/dashboard/leads",
  "/api/properties",
  "/api/leads",
];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const matchedLegacyPrefix = legacyPrefixes.find((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (matchedLegacyPrefix) {
    if (matchedLegacyPrefix.startsWith("/api/")) {
      return NextResponse.json(
        {
          error: "Ruta legacy deshabilitada en SoloAderezos.",
        },
        { status: 410 },
      );
    }

    return NextResponse.redirect(new URL("/", req.url));
  }

  const isProtectedAdminPath = pathname.startsWith("/dashboard") || pathname === "/debug";
  if (!isProtectedAdminPath) {
    return NextResponse.next();
  }

  return (async () => {
    const token = await getToken({ req });
    if (token?.role === "ADMIN") {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  })();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/debug",
    "/propiedad/:path*",
    "/propiedades/:path*",
    "/api/properties/:path*",
    "/api/leads/:path*",
  ],
};
