// CSS animations injected into shadow root — keeps extension styles isolated from the page
export const CIRCLE_STYLES = `
@keyframes circleIdleBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
@keyframes circleScanPulse {
  0%, 100% { box-shadow: 0 8px 45px rgba(100,140,255,0.5), inset 0 3px 10px rgba(255,255,255,0.8); }
  50% { box-shadow: 0 8px 45px rgba(100,140,255,0.65), 0 0 90px rgba(100,140,255,0.35), inset 0 3px 10px rgba(255,255,255,0.8); }
}
@keyframes circlePupilLook {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(6px, -4px); }
  40% { transform: translate(-5px, 5px); }
  60% { transform: translate(5px, 3px); }
  80% { transform: translate(-4px, -5px); }
}
@keyframes circleAIWiggle {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-3px) rotate(-2deg); }
  75% { transform: translateX(3px) rotate(2deg); }
}
@keyframes circleRealBounce {
  0% { transform: scale(1); }
  30% { transform: scale(1.1); }
  50% { transform: scale(0.95); }
  70% { transform: scale(1.04); }
  100% { transform: scale(1); }
}
@keyframes verdictBubblePop {
  0% { opacity: 0; transform: scale(0.6) translateY(6px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
* { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
`;
