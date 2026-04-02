import json
import os
from indic_transliteration import sanscript

def process_mahabharata(input_json, output_json):
    print(f"Loading {input_json}...")
    with open(input_json, 'r', encoding='utf-8') as f:
        db = json.load(f)
    
    total_verses = 0
    # The structure is db[parva][chapter] = [{"verse": V, "text": "..."}]
    
    for parva, chapters in db.items():
        for chapter, verses in chapters.items():
            for v in verses:
                transliterated_text = v["text"]
                # GRETIL IAST mostly maps to ISO or IAST. indic_transliteration handles IAST well.
                try:
                    devanagari_text = sanscript.transliterate(transliterated_text, sanscript.IAST, sanscript.DEVANAGARI)
                except Exception as e:
                    devanagari_text = transliterated_text
                
                # Update the verse to have sanskrit and transliteration
                v["sanskrit"] = devanagari_text
                v["transliteration"] = transliterated_text
                total_verses += 1
                
    print(f"Processed {total_verses} verses. Saving to {output_json}...")
    
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
        
    print("Done! Augmented database saved.")

if __name__ == "__main__":
    db_path = "frontend/src/data/mahabharata_database.json"
    if os.path.exists(db_path):
        process_mahabharata(db_path, db_path)
    else:
        print(f"Could not find {db_path}!")
