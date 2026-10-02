# Original artwork license audit

Verified on 2026-09-30. Scope: all 21 PNG files in the five original background directories and all three original monster run sheets. No artwork was replaced or modified during this audit.

| Asset group | Creator / original title | Verified license | Evidence |
| --- | --- | --- | --- |
| City, City Dirty, Desert, Jungle, Mountain | The Pixel Nook / Parallax Backgrounds (Demo) | CC BY 4.0 | All 21 PNGs match `Free.rar` exactly; creator's Jungle preview matches the archive's decoded preview pixels |
| Dude, Owlet, Pink Monster | CraftPix.net 2D Game Assets / Tiny Hero Sprites Pixel Art | OGA-BY 3.0 | All three PNGs match the creator's OpenGameArt download exactly |

## Background source evidence

[The creator's listing](https://the-pixel-nook.itch.io/parallax-backgrounds-demo) describes five 320 × 180 layered backgrounds, shows the same five scenes, names the download `Free.rar`, and specifies Creative Commons Attribution v4.0 International under its asset license.

The browser download stalled. The existing `Free.rar` in the user's Downloads folder was used for byte comparisons. It contains the same theme names, file names, dimensions, and artwork. Every project PNG has an exact SHA-256 match in that archive; duplicate city sky/building layers are shared between both city themes.

To establish that the local archive corresponds to the creator's pack, the Jungle GIF was downloaded directly from the listing's Free preview:
https://img.itch.zone/aW1nLzEzMjE1MjkwLmdpZg==/original/w4H04R.gif

The first decoded 320 × 180 frame matches `Free/Jungle/Jungle_free.gif` exactly. SHA-256 of row-major RGBA pixel bytes for both: `967FCF2BFE46FE7E78B1C377A583166F87EFE6B4C7A2D6CEC26BA7649CADFBD2`. Encoded GIF hashes differ because the site's GIF encoding differs; the decoded artwork matches.

The older creator comment says credit is optional and assets must not be resold. The listing's explicit CC BY 4.0 declaration is used here, with full attribution. These assets are not represented as public domain.

## Monster source evidence

[CraftPix's OpenGameArt listing](https://opengameart.org/content/tiny-hero-sprites-pixel-art) identifies the author and OGA-BY 3.0 license. The downloaded archive is:
https://opengameart.org/sites/default/files/pixel-art-tiny-hero-sprites.zip

All three original monster sheets match this archive exactly. The shortened Pink Monster filename is recorded in the manifest. No CraftPix PSDs, other animations, or fonts were added.

## Retained evidence and requirements

- [original-artwork-manifest.json](original-artwork-manifest.json) records all 24 asset hashes, original paths, source URLs, archive hashes, and licenses.
- Official license texts are saved in `public/assets/licenses/CC-BY-4.0.txt` and `OGA-BY-3.0.txt`.
- Attribution, original titles, source/license links, and presentation changes are recorded in `ASSET_CREDITS.md` and the game's `public/artwork-credits.html` page.
- Keep the notices when redistributing artwork, including through a public source repository. Changes to artwork must be identified. These attribution licenses do not require the project's separate code to use the artwork's license.

This audit covers the original background and monster artwork only. Credits for later additions are maintained separately in the main asset credits file; it is not an audit of music, fonts, dependencies, or all other project content.
