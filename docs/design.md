# Product and design system

## Creative north star

The supplied landing references establish the look: a near-black field, restrained blood-red wash, one central detective silhouette, warm ivory type, brass accent, hairline rules, and oversized editorial typography. It should feel like a premium title sequence and evidence room, never a dark SaaS dashboard or horror site. Keep composition sparse: one focal image, one oversized statement, one primary action.

V is the visual anchor, not a mascot. Show only controlled cinematic movements and never make the user wait for animation to use the product.

## Visual tokens

Use only these variables; no one-off colours.

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#090807` | page ground |
| `--ink-raised` | `#15110F` | panels and folder shadows |
| `--oxblood` | `#641B1B` | scene wash and active state |
| `--evidence-red` | `#A92A28` | stamps, destructive emphasis, yarn |
| `--paper` | `#E7DDC8` | paper and display type |
| `--paper-muted` | `#B8AD98` | metadata and secondary copy |
| `--brass` | `#A9874A` | borders, rules, clearance details |
| `--smoke` | `#78716A` | disabled/de-emphasised content |

Textures are quiet CSS or compressed-image overlays at 3–6% opacity. Use 1px brass rules, 2px red stamp edges, and slightly imperfect paper edges as recurring motifs.

## Typography

The intended font family is local and licensed, not a downloaded Google substitute.

| Role | Production family | Typical treatment | Development fallback |
| --- | --- | --- | --- |
| Hero / case title | TBJ Valmist Serif Bold | `clamp(4.5rem, 14vw, 14rem)`, tight tracking | `Bodoni Moda`, Georgia, serif |
| Editorial pull line | ITC Garamond Condensed Light Italic or Colitez Serif Italic | `clamp(1.75rem, 4vw, 4rem)`, italic | `Cormorant Garamond`, Georgia, serif |
| Tall labels / numbers | Selnora Thin Condensed or Harmera Regular | uppercase, `0.08em` tracking | `Barlow Condensed`, Arial Narrow, sans-serif |
| Navigation / evidence metadata | Gothica Modern | 11–14px, uppercase, `0.12em` tracking | `DM Mono`, ui-monospace, monospace |

Use `next/font/local` and CSS variables with WOFF2 files under `src/app/fonts/`; never request fonts from a third-party CDN. Use 3–4 styles maximum. Production web licensing is required: public editions of ITC Garamond, Selnora, Harmera, and TBJ Valmist are not automatically web-embeddable.

## Page flow

## Required visual approval gate

Before implementing **each new user-facing page or materially redesigning an existing page**, the coding agent must stop and ask for design approval. It must provide a concise visual brief containing: page purpose, hierarchy/copy, layout at desktop and mobile, chosen reference from this design system, imagery/assets needed, colour/type/motion choices, interaction states, and a short statement of how the proposal reflects the supplied visual references. It must wait for the user's approval or revision before writing that page's UI code.

Do not require approval for server services, schemas, migrations, tests, import tooling, auth callbacks, environment validation, accessibility fixes, bug fixes that preserve the approved design, or other non-visual backend work. Once a page's visual brief is approved, implement it faithfully; ask again only if a material visual or interaction change becomes necessary.

### Landing — `/`

The hero opens with detective image/video, monogram, sparse navigation, case-file metadata, oversized title, and `Enter case files` / `Play now`. It scrolls through three pinned chapters:

1. **Observation:** magnifying glass focuses the opening message; detective and title remain central.
2. **Evidence:** oxblood falls toward black; evidence fragments and parallax enter; premise becomes readable.
3. **Decision:** the scene resolves to one invitation to play.

GSAP ScrollTrigger owns pinned landing timelines; Lenis is the single smooth-scroll owner. Do not mix GSAP scroll control with Motion scroll controls. Motion handles application transitions, folder state, dialogs, and micro-interactions.

Do not convert hero video to a GIF. GIFs are large, inefficient to decode/scrub, and have no playback control. Use compressed MP4, WebM where practical, a static poster, and a native `video` element. ScrollTrigger crossfades/transforms DOM around the video; it must not require frame-perfect seeking. The landing works before video metadata loads.

React Three Fiber plus Drei is permitted only for one dynamically imported decorative canvas: dust, depth, or magnifier/refraction. It has a poster fallback and is disabled for reduced motion, constrained mobile/battery, WebGL failure, or performance-budget breach. Never put gameplay in WebGL.

### Entry and onboarding — `/enter`, `/login`, `/signup`, `/onboarding`

`Play now` reveals full-height **Played before** and **New here** panels. Hover/focus grows a panel without moving its target under the pointer; touch always has a visible action button.

Returning copy: **Agent Login — Welcome Back, Agent.** Successful return reveals `Welcome back, Agent {tag}` then goes to the library. New flow: authenticate → verify usable email if missing → accept terms → choose unique six-digit agent tag → choose display name → training paper → `Complete Training` stamp → library. Refresh resumes the unfinished step.

### Library, folder, finale

The library is a responsive pinboard: one prominent case, intentionally positioned secondary evidence, and accessible details with difficulty, premise, status, and `Play`/`Continue`. Only server data creates `Completed` and `In Progress` stamps.

A case begins as a worn folder. Its first left page carries the oversized title and premise; subsequent pages reveal authored narrative, evidence, and interactions. The folder closes into the evidence board. Provide buttons, page counter, and keyboard equivalents; page flip never gates reading. Pinboard ordering works with keyboard/touch and accessible equivalent controls; yarn is decorative.

## Motion, asset, and accessibility rules

- Respect `prefers-reduced-motion`: remove smoothing/parallax, use short opacity changes, show hero poster.
- Load GSAP/Lenis and optional canvas only on `/`; dynamically import canvas. Clean GSAP contexts on unmount.
- One active pinned scene at a time; do not animate layout-critical dimensions every frame.
- Landing motion/3D initial-route addition must stay below 250 KB gzip. If exceeded, remove WebGL first.
- Visible hero poster only is priority-loaded. All other images use explicit dimensions, responsive sizes, `next/image`, and lazy load. Audio always has a transcript.
- Meet WCAG AA contrast; use 44×44px targets, visible focus, semantic controls, focus restoration, and no hover-only actions. Decorative texture/canvas is `aria-hidden`; successful saves/answers always have text feedback.
