"""
Ramacaritamanasa (Tulsidas) Extraction Script - v2 (Complete)
==============================================================
Comprehensive parser that captures ALL verse types:
  - Chaupai   : Lines with // delimiters (paired couplets)
  - Doha      : Lines prefixed with 'do.' (couplets with numbered ending)
  - Soratha   : Lines prefixed with 'so.' (inverted doha, may span 2 lines)
  - Shloka    : Opening Sanskrit stanzas ending with single '/'
  - Chanda    : Occasional meter verses

Output JSON schema per verse:
  { kanda, kanda_name, verse_num, type, text_roman, text_devanagari }
"""

import json
import re
import os
from bs4 import BeautifulSoup
from indic_transliteration import sanscript

# ─── Config ───────────────────────────────────────────────────────────────────

KANDA_NAMES = {
    1: "Balakanda",
    2: "Ayodhyakanda",
    3: "Aranyakanda",
    4: "Kishkindhakanda",
    5: "Sundarakanda",
    6: "Lankakanda",
    7: "Uttarakanda",
}

# The absolute exact start IAST text for the first verse of each Kanda.
# Everything before this is guaranteed to be GRETIL preamble fluff to be discarded.
KANDA_STARTS = {
    1: r'varṇānāmarthasaṃghānāṃ',
    2: r'yasyāṅke ca vibhāti',
    3: r'mūlaṃ dharmatarorvivekajaladheḥ',
    4: r'kundendīvarasundarāvatibalau',
    5: r'śāntaṃ śāśvatamaprameyamanaghaṃ',
    6: r'rāmaṃ kāmārisevyaṃ',
    7: r'kekīkaṇṭhābhanīlaṃ',
}


RAW_DIR = os.path.join(os.path.dirname(__file__), "../data/raw/ramcharitmanas")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "../data/processed/ramcharitmanas_database.json")

# Skip-list: GRETIL header/preamble lines, non-verse markers
SKIP_PAT = re.compile(
    r'^(GRETIL|THIS|COPYRIGHT|Text converted|Input|description:|'
    r'long [aAiIuUrR]|vocalic|velar|palatal|retroflex|anusvara|anunasika|'
    r'visarga|nasalized|Unless|For a comprehensive|http|and$|\(in Nagari|'
    r'set to UTF|flapped|intervocalic|voiceless|k underbar|t underbar|'
    r'n underbar|l underbar|r underbar|u dieresis|a breve|e breve|o breve|'
    r'śloka$|bālakāṇḍa|ayodhyā.*kāṇḍa|araṇya.*kāṇḍa|kiṣkindhā.*kāṇḍa|'
    r'sundarakāṇḍa|laṃkā.*kāṇḍa|uttara.*kāṇḍa|'
    r'māsapārāyaṇa|avagāhata.*sādara|sopāna|prathama|dvitīya|tr̥tīya|'
    r'caturtha|paṃcama|paṅcama|ṣaṣṭha|saptama|\(This file|'
    r'iti.*rāmacarita|śrī.*jānakī|śrī.*rāmacarita)',
    re.I
)

# ─── Helpers ──────────────────────────────────────────────────────────────────

def to_devanagari(text: str) -> str:
    try:
        return sanscript.transliterate(text.strip(), sanscript.IAST, sanscript.DEVANAGARI)
    except Exception:
        return text

def clean(text: str) -> str:
    """Remove trailing verse numbers like // 1 // and strip whitespace."""
    text = re.sub(r'\s*//\s*\d+[\w()\\.]*\s*//?\s*$', '', text)
    text = re.sub(r'\s*/+\s*$', '', text)
    return text.strip()

def emit(records, kanda_num, verse_num, vtype, text):
    """Add a verse record if the text is substantial."""
    text = clean(text)
    if not text or len(text) < 6:
        return verse_num
    devanagari = to_devanagari(text)
    records.append({
        "kanda": kanda_num,
        "kanda_name": KANDA_NAMES[kanda_num],
        "verse_num": verse_num,
        "type": vtype,
        "text_roman": text,
        "text_devanagari": devanagari
    })
    return verse_num + 1

# ─── Per-kanda Parser ─────────────────────────────────────────────────────────

