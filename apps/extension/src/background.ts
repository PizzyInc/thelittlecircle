// Service worker — handles install and storage defaults

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["tlc_active", "tlc_name", "tlc_plan"], (result) => {
    const updates: Record<string, unknown> = {};
    if (result.tlc_active === undefined) updates.tlc_active = true;
    if (!result.tlc_name) updates.tlc_name = "Circle";
    if (!result.tlc_plan) updates.tlc_plan = "free";
    if (Object.keys(updates).length > 0) chrome.storage.local.set(updates);
  });
});
