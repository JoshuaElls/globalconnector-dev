# GlobalConnector Dev Site — Editorial Rules

Staging copy of the Global Interconnect, Inc. (Gii) website. Will replace
www.globalinterconnect.com at launch. Owner: Josh (jbates897@gmail.com).

## Hard rules — do not violate

1. **Never edit the migrated articles.** Every folder at the repo root with an
   `index.html` inside (e.g. `understanding-custom-medical-connectors/`) is a
   blog/news article migrated verbatim from the live site at its original URL.
   These are historical record and SEO assets: do not change their content,
   folder names, or URLs. Site-wide sweeps (find/replace, link updates,
   restyling) must exclude these folders.

2. **Manufacturing voice: first-person, ownership-leaning.** Describe
   manufacturing as Gii's own ("our manufacturing network", "our facilities",
   "Gii manufactures across its own nearshore facility in Cartago and its
   established manufacturing operations in Asia"). Gii will own the Costa
   Rica facility; the China facility is not Gii-owned — keep Asia wording
   vague but possessive. Never use "partners", "partner network", "curated
   network", or "vetted" for the manufacturing footprint on main pages.
   (Blog articles openly discuss the partner-network model; per rule 1 they
   stay as-is.)

3. **US = engineering only, never manufacturing.** Gii has engineering,
   design, and rapid prototyping in the US (HQ: Pocasset, MA) — but NO US
   manufacturing. Manufacturing is in Cartago, Costa Rica (nearshore) and
   Asia (Hong Kong HQ, Dongguan China production). Never write copy implying US
   manufacturing or production. US offices/warehousing (Jacksonville FL,
   St. Louis MO) and US-related trade compliance are fine to mention.

4. **No invented facts or stats.** Capacity/volume figures (sq ft, worker
   counts, unit volumes) were removed deliberately — do not reintroduce
   numbers without Josh providing them. The one approved proof point: the $7M
   orthopedics case study ($7M / 500,000 pieces / 6→2 components / 3→1
   suppliers / 75% pin cost reduction).

5. **Keep the SEO safety rails until launch:** the
   `<meta name="robots" content="noindex, nofollow">` staging tags on every
   page, the "value engineering" phrase in the homepage methodology H2 and
   capabilities title, and article canonical tags pointing at
   www.globalinterconnect.com.

## Context

- Production repo (live site fallback): JoshuaElls/GlobalConnector
  (plus its `stable-backup` branch). Never push there without asking.
- Josh also edits this repo directly (GitHub web / GitHub Desktop):
  always `git pull` before working and merge his changes, never overwrite.
- Redirect map and old-site URL inventory live with Josh (CSV exports);
  articles need no redirects because their URLs match the old site exactly.
