"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar as CalendarIcon, ArrowRight, ShieldAlert, BadgeAlert, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { format, differenceInCalendarDays, isBefore, startOfDay, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

interface RentalFormProps {
  product: {
    id: string;
    name: string;
    brand: string;
    rentPriceDaily: any;
    rentPriceWeekly: any;
    images: { imageUrl: string }[];
  };
  bookedRanges: { start: string; end: string }[];
  userLocation: {
    city: string;
    province: string;
    isOutOfTown: boolean;
  };
  settings: {
    depositPercentage: any;
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
  };
}

export default function RentalForm({
  product,
  bookedRanges,
  userLocation,
  settings,
}: RentalFormProps) {
  const router = useRouter();

  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [durationDays, setDurationDays] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);

  const dailyRate = parseFloat(product.rentPriceDaily || "0");
  const depositPercent = parseFloat(settings.depositPercentage || "0.20");

  // Sync calendar selection to string states for form submission
  useEffect(() => {
    if (range?.from) {
      setStartDateStr(format(range.from, "yyyy-MM-dd"));
    } else {
      setStartDateStr("");
    }
    if (range?.to) {
      setEndDateStr(format(range.to, "yyyy-MM-dd"));
    } else {
      setEndDateStr("");
    }
  }, [range]);

  // Calculate duration and pricing
  useEffect(() => {
    if (startDateStr && endDateStr) {
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      
      const days = differenceInCalendarDays(end, start) + 1; // inclusive
      if (days > 0) {
        setDurationDays(days);
        const cost = days * dailyRate;
        setSubtotal(cost);
        if (userLocation.isOutOfTown) {
          setDepositAmount(cost * depositPercent);
        } else {
          setDepositAmount(0);
        }
      } else {
        setDurationDays(0);
        setSubtotal(0);
        setDepositAmount(0);
      }
    } else {
      setDurationDays(0);
      setSubtotal(0);
      setDepositAmount(0);
    }
  }, [startDateStr, endDateStr, dailyRate, userLocation.isOutOfTown, depositPercent]);

  // Check if date is booked
  const isBooked = (date: Date) => {
    const dateT = startOfDay(date).getTime();
    return bookedRanges.some((range) => {
      const start = startOfDay(new Date(range.start)).getTime();
      const end = startOfDay(new Date(range.end)).getTime();
      return dateT >= start && dateT <= end;
    });
  };

  // Check if date is available (not booked and not in the past)
  const isAvailable = (date: Date) => {
    const today = startOfDay(new Date());
    const dateT = startOfDay(date).getTime();
    return dateT >= today.getTime() && !isBooked(date);
  };

  const handleRangeSelect = (newRange: DateRange | undefined) => {
    if (newRange?.from && newRange?.to) {
      // Check if any date in between from and to is booked
      let current = startOfDay(newRange.from);
      const end = startOfDay(newRange.to);
      let hasBooked = false;
      while (current <= end) {
        if (isBooked(current)) {
          hasBooked = true;
          break;
        }
        current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
      }

      if (hasBooked) {
        toast.error("Rentang tanggal sewa tidak boleh melewati tanggal yang sudah disewa.");
        setRange(undefined);
        return;
      }
    }
    setRange(newRange);
  };

  // Check if dates conflict with booked date ranges (fallback for form submit)
  const isRangeBooked = (start: Date, end: Date) => {
    const startT = start.getTime();
    const endT = end.getTime();

    return bookedRanges.some((range) => {
      const bStart = new Date(range.start).getTime();
      const bEnd = new Date(range.end).getTime();

      // Overlap logic: (start1 <= end2) && (end1 >= start2)
      return startT <= bEnd && endT >= bStart;
    });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDateStr || !endDateStr) {
      toast.error("Silakan tentukan tanggal mulai dan selesai sewa.");
      return;
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isBefore(start, startOfDay(new Date()))) {
      toast.error("Tanggal mulai tidak boleh di masa lalu.");
      return;
    }

    if (isBefore(end, start)) {
      toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      return;
    }

    if (isRangeBooked(start, end)) {
      toast.error("Tanggal yang Anda pilih bertabrakan dengan jadwal sewa lain yang sudah disetujui.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          startDate: startDateStr,
          endDate: endDateStr,
        }),
      });

      const resData = await response.json();

      if (response.ok) {
        toast.success("Reservasi sewa berhasil diajukan!");
        // Redirect to transactions page. For out of towners, they will upload deposit proof there.
        router.push("/transaksi");
      } else {
        toast.error(resData.message || "Gagal membuat reservasi.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get min date string for inputs (today)
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const imageUrl = product.images[0]?.imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60";

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Date Pickers */}
      <div className="md:col-span-2 space-y-6">
        <Card className="bg-white border-border">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/60">
              <div className="relative h-16 w-16 bg-bg-secondary rounded-lg overflow-hidden border border-border shrink-0">
                <Image src={imageUrl} alt={product.name} fill className="object-cover" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-accent-gold-hover tracking-wider">{product.brand}</span>
                <h3 className="font-semibold text-text-primary text-sm line-clamp-1">{product.name}</h3>
                <p className="text-xs text-text-secondary mt-0.5">{formatRupiah(dailyRate)} / hari</p>
              </div>
            </div>

            {/* Inline Date Picker Calendar */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/40 pb-2">
                <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Pilih Jadwal Sewa</h4>
                <div className="flex gap-4 text-[10px] font-semibold uppercase">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Tersedia
                  </span>
                  <span className="flex items-center gap-1 text-red-700">
                    <span className="h-2 w-2 rounded-full bg-red-500" /> Sedang Disewa
                  </span>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                Silakan pilih rentang tanggal mulai hingga selesai sewa langsung pada kalender di bawah ini. Tanggal yang berwarna merah tidak tersedia untuk dipilih.
              </p>

              <div className="flex justify-center p-4 bg-bg-secondary rounded-2xl border border-border">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={handleRangeSelect}
                  disabled={[
                    { before: new Date() },
                    isBooked
                  ]}
                  modifiers={{
                    booked: isBooked,
                    available: isAvailable,
                  }}
                  className="w-full max-w-sm"
                />
              </div>

              {startDateStr && endDateStr ? (
                <div className="flex items-center justify-between p-4 bg-accent-gold-light/40 border border-accent-gold/20 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-accent-gold animate-pulse" />
                    <div>
                      <span className="font-semibold text-text-secondary">Tanggal Sewa Terpilih:</span>
                      <div className="font-bold text-text-primary mt-0.5">
                        {format(new Date(startDateStr), "dd MMMM yyyy", { locale: id })} &mdash; {format(new Date(endDateStr), "dd MMMM yyyy", { locale: id })}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-accent-gold text-white font-semibold px-2.5 py-1">{durationDays} Hari</Badge>
                </div>
              ) : (
                <div className="p-4 bg-bg-secondary border border-border border-dashed rounded-xl text-center text-xs text-text-muted">
                  Silakan klik tanggal mulai dan tanggal selesai sewa pada kalender di atas.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Detection Box */}
        <Card className="bg-white border-border">
          <CardContent className="p-6 space-y-3">
            <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Verifikasi Lokasi Pelanggan</h4>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">Domisili Akun:</span>
              <span className="font-semibold text-text-primary">{userLocation.city}, {userLocation.province}</span>
            </div>
            
            {userLocation.isOutOfTown ? (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-warning">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>Wajib Deposit Jaminan (Luar Bandung)</span>
                </div>
                <p className="text-[10px] text-text-secondary leading-relaxed">
                  Berdasarkan alamat Anda di luar Bandung/Cimahi, sistem mendeteksi wajib mentransfer deposit sebesar **{depositPercent * 100}%** dari total sewa sebagai jaminan reservasi. Bukti transfer diunggah setelah submit.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-success/10 border border-success/20 rounded-xl flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success shrink-0" />
                <span className="text-[10px] text-text-secondary font-medium">
                  Bebas jaminan deposit (Domisili Bandung & Cimahi). Pembayaran sewa dilakukan 100% offline saat ambil barang.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Side: Cost Summary Box */}
      <div className="space-y-6">
        <Card className="bg-white border-border shadow-sm sticky top-24">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-2">
              Rincian Biaya
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Tarif Harian:</span>
                <span className="font-semibold">{formatRupiah(dailyRate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Durasi Sewa:</span>
                <span className="font-semibold">{durationDays} Hari</span>
              </div>
              
              <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
                <span className="text-text-primary">Subtotal Sewa:</span>
                <span className="text-text-primary font-price font-bold">{formatRupiah(subtotal)}</span>
              </div>
            </div>

            {userLocation.isOutOfTown && subtotal > 0 && (
              <div className="border-t border-dashed border-border pt-3 space-y-3">
                <div className="flex justify-between items-center text-xs text-warning">
                  <span>Jaminan Deposit ({depositPercent * 100}%):</span>
                  <span className="font-bold font-price">{formatRupiah(depositAmount)}</span>
                </div>
                
                <div className="bg-bg-secondary p-3 rounded-lg border border-border space-y-1.5 text-[10px] text-text-secondary leading-relaxed">
                  <p className="font-semibold text-text-primary">Transfer Ke Rekening Toko:</p>
                  <div>Bank: <span className="font-medium text-text-primary">{settings.bankName}</span></div>
                  <div>No. Rek: <span className="font-medium text-text-primary">{settings.bankAccountNumber}</span></div>
                  <div>Atas Nama: <span className="font-medium text-text-primary">{settings.bankAccountName}</span></div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || durationDays === 0}
                className="w-full bg-gradient-to-r from-accent-gold to-accent-gold-hover text-white py-2.5 rounded-lg shadow-md hover:from-accent-gold-hover hover:to-accent-gold transition-colors duration-200"
              >
                {isSubmitting ? "Mengajukan..." : "Ajukan Sewa"}
              </Button>
              <p className="text-[10px] text-center text-text-secondary mt-2 leading-relaxed">
                Handovers barang dan verifikasi fisik dilakukan offline di toko GadgetVault.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
