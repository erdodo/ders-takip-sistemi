"use client";

import { buildWhatsAppUrl, getLowCreditMessage } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  phone: string;
  customerName: string;
  remainingCredits: number;
  studioName: string;
  variant?: "icon" | "button";
}

export function WhatsAppButton({
  phone,
  customerName,
  remainingCredits,
  studioName,
  variant = "button",
}: WhatsAppButtonProps) {
  const message = getLowCreditMessage(customerName, remainingCredits, studioName);
  const url = buildWhatsAppUrl(phone, message);

  if (variant === "icon") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
        title="WhatsApp Mesajı Gönder"
      >
        <MessageCircle size={16} />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
    >
      <MessageCircle size={15} />
      WhatsApp
    </a>
  );
}
