"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface RevenueChartProps {
  data: {
    date: string;
    revenue: number;
    rentals: number;
    sales: number;
  }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const formatRupiah = (val: any) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div>
        <h3 className="font-bold text-text-primary text-sm">Tren Pendapatan Harian</h3>
        <p className="text-[11px] text-text-secondary">Akumulasi sewa & penjualan dalam 7 hari terakhir</p>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-text-secondary">
            Belum ada data pendapatan
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1EFEA" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={9}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `Rp ${val / 1000}k`}
              />
              <Tooltip
                formatter={(value: any) => [formatRupiah(value), "Pendapatan"]}
                labelStyle={{ fontSize: "10px", fontWeight: "bold", color: "#1A1A1A" }}
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E2DC",
                  borderRadius: "12px",
                  fontSize: "11px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#C9A96E"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
