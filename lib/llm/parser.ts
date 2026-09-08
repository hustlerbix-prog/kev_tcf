export function profondeurs(s: string): string[] {
  let inS = false;
  let ech = false;
  const pile: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (ech) {
      ech = false;
      continue;
    }
    if (inS) {
      if (c === "\\") ech = true;
      else if (c === '"') inS = false;
      continue;
    }
    if (c === '"') {
      inS = true;
      continue;
    }
    if (c === "{") pile.push("}");
    else if (c === "[") pile.push("]");
    else if (c === "}" || c === "]") pile.pop();
  }
  return pile;
}

export function lireJSON<T = unknown>(t: string): T | null {
  let s = String(t).replace(/^```(?:json)?/i, "").replace(/```\s*$/, "").trim();
  const i = s.indexOf("{");
  if (i < 0) return null;
  s = s.slice(i);
  try {
    return JSON.parse(s) as T;
  } catch {
    /* fallthrough */
  }
  const j = s.lastIndexOf("}");
  if (j > 0) {
    try {
      return JSON.parse(s.slice(0, j + 1)) as T;
    } catch {
      /* fallthrough */
    }
  }
  let inS = false;
  let ech = false;
  const pile: string[] = [];
  let coupe = -1;
  for (let k = 0; k < s.length; k++) {
    const c = s[k];
    if (ech) {
      ech = false;
      continue;
    }
    if (inS) {
      if (c === "\\") ech = true;
      else if (c === '"') inS = false;
      continue;
    }
    if (c === '"') {
      inS = true;
      continue;
    }
    if (c === "{") pile.push("}");
    else if (c === "[") pile.push("]");
    else if (c === "}" || c === "]") {
      pile.pop();
      if (pile.length <= 2) coupe = k;
    }
  }
  if (coupe < 0) return null;
  let bout = s.slice(0, coupe + 1);
  const reste = profondeurs(bout);
  while (reste.length) bout += reste.pop()!;
  try {
    return JSON.parse(bout) as T;
  } catch {
    return null;
  }
}
