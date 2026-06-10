import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import AdminNavbar from "@/components/admin/admin-navbar";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth guard — only admin role can access
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "admin") {
    redirect("/login");
  }

  // Fetch badge counts for sidebar
  const [pendingKyc, pendingDeposit, pendingRentals] = await Promise.all([
    prisma.user.count({ where: { kycStatus: "pending" } }),
    prisma.deposit.count({ where: { status: "pending" } }),
    prisma.rentalTransaction.count({ where: { status: "pending" } }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <AdminNavbar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar
          pendingKyc={pendingKyc}
          pendingDeposit={pendingDeposit}
          pendingRentals={pendingRentals}
        />
        <main className="flex-1 bg-slate-50 overflow-y-auto">
          <div className="max-w-screen-xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
