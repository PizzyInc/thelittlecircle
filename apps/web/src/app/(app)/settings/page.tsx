import { createClient } from "@/lib/supabase/server";
import AccountSection from "./AccountSection";
import DevicesSection from "./DevicesSection";
import CircleSection from "./CircleSection";
import SubscriptionSection from "./SubscriptionSection";
import NotificationsSection from "./NotificationsSection";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const identities = user?.identities ?? [];
  const googleIdentity = identities.find((id) => id.provider === "google");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-sky-950">Settings</h1>
        <p className="text-sky-500 text-sm mt-1">Manage your account, devices, and subscription.</p>
      </div>

      <div className="space-y-4">
        <AccountSection
          email={user?.email}
          name={user?.user_metadata?.full_name}
          googleConnected={!!googleIdentity}
          googleEmail={googleIdentity?.identity_data?.email as string | undefined}
        />

        <DevicesSection />

        <CircleSection />

        <SubscriptionSection />

        <NotificationsSection />
      </div>
    </div>
  );
}
