# Concept Card Workshop — visual thesis

## Direction

**Pixel/demoscene field kit.** This is a workshop instrument, not a game-show
dashboard: a midnight-blue projection surface holds bright, printed-looking
cards like objects in a tiny 16-bit strategy scene. The visual language makes
the four roles legible from across a classroom while giving an instructor the
calm, deliberate feel of setting up a tabletop exercise.

## System

- **Palette:** void `#101424`, panel `#1b2237`, paper `#f7f1df`, ink `#171b2a`,
  signal cyan `#8cf4ff`, decision gold `#ffcf70`, consequence coral `#ff886f`,
  evidence mint `#8ee1b0`, muted `#aeb6c9`. Each role has a named colour plus a
  text label and icon, so colour is never the only cue. The default is a dark
  projection mode; a light print treatment deliberately switches to paper/ink.
- **Type:** system monospace (`ui-monospace`, SFMono-Regular, Menlo, Consolas)
  for labels, timers, and game-like controls; system sans (`Inter`-like native
  stack) for readable card content. No remote font requests.
- **Space:** 4px base grid, with 8/12/16/24/32/48px rhythm. Chunky 2px outlines
  and an 8px pixel-offset shadow establish depth without a generic card grid.
- **Interaction grammar:** role chips are square-tile controls; cards lift by
  2px on hover and settle back on press. Status messages are small terminal
  strips. Important actions use a clearly labelled bright button, never an
  icon-only mystery control.
- **Motion:** 180ms transform/opacity transitions provide physical continuity.
  The reduced-motion mode removes transforms and uses instantaneous state
  changes. Nothing loops or flashes.

## Original illustration

The hero is an original raster illustration of a facilitator tabletop seen as
a demoscene still: a glowing timer, four coloured card piles, and discussion
markers. It supports the product metaphor without depicting people or implying
course material. Generated imagery disclosure appears in the footer.

Prompt sheet: *isometric 16-bit pixel art classroom tabletop at night, four
small stacks of blank discussion cards in cyan, gold, mint and coral, a simple
digital timer, dark navy background, crisp pixel clusters, limited palette,
subtle CRT dither texture, no people, no words, no letters, no watermark, no
logos, no brands*. Negative list: readable text, logos, human faces, gradients,
photorealism, copyrighted characters.

Provenance: generated with the factory Azure OpenAI image deployment on
2026-08-28; original product illustration. Optimised WebP is shipped locally.
