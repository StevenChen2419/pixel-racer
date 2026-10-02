# Asset credits

## Newly added art

### Woodland scenery, Fox, and Squirrel

Artwork by **Luis Zuno (@ansimuz)**, public domain / [CC0](https://creativecommons.org/publicdomain/zero/1.0/).

- Woodland and Squirrel: https://opengameart.org/content/sunnyland-woods
- Fox: https://opengameart.org/content/sunny-land-2d-pixel-art-pack
- Woodland files: `public/assets/bg/woodland/`; original background layers plus a repeating ground strip assembled from the pack's log tiles. The picker composites the same layers as the race.
- Runners: `public/assets/sprites/fox-run.png` and `squirrel-run.png`. Six original run frames are trimmed to common bounds, scaled with nearest-neighbor sampling, and packed into 32 × 32 frames for the existing animation system.
- Original license notices: `public/assets/bg/woodland/LICENSE.txt` and `public/assets/sprites/SUNNYLAND-LICENSE.txt`. No demo code or music is included.

### SunnyLand and Magic Cliffs backgrounds

Both packs are by **Luis Zuno (@ansimuz)**.

- SunnyLand: https://opengameart.org/content/sunny-land-2d-pixel-art-pack — public domain / [CC0](https://creativecommons.org/publicdomain/zero/1.0/). Files: `public/assets/bg/sunnyland/`.
- Magic Cliffs: https://opengameart.org/content/magic-cliffs-environment — the downloaded archive includes a [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) notice, preserved in `public/assets/bg/magic_cliffs/LICENSE.txt`, with attribution displayed in the game. Although the current listing says CC0, this project honors the archive's notice.
- Original license notices are included. SunnyLand's `canopy.png` crops the unused flat fill beneath the original `middle.png` foliage; other background artwork is unchanged. The repeating `ground.png` strips are assembled from each pack's original grass and terrain artwork to provide a continuous running surface. SunnyLand's soil is sampled from its environment preview. No music or bundled code is included.

### Neon Street background

Cyberpunk Street Environment by **Luis Zuno (@ansimuz)**.

- Source: https://opengameart.org/content/cyberpunk-street-environment
- Creator's current pack: https://ansimuz.itch.io/cyberpunk-street-environment
- License for the downloaded OpenGameArt edition: [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
- Files: `public/assets/bg/synth_city/`.
- Original license notice is included as `LICENSE.txt`. PNG artwork is unchanged; the game scales and scrolls the original layers and uses the composite image as its picker thumbnail.

The current itch.io pack lists CC0, but this project preserves the attribution required by the specific archive downloaded from OpenGameArt.

### Pixel Adventure runners

Pixel Adventure by **Pixel Frog**: Ninja Frog, Mask Dude, Pink Man, and Virtual Guy.

- Source: https://pixelfrog-assets.itch.io/pixel-adventure-1
- License: [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
- Files: `public/assets/sprites/ninja-frog-run.png`, `mask-dude-run.png`, `pink-man-run.png`, and `virtual-guy-run.png`.
- Original 32 × 32 run sheets are unchanged and contain 12 frames each. Filenames were simplified for web use.

## Existing art

### Original five backgrounds

**Parallax Backgrounds (Demo)** by **The Pixel Nook**, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

- Creator and source: https://the-pixel-nook.itch.io/parallax-backgrounds-demo
- Files: `public/assets/bg/city/`, `city_dirty/`, `desert/`, `jungle/`, and `mountain/` (21 PNG layers, including the currently unused Desert dunes).
- All PNGs match the original `Free.rar` archive byte for byte. City layer filenames were simplified; artwork is unchanged. The game scales, scrolls, and composites layers for race scenery and picker previews.
- License copy: `public/assets/licenses/CC-BY-4.0.txt`.
- The listing explicitly specifies CC BY 4.0. Its older comment describes optional credit and no asset resale; this project uses the explicit CC BY 4.0 license and supplies attribution, source, and license links.

### Original monster runners

**Tiny Hero Sprites Pixel Art** by **CraftPix.net 2D Game Assets**, licensed under [OGA-BY 3.0](https://static.opengameart.org/OGA-BY-3.0.txt).

- Creator's OpenGameArt release: https://opengameart.org/content/tiny-hero-sprites-pixel-art
- Files: `public/assets/sprites/Dude_Monster_Run_6.png`, `Owlet_Monster_Run_6.png`, and `Pink_Monster_Run.png`.
- All three sheets match the creator's OpenGameArt ZIP byte for byte. Pink Monster's filename was shortened; artwork is unchanged. The game scales and animates the six original frames.
- License copy: `public/assets/licenses/OGA-BY-3.0.txt`. OGA-BY is an OpenGameArt license, not CC0 or a Creative Commons license. This project uses the verified OpenGameArt edition rather than assuming the CraftPix website's separate license applies.

## Verification and distribution

The original artwork audit was completed on **2026-09-30**. See [verification evidence](docs/artwork-license-audit.md) and the [SHA-256 manifest](docs/original-artwork-manifest.json) for the exact files and archive paths.

Both original asset licenses allow use, modification, and redistribution, including commercial projects, with attribution and the applicable license conditions. Preserve these credits and license notices when publishing the repository or game. The artwork keeps its own licenses independently of any future license chosen for the project's code.

The game links to `public/artwork-credits.html`, which includes credits for both original and newly added artwork.
