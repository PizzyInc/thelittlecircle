import { createClient } from "@/lib/supabase/server";
import AccountSection from "./AccountSection";
import DevicesSection from "./DevicesSection";
import CircleSection from "./CircleSection";

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

        {[
          { title: "Subscription", description: "Plan, billing, usage" },
          { title: "Notifications", description: "Alert preferences" },
        ].map((section) => (
          <div key={section.title} className="bg-white rounded-2xl border border-sky-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-sky-900">{section.title}</h2>
              <p className="text-sky-400 text-xs mt-0.5">{section.description}</p>
            </div>
            <span className="text-sky-300 text-xs">Coming soon</span>
          </div>
        ))}
      </div>
    </div>
  );
}
