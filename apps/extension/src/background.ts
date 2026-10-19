// Service worker — inject into existing tabs and set storage defaults

const EXCLUDED = [
  "thelittlecircle.com",
  "www.thelittlecircle.com",
  "localhost",
];

function isEligible(url: string | undefined): boolean {
  if (!url) return false;
  if (url.startsWith("chrome://") || url.startsWith("chrome-extension://") || url.startsWith("edge://")) return false;
  try {
    const host = new URL(url).hostname;
    return !EXCLUDED.includes(host);
  } catch {
    return false;
  }
}

async function injectIntoAllTabs() {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.id || !isEligible(tab.url)) continue;
    chrome.scripting
      .executeScript({ target: { tabId: tab.id }, files: ["src/content.js"] })
      .catch(() => {}); // ignore restricted pages
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["tlc_active", "tlc_name", "tlc_plan"], (result) => {
    const updates: Record<string, unknown> = {};
    if (result.tlc_active === undefined) updates.tlc_active = true;
    if (!result.tlc_name) updates.tlc_name = "Circle";
    if (!result.tlc_plan) updates.tlc_plan = "free";
    if (Object.keys(updates).length > 0) chrome.storage.local.set(updates);
  });
  injectIntoAllTabs();
});

chrome.runtime.onStartup.addListener(() => {
  injectIntoAllTabs();
});

// Inject into every page as it finishes loading — this is the primary injection path
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && isEligible(tab.url)) {
    chrome.scripting
      .executeScript({ target: { tabId }, files: ["src/content.js"] })
      .catch(() => {});
  }
});
