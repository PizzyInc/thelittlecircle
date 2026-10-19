export type SkinId = "peach" | "midnight" | "mint" | "lavender" | "blush" | "gold";

export interface Skin {
  id: SkinId;
  name: string;
  emoji: string;
  bg: string;
  shadow: string;
  eyeWhite: string;
  pupil: string;
}

export const SKINS: Record<SkinId, Skin> = {
  peach: {
    id: "peach",
    name: "Peach",
    emoji: "🍑",
    bg: "linear-gradient(145deg, #ffe8dc 0%, #ffd4c4 100%)",
    shadow: "0 6px 28px rgba(255,180,150,0.55), inset 0 -3px 10px rgba(255,150,120,0.25), inset 0 3px 10px rgba(255,255,255,0.8)",
    eyeWhite: "#fff",
    pupil: "#2c2c2c",
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    emoji: "🌙",
    bg: "linear-gradient(145deg, #1e2a4a 0%, #0d1526 100%)",
    shadow: "0 6px 28px rgba(80,120,255,0.55), inset 0 -3px 10px rgba(40,60,140,0.4), inset 0 3px 10px rgba(100,140,255,0.2)",
    eyeWhite: "rgba(200,220,255,0.95)",
    pupil: "#0a1020",
  },
  mint: {
    id: "mint",
    name: "Mint",
    emoji: "🌿",
    bg: "linear-gradient(145deg, #d4f5e8 0%, #a8ecd0 100%)",
    shadow: "0 6px 28px rgba(80,200,160,0.45), inset 0 -3px 10px rgba(60,180,130,0.2), inset 0 3px 10px rgba(255,255,255,0.8)",
    eyeWhite: "#fff",
    pupil: "#1a3d2b",
  },
  lavender: {
    id: "lavender",
    name: "Lavender",
    emoji: "💜",
    bg: "linear-gradient(145deg, #ede9fe 0%, #d4c8fc 100%)",
    shadow: "0 6px 28px rgba(150,120,255,0.45), inset 0 -3px 10px rgba(130,100,240,0.2), inset 0 3px 10px rgba(255,255,255,0.8)",
    eyeWhite: "#fff",
    pupil: "#2d1b69",
  },
  blush: {
    id: "blush",
    name: "Blush",
    emoji: "🌸",
    bg: "linear-gradient(145deg, #fce7f3 0%, #f9a8d4 100%)",
    shadow: "0 6px 28px rgba(244,114,182,0.5), inset 0 -3px 10px rgba(220,80,150,0.2), inset 0 3px 10px rgba(255,255,255,0.8)",
    eyeWhite: "#fff",
    pupil: "#831843",
  },
  gold: {
    id: "gold",
    name: "Gold",
    emoji: "✨",
    bg: "linear-gradient(145deg, #fef3c7 0%, #fcd34d 100%)",
    shadow: "0 6px 28px rgba(245,158,11,0.55), inset 0 -3px 10px rgba(217,119,6,0.25), inset 0 3px 10px rgba(255,255,255,0.8)",
    eyeWhite: "#fff",
    pupil: "#451a03",
  },
};

export const SKIN_LIST = Object.values(SKINS);
