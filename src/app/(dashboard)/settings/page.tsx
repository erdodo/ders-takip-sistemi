import {
  getStudioSettings,
  getAccountSettings,
  getWebhookEndpoints,
} from "@/lib/actions/settings.actions";
import { SettingsClient } from "./SettingsClient";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const [studio, account, webhooks] = await Promise.all([
    getStudioSettings(),
    getAccountSettings(),
    getWebhookEndpoints(),
  ]);

  if (!studio || !account) redirect("/login");

  return (
    <SettingsClient
      studio={studio as any}
      account={account as any}
      webhooks={webhooks as any}
    />
  );
}
