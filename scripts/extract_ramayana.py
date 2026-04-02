import json
from bs4 import BeautifulSoup
import re
from indic_transliteration import sanscript

def translate_to_devanagari(iast_text):
    # The GRETIL text is in IAST (International Alphabet of Sanskrit Transliteration)
    # We will convert it to conventional Devanagari
    return sanscript.transliterate(iast_text, sanscript.IAST, sanscript.DEVANAGARI)

def build_ramayana_db():
    print("Loading Ramayana HTML...")
    with open('../data/raw/ramayana.htm', 'r', encoding='utf-8') as f:
        html_content = f.read()

    print("Parsing HTML...")
    soup = BeautifulSoup(html_content, 'html.parser')

    database = []

    # Find all p tags with an id starting with R_
    p_tags = soup.find_all('p', id=re.compile(r'^R_\d+\.\d+\.\d+'))

    print(f"Found {len(p_tags)} verses. Processing...")

    for p in p_tags:
        verse_id = p.get('id')  # e.g. R_1.076.014
        
        # Parse the ID
        parts = verse_id.replace('R_', '').split('.')
        if len(parts) == 3:
            kanda = int(parts[0])
            sarga = int(parts[1])
            shloka = int(parts[2])
            
            # Remove the <span class="ref"> completely
            for span in p.find_all("span", class_="ref"):
                span.decompose()

            # The text lines are separated by <br>. Let's get them cleanly
            text_lines = p.stripped_strings
            iast_lines = []
            for line in text_lines:
                clean_line = line.strip()
                if clean_line:
                    iast_lines.append(clean_line)
                    
            iast_text = " | ".join(iast_lines)
            
            # Convert to Devanagari
            devanagari_text = translate_to_devanagari(iast_text)

            database.append({
                "kanda": kanda,
                "sarga": sarga,
                "shloka": shloka,
                "sanskrit": devanagari_text,
                "transliteration": iast_text
            })

    print(f"Processed {len(database)} verses successfully.")

    # Save to JSON
    output_path = '../data/processed/ramayana_database.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(database, f, ensure_ascii=False, indent=2)

    print(f"Ramayana JSON saved to {output_path}")

if __name__ == "__main__":
    build_ramayana_db()
