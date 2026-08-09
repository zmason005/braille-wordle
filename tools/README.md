# Word bank generator

Generates a batch of new 5-cell-braille candidate words for Contractable,
in the same format as `import-words.txt` (word, space, 5 Unicode Braille
cells, newline).

## One-time setup

```bash
apt-get update
apt-get install -y liblouis-bin liblouis-data python3-louis
pip install better-profanity --break-system-packages
```

## Running it

From this `tools/` folder, with a current copy of `daily-word4.json` and
`brlunicode-mapping.json` alongside it (copy them from the repo root, or
symlink):

```bash
python3 generate_words.py
```

This downloads fresh copies of its word sources each run:
- `words_alpha.txt` — dwyl/english-words (dictionary validity check)
- `en_freq.txt` — hermitdave/FrequencyWords (recognizability gate)
- `first_names.txt`, `us_names.txt` — name lists (to exclude proper nouns)

It writes `import-words.txt` with up to `TARGET_COUNT` new words (default
100), excluding anything already present in `daily-word4.json`.

## Before re-running for a new batch

Make sure `daily-word4.json` reflects everything you've already merged in
from prior `import-words.txt` batches — the script only excludes words
that are already in that file, so if you haven't merged a previous batch
yet, pass it in too or the next batch may re-suggest the same words.

## Tunable knobs (top of the script)

- `TARGET_COUNT` — how many words to output per run
- `MIN_LETTERS` — minimum print-word length to consider (default 5)
- `FREQ_RANK_CUTOFF` — how far down the frequency list to search
- `CONTRACTION_STEMS` — manual blocklist for dictionary-source artifacts
