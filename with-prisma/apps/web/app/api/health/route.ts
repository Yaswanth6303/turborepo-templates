import { prisma } from "@repo/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", database: "up" });
  } catch (error) {
    console.error("Health check failed", error);
    return Response.json(
      { status: "error", database: "down" },
      { status: 503 },
    );
  }
}
