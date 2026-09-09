const esc = (t: string) =>
  t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function parseInline(t: string): string {
  let out = esc(t);
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return out;
}

export function markdownLite(src: string): string {
  if (!src) return "";
  const lines = src.split(/\r?\n/);
  const out: string[] = [];
  let inList: "ul" | "ol" | null = null;
  let inBlockquote = false;
  let inTable = false;
  const closeList = () => {
    if (inList) {
      out.push("</" + inList + ">");
      inList = null;
    }
  };
  const closeQuote = () => {
    if (inBlockquote) {
      out.push("</blockquote>");
      inBlockquote = false;
    }
  };
  const closeTable = () => {
    if (inTable) {
      out.push("</tbody></table>");
      inTable = false;
    }
  };
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeList();
      closeQuote();
      closeTable();
      continue;
    }
    const h = /^(#{1,3})\s+(.+)$/.exec(line);
    if (h) {
      closeList(); closeQuote(); closeTable();
      const lvl = h[1].length;
      out.push("<h" + lvl + ">" + parseInline(h[2]) + "</h" + lvl + ">");
      continue;
    }
    const bq = /^>\s?(.+)$/.exec(line);
    if (bq) {
      closeList(); closeTable();
      if (!inBlockquote) { out.push("<blockquote>"); inBlockquote = true; }
      out.push("<p>" + parseInline(bq[1]) + "</p>");
      continue;
    }
    const ul = /^\s*[-*•]\s+(.+)$/.exec(line);
    if (ul) {
      closeQuote(); closeTable();
      if (!inList || inList !== "ul") { closeList(); out.push("<ul>"); inList = "ul"; }
      out.push("<li>" + parseInline(ul[1]) + "</li>");
      continue;
    }
    const ol = /^\s*\d+\.\s+(.+)$/.exec(line);
    if (ol) {
      closeQuote(); closeTable();
      if (!inList || inList !== "ol") { closeList(); out.push("<ol>"); inList = "ol"; }
      out.push("<li>" + parseInline(ol[1]) + "</li>");
      continue;
    }
    if (line.includes("|") && /^\s*\|?[^|]+\|/.test(line)) {
      closeList(); closeQuote();
      const cells = line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(c => c.trim());
      if (!inTable) {
        out.push('<table style="border-collapse:collapse;width:100%;margin:8px 0"><tbody>');
        inTable = true;
      }
      const isSep = cells.every(c => /^:?-{2,}:?$/.test(c));
      if (isSep) continue;
      out.push("<tr>" + cells.map(c => '<td style="border:1px solid rgba(0,0,0,.15);padding:6px 10px;font-size:13px">' + parseInline(c) + "</td>").join("") + "</tr>");
      continue;
    }
    closeList(); closeQuote(); closeTable();
    out.push("<p>" + parseInline(line) + "</p>");
  }
  closeList(); closeQuote(); closeTable();
  return out.join("\n");
}

export default markdownLite;
