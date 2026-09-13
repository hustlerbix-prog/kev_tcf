#!/usr/bin/env python3
"""Sanity checks on 011_eo_seed_72_archetypes.sql — robust version."""
import re
p = "/Users/kevche_mini/TFC App/supabase/migrations/011_eo_seed_72_archetypes.sql"
txt = open(p, encoding="utf-8").read()

# Extract INSERT ... ; blocks (everything ending with updated_at = NOW(); )
pattern = re.compile(r"INSERT INTO eo_archetypes.*?updated_at = NOW\(\);", re.S)
blocks = pattern.findall(txt)
print(f"1) INSERT blocks total = {len(blocks)}  (attendu 72)")

id_re = re.compile(r"\$bc\$(T[123]-[A-Z]{2,4}-\d{2})\$bc\$")
# Consigne, question_ouverture, puis duration_sec, prep_sec, set
# Pattern: le tuple VALUES contient ..., $bc$...$bc$, $bc$...$bc$, duration, prep, set
# On cherche 3 entiers consécutifs [1,3] ordre puis duration puis prep pas d'entiers puis set
# Plus simple: le 2ème, 3ème, 4ème entiers après VALUES ( dans VALUES(...)
set_re = re.compile(
    r"VALUES\s*\(\s*\$bc\$[^$]+\$bc\$\s*,"   # id
    r"\s*([123])\s*,"                            # task (1..3)
    r"\s*(\d+)\s*,"                              # ordre (1..N)
    r"\s*\$bc\$[^$]+\$bc\$\s*,"                  # catégorie
    r"\s*\$bc\$.*?\$bc\$\s*,"                    # consigne
    r"\s*\$bc\$.*?\$bc\$\s*,"                    # question
    r"\s*(\d+)\s*,"                              # duration
    r"\s*(\d+)\s*,"                              # prep
    r"\s*\$bc\$(quick|full)\$bc\$\s*,",
    re.S
)

counts = {"T1":{"q":0,"f":0,"t":0},"T2":{"q":0,"f":0,"t":0},"T3":{"q":0,"f":0,"t":0}}
rows = []
for blk in blocks:
    mid = id_re.search(blk).group(1)
    task_n, ordre, duration, prep, set_ = set_re.search(blk).groups()
    task = "T" + task_n
    c = counts[task]
    c["t"] += 1
    if set_ == "quick": c["q"] += 1
    else: c["f"] += 1
    rows.append((mid, task, int(ordre), set_, blk))

print("\n2) RÈGLE AC R1 [[1,20,8],[2,24,7],[3,28,9]] :")
for t,d in [("T1",(1,20,8)),("T2",(2,24,7)),("T3",(3,28,9))]:
    got = counts[t]
    ok = (got["t"]==d[1] and got["q"]==d[2])
    print(f"   [{'OK' if ok else 'KO'}] {t} attendu task={d[0]} total={d[1]} quick={d[2]} / obtenu total={got['t']} quick={got['q']} full={got['f']}")

# ordre contigu 1..N par tâche
print("\n3) Ordres contigus par tâche :")
for t in ("T1","T2","T3"):
    ords = sorted(r[2] for r in rows if r[1]==t)
    lo, hi = min(ords), max(ords)
    expected = list(range(lo, hi+1))
    ok = ords == expected and len(ords) == counts[t]["t"]
    print(f"   [{'OK' if ok else 'KO'}] {t} ordres {lo}..{hi} — {len(ords)} valeurs, attendu {counts[t]['t']}")

# Required moves T1
print("\n4) T1 required_moves (4 items, identiques pour tous les 20) :")
req_exp = {"Se présenter soi-même", "Décrire une situation personnelle", "Raconter un événement passé", "Évoquer un projet ou une hypothèse future"}
arr_re = re.compile(r"ARRAY\[(.*?)\]")
bad = []
for mid, task, o, s, blk in rows:
    if task != "T1": continue
    vals = blk.split("VALUES (",1)[1].split("NOW()")[0]
    arrays = [m.group(1) for m in arr_re.finditer(vals)]
    # 1er array = required_moves
    its = re.findall(r"\$bc\$(.*?)\$bc\$", arrays[0])
    if set(its) != req_exp: bad.append(mid)
print(f"   [{'KO' if bad else 'OK'}] {len(bad)} cas problématiques : {bad}")

