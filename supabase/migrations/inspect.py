#!/usr/bin/env python3
import re
p = "/Users/kevche_mini/TFC App/supabase/migrations/011_eo_seed_72_archetypes.sql"
txt = open(p, encoding="utf-8").read()

def find_block(target_id):
    # Match l'INSERT où le PREMIER $bc$...$bc$ est exactement target_id
    pat = re.compile(
        r"INSERT INTO eo_archetypes[\s\S]*?VALUES\s*\(\s*\$bc\$" + re.escape(target_id) + r"\$bc\$[\s\S]*?updated_at = NOW\(\);",
        re.S
    )
    m = pat.search(txt)
    return m.group(0) if m else None

def arrays_for(row_id):
    blk = find_block(row_id)
    assert blk, f"Block {row_id} introuvable"
    vals = blk.split("VALUES (",1)[1].split("NOW()")[0]
    arr_re = re.compile(r"ARRAY\[(.*?)\]", re.S)
    out = []
    for m in arr_re.finditer(vals):
        start = m.start()
        commas = vals[:start].count(",")
        items = re.findall(r"\$bc\$(.*?)\$bc\$", m.group(1))
        out.append((commas, len(items), items[:2]))
    return out

print("=== T1-IDE-01 ===")
for c,n,s in arrays_for("T1-IDE-01"):
    print(f"  commas={c:2d}, n={n:2d}, sample={s}")
print()
print("=== T2-BEN-01 ===")
for c,n,s in arrays_for("T2-BEN-01"):
    print(f"  commas={c:2d}, n={n:2d}, sample={s}")
print()
print("=== T2-LOG-03 ===")
for c,n,s in arrays_for("T2-LOG-03"):
    print(f"  commas={c:2d}, n={n:2d}, sample={s}")
print()
print("=== T3-TEC-01 (qs) ===")
for c,n,s in arrays_for("T3-TEC-01"):
    print(f"  commas={c:2d}, n={n:2d}, sample={s}")
print()
print("=== T3-IDE-02 (full) ===")
for c,n,s in arrays_for("T3-IDE-02"):
    print(f"  commas={c:2d}, n={n:2d}, sample={s}")
