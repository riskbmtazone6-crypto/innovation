import re

# Read the raw text from parse_employees.py
with open("scripts/parse_employees.py") as f:
    code = f.read()

# Extract raw_text
match = re.search(r'raw_text = """(.*?)"""', code, re.DOTALL)
if not match:
    print("Could not find raw_text")
    exit(1)

content = match.group(1)

# In the text, each record starts with a digit ID at the start of a line or after newline followed by \t
# Pattern: (\d{5,8})\t
# Everything between (\d{5,8})\t and the next (\d{5,8})\t (or EOF) belongs to that employee!

pattern = re.compile(r'(\d{5,8})\t(.*?)(?=(?:\n\d{5,8}\t)|\Z)', re.DOTALL)
records = pattern.findall(content)
print(f"Found {len(records)} employee records with regex")

def decode_name(raw_bytes_str):
    chars = []
    for c in raw_bytes_str:
        val = ord(c)
        if val == 32: # space
            chars.append(" ")
        elif val == 10: # newline -> was char 10 + 160 = 170 ('ช')
            # Wait, could val 10 in the middle of text be 'ช'?
            chars.append(bytes([10 + 160]).decode('cp874'))
        elif val == 9: # tab inside name? was char 9 + 160 = 169 ('ฉ')
            chars.append(bytes([9 + 160]).decode('cp874'))
        elif 0 < val < 128:
            try:
                chars.append(bytes([val + 160]).decode('cp874'))
            except Exception:
                chars.append(c)
        else:
            chars.append(c)
    
    decoded = "".join(chars)
    # clean up multiple spaces
    decoded = " ".join(decoded.split())
    return decoded

for emp_id, raw_name in records[:25]:
    name = decode_name(raw_name)
    print(f"{emp_id}: {name}")
