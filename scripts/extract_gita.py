"""
Bhagavad Gita Database Extractor — Enriched Edition
=====================================================
Designed for NLM/LLM training data with deep, multi-source `meaning` field.

Output: geeta_database.json
Schema per verse:
{
  "chapter": int,
  "verse": int,
  "chapter_name": str,
  "sanskrit": str,          # Devanagari
  "transliteration": str,   # IAST roman
  "translation": str,       # Primary English translation (best available)
  "meaning": str,           # Rich composite: all English commentaries merged
  "commentaries": {         # All per-commentator data for fine-grained training
      "<key>": {
          "author": str,
          "text": str
      }, ...
  }
}
"""

import json
import time
import urllib.request
import urllib.error

CHAPTER_VERSE_COUNTS = {
    1: 47, 2: 72, 3: 43, 4: 42, 5: 29,
    6: 47, 7: 30, 8: 28, 9: 34, 10: 42,
    11: 55, 12: 20, 13: 34, 14: 27, 15: 20,
    16: 24, 17: 28, 18: 78,
}

CHAPTER_NAMES = {
    1: "Arjuna Visada Yoga — Arjuna's Dilemma",
    2: "Sankhya Yoga — Transcendental Knowledge",
    3: "Karma Yoga — Path of Action",
    4: "Jnana Karma Sanyasa Yoga — Knowledge & Action",
    5: "Karma Sanyasa Yoga — Path of Renunciation",
    6: "Dhyana Yoga — Path of Meditation",
    7: "Jnana Vijnana Yoga — Knowledge of the Absolute",
    8: "Aksara Brahma Yoga — The Imperishable Brahman",
    9: "Raja Vidya Raja Guhya Yoga — Royal Knowledge",
    10: "Vibhuti Yoga — Divine Glories",
    11: "Visvarupa Darsana Yoga — Universal Form",
    12: "Bhakti Yoga — Path of Devotion",
    13: "Ksetra Ksetrajna Vibhaga Yoga — Field & Knower",
    14: "Gunatraya Vibhaga Yoga — Three Modes of Nature",
    15: "Purusottama Yoga — The Supreme Person",
    16: "Daivasura Sampad Vibhaga Yoga — Divine & Demoniac",
    17: "Sraddhatraya Vibhaga Yoga — Three Types of Faith",
    18: "Moksha Sanyasa Yoga — Liberation through Renunciation",
}

BASE_URL  = "https://vedicscriptures.github.io/slok/{chapter}/{verse}/"

# All commentators with preferred field order per author
# Format: (api_key, author_label, field_priority)
COMMENTATORS = [
    # English commentaries (primary for meaning)
    ("siva",    "Swami Sivananda",                  ["ec", "et"]),
    ("prabhu",  "A.C. Bhaktivedanta Swami Prabhupada", ["ec", "et"]),
    ("sankar",  "Sri Shankaracharya",               ["et", "sc", "ht"]),
    ("raman",   "Sri Ramanuja",                     ["et", "sc"]),
    ("abhinav", "Sri Abhinavagupta",                ["et", "sc"]),
    ("gambir",  "Swami Gambirananda",               ["et"]),
    ("adi",     "Swami Adidevananda",               ["et"]),
    ("purohit", "Shri Purohit Swami",               ["et"]),
    ("san",     "Dr. S. Sankaranarayan",            ["et"]),
    # Sanskrit/Hindi commentaries (secondary — stored but not merged into main meaning)
    ("tej",     "Swami Tejomayananda",              ["ht"]),
    ("chinmay", "Swami Chinmayananda",              ["hc"]),
    ("rams",    "Swami Ramsukhdas",                 ["hc", "ht"]),
    ("madhav",  "Sri Madhavacharya",                ["sc"]),
    ("anand",   "Sri Anandgiri",                    ["sc"]),
    ("ms",      "Sri Madhusudan Saraswati",         ["sc"]),
    ("srid",    "Sri Sridhara Swami",               ["sc"]),
    ("neel",    "Sri Neelkanth",                    ["sc"]),
    ("vallabh", "Sri Vallabhacharya",               ["sc"]),
    ("jaya",    "Sri Jayatritha",                   ["sc"]),
    ("dhan",    "Sri Dhanpati",                     ["sc"]),
    ("puru",    "Sri Purushottamji",                ["sc"]),
]

# Only these commentators contribute to the primary English `meaning` field
ENGLISH_MEANING_KEYS = {"siva", "prabhu", "sankar", "raman", "abhinav",
                        "gambir", "adi", "purohit", "san"}


