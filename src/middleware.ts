import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isTenantReadOnly, READ_ONLY_MESSAGE } from "@/lib/campaign";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const protectedPaths = [
    "/dashboard",
    "/customers",
    "/packages",
    "/payments",
    "/settings",
  ];

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // Kampanya sonrası aboneliği olmayan stüdyolarda değişiklik yapılamaz (form gönderimi / API yazma)
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(req.method);
  const studioId = (req.auth?.user as { studioId?: string } | undefined)?.studioId;
  if (isMutation && req.auth && isTenantReadOnly(studioId)) {
    return NextResponse.json({ error: READ_ONLY_MESSAGE, readOnly: true }, { status: 402 });
  }

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/packages/:path*",
    "/payments/:path*",
    "/settings/:path*",
    "/api/packages/:path*",
  ],
};
