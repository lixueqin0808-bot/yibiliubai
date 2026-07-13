# Golden Level Control Tuning Design

## Goal

Make the golden sample level comfortable inside a portrait browser: reduce the map and blade, preserve matching visual and collision sizes, keep an active drag when it leaves the canvas, and cut immediately when the stroke crosses the map.

## Decisions

- Scale the map to roughly 84% of its current footprint around the existing center.
- Reduce the blade collision radius from 18 to 14 logical pixels and scale its rendered shape by the same ratio.
- Track the active pointer on `window` after it starts on the canvas so leaving the canvas does not cancel the gesture.
- Complete a valid cut during `pointermove`; `pointerup` remains a fallback for quick gestures.
- Replace the success sound with a shorter paper-slice transient plus restrained low-frequency impact. Formal sound assets remain outside this iteration.

## Acceptance

- The map has visibly wider margins on a 390 x 844 viewport.
- The rendered blade and collision radius shrink together.
- A desktop drag can leave the portrait game frame and still complete.
- Progress changes before pointer release once the line crosses both map boundaries.
- Unit tests, production build, and Playwright mobile/desktop flows pass.
