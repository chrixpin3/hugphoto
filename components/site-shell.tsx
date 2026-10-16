import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getSettingsSafe } from "@/lib/settings";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const settings = await getSettingsSafe();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
      <WhatsAppButton
        whatsapp={settings.whatsapp}
        websiteName={settings.websiteName}
      />
    </>
  );
}
