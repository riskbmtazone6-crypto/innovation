import re
import json

with open("scripts/parse_employees.py") as f:
    code = f.read()

# Grab raw_text up to the closing quote before def decode_val
m = re.search(r'raw_text = """(.*?)"""', code, re.DOTALL)
if not m:
    print("Failed to find raw_text")
    exit(1)

raw_data = m.group(1)

# Find all records: each starts with an ID (5 to 8 digits) followed by \t
pattern = re.compile(r'(?:^|\n)(\d{5,8})\t(.*?)(?=(?:\n\d{5,8}\t)|\Z)', re.DOTALL)
matches = pattern.findall(raw_data)
print(f"Total employee records matched: {len(matches)}")

def decode_employee_name(raw_name_chunk):
    # Convert characters:
    # ASCII < 128:
    # If char is 10 (newline) -> originally CP874 byte 170 = 'ช'
    # If char is 9 (tab) -> originally CP874 byte 169 = 'ฉ'
    # If char is 13 (carriage return) -> originally CP874 byte 173 = 'ญ'
    # If char is between 1 and 91 (except 32):
    #   val + 160 -> decoded with CP874
    # What about char 32 (space)?
    # 32 can be:
    #   - Letter 'ภ' (192 - 160 = 32)
    #   - OR space separating first name and last name
    
    # First, let's map everything except 32
    tokens = []
    for c in raw_name_chunk:
        code = ord(c)
        if code == 10:
            tokens.append(bytes([170]).decode('cp874')) # ช
        elif code == 9:
            tokens.append(bytes([169]).decode('cp874')) # ฉ
        elif code == 13:
            tokens.append(bytes([173]).decode('cp874')) # ญ
        elif code == 32:
            tokens.append(32) # marker for 32
        elif 0 < code < 128:
            try:
                tokens.append(bytes([code + 160]).decode('cp874'))
            except Exception:
                tokens.append(c)
        else:
            tokens.append(c)
    
    # Now resolve 32s in tokens:
    # In Thai names:
    # - Prefix: นาย / นางสาว / นาง (often at beginning)
    # - If a 32 is followed by vowel/tone mark (ะ ั า ำ ิ ี ึ ื ุ ู ฺ ็ ่ ้ ๊ ๋ ์ ์), it is ALWAYS 'ภ'!
    # - If a 32 is preceded by leading vowels (เ แ โ ใ ไ), it is ALWAYS 'ภ'! (e.g. โภคา, โสภณ)
    # - If 32 is at the very beginning of text or right after prefix (e.g. นาย ภ...), it is 'ภ' (e.g. ภัทร, ภาค, ภานุ)
    # - If 32 is preceded by a consonant and followed by vowel/mark, it is 'ภ'
    # - There is usually EXACTLY ONE true space in a person's name: between Firstname and Lastname!
    
    vowels_after = set(['ะ', 'ั', 'า', 'ำ', 'ิ', 'ี', 'ึ', 'ื', 'ุ', 'ู', 'ฺ', '็', '่', '้', '๊', '๋', '์'])
    vowels_before = set(['เ', 'แ', 'โ', 'ใ', 'ไ'])
    
    resolved = []
    n = len(tokens)
    for i, tok in enumerate(tokens):
        if tok != 32:
            resolved.append(tok)
            continue
        
        # tok is 32. Is it 'ภ' or space?
        prev_tok = tokens[i-1] if i > 0 else None
        next_tok = tokens[i+1] if i + 1 < n else None
        
        is_pho = False
        
        # Check next token
        if next_tok and isinstance(next_tok, str) and next_tok in vowels_after:
            is_pho = True
        # Check prev token
        elif prev_tok and isinstance(prev_tok, str) and prev_tok in vowels_before:
            is_pho = True
        # Common Thai roots with ภ:
        # e.g., ภัทร, ภัค, ภาค, ภัส, ภูมิ, ภู่, ภักดี, ภาพ, ภา, โภค, ลาภ, กอบลาภ, ศุภ, นิภา, วราภรณ์, อภิ
        elif next_tok and isinstance(next_tok, str) and next_tok in ['ั', 'ั', 'ั', 'า', 'ู', 'ิ', 'ุ']:
            is_pho = True
        
        if is_pho:
            resolved.append('ภ')
        else:
            resolved.append(32) # still candidate space or ภ
    
    # Check remaining 32s
    space_indices = [idx for idx, t in enumerate(resolved) if t == 32]
    if len(space_indices) == 1:
        # Exactly one candidate left -> it MUST be the space!
        resolved[space_indices[0]] = ' '
    elif len(space_indices) > 1:
        # Multiple candidates left!
        # Let's inspect where prefix is:
        # e.g. "นายภัทรพร กรณพงศ์" -> if 32 is right after "นาย", next is ภัทร -> ภ!
        for s_idx in space_indices:
            # Check what's around s_idx
            prefix_chunk = "".join([str(x) for x in resolved[:s_idx]])
            suffix_chunk = "".join([str(x) for x in resolved[s_idx+1:]])
            
            # If s_idx is right after "นาย" or "นาง" or "นางสาว" without space:
            if prefix_chunk in ['นาย', 'นาง', 'นางสาว']:
                # The name starts with ภ! e.g. นายภัทร, นายภาคภูมิ
                resolved[s_idx] = 'ภ'
            elif suffix_chunk.startswith('ู') or suffix_chunk.startswith('ู่') or suffix_chunk.startswith('ักดี') or suffix_chunk.startswith('ัสสร') or suffix_chunk.startswith('ัทร') or suffix_chunk.startswith('ัค') or suffix_chunk.startswith('าษี') or suffix_chunk.startswith('าพ') or suffix_chunk.startswith('ารณ์') or suffix_chunk.startswith('รณ์') or suffix_chunk.startswith('ริทัย'):
                resolved[s_idx] = 'ภ'
            elif prefix_chunk.endswith('ลา') or prefix_chunk.endswith('กอบลา') or prefix_chunk.endswith('ศุ') or prefix_chunk.endswith('อ') or prefix_chunk.endswith('สุ') or prefix_chunk.endswith('สม') or prefix_chunk.endswith('ไชย') or prefix_chunk.endswith('สิร'):
                resolved[s_idx] = 'ภ'
        
        # Now see if remaining 32s can be resolved
        remaining_spaces = [idx for idx, t in enumerate(resolved) if t == 32]
        if len(remaining_spaces) == 1:
            resolved[remaining_spaces[0]] = ' '
        elif len(remaining_spaces) > 1:
            # Pick the middle one or the one closest to middle as the space, others as ภ
            # Usually first name is ~5-15 chars, last name is ~5-15 chars
            mid = len(resolved) // 2
            best_space = min(remaining_spaces, key=lambda idx: abs(idx - mid))
            for idx in remaining_spaces:
                if idx == best_space:
                    resolved[idx] = ' '
                else:
                    resolved[idx] = 'ภ'
    
    result = "".join([str(x) if x != 32 else ' ' for x in resolved])
    # Normalize multiple spaces
    result = " ".join(result.split())
    return result

cleaned_employees = []
for emp_id, raw_chunk in matches:
    name = decode_employee_name(raw_chunk)
    cleaned_employees.append({"id": emp_id, "name": name})

print(f"Processed {len(cleaned_employees)} employees.")
for e in cleaned_employees[:30]:
    print(f"{e['id']}: {e['name']}")

with open("scripts/decoded_employees.json", "w", encoding="utf-8") as f:
    json.dump(cleaned_employees, f, ensure_ascii=False, indent=2)