# Lexical field T2 & T3 >= 10
print("\n5) lexical_field : T2 & T3 >= 10 items :")
bad_lf = []
for mid, task, o, s, blk in rows:
    if task == "T1": continue
    vals = blk.split("VALUES (",1)[1].split("NOW()")[0]
    arrays = [m.group(1) for m in arr_re.finditer(vals)]
    # Positions dans VALUES (0-based column list):
    # id, task, ordre, cat, cons, qopen, dur, prep, set, reqM(9,array), rel(10,array), exam(11), cand(12), scene(13,array/NULL), compl(14), LF(15,array), AP(16,array/NULL), AC(17,array/NULL), EC(18,array/NULL), conn(19,array/NULL), p4t(20,array/NULL), cre, upd
    # => array positions parmi columns: 9,10,13,15,16,17,18,19,20
    # Count commas in vals up to start of each array
    info = []
    for m in arr_re.finditer(vals):
        start = m.start()
        commas = vals[:start].count(",")
        items = re.findall(r"\$bc\$(.*?)\$bc\$", m.group(1))
        info.append((commas, len(items)))
    lf_items = None
    for commas, n in info:
        if 20 <= commas <= 30:
            # 15e colonne = commas ~ 15 (cols avant: 0..14 → 15 virgules si LF est 15e et juste après un string ou NULL)
            if lf_items is None and n >= 5:
                lf_items = n
    # Fallback: plus grand array (lexical field a 10-15 items)
    if lf_items is None:
        lens = [n for _,n in info]
        if lens: lf_items = sorted(lens)[-2] if len(lens)>=2 else lens[0]
    if lf_items is None or lf_items < 10:
        bad_lf.append((mid, lf_items, info))
print(f"   [{'KO' if bad_lf else 'OK'}] {len(bad_lf)} problématiques : "
      f"{[(a,b) for a,b,_ in bad_lf[:10]]}")

# T2 scene_facts : 6-8
print("\n6) T2 scene_facts : 6..8 facts :")
bad_sf = []
for mid, task, o, s, blk in rows:
    if task != "T2": continue
    vals = blk.split("VALUES (",1)[1].split("NOW()")[0]
    info = []
    for m in arr_re.finditer(vals):
        start = m.start()
        commas = vals[:start].count(",")
        items = re.findall(r"\$bc\$(.*?)\$bc\$", m.group(1))
        info.append((commas, len(items)))
    n_sf = None
    for commas, n in info:
        if 13 <= commas <= 20 and 6 <= n <= 8:
            n_sf = n
    if n_sf is None:
        # 2ème array parmi (reqM, rel, scene, lf, ...)
        lens = sorted([n for _,n in info], reverse=True)
        # scene: 6..8 items → souvent 2ème par taille
        for n in lens:
            if 6 <= n <= 8:
                n_sf = n; break
    if n_sf is None or not (6 <= n_sf <= 8):
        bad_sf.append((mid, n_sf, info))
print(f"   [{'KO' if bad_sf else 'OK'}] {len(bad_sf)} problématiques : {[(a,b) for a,b,_ in bad_sf]}")

# T2 complication : > 100 chars
print("\n7) T2 complication : >= 100 chars chacun :")
bad_comp = []
for mid, task, o, s, blk in rows:
    if task != "T2": continue
    vals = blk.split("VALUES (",1)[1].split("NOW()")[0]
    strings = re.findall(r"\$bc\$(.*?)\$bc\$", vals, re.S)
    longs = [x for x in strings if len(x) >= 100]
    if len(longs) < 2:
        bad_comp.append((mid, [len(x) for x in strings if len(x)>=80]))
    else:
        compl = [x for x in longs if not x.startswith("Le candidat") and not x.startswith("Bonjour") and not x.startswith("L'invité")]
        if not compl:
            bad_comp.append((mid, "pas trouvée"))
print(f"   [{'KO' if bad_comp else 'OK'}] {len(bad_comp)} problématiques : {bad_comp[:6]}")

# T3 QS : AP=3, AC=3, EC=2, CONN=6, P4T=4
print("\n8) T3 quick-set AP=3 AC=3 EC=2 CONN=6 P4T=4 :")
qs_ids = []
qs_issues = []
for mid, task, o, s, blk in rows:
    if task != "T3" or s != "quick": continue
    qs_ids.append(mid)
    vals = blk.split("VALUES (",1)[1].split("NOW()")[0]
    info = []
    for m in arr_re.finditer(vals):
        items = re.findall(r"\$bc\$(.*?)\$bc\$", m.group(1))
        info.append(len(items))
    wanted = {3: ("AP/AC", 2), 2: ("EC",1), 6: ("CONN",1), 4: ("P4T",1)}
    have = {n: info.count(n) for n in wanted}
    ok = True
    for n, (label, cnt) in wanted.items():
        if have.get(n,0) < cnt: ok = False
    if not ok: qs_issues.append((mid, info))
print(f"   T3 quick count = {len(qs_ids)} (attendu 9) : {qs_ids}")
print(f"   [{'KO' if qs_issues else 'OK'}] champs longueurs: {qs_issues}")

# idempotency
print("\n9) Idempotency — ON CONFLICT DO UPDATE par INSERT :")
n = txt.count("ON CONFLICT (id) DO UPDATE SET")
print(f"   {n} occurrences — attendu 72 : {'OK' if n==72 else 'KO'}")

# apostrophe échappée \'
print("\n10) Aucune apostrophe échappée \\' :")
n = txt.count("\\'")
print(f"   {n} — attendu 0 : {'OK' if n==0 else 'KO'}")

# DELETE condition
print("\n11) DELETE idempotent regex ^T[123]- :")
ok_del = "DELETE FROM eo_archetypes WHERE id ~ '^T[123]-'" in txt
print(f"   [{'OK' if ok_del else 'KO'}] DELETE présent")
