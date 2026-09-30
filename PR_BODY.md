# Sanctuary Market & Wellness UI refresh

## Summary

Introduces a CSS custom-property design system, replaces cartoonish emoji glyphs with
Lucide icons, and refreshes the Sanctuary Market and companion wellness scenes.

**Presentation-only.** No changes to habit state or logic, purchasing, inventory,
accessory behaviour, or any backend/state management.

## Commits

| Commit | Description |
| --- | --- |
| `abd4908` | `fix(deps):` bump esbuild to `^0.28.0` for Vite 8 peer compatibility |
| `5ac3923` | `feat(ui):` swap emoji glyphs for Lucide icons and redesign the goals modal |
| `b924026` | `feat(ui):` add design-token system, migrate emoji to Lucide icons, refresh market & wellness UI |

## Design tokens (`src/index.css`)

- Added `--color-surface` / `-ink` / `-line` / `-accent` / `-canvas` tokens with dark
  variants, plus `--c-*` aliases for concise use inside components.
- Harmonized dark-mode surface and border tones (e.g. `WellnessMarket`
  `#132219` / `#172b1f` / `#16271c` → unified `#182a22` with `#244137` borders) so
  panels read as one cohesive system instead of drifting per component.

## Icons and shared visuals

- Swapped emoji item glyphs for Lucide icons (148 new icon imports) across the
  wellness, market, community, and journal surfaces. `PouWellnessTab` is now
  emoji-free; `WellnessMarket` keeps emoji only where Lucide has no faithful
  equivalent (salakot, beanie, scarf).
- Added `src/data/circleAwards.ts` so Circle Award icon and colour visuals live in one
  place, shared by the `ExpandedMarket` awards section and the `RedditCommunity` award
  picker. **Imported by `RedditCommunity.tsx`, so it ships with this change** — the
  build would fail without it.

## Wellness & companion scenes

- **`PouWellnessTab`**
  - In-scene place rails (icon-only at rest, click to reveal a single label).
  - Wall pantry with a sliding door replaces the flat refrigerator sticker; shares one
    item list with the tray so the two cannot drift apart.
  - Kitchen items are both draggable and tap-to-serve, with a smooth scroll back to
    the pet after a tap.
  - Bathroom: mirror cabinet, towel rail, tub caddy, and an integrated wall-hung pet
    blower with a spinning rotor, air streaks, and an airflow shake on the pet — all
    animation gated so nothing keeps moving after it stops. Existing shower/bathing
    behaviour is preserved and takes priority for pet positioning.
  - Item-accurate food and drink serving: the served visual always matches the exact
    selected item (no hardcoded fish), drinks get lapping/droplet behaviour, and the
    consumable is anchored inside the rug so it stays aligned as the scene scales.
  - Outside: split Rainy / Sunny controls, plus a rooted meadow flower that grows after
    rain is held for 5s and sways gently in the sun.
  - Clinic: medical kit visual and a vitals panel; stethoscope/note icons and the old
    Sanctuary card removed.
- **`CuteCompanion`**: renders the exact item being consumed instead of a hardcoded
  species snack, with a gentler lap for drinks.

## Sanctuary Market

- **Stopped rendering the "Gentle Daily Habits" panel** inside the market. This is
  presentation-only: `appState.habits`, `handleToggleHabit`, `initialHabits`, and the
  WP reward logic are all untouched and still active — the habits feature simply is no
  longer displayed here. The `<ExpandedMarket>` props and its `App.tsx` call site were
  deliberately left intact so the habit wiring is provably unchanged.
  - `src/components/DailyHabits.tsx` is intentionally **kept** (now unreferenced) rather
    than deleted, so the feature can be restored or surfaced elsewhere.
- `WellnessMarket`: dark-mode surface and border harmonization.

## Also refreshed

`App` shell, `AccountView`, `RedditCommunity`, `PhoneMinimizer`, `PrivateJournal`,
`DigitalShieldTab`, `CompanionChatModal`, `CompanionStage`, `BayanihanCircle`,
`CrisisModal`, onboarding flows, and the mini-games surface.

## Verification

- `tsc --noEmit` — **clean, zero errors** (this also resolves the two pre-existing
  `src/App.tsx` `TS2532` errors).
- `vite build` — succeeds, 2089 modules transformed.
- Dev server smoke test — 200 on `/`, `/src/main.tsx`, `/src/App.tsx`, `/src/index.css`,
  `/src/data/circleAwards.ts`, and every changed component module, plus `POST /api/chat`
  and `GET /api/download-source`.
- No `console.log`/`debugger`/TODO markers and no hardcoded secrets in the diff.

## Known gaps

- **No visual verification was possible** — no browser was attached during this work, so
  the layout, icon sizing, and dark-mode contrast are verified by typecheck, build, and
  code review only. Worth a pass at mobile and desktop widths before merging.
- `PR_BODY.md` and `package-lock.json` are intentionally **excluded** from this branch.
  The repo tracks `bun.lock`, so committing a second lockfile would risk dependency
  drift.
- The 3D bowl in `ThreePetCanvas.tsx` still renders an orange fill for cats regardless
  of what was served. Pre-existing, untouched, and out of scope.
- Unresolved pre-existing items in `server.ts`: invalid Gemini model IDs
  `gemini-3.1-flash-lite` and `gemini-3.8-flash`.