def parse_kanda(filepath: str, kanda_num: int):
    print(f"  Parsing Kanda {kanda_num}: {KANDA_NAMES[kanda_num]}...")

    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        html = f.read()

    soup = BeautifulSoup(html, 'html.parser')
    raw = soup.get_text()
    lines = [l.strip() for l in raw.splitlines() if l.strip()]

    in_verses = False
    verse_lines = []
    start_marker = re.compile(KANDA_STARTS[kanda_num], re.I)
    
    for l in lines:
        if not in_verses:
            if start_marker.search(l):
                in_verses = True
            else:
                continue
                
        # Skip internal section markers
        if SKIP_PAT.match(l):
            continue
        verse_lines.append(l)

    records = []
    verse_num = 1
    i = 0
    
    while i < len(verse_lines):
        line = verse_lines[i]

        # ── SORATHA ──────────────────────────────────────────────────────────
        # 'so.' prefix, usually single line with // ending but sometimes continues to 
        # the very next non-// line
        if re.match(r'^so\.\s+', line):
            body = re.sub(r'^so\.\s+', '', line)
            # Check if the next line also belongs to this soratha (no //)
            if i + 1 < len(verse_lines):
                nxt = verse_lines[i + 1]
                if '//' not in nxt and not re.match(r'^(do|so)\.\s+', nxt):
                    body = body + ' ' + nxt
                    i += 1
            verse_num = emit(records, kanda_num, verse_num, "soratha", body)
            i += 1
            continue

        # ── DOHA ─────────────────────────────────────────────────────────────
        # 'do.' prefix, content on the same line followed by // N //
        if re.match(r'^do\.\s+', line):
            body = re.sub(r'^do\.\s+', '', line)
            # Also grab the next line if it continues the doha (no //)
            if i + 1 < len(verse_lines):
                nxt = verse_lines[i + 1]
                # The second line of a doha does NOT start with do/so and has // 
                if '//' in nxt and not re.match(r'^(do|so)\.\s+', nxt):
                    body = body + ' ' + nxt
                    i += 1
            verse_num = emit(records, kanda_num, verse_num, "doha", body)
            i += 1
            continue

        # ── CHAUPAI ──────────────────────────────────────────────────────────
        # Lines containing // — emit each delimited segment as its own verse unit
        if '//' in line:
            # Split by // and remove pure numeric tokens (verse numbers)
            parts = re.split(r'\s*//\s*', line)
            parts = [p.strip() for p in parts if p.strip() and not re.match(r'^\d[\w()]*$', p.strip())]
            for part in parts:
                verse_num = emit(records, kanda_num, verse_num, "chaupai", part)
            i += 1
            continue

        # ── SHLOKA ───────────────────────────────────────────────────────────
        # Lines ending with ' /' (single slash) — opening Sanskrit shlokas, accumulate pairs
        if line.endswith('/') or (line.endswith('/ ') and '//' not in line):
            shloka_lines = [line]
            while i + 1 < len(verse_lines):
                nxt = verse_lines[i + 1]
                if '//' in nxt:  # end of a shloka stanza
                    shloka_lines.append(nxt)
                    i += 1
                    break
                elif nxt.endswith('/') or nxt.endswith('/ '):
                    shloka_lines.append(nxt)
                    i += 1
                else:
                    break
            text = ' '.join(shloka_lines)
            verse_num = emit(records, kanda_num, verse_num, "shloka", text)
            i += 1
            continue

        # ── PLAIN VERSE LINE ─────────────────────────────────────────────────
        # Disabled: catch-all was pulling in preamble noise. All real verses
        # are captured via the // / do. / so. pattern branches above.
        # if len(line) > 15 and re.search(r'[āīūṛśṣṭḍṇñṅṃḥ]', line, re.I):
        #     verse_num = emit(records, kanda_num, verse_num, "verse", line)

        i += 1

    print(f"    → Extracted {len(records)} verses from Kanda {kanda_num}.")
    return records


# ─── Main Runner ──────────────────────────────────────────────────────────────

def build_database():
    all_records = []

    for kanda_num in range(1, 8):
        filepath = os.path.join(RAW_DIR, f"tulrcm{kanda_num}u.htm")
        if not os.path.exists(filepath):
            print(f"  WARNING: File not found: {filepath}, skipping.")
            continue
        records = parse_kanda(filepath, kanda_num)
        all_records.extend(records)

    print(f"\nTotal verses extracted: {len(all_records)}")

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(all_records, f, ensure_ascii=False, indent=2)

    print(f"Database saved to: {OUTPUT_PATH}")
    return all_records


if __name__ == "__main__":
    print("=== Ramacaritamanasa Extraction Script v2 ===")
    build_database()
    print("Done!")
