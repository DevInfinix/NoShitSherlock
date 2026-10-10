# Case content and automation pipeline

## Source and output layout

Google Drive is the editorial source. Mirror it locally using Google Drive for desktop (or an authorised sync) into git-ignored `content/inbox/`; the browser never reads Drive.

```text
content/inbox/
  Cases PDF/
    case1_NoShitSherlock.pdf
    case2_NoShitSherlock.pdf
    ...
  Image Assets/
    case1/
      case1_image1.png ... case1_imageN.png
    case2/
      case2_image1.png ... case2_imageN.png
    ...

content/cases/case-01-missing-ledger/
  case.json
  asset-manifest.json
public/cases/case-01-missing-ledger/
  images/*.webp
  audio/*.mp3
```

Raw PDFs, original PNGs, source video, and Drive credentials are never committed or put in `public/`.

## Automated import

Extend fixed `bun run db:seed` with `--import-case <source-dir>`. This authoring/build command is not a request-time API:

1. Extract PDF text with page numbers.
2. Parse headings, sections, `[IMAGE ASSET — ...]` blocks, prompts, interaction labels, options, explicit answers, accepted variants, clue unlocks, and final deductions.
3. Pair `case1_imageN.png` with PDF asset blocks in numeric/source order. Fail on a count/type mismatch; never guess a replacement.
4. Create `asset-manifest.json`: stable key, source page, prompt, image mapping, ratio, alt-text draft, and provenance.
5. Optimise PNGs to WebP, retain dimensions, generate blur placeholders.
6. Create draft `case.json`; validate it with Zod, including every answer rule and asset reference.
7. Print review report: unmapped assets, duplicate keys, question count, score total, missing transcripts, and answer data. Seed only after validation passes.

One deliberate review of generated `case.json` remains mandatory. A parser can extract explicit content but cannot safely infer an ambiguous puzzle rule or free-text acceptance logic. This eliminates repetitive mapping while keeping game truth deterministic and offline.

## Case 01 contract

`case1_NoShitSherlock.pdf` defines **The Missing Ledger**: five sections, 15 interactions, 500-point result display, five finale evidence items, a `Who / How / Why` board, and a final free-text reconstruction. Preserve its authored facts and never expose answers to the client.

| Section | Interaction patterns |
| --- | --- |
| 01 — Desk Drawer | torn-note word drag; timeline observation; map/route inspection |
| 02 — Security Log | chronological order; evidence-label conclusion; limited two-question selection |
| 03 — Safe | code/access deduction; connection matching; choose two facts |
| 04 — Time That Doesn't Fit | timestamp conversion; evidence-based free text; timeline window |
| 05 — Voicemail | clue-linked missing word; transcript/audio; finale transition |
| Finale | evidence into `Who`, `How`, `Why`; reconstruction against required deductions |

Final reconstruction uses structured server validation: store required deduction concepts server-side, normalise input, and return safe feedback such as “You have the motive; re-check the sequence.” No exact-string rule and no browser-visible keyword list.

## Assets and delivery

PDF image blocks are provenance, not runtime prompts. Reuse an asset key whenever evidence repeats: Rajan, Arjun, office desk, train ticket, and safe must match visually. Case 01 character portraits are 4:5; environments/evidence boards 16:9; close-ups may be 4:3. Record this in the manifest.

Skip a CDN for v1. `next/image`, build-time WebP conversion, explicit responsive sizes, lazy loading, and static local assets are sufficient at this scale. Audio is pre-generated MP3 with authored transcript in `case.json`.
