import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  // Check authorization headers to prevent unauthorized triggers in production.
  // Vercel Cron sends the header "Authorization: Bearer <CRON_SECRET>"
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Perform a simple and fast read query to activate database connection and keep Supabase alive
    const categoriesCount = await prisma.category.count();

    return NextResponse.json({
      success: true,
      message: "Database keep-alive ping successful",
      timestamp: new Date().toISOString(),
      data: {
        categoriesCount,
      },
    });
  } catch (error: any) {
    console.error("Keep-alive cron job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown database error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
