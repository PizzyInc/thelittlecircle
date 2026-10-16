# The Little Circle — Feature Specification

**Product:** The Little Circle  
**Website:** thelittlecircle.com  
**Version:** 1.0 (MVP)  
**Last Updated:** October 2026

---

## Overview

The Little Circle is an AI detection companion — a small floating circle that lives on your screen and tells you if the content you're viewing is AI-generated or real.

**Core value:** One tap to know if something is AI or not.

---

## 1. The Companion (Circle UI)

### 1.1 Appearance

- **Shape:** Circle with two eyes (the "face")
- **Size:** ~50px diameter on mobile (scales proportionally on other devices)
- **Primary color:** Warm peach (#FFD4C4) with dark eyes (#2C2C2C)
- **Always has:** Soft shadow/glow to float above content
- **Logo version:** White circle, black eyes (for branding/marketing)

### 1.2 Positioning

- **Default position:** Bottom-right corner of screen
- **Draggable:** User can drag the circle anywhere on screen
- **Boundary constraints:** Cannot be dragged off-screen or under system UI (notch, status bar)
- **Position persists:** Remembers position between sessions

### 1.3 Visibility Modes

Users can toggle between two modes from settings:

| Mode | Behavior | Best For |
|------|----------|----------|
| **Stealth** (default) | Circle is hidden. Only appears when AI content is detected. | Casual users who want protection without clutter |
| **Always-On** | Circle is always visible on screen. Tap anytime to scan. | Power users who want manual control |

---

## 2. Eye Behavior

The eyes give the companion personality and awareness.

### 2.1 Eye Tracking

**When user is scrolling:**
- Eyes look toward the user's hand/thumb
- If circle is on **right side** → eyes look **left**
- If circle is on **left side** → eyes look **right**
- If circle is **centered horizontally** → eyes look **straight** (no left/right)

**Vertical awareness:**
- If circle is at **top** of screen → eyes bias **downward** (toward content)
- If circle is at **bottom** → eyes follow scroll direction
- Scrolling **down** → eyes glance down
- Scrolling **up** → eyes glance up

**When idle (not scrolling):**
- Eyes return to center after ~300ms
- Occasional slow blink (every 4 seconds)
- Subtle "breathing" animation on the circle

**When being dragged:**
- Eyes follow the drag direction
- Circle scales up slightly (1.1x) to feel responsive

### 2.2 Emotional States

| State | Trigger | Eyes | Face Color | Animation |
|-------|---------|------|------------|-----------|
| **Idle** | Default | Normal, occasional blink | Peach | Gentle breathing |
| **Scanning** | User tapped to check | Dart around quickly | Blue tint | Pulsing glow |
| **AI Detected** | Found AI content | Wide open | Orange/amber | Worried wiggle |
| **Real/Human** | Content is real | Happy squint | Green | Bounce + smile |

---

## 3. Detection Flow

### 3.1 Tap to Scan

**Trigger:** User taps the circle (quick tap, not drag)

**Flow:**
1. Circle enters **Scanning** state (1.5 seconds)
2. Eyes dart around, face turns blue, pulsing glow
3. Content being scanned gets a brief **highlight effect** (blue outline)
4. After scan completes → show verdict

### 3.2 Content Selection Logic

How the app knows what to scan:

| Circle Position | Scans |
|-----------------|-------|
| **Near specific content** (within ~100px) | That specific content (proximity-based) |
| **In corner/edge** (away from content) | Whatever is in center of screen (what user is looking at) |

This gives users both quick scanning (just tap) and precise targeting (drag near content, then tap).

### 3.3 Verdict Display

After scanning, show result:

**Verdict Bubble:**
- Small bubble appears above/beside the circle
- Shows icon + short text: "AI" or "Real"
- Position adjusts based on circle location (never goes off-screen)
- Auto-dismisses after 3 seconds

**Circle State:**
- **AI Detected:** Orange face, wide eyes, worried mouth "o"
- **Real/Human:** Green face, happy smile, brief bounce

**Reset:** After verdict dismisses, circle returns to idle state.

### 3.4 Auto-Detect Mode

When enabled, the companion passively monitors screen content:

- Runs in background while user scrolls/watches
- When AI content detected:
  - **Stealth mode:** Circle pops in from edge with alert
  - **Always-On mode:** Circle pulses/glows to get attention
- User can tap to see details or dismiss

**Sensitivity settings:** Aggressive, Balanced (default), Minimal

---

## 4. Companion Personalization

### 4.1 Naming Your Companion

During onboarding (or in settings), users can **name their companion**.

- Default name: "Circle" (or no name)
- User can set any name (e.g., "Hira", "Buddy", "Luna")
- Name is used for voice wake word and adds personal connection

### 4.2 Voice Commands (Pro/Family Only)

**Availability:** Pro and Family subscribers only  
**Default:** Off (user must enable in settings)

When enabled, users can talk to their companion instead of tapping.

**How it works:**

| Phase | What Happens |
|-------|--------------|
| **Passive listening** | Circle listens for wake word (companion's name) only — nothing sent anywhere |
| **Wake** | User says "Hey Hira" (or just "Hira") — circle shows active listening animation |
| **Capture** | User continues: "Is this post AI generated?" — speech is captured |
| **Silence detected** | After ~2 seconds of silence, capture ends |
| **Detection** | Captured text sent to detection API |
| **Response** | Companion **speaks back** the verdict using text-to-speech |
| **Reset** | Returns to passive listening mode |

**Voice Response Examples:**
- "That looks AI generated — about 94% confident"
- "Seems real to me, I don't detect anything synthetic here"
- "Hmm, I'm not sure about this one — maybe 60% chance it's AI"

**Voice Characteristics:**
- Slightly warm tone (not robotic)
- Natural speech rate
- Friendly personality matching the companion's visual design

---

## 5. Content Types Detected

The app should detect AI-generated content across:

| Type | Examples |
|------|----------|
| **Images** | AI-generated photos, art, deepfakes |
| **Videos** | Synthetic video, face swaps |
| **Text** | ChatGPT-generated content, bot messages |
| **Audio** | Cloned voices, synthetic speech |
| **Live video calls** | Real-time deepfake detection |
| **Phone calls** | Voice clone detection |

**MVP Priority:** Images first, then expand to other modalities.

---

## 5. Account & Device Management

### 5.1 Authentication

- **Sign in with Google** (primary method)
- One account = access on all devices
- No separate username/password to remember

### 5.2 Central Dashboard

Accessed from app settings or web portal:

| Feature | Description |
|---------|-------------|
| **Device list** | See all devices signed in |
| **Per-device toggle** | Turn circle on/off for each device |
| **Visibility mode** | Set Stealth or Always-On per device |
| **Auto-detect settings** | Enable/disable, set sensitivity |
| **Account settings** | Subscription, privacy, data |

### 5.3 Setup Flow

Target: **Under 60 seconds from download to working**

1. Download app / install extension
2. "Sign in with Google" button
3. Grant necessary permissions (screen access, overlay)
4. Brief tutorial (optional, skippable)
5. Circle appears — ready to use

---

## 6. Permissions Required

### 6.1 Mobile (iOS/Android)

| Permission | Why |
|------------|-----|
| **Display over other apps** | To show the floating circle |
| **Screen capture / Accessibility** | To analyze on-screen content |
| **Internet** | To call detection API |
| **Notifications** | For auto-detect alerts |
| **Microphone** (Pro/Family) | For voice commands feature |

### 6.2 Privacy Principles

- **No content storage:** Analyze → verdict → discard
- **No browsing history:** Don't track what user views
- **Local processing where possible:** Reduce data sent to cloud
- **User controls everything:** Devices, modes, sensitivity

---

## 7. Technical Requirements

### 7.1 Detection Engine

| Requirement | Target |
|-------------|--------|
| **Accuracy** | 99%+ (stretch goal: 99.9%) |
| **Latency** | Verdict in under 2 seconds |
| **Offline support** | Basic detection works offline; cloud for complex cases |
| **Multi-modal** | Image, video, audio, text (phased rollout) |

### 7.2 Performance

- Circle UI must be **smooth 60fps**
- Eye animations must not lag
- Minimal battery impact
- Low memory footprint

---

## 8. Platform Rollout

| Phase | Platforms |
|-------|-----------|
| **Phase 1 (MVP)** | iOS app, Android app |
| **Phase 2** | Chrome extension, macOS app, Windows app |
| **Phase 3** | Smart TV apps, other browser extensions |

---

## 9. Business Model

### 9.1 Freemium Tiers

| Tier | Features |
|------|----------|
| **Free** | Limited daily scans, basic auto-detect, Stealth mode only |
| **Pro** | Unlimited scans, advanced auto-detect, all modes, all devices, **voice commands**, companion naming |
| **Family** | Everything in Pro, up to 6 accounts, each with their own named companion |

### 9.2 Pricing

- **Free:** $0
- **Pro:** $4.99/month or $39.99/year
- **Family:** $9.99/month (up to 6 accounts)

---

## 10. UI Specifications

### 10.1 Circle Dimensions

| Context | Size | Eye Size | Eye Gap |
|---------|------|----------|---------|
| Mobile (default) | 50px | 10px | 10px |
| Tablet | 60px | 12px | 12px |
| Desktop overlay | 50px | 10px | 10px |
| TV | 80px | 16px | 16px |

### 10.2 Colors

| Element | Hex | Usage |
|---------|-----|-------|
| **Peach (face)** | #FFD4C4 | Idle state |
| **Eyes** | #2C2C2C | Always |
| **Eye highlight** | #FFFFFF | Always |
| **Scanning** | #C8D8FF | Blue tint when scanning |
| **AI Detected** | #FF9500 | Orange alert |
| **Real/Safe** | #34C759 | Green confirmation |

### 10.3 Animations

| Animation | Duration | Easing |
|-----------|----------|--------|
| Breathing (idle) | 3s loop | ease-in-out |
| Blink | 200ms | ease-in-out |
| Eye movement | 150ms | ease-out |
| Scanning pulse | 800ms loop | ease-in-out |
| Alert wiggle | 400ms | ease-in-out |
| Happy bounce | 400ms | ease-out |
| Verdict bubble appear | 300ms | cubic-bezier(0.34, 1.56, 0.64, 1) |

---

## 11. Error States

| Scenario | Behavior |
|----------|----------|
| **No internet** | Show offline indicator; use local detection if available |
| **Detection failed** | Show "Couldn't check" message; offer retry |
| **Permission denied** | Explain why permission is needed; link to settings |
| **Account issue** | Prompt to sign in again |

---

## 12. Accessibility

- Circle can be repositioned to avoid obstructing content
- High contrast mode support (black/white logo versions)
- Screen reader: announce verdicts
- Reduce motion: disable animations if system preference set

---

## 13. Analytics Events (for tracking)

| Event | When |
|-------|------|
| `circle_tap` | User taps to scan |
| `scan_complete` | Scan finished |
| `verdict_ai` | AI detected |
| `verdict_real` | Real content confirmed |
| `auto_detect_trigger` | Auto-detect found something |
| `circle_dragged` | User repositioned circle |
| `mode_changed` | User switched Stealth/Always-On |
| `device_added` | New device signed in |
| `companion_named` | User set companion name |
| `voice_enabled` | User turned on voice commands |
| `voice_wake` | Wake word detected |
| `voice_command` | Voice command completed |

---

## 14. Open Questions for Development

1. **iOS screen access:** What's technically possible? Accessibility service? Screen recording API?
2. **Detection API:** Build vs. buy vs. partner?
3. **Offline detection:** What can run on-device?
4. **Battery optimization:** How to minimize background impact?
5. **App Store approval:** Will overlay apps be approved?

---

## 15. References

See the `Design/` folder for visual references:
- `Design/Logo/` — Logo system (white/black primary, variations)
- `Design/Companion/` — Face design, colors, expressions
- `Design/Demos/` — Interactive demo showing full behavior

---

*Document created: October 2026*  
*Product: The Little Circle — thelittlecircle.com*
