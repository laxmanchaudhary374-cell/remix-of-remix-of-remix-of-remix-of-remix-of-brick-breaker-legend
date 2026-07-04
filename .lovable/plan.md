
# 12 Fixes for Neon Brick Breaker

I'll implement all 12 changes as isolated, minimal edits. No refactors, no visual re-theming, no changes to monetization, level data, or Capacitor config.

---

## 1. Slower ball-speed curve
**File:** `src/utils/gameUtils.ts` (and/or wherever `level.ballSpeed` is derived — will confirm on read).
Currently level 141 already feels like the "max". I'll rescale so the same top-end speed is reached around level ~1500 instead. Change is a single curve function — no per-level data touched.

Formula change (concept):
```
old: speed = base + level * k1
new: speed = base + (level ^ 0.75) * k2   // tuned so L1500 ≈ old L141
```

## 2. Interstitial ad every 3 levels (not every level)
**File:** `src/components/game/BrickBreakerGame.tsx` → `handleNextLevel`.
Change condition from `nextLevel >= 15` firing every time to firing only when `nextLevel % 3 === 0` (and still respecting `isAdsRemoved()` and the `>=15` gate). No change to AdMob code.

## 3. Normal ball breaks only 1 brick per hit
**File:** `src/components/game/GameCanvas.tsx` collision loop.
When ball is NOT fireball/big/shock, break-out of the brick-collision `for` loop after the first hit and stop further overlaps that frame. Fireball / big-ball / shock behavior unchanged.

## 4. Slightly bigger bricks
**File:** `src/utils/gameUtils.ts` brick sizing constants (BRICK_WIDTH / BRICK_HEIGHT or scale factor).
Increase brick size ~11% (your 45→50 example) while keeping the same grid columns so layout still fits. Will verify visually that no row overflows the canvas.

## 5. Phone heating when online
Root cause is almost always the render loop running at uncapped rAF plus network-driven re-renders. I'll:
- Cap the game loop delta so background tabs / throttled frames don't spike CPU.
- Ensure the background is drawn from a cached offscreen canvas (drawn once), not re-computed per frame.
- Debounce any online-only work (banner refresh, network listeners).
No feature removal — just efficiency.

## 6. Background stops "pulsing" with invisible bricks
**File:** `src/components/game/GameCanvas.tsx` render order.
The background is currently being redrawn inside the shaken/transformed context, so when bricks toggle visibility (and canvas transform changes for shake), the bg moves too. Fix: draw background FIRST with identity transform, then `save()` → apply shake → draw entities → `restore()`. Matches your memory rule "screen shake isolated to game entities, background fixed."

## 7. HD steel-shiny ball with smooth motion
**File:** `src/utils/brickRenderer.ts` `drawPremiumBall`.
Upgrade to a multi-layer render: base metallic radial gradient (dark→light steel), specular highlight, rim light, soft contact shadow, subtle motion trail. Smoothness comes from removing any integer-rounding on ball position during draw (sub-pixel positioning) — physics stays delta-time based per your memory.

## 8. Sound continues when app minimized / screen locked
**Files:** `src/components/game/BrickBreakerGame.tsx` + `src/utils/audioManager.ts`.
Add Capacitor `App` `appStateChange` listener: on `isActive=false` → `audioManager.mute()` + `stopBackgroundMusic()`; on resume → restore only if screen is `playing` and user hadn't muted. Also listen to `document.visibilitychange` as web fallback.

## 9. 2-second delay on "Next Level" when offline
**File:** `src/components/game/BrickBreakerGame.tsx` `handleNextLevel`.
Currently offline path still tries `showInterstitialAd` and relies on the 6s fallback. Fix: check `navigator.onLine` (and `isAdsRemoved`) — if offline, skip ad entirely and start next level immediately. Ad path only runs when actually online.

## 10. Show only 3 lives (not 5)
**File:** `src/components/game/BrickBreakerGame.tsx`.
Change `MAX_LIVES = 5` → `3`, default life values `'5'` → `'3'`, initial `getStoredLives` default → 3. Existing users with stored 5 will be clamped to 3 on next read. Regen time unchanged.

## 11. Emergency-powerup countdown moves to top bar
**Files:** `src/components/game/GameUI.tsx` + `GameCanvas.tsx`.
Today the countdown pushes the game canvas down. I'll:
- Remove the inline countdown block from the play area.
- Render a compact blinking countdown badge in the top-left of the HUD, just under the Pause button, absolutely positioned so it does NOT reflow the canvas.

## 12. Add Laser Gun as 4th emergency power-up
**Files:** `BrickBreakerGame.tsx`, `GameCanvas.tsx`, emergency button list (bottom-right stack).
- Add `laser` to `EMERGENCY_PRICES`, `getEmergencyCounts` (default e.g. 3), `handleEmergencyPowerUp`, `handleBuyEmergency`, storage key `neon_breaker_em_laser`.
- Add a 4th round button under the Three-Ball button with a laser-gun icon, styled identically.
- When triggered mid-game, activate the existing laser paddle behavior for its normal duration.

---

## One thing I need from you before I start

**#12 – Laser Gun emergency:** should one tap give the laser for a **fixed duration** (e.g. 10 seconds, same as the power-up drop), or **N laser shots** then it ends? And what **coin price** do you want in the shop for buying more? (Auto=50, Shock=75, Multi=100 today — I'd suggest **Laser = 60**.)

Reply with just "duration 10s, price 60" (or your numbers) and I'll ship all 12 in one pass.
