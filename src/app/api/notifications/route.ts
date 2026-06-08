import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("Notifications GET Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ message: "Semua notifikasi ditandai telah dibaca." }, { status: 200 });
    }

    if (!notificationId) {
      return NextResponse.json({ message: "Notification ID required" }, { status: 400 });
    }

    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notif || notif.userId !== userId) {
      return NextResponse.json({ message: "Notifikasi tidak ditemukan." }, { status: 404 });
    }

    const updatedNotif = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json(
      { message: "Notifikasi berhasil ditandai dibaca.", notification: updatedNotif },
      { status: 200 }
    );
  } catch (error) {
    console.error("Notifications PATCH Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan internal." }, { status: 500 });
  }
}
