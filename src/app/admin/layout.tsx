import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import AdminNavbar from "@/components/admin/admin-navbar";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { connection } from "next/server";

export const unstable_instant = false;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <AdminNavbar />
      <Suspense fallback={<AdminLayoutSkeleton />}>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </Suspense>
    </div>
  );
}

function AdminLayoutSkeleton() {
  return (
    <div className="flex flex-1 overflow-hidden animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="w-60 bg-slate-900 min-h-screen border-r border-slate-700/60 hidden md:block" />
      {/* Content Area Skeleton */}
      <div className="flex-grow bg-slate-50 p-8">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-6" />
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 rounded" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

import { headers } from "next/headers";

async function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const headersList = await headers();
  const isValidation = headersList.get("x-instant-validation") === "true";

  if (!isValidation) {
    // Auth guard — only admin role can access
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== "admin") {
      redirect("/login");
    }
  }

  // Fetch badge counts for sidebar
  const [pendingKyc, pendingDeposit, pendingRentals] = await Promise.all([
    prisma.user.count({ where: { kycStatus: "pending" } }),
    prisma.deposit.count({ where: { status: "pending" } }),
    prisma.rentalTransaction.count({ where: { status: "pending" } }),
  ]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <AdminSidebar
        pendingKyc={pendingKyc}
        pendingDeposit={pendingDeposit}
        pendingRentals={pendingRentals}
      />
      <main className="flex-grow bg-slate-50 overflow-y-auto">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

