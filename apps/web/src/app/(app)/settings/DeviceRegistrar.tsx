"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

function getDeviceId(): string {
  const key = "tlc_device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

type DeviceType = "phone" | "tablet" | "desktop" | "tv" | "browser";

function getDeviceInfo(): { name: string; type: DeviceType } {
  const ua = navigator.userAgent;

  // Smart TV detection
  const isTV = /Smart-TV|SMART-TV|WebOS|Tizen|NetCast|HbbTV|VIDAA|AppleTV|Roku|FireTV|CrOS TV|Android TV|GoogleTV/i.test(ua);
  if (isTV) {
    let tvName = "Smart TV";
    if (/Tizen/i.test(ua)) tvName = "Samsung Smart TV";
    else if (/WebOS/i.test(ua)) tvName = "LG Smart TV";
    else if (/AppleTV/i.test(ua)) tvName = "Apple TV";
    else if (/Roku/i.test(ua)) tvName = "Roku";
    else if (/FireTV/i.test(ua)) tvName = "Fire TV";
    return { name: tvName, type: "tv" };
  }

  // Tablet
  const isTablet =
    /iPad/i.test(ua) ||
    (/Android/i.test(ua) && !/Mobile/i.test(ua)) ||
    (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  if (isTablet) {
    const name = /iPad/i.test(ua) ? "iPad" : "Android Tablet";
    return { name, type: "tablet" };
  }

  // Phone
  const isPhone = /iPhone|Android.*Mobile|Mobile.*Android|Windows Phone|BlackBerry/i.test(ua);
  if (isPhone) {
    let name = "Phone";
    if (/iPhone/i.test(ua)) name = "iPhone";
    else if (/Android/i.test(ua)) name = "Android Phone";
    return { name, type: "phone" };
  }

  // Desktop — identify OS + browser
  let browser = "Browser";
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua) && !/OPR/i.test(ua)) browser = "Chrome";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Edg/i.test(ua)) browser = "Edge";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/OPR|Opera/i.test(ua)) browser = "Opera";

  let os = "";
  if (/Windows/i.test(ua)) os = " on Windows";
  else if (/Macintosh/i.test(ua)) os = " on Mac";
  else if (/Linux/i.test(ua)) os = " on Linux";

  return { name: `${browser}${os}`, type: "desktop" };
}

export default function DeviceRegistrar({ userId }: { userId: string }) {
  useEffect(() => {
    const id = getDeviceId();
    const { name, type } = getDeviceInfo();
    const supabase = createClient();

    supabase
      .from("user_devices")
      .upsert({ id, user_id: userId, name, type, last_active: new Date().toISOString() }, { onConflict: "id" })
      .select("circle_active")
      .single()
      .then(({ data }) => {
        if (data) {
          localStorage.setItem("tlc_circle_active", String(data.circle_active));
          window.dispatchEvent(new CustomEvent("tlcCircleActiveChange", { detail: data.circle_active }));
        }
      });

    // Device limit check — free plan allows 1 device
    supabase
      .from("user_devices")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .then(({ count }) => {
        const overLimit = (count ?? 0) > 1;
        localStorage.setItem("tlc_over_limit", String(overLimit));
        window.dispatchEvent(new CustomEvent("tlcDeviceLimitChange", { detail: overLimit }));
      });
  }, [userId]);

  return null;
}
