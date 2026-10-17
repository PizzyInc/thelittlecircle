export const SUPABASE_URL = "https://mhxfyhpxcjcemrrvwdgu.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_79ODIHRvWM-1PTiTbvHUmQ_z9Mx2VDv";

// Read a row for the current device
export async function getDeviceRow(token: string, deviceId: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/user_devices?id=eq.${deviceId}&select=circle_active`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] ?? null;
}

// Update circle_active for the current device
export async function setCircleActive(token: string, deviceId: string, active: boolean) {
  await fetch(
    `${SUPABASE_URL}/rest/v1/user_devices?id=eq.${deviceId}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ circle_active: active }),
    }
  );
}