def fetch_verse(chapter: int, verse: int, retries: int = 4) -> dict | None:
    url = BASE_URL.format(chapter=chapter, verse=verse)
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "GeetaAI-Enriched/2.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (urllib.error.URLError, json.JSONDecodeError) as e:
            print(f"  ⚠ Attempt {attempt+1} failed for {chapter}.{verse}: {e}")
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
    return None


def get_commentary_text(block: dict, fields: list[str]) -> str:
    """Pick the first non-empty field from the block."""
    for f in fields:
        val = block.get(f, "").strip()
        if val and val.lower() not in ("", "none"):
            return val
    return ""


def build_commentaries(raw: dict) -> dict:
    """Build a structured dict of all available commentaries."""
    result = {}
    for api_key, author_label, fields in COMMENTATORS:
        block = raw.get(api_key, {})
        if not block:
            continue
        text = get_commentary_text(block, fields)
        if text:
            result[api_key] = {"author": author_label, "text": text}
    return result


def build_rich_meaning(commentaries: dict) -> str:
    """
    Composite meaning field for NLM training:
    Merges all English commentaries into a rich multi-perspective paragraph block.
    Each commentator's text is delimited with a clear header so the model can
    learn both individual styles and the aggregate philosophical meaning.
    """
    parts = []
    for api_key in ENGLISH_MEANING_KEYS:
        entry = commentaries.get(api_key)
        if entry:
            parts.append(f"[{entry['author']}]\n{entry['text']}")
    return "\n\n".join(parts)


def extract_fields(raw: dict, chapter: int, verse: int) -> dict:
    sanskrit        = raw.get("slok", "").strip()
    transliteration = raw.get("transliteration", "").strip()

    # Primary English translation (first available, in priority order)
    translation = ""
    for key in ["purohit", "gambir", "adi", "siva", "san"]:
        block = raw.get(key, {})
        t = block.get("et", "").strip() if block else ""
        if t:
            translation = t
            break

    commentaries = build_commentaries(raw)
    meaning      = build_rich_meaning(commentaries)

    return {
        "chapter":        chapter,
        "verse":          verse,
        "chapter_name":   CHAPTER_NAMES.get(chapter, ""),
        "sanskrit":       sanskrit,
        "transliteration": transliteration,
        "translation":    translation,
        "meaning":        meaning,
        "commentaries":   commentaries,
    }


def main():
    database = []
    total_verses = sum(CHAPTER_VERSE_COUNTS.values())
    processed = 0
    failed = []

    print(f"🙏 Bhagavad Gita — Enriched Extraction ({total_verses} verses, 18 chapters)\n")

    for chapter, verse_count in CHAPTER_VERSE_COUNTS.items():
        print(f"📖 Chapter {chapter:2d} — {CHAPTER_NAMES[chapter]} ({verse_count} verses)...")
        for verse in range(1, verse_count + 1):
            raw = fetch_verse(chapter, verse)
            if raw:
                entry = extract_fields(raw, chapter, verse)
                database.append(entry)
                processed += 1
                if verse % 10 == 0 or verse == verse_count:
                    # Count commentaries in last entry
                    nc = len(entry["commentaries"])
                    print(f"   ✓ {processed}/{total_verses} — Ch{chapter}.{verse} ({nc} commentaries)")
            else:
                print(f"   ✗ FAILED: Ch{chapter}.{verse}")
                failed.append({"chapter": chapter, "verse": verse})
            time.sleep(0.3)
        print()

    # Save
    out_path = "geeta_database.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(database, f, ensure_ascii=False, indent=2)

    print(f"✅ Saved {processed} verses → {out_path}")

    if failed:
        fail_path = "geeta_failed_verses.json"
        with open(fail_path, "w") as f:
            json.dump(failed, f, indent=2)
        print(f"⚠ {len(failed)} failures → {fail_path}")

    # Sample print
    if database:
        sample = database[46]  # BG 2.47 — the most famous verse
        print("\n── Sample: BG 2.47 (Karmanyevadhikaraste) ──")
        print(f"Sanskrit:        {sample['sanskrit'][:80]}...")
        print(f"Transliteration: {sample['transliteration'][:80]}...")
        print(f"Translation:     {sample['translation'][:120]}...")
        print(f"Commentaries:    {list(sample['commentaries'].keys())}")
        print(f"\nMeaning preview (first 600 chars):\n{sample['meaning'][:600]}...")


if __name__ == "__main__":
    main()
