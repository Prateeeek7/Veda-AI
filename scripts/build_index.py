"""
build_index.py — One-time setup script
=======================================
Reads geeta_database.json, embeds each verse using sentence-transformers,
then stores the FAISS vector index + metadata for the chatbot to use.

Run once:
    python3 build_index.py
"""

import json
import os
import pickle
import numpy as np

def main():
    print("🙏 GeetaAI — Building Vector Index")
    print("=" * 45)

    # ── 1. Load database ─────────────────────────────────
    db_path = "geeta_database.json"
    if not os.path.exists(db_path):
        print(f"❌ {db_path} not found. Run extract_gita.py first.")
        return

    with open(db_path, "r", encoding="utf-8") as f:
        verses = json.load(f)
    print(f"✓ Loaded {len(verses)} verses")

    # ── 2. Load embedding model ───────────────────────────
    print("⏳ Loading embedding model (all-MiniLM-L6-v2)...")
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("all-MiniLM-L6-v2")
    print("✓ Model loaded")

    # ── 3. Build text corpus for embedding ───────────────
    # We embed the English content — translation + first 800 chars of meaning
    # This gives semantically rich vectors without being too long
    texts = []
    for v in verses:
        meaning_snippet = v.get("meaning", "")[:800]
        text = (
            f"Chapter {v['chapter']}, Verse {v['verse']}. "
            f"{v.get('chapter_name', '')}. "
            f"{v.get('translation', '')} "
            f"{meaning_snippet}"
        )
        texts.append(text)
    print(f"✓ Prepared {len(texts)} text chunks for embedding")

    # ── 4. Generate embeddings ────────────────────────────
    print("⏳ Generating embeddings (this takes ~60 seconds)...")
    import faiss
    embeddings = model.encode(
        texts,
        batch_size=64,
        show_progress_bar=True,
        normalize_embeddings=True,  # cosine similarity via inner product
    )
    embeddings = np.array(embeddings, dtype="float32")
    print(f"✓ Embeddings shape: {embeddings.shape}")

    # ── 5. Build FAISS index ──────────────────────────────
    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)  # Inner Product = cosine on normalized vecs
    index.add(embeddings)
    print(f"✓ FAISS index built — {index.ntotal} vectors, dim={dim}")

    # ── 6. Save index + metadata ──────────────────────────
    faiss.write_index(index, "gita_index.faiss")

    # Save metadata (what we need per result for the UI)
    meta = []
    for v in verses:
        meta.append({
            "chapter":        v["chapter"],
            "verse":          v["verse"],
            "chapter_name":   v.get("chapter_name", ""),
            "sanskrit":       v.get("sanskrit", ""),
            "transliteration":v.get("transliteration", ""),
            "translation":    v.get("translation", ""),
            "meaning":        v.get("meaning", ""),
        })

    with open("gita_meta.pkl", "wb") as f:
        pickle.dump(meta, f)

    print("✓ Saved: gita_index.faiss")
    print("✓ Saved: gita_meta.pkl")
    print()
    print("🎉 Index ready! Run: python3 chatbot.py")


if __name__ == "__main__":
    main()
