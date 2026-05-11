# Art Reference Index

This document maps the **local-only** artwork collection
(`assets/artwork/bram_artwork_collection/`) to its intended
production use. The folder itself is gitignored — see `.gitignore`.

> These files are local pre-production references. They are not
> committed production assets. Final game assets must be recreated
> as transparent sprite sheets, tilemaps, atlases, SVGs, Spine
> rigs, or other clean runtime assets. See `ASSET_PIPELINE.md`.

## What's in there

The collection is organized under five top-level folders. Each
folder is described below, with the files it contains and the
production stage it informs.

---

## 01 — Concept Art Boards

**Path:** `assets/artwork/bram_artwork_collection/01_concept_art/`

**Purpose:** mood, game-mode direction, high-level UI tone. Use
these to align with the painterly storybook target and to remember
what each mode "feels like" before any production art exists.

| File | Use as reference for |
|---|---|
| `01_original_math_adventure_pitch.png` | Original concept pitch — overall tone, UI mood, restoration arc framing. |
| `02_cozy_journey_self_discovery.png` | Warmer cozy pass — palette, parchment UI direction. |
| `03_downhill_skateboarding_rattle_run.png` | Rattle Run mode — slope feel, answer gates, parallax depth. |
| `04_side_scrolling_platforming.png` | Platform mode — floating forest, bridge/lever palette. |
| `05_top_down_adventure_puzzle.png` | Top-Down mode — garden palette, coin puzzle layout. |

**Do not** treat these as final backgrounds. They have baked text
labels, UI mockups, and inconsistent layouts.

---

## 02 — Storyboards

**Path:** `assets/artwork/bram_artwork_collection/02_storyboards/`

**Purpose:** prologue staging, cinematic/animatic reference, Veo
prompt material. Use these when writing or revising prologue panels
and when describing shots for video previs.

| File | Use as reference for |
|---|---|
| `01_midnight_transformation_storyboard.png` | Early transformation framing (superseded by 04 — kept for archive). |
| `02_alien_transformation_storyboard.png` | Earlier alien-arrival framing (superseded by 04). |
| `03_bram_broken_world_adventure_begins.png` | Giving/repair beat — Bram offering, Nilo gaining form. |
| `04_light_over_the_water_storyboard.png` | **Canonical opening** — flash, orb over water, bounce, turn-to-shore, kitchen, repair. Aligns with `PrologueScene` panels 1–14. |

**Do not** use baked storyboard frames as runtime backgrounds. The
procedural panels in `PrologueScene` remain authoritative.

---

## 03 — Character Sheets

**Path:** `assets/artwork/bram_artwork_collection/03_character_sheets/`

**Purpose:** model-sheet references for Bram, Nilo, Owl, side
creatures. Use these to lock proportions, palette, and key poses
before commissioning or drawing the clean v0.1 sprite sheets.

| File | Use as reference for |
|---|---|
| `01_character_lineup.png` | Relative scale of Bram, Nilo, Owl side-by-side. |
| `02_bram_skeleton_side_scroller_sheet.png` | Bram skeleton model sheet — pose library and animation poses. |
| `03_bram_human_animation_reference.png` | Bram human side-scrolling animation reference. |
| `04_nilo_alien_and_human_forms.png` | Nilo's alien-energy form and human form together (visual distinction from Bram). |
| `05_side_characters_and_creatures.png` | Owl + side creatures. |

**Do not** cut sprites directly from these sheets. They have:
parchment backgrounds, baked shadows, inconsistent frame boxes,
inconsistent feet/pivots, decorative labels, and varying pose
scales. Use them as art direction; redraw clean sheets for v0.1
per the spec in `ASSET_PIPELINE.md`.

---

## 04 — Environment and Asset Sheets

**Path:** `assets/artwork/bram_artwork_collection/04_environment_and_asset_sheets/`

**Purpose:** parallax, tileset, props, UI, and effects references.
Use to inform palette, density, and motif for environment and
prop production.

| File | Use as reference for |
|---|---|
| `01_environment_parallax_concepts.png` | Coastal house, Rattlewood, Clocktower Marsh parallax direction. |
| `02_platformer_tileset_terrain_kit.png` | Platforming tile motifs and modular assemblies. |
| `03_props_interactables_ui_effects.png` | Props, interactables, UI parchment panels, restoration strip, effects. |

**Do not** export tiles from these sheets. They are concept-density,
not gameplay-density. Production tilesets must be cut at fixed
grid sizes (see `MAP_PIPELINE.md` and `ASSET_PIPELINE.md`).

---

## 05 — Video and Reference Frames

**Path:** `assets/artwork/bram_artwork_collection/05_video_and_reference_frames/`

**Purpose:** animatic / previs reference only. Use these to set
camera framing and pacing expectations for cinematic moments;
do not embed in the game.

| File | Use as reference for |
|---|---|
| `01_veo_panel_01_clean_reference.png` | 16:9 clean reference frame for Veo shot 1. |
| `02_veo_panel_02_clean_reference.png` | 16:9 clean reference frame for Veo shot 2. |
| `03_veo_frame_contact_sheet.jpg` | Contact sheet of Veo first-establishing-shot stills. |
| `04_first_veo_establishing_shot.mp4` | First Veo previs clip (3.2 MB). Animatic only. |

The MP4 is never to be committed to the repo and never to be
served at runtime.
