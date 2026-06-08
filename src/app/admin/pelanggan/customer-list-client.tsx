"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Eye, ShieldAlert, ShieldCheck, UserMinus, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CustomerListClientProps {
  initialCustomers: any[];
}

export default function CustomerListClient({ initialCustomers }: CustomerListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCustomers = initialCustomers.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery));
      
    const matchesFilter =
      statusFilter === "all" ||
      (statusFilter === "verified" && c.kycStatus === "verified") ||
      (statusFilter === "pending" && c.kycStatus === "pending") ||
      (statusFilter === "blacklisted" && c.isBlacklisted) ||
      (statusFilter === "unverified" && c.kycStatus === "unverified" && !c.isBlacklisted);

    return matchesSearch && matchesFilter;
  });

  const getKycBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-success text-white">Verified ✓</Badge>;
      case "pending":
        return <Badge className="bg-warning text-white">Pending ⏳</Badge>;
      case "rejected":
        return <Badge className="bg-danger text-white">Rejected ✗</Badge>;
      default:
        return <Badge className="bg-bg-tertiary text-text-secondary border border-border">Unverified</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs rounded-xl overflow-hidden">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <Search className="w-4 h-4" />
          </span>
          <Input
            placeholder="Cari nama, email, no HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs rounded-xl border-border focus:ring-accent-gold"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-border bg-white px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-gold font-semibold"
          >
            <option value="all">Semua Status</option>
            <option value="verified">KYC Verified</option>
            <option value="pending">KYC Pending</option>
            <option value="blacklisted">Blacklisted</option>
            <option value="unverified">Unverified Only</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-xs text-left">
            <thead className="bg-bg-secondary text-text-secondary font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Nama Pelanggan</th>
                <th className="px-5 py-3">No. HP</th>
                <th className="px-5 py-3">KYC Status</th>
                <th className="px-5 py-3 text-center">Blacklist</th>
                <th className="px-5 py-3 text-center">Transaksi</th>
                <th className="px-5 py-3">Join Date</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-text-primary">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-text-secondary">
                    Tidak ada data pelanggan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c: any) => {
                  const totalTx = c._count.rentals + c._count.purchases;
                  return (
                    <tr key={c.id} className={`hover:bg-bg-secondary/40 transition-colors ${c.isBlacklisted ? "bg-danger/5" : ""}`}>
                      <td className="px-5 py-4">
                        <div className="font-semibold flex items-center gap-2">
                          {c.name}
                          {c.isBlacklisted && <ShieldAlert className="w-3.5 h-3.5 text-danger shrink-0" />}
                        </div>
                        <div className="text-[10px] text-text-secondary mt-0.5">{c.email}</div>
                      </td>
                      <td className="px-5 py-4 font-mono">{c.phone || "-"}</td>
                      <td className="px-5 py-4">{getKycBadge(c.kycStatus)}</td>
                      <td className="px-5 py-4 text-center">
                        {c.isBlacklisted ? (
                          <Badge className="bg-danger text-white">Ya</Badge>
                        ) : (
                          <span className="text-text-secondary">Tidak</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-text-primary">
                        {totalTx}
                      </td>
                      <td className="px-5 py-4 text-text-secondary">
                        {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link href={`/admin/pelanggan/${c.id}`}>
                          <Button
                            variant="ghost"
                            className="p-1 h-7 rounded-lg hover:bg-bg-secondary border border-border text-text-secondary gap-1 text-[10px]"
                          >
                            <Eye className="w-3.5 h-3.5" /> Detail
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
