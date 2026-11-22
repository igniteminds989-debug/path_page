# Project memory

## Product intent & audience

- Interactive journey/progress map visualization ("JourneyMap") where a character/object "Pip" walks along an SVG trail path through a series of nodes.

## Brand personality & voice

- Not yet inferred.

## Visual design & UX direction

- SVG-based trail/path rendered responsively; path geometry is generated only after the container size is measured (`size.w > 0`).
- Nodes are positioned along the path by length (`nodeLengths` array); Pip animates between nodes by sampling `getPointAtLength`.
- Animation threshold: if delta between previous and target length is < 0.5, Pip snaps instead of animating.
- Responsive: path starts as empty string `""` until size is known; layout depends on measured container dimensions.

## Decisions, constraints & rationale

- Framework: Vite + React.
- Guard all SVG path sampling (`getTotalLength`, `getPointAtLength`) against empty/invalid paths — these APIs throw on an empty `d` attribute and can crash the entire React tree (white screen).
- Wrap `getTotalLength`/`getPointAtLength` calls in try/catch as a safety net, even when guarded by size checks.
- `PipWalker` walk effect must tolerate initial mount when `nodeLengths` is `[]` (`nodeLengths[currentIndex]` → `undefined ?? 0` = 0); re-runs naturally when `nodeLengths` populates.
- `JourneyMap` effect returns early when `size.w === 0` to avoid setting `d` before geometry exists.
- `prevLenRef` starts as `null`; when path populates late, `startLen = targetLen` so Pip snaps to current node (acceptable behavior).

## Open questions & assumptions

- Brand personality, color palette, typography, and detailed visual direction are not yet established.
- Exact meaning of "nodes" (stages, milestones, levels?) is unconfirmed.
- Audience and product context beyond the journey-map concept are unknown.