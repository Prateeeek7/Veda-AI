import json
import re
import os

def parse_mahabharata(html_file, output_json):
    print(f"Parsing {html_file}...")
    
    pattern = re.compile(r'^(\d{2}),(\d{3})\.(\d{3})([a-zA-Z\*\d_@]*(?:=\d*)?)\s+(.*?)<BR>', re.IGNORECASE)
    
    database = []
    
    current_parva = None
    current_chapter = None
    current_verse = None
    current_text = []
    
    with open(html_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            
            match = pattern.match(line)
            if match:
                parva, chapter, verse, suffix, text = match.groups()
                
                # Check if we moved to a new verse
                if parva != current_parva or chapter != current_chapter or verse != current_verse:
                    if current_parva is not None:
                        database.append({
                            "parva": int(current_parva),
                            "chapter": int(current_chapter),
                            "verse": int(current_verse),
                            "text": " | ".join(current_text)
                        })
                    current_parva = parva
                    current_chapter = chapter
                    current_verse = verse
                    current_text = []
                
                current_text.append(text.strip())
                
    # save last
    if current_parva is not None:
        database.append({
            "parva": int(current_parva),
            "chapter": int(current_chapter),
            "verse": int(current_verse),
            "text": " | ".join(current_text)
        })
    
    print(f"Extracted {len(database)} distinct verses from raw parsed lines.")
    
    # Group by Parva -> Chapter -> Verses
    structured_db = {}
    for entry in database:
        p = entry["parva"]
        c = entry["chapter"]
        v = entry["verse"]
        t = entry["text"]
        
        if p not in structured_db:
            structured_db[p] = {}
        if c not in structured_db[p]:
            structured_db[p][c] = []
            
        structured_db[p][c].append({
            "verse": v,
            "text": t
        })
        
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(structured_db, f, ensure_ascii=False, indent=2)
        
    print(f"Saved to {output_json} (Size: {os.path.getsize(output_json) / (1024*1024):.2f} MB)")

if __name__ == "__main__":
    parse_mahabharata("MBH1-18U.HTM", "mahabharata_database.json")
