import { type ClassValue, clsx } from "clsx";
import { format, isBefore, parseISO, startOfDay, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { twMerge } from "tailwind-merge";
import type { Charge, ChargeStatus } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function formatDate(date: string | null | undefined) {
  if (!date) return "-";
  return format(parseISO(date), "dd/MM/yyyy", { locale: ptBR });
}

export function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

export function getRealChargeStatus(charge: Pick<Charge, "status" | "due_date">): ChargeStatus {
  if (charge.status === "paid" || charge.status === "canceled") return charge.status;
  const due = startOfDay(parseISO(charge.due_date));
  return isBefore(due, startOfDay(new Date())) ? "overdue" : "pending";
}

export function daysOverdue(dueDate: string) {
  return Math.max(0, differenceInCalendarDays(startOfDay(new Date()), startOfDay(parseISO(dueDate))));
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeBrazilPhone(phone: string) {
  const digits = onlyDigits(phone);
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
}

export function whatsappUrl(phone: string, message: string) {
  return `https://wa.me/${normalizeBrazilPhone(phone)}?text=${encodeURIComponent(message)}`;
}

export function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/[-\s]+$/, "");
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/[-\s]+$/, "");
}

export function parseCurrencyInput(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  return Number(normalized || 0);
}
