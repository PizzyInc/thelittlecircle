# AI or Not — Product Specification

## Overview

**Product Name:** AI or Not  
**Tagline:** The trust layer for the AI age.  
**One-liner:** A floating circle on all your devices. Tap it to know if what you're seeing is AI or not.

---

## The Problem

AI-generated content is everywhere — images, videos, voices, text — across social media, news, dating apps, business communications. People can't tell what's real anymore, and they're getting fooled daily. It's only getting worse.

---

## The Solution

**AI or Not** is an AI detection companion that lives as a small floating circle on every device you're signed into. One Google account = one always-available AI detector that follows you everywhere.

### Core Value Proposition
- No switching apps
- No uploading files
- No friction
- Just tap and know

---

## How It Works

### The Circle
A small, persistent floating circle appears on your screen. It's always there, unobtrusive, waiting.

### Two Modes

| Mode | Description |
|------|-------------|
| **Tap to Check** | You see something suspicious while scrolling Twitter, Instagram, TikTok, Facebook, CyberRant — tap the circle, get an instant verdict: AI or Not |
| **Auto-Detect** | The companion watches your screen passively and proactively alerts you when it detects AI content |

### What It Detects
- Images (AI-generated photos, art, deepfakes)
- Videos (synthetic video, face swaps)
- Text (ChatGPT-generated content, bot messages)
- Audio (cloned voices, synthetic speech)
- Live video calls (is the person on this call real?)
- Phone calls (is this voice real or AI?)

---

## Account & Device Management

### Google Sign-In
Your Google account is your AI or Not account. Sign in once and you're set up across all devices.

### Central Dashboard
From one place, you can:
- See all devices where you're signed in
- Toggle which devices show the circle (on/off per device)
- Turn off on work laptop, keep on phone and TV
- Manage auto-detect preferences

### Setup Flow
1. Download the app / install the extension
2. Sign in with Google
3. App detects your devices
4. Toggle which ones are active
5. Done

**Target:** Under 60 seconds from download to working.

---

## User Experience

### The Circle UI
- Small, floating, always accessible
- Doesn't obstruct content
- Draggable to reposition
- Subtle pulse/glow when auto-detect finds something
- Tap to expand detection panel

### Detection Result
When you tap (or auto-detect triggers):
- Clear verdict: **AI** or **NOT AI**
- Confidence indicator (high/medium/low)
- Brief explanation (optional expand for details)
- Dismiss with one tap

### Auto-Detect Behavior
- Passive monitoring while you scroll/watch/talk
- Non-intrusive notification when AI detected
- User controls sensitivity (aggressive, balanced, minimal)
- Can be turned off per-device or globally

---

## Supported Platforms

### Phase 1 (MVP)
- iOS app
- Android app

### Phase 2
- Chrome extension (desktop)
- macOS app
- Windows app

### Phase 3
- Smart TV apps (Android TV, Apple TV, Samsung, LG)
- Browser extensions (Firefox, Safari, Edge)

---

## Technical Requirements

### Core Detection Engine
- Multi-modal AI detection (image, video, audio, text)
- Target accuracy: 99.9%
- Low latency: verdict in under 2 seconds
- Works offline for basic detection (cloud for complex cases)

### Screen Access
- Permission to capture/analyze screen content
- Privacy-first: content analyzed locally where possible
- No storage of user content

### Sync Infrastructure
- Real-time device sync via Google account
- Preference sync across all devices
- Minimal data footprint

---

## Privacy & Trust

### Core Principles
- **We don't store your content** — analysis happens, verdict delivered, content discarded
- **We don't track what you view** — no browsing history, no content logs
- **You control everything** — what devices, what modes, what sensitivity

### Data We Store
- Account info (Google profile basics)
- Device list and preferences
- Aggregate detection stats (optional, anonymized)

### Data We Don't Store
- Screenshots or screen content
- Messages or text you view
- Audio from calls
- Any personally identifiable browsing data

---

## Business Model

### Freemium
- **Free tier:** X taps per day, basic auto-detect
- **Pro tier:** Unlimited taps, advanced auto-detect, all devices, priority detection

### Potential Pricing
- Free: Limited daily checks
- Pro: $4.99/month or $39.99/year
- Family: $9.99/month (up to 6 accounts)

### Future Revenue
- Enterprise/API licensing
- Platform partnerships (social networks, messaging apps)
- B2B white-label solutions

---

## Success Metrics

### User Metrics
- Daily Active Users (DAU)
- Taps per user per day
- Auto-detect engagement rate
- Device activation rate (how many devices per user)

### Product Metrics
- Detection accuracy (target: 99.9%)
- Detection latency (target: <2 seconds)
- False positive rate
- False negative rate

### Business Metrics
- Free to Pro conversion rate
- Monthly Recurring Revenue (MRR)
- Churn rate
- Customer Acquisition Cost (CAC)

---

## Competitive Positioning

### Why We Win
1. **Zero friction** — one tap, no context switching
2. **Always there** — companion model, not a tool you open
3. **Cross-device** — one account, every screen
4. **All content types** — not just images, everything

### Competitors
- Browser extensions (require upload, desktop only)
- Standalone detection apps (context switch required)
- Platform-native labels (only on that platform, inconsistent)

---

## Go-to-Market

### Launch Strategy
1. **Beta:** Tech-savvy early adopters, privacy-conscious users
2. **Public launch:** Broad consumer push, focus on "trust" messaging
3. **Viral mechanics:** Share detection results, referral program

### Key Messages
- "Is this real? One tap to know."
- "AI or Not — your trust layer for the AI age."
- "Stop getting fooled. Start knowing."

---

## Open Questions for Team

1. **Screen capture permissions:** What's technically possible on iOS/Android for overlay + screen access?
2. **Detection models:** Build vs. buy vs. partner? What's the state of the art for each modality?
3. **Latency vs. accuracy tradeoffs:** Where do we draw the line?
4. **Auto-detect UX:** How aggressive should notifications be? How do we avoid annoyance?
5. **Smart TV implementation:** What's the overlay model on TV platforms?
6. **Live call detection:** Technical feasibility of real-time voice/video analysis during calls?

---

## Next Steps

1. **Technical feasibility study** — Can we actually build the overlay + detection on mobile?
2. **Detection model evaluation** — Test existing APIs/models for accuracy across modalities
3. **UX prototypes** — Design the circle, detection panel, dashboard
4. **MVP scope** — Define what's in v1 (likely: mobile + images + tap-to-check)

---

*Document created: October 2026*  
*Product: AI or Not*
