import { daysOverdue, formatCurrency, formatDate } from "@/lib/utils";
import type { ChargeWithClient, MessageTone, Organization } from "@/types/database";

const toneLabel: Record<MessageTone, string> = {
  educado: "Educado",
  amigavel: "Amigável",
  firme: "Firme",
  ultima_tentativa: "Última tentativa",
};

export const messageTones = Object.entries(toneLabel).map(([value, label]) => ({ value: value as MessageTone, label }));

export function buildLocalChargeMessage(charge: ChargeWithClient, organization?: Organization, tone: MessageTone = "educado") {
  const clientName = charge.clients?.name?.split(" ")[0] || "tudo bem";
  const company = organization?.name || "nossa empresa";
  const amount = formatCurrency(charge.amount);
  const due = formatDate(charge.due_date);
  const overdueDays = daysOverdue(charge.due_date);
  const paymentInfo = charge.payment_link
    ? `\n\nLink para pagamento: ${charge.payment_link}`
    : charge.pix_copy_paste
      ? `\n\nPix copia e cola: ${charge.pix_copy_paste}`
      : "";

  if (tone === "amigavel") {
    return `Oi, ${clientName}! Tudo bem? Aqui é da ${company}. Passando para lembrar da cobrança "${charge.description}" no valor de ${amount}, com vencimento em ${due}.${overdueDays > 0 ? ` Ela está em aberto há ${overdueDays} dia(s).` : ""} Quando puder, me confirme o pagamento por aqui.${paymentInfo}`;
  }

  if (tone === "firme") {
    return `Olá, ${clientName}. Identificamos que a cobrança "${charge.description}", no valor de ${amount}, com vencimento em ${due}, ainda está em aberto. Para evitar bloqueios ou novos contatos, pedimos que regularize o pagamento o quanto antes.${paymentInfo}`;
  }

  if (tone === "ultima_tentativa") {
    return `${clientName}, esta é nossa última tentativa amigável de contato sobre a cobrança "${charge.description}", no valor de ${amount}, vencida em ${due}. Precisamos da regularização ou de um retorno ainda hoje para manter o acordo em aberto.${paymentInfo}`;
  }

  if (overdueDays >= 15) {
    return `Olá, ${clientName}. A cobrança "${charge.description}" de ${amount}, vencida em ${due}, permanece em aberto há ${overdueDays} dias. Podemos te ajudar com o pagamento?${paymentInfo}`;
  }

  if (overdueDays >= 7) {
    return `Olá, ${clientName}. Passando para lembrar que a cobrança "${charge.description}" de ${amount} venceu em ${due}. Ela está em aberto há ${overdueDays} dias. Pode nos dar um retorno?${paymentInfo}`;
  }

  if (overdueDays >= 3) {
    return `Oi, ${clientName}. Notamos que a cobrança "${charge.description}" de ${amount}, vencida em ${due}, ainda não foi identificada. Pode verificar por gentileza?${paymentInfo}`;
  }

  if (overdueDays === 0) {
    return `Olá, ${clientName}. Hoje vence a cobrança "${charge.description}" no valor de ${amount}. Seguem os dados para pagamento.${paymentInfo}`;
  }

  return `Olá, ${clientName}. Aqui é da ${company}. Sua cobrança "${charge.description}" no valor de ${amount} vence em ${due}. Enviamos este lembrete para facilitar sua organização.${paymentInfo}`;
}
