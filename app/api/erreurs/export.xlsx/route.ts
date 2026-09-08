import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ErreurSuivi } from "@/lib/types/tcf";
import {
  deflateSync,
  crc32 as _zlibCrc32,
} from "node:zlib";
import { Buffer } from "node:buffer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*   Export XLSX minimal (0 dépendances) conforme OOXML / ECMA-376            */
/*   Compatible Microsoft Excel, Apple Numbers, LibreOffice Calc, Google      */
/*   Sheets.                                                                  */
/* -------------------------------------------------------------------------- */

type CsvRow = (string | number | boolean | null | undefined)[];
const HEADERS = [
  "#",
  "Date",
  "Source",
  "Code",
  "Catégorie",
  "Gravité",
  "Forme fautive (original)",
  "Correction",
  "Contexte / phrase",
  "Explication",
  "Écrit 10× ?",
  "Nb révisions",
  "Dernière révision",
  "Prochaine révision",
  "Notes personnelles",
  "id essai",
  "id erreur",
];

const CATEGORIES: Record<string, string> = {
  CONJ: "Conjugaison / temps verbaux",
  ORT:  "Orthographe / accent / tréma / cédille",
  ACC:  "Accent / diacritique porteur de sens",
  REG:  "Accord / genre / nombre / règle grammaticale",
  GRAM: "Grammaire & syntaxe (phrases, négation, prépositions)",
  GR:   "Grammaire générale / tournures de phrase",
  VOC:  "Vocabulaire / registre / choix de mot",
  LEX:  "Vocabulaire / choix lexical",
  ESP:  "Spécificités de l'écrit (ponctuation, OQLF)",
  COH:  "Cohérence / connecteurs / organisation",
  AUT:  "Autre / à classer",
};
function categorie(code: string | undefined | null): string {
  return CATEGORIES[String(code ?? "").toUpperCase()] ?? "Autre / à classer";
}
function fmtDate(v: unknown): string {
  if (!v) return "";
  try {
    const d = new Date(v as string | number);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toISOString().replace("T", " ").slice(0, 16);
  } catch {
    return String(v);
  }
}
function rowsOf(liste: ErreurSuivi[]): CsvRow[] {
  return liste.map((e, i) => [
    i + 1,
    fmtDate(e.created_at),
    e.manuel ? "Ajout manuel" : e.essai_id ? "Copie corrigée" : "-",
    e.code ?? "AUT",
    categorie(e.code),
    e.gravite === "haute" ? "Haute" : e.gravite === "basse" ? "Basse" : "Moyenne",
    e.original ?? "",
    e.correction ?? "",
    e.contexte ?? "",
    e.explication ?? "",
    e.ecrit_10x_fois ? "Oui" : "Non",
    e.nb_revisions ?? 0,
    fmtDate(e.derniere_revision),
    fmtDate(e.prochaine_revision),
    e.notes ?? "",
    e.essai_id ?? "",
    e.id ?? "",
  ]);
}

/* ========================================================================== */
/*                          GÉNÉRATEUR XLSX MINIMAL                           */
/* ========================================================================== */

/**
 * Échappe une chaîne pour un texte XML feuille Excel.
 */
function xmlEsc(s: string): string {
  if (s === undefined || s === null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u0000-\u0008\u000B\u000C\u000E-\u001F/g, " ");
}

/**
 * Représente une cellule : type "s" string ou type "n" nombre.
 */
type Cell = { t: "s"; v: string } | { t: "n"; v: number } | null;

function toCell(r: CsvRow[number]): Cell {
  if (r === null || r === undefined || r === "") return null;
  if (typeof r === "number" && Number.isFinite(r)) return { t: "n", v: r };
  if (typeof r === "boolean") return { t: "s", v: r ? "Oui" : "Non" };
  return { t: "s", v: String(r) };
}

function crc32(buf: Uint8Array, init = 0): number {
  if (typeof _zlibCrc32 === "function") {
    try {
      // Node ≥ 16 : zlib.crc32(data, initial?) returns number (may be signed if > 2^31-1)
      const n = _zlibCrc32(buf as any, init) as number;
      return (n >>> 0) >>> 0;
    } catch {
      /* fallback */
    }
  }
  // Fallback : CRC-32 ISO 3309 / IEEE
  let c = (init >>> 0) ^ 0xffffffff;
  const table = _crcTable;
  for (let i = 0; i < buf.length; i++) {
    c = (table[(c ^ buf[i]) & 0xff] ^ (c >>> 8)) >>> 0;
  }
  return ((c ^ 0xffffffff) >>> 0) >>> 0;
}

const _crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n >>> 0;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)) >>> 0;
    }
    t[n] = c >>> 0;
  }
  return t;
})();

function dosDateNow(): { date: number; time: number } {
  const d = new Date();
  const date =
    ((d.getFullYear() - 1980) << 9) |
    ((d.getMonth() + 1) << 5) |
    d.getDate();
  const time =
    (d.getHours() << 11) |
    (d.getMinutes() << 5) |
    Math.floor(d.getSeconds() / 2);
  return { date: date & 0xffff, time: time & 0xffff };
}

type ZipFileIn = { name: string; data: Uint8Array; store?: boolean };
type ZipFileOut = ZipFileIn & {
  crc32: number;
  compressed: Uint8Array;
  compressedSize: number;
  uncompressedSize: number;
  localOffset: number;
};

/**
 * Construit un ZIP conforme 32 bits (pas Zip64) avec stockage optionnel.
 * Taille max des données ~ 4 Go ; pour l'export erreurs c'est suffisant.
 */
function buildZip(filesIn: ZipFileIn[]): Uint8Array {
  const { date: dosDate, time: dosTime } = dosDateNow();
  const files: ZipFileOut[] = filesIn.map((f) => {
    const u8 = f.data instanceof Uint8Array ? f.data : new Uint8Array(f.data as any);
    const crc = crc32(u8);
    const uncompressedSize = u8.length;
    let compressed: Uint8Array;
    let method: number;
    let compressedSize: number;
    if (f.store) {
      compressed = u8;
      method = 0;
      compressedSize = uncompressedSize;
    } else {
      const deflated = deflateSync(Buffer.from(u8), { level: 9 });
      compressed = new Uint8Array(deflated.buffer, deflated.byteOffset, deflated.byteLength);
      method = 8;
      compressedSize = compressed.length;
    }
    void method;
    return {
      ...f,
      data: u8,
      crc32: crc >>> 0,
      compressed,
      compressedSize,
      uncompressedSize,
      localOffset: 0,
    };
  });

  const chunks: Uint8Array[] = [];
  let offset = 0;
  function pushChunk(c: Uint8Array) {
    chunks.push(c);
    offset += c.length;
  }

  // Local file headers + compressed data
  for (const f of files) {
    f.localOffset = offset;
    const nameBytes = new TextEncoder().encode(f.name);
    const method16 = f.store ? 0 : 8;
    const lfh = Buffer.alloc(30 + nameBytes.length);
    lfh.writeUInt32LE(0x04034b50, 0);           // signature
    lfh.writeUInt16LE(20, 4);                     // version needed (2.0)
    lfh.writeUInt16LE(0x0800, 6);                 // flags: UTF-8
    lfh.writeUInt16LE(method16, 8);               // compression
    lfh.writeUInt16LE(dosTime, 10);
    lfh.writeUInt16LE(dosDate, 12);
    lfh.writeUInt32LE((f.crc32 >>> 0) >>> 0, 14);
    lfh.writeUInt32LE((f.compressedSize >>> 0) >>> 0, 18);
    lfh.writeUInt32LE((f.uncompressedSize >>> 0) >>> 0, 22);
    lfh.writeUInt16LE(nameBytes.length, 26);
    lfh.writeUInt16LE(0, 28);                     // extra
    lfh.set(nameBytes, 30);
    pushChunk(new Uint8Array(lfh.buffer, lfh.byteOffset, lfh.byteLength));
    pushChunk(f.compressed);
  }

  // Central directory
  const centralStart = offset;
  for (const f of files) {
    const nameBytes = new TextEncoder().encode(f.name);
    const method16 = f.store ? 0 : 8;
    const externalAttrs = 0o100644 << 16;      // attributs UNIX fichier
    const cfh = Buffer.alloc(46 + nameBytes.length);
    cfh.writeUInt32LE(0x02014b50, 0);
    cfh.writeUInt16LE(20, 4);                   // version made by (2.0)
    cfh.writeUInt16LE(20, 6);                   // version needed
    cfh.writeUInt16LE(0x0800, 8);
    cfh.writeUInt16LE(method16, 10);
    cfh.writeUInt16LE(dosTime, 12);
    cfh.writeUInt16LE(dosDate, 14);
    cfh.writeUInt32LE((f.crc32 >>> 0) >>> 0, 16);
    cfh.writeUInt32LE((f.compressedSize >>> 0) >>> 0, 20);
    cfh.writeUInt32LE((f.uncompressedSize >>> 0) >>> 0, 24);
    cfh.writeUInt16LE(nameBytes.length, 28);
    cfh.writeUInt16LE(0, 30);                   // extra
    cfh.writeUInt16LE(0, 32);                   // comment
    cfh.writeUInt16LE(0, 34);                   // disk number start
    cfh.writeUInt16LE(0, 36);                   // internal attrs
    cfh.writeUInt32LE((externalAttrs >>> 0) >>> 0, 38);
    cfh.writeUInt32LE((f.localOffset >>> 0) >>> 0, 42);
    cfh.set(nameBytes, 46);
    pushChunk(new Uint8Array(cfh.buffer, cfh.byteOffset, cfh.byteLength));
  }
  const centralSize = offset - centralStart;

  // End of central directory
  const entries = files.length;
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);                    // disk number
  eocd.writeUInt16LE(0, 6);                    // disk number with central dir
  eocd.writeUInt16LE(entries, 8);              // entries this disk
  eocd.writeUInt16LE(entries, 10);             // total entries
  eocd.writeUInt32LE((centralSize >>> 0) >>> 0, 12);
  eocd.writeUInt32LE((centralStart >>> 0) >>> 0, 16);
  eocd.writeUInt16LE(0, 20);
  pushChunk(new Uint8Array(eocd.buffer, eocd.byteOffset, eocd.byteLength));

  // Concat
  const totalLen = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(totalLen);
  let p = 0;
  for (const c of chunks) { out.set(c, p); p += c.length; }
  return out;
}

function columnLetter(i0: number): string {
  let s = "";
  let n = i0;
  while (true) {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
    if (n < 0) break;
  }
  return s;
}

/**
 * Génère le ZIP XLSX binaire à partir des lignes (avec HEADERS en ligne 1).
 */
function xlsxBinary(header: string[], rows: CsvRow[]): Uint8Array {
  // Dictionnaire partagé (sharedStrings) + indices
  const sstMap = new Map<string, number>();
  const sstList: string[] = [];
  function internShared(s: string): number {
    const e = sstMap.get(s);
    if (e !== undefined) return e;
    sstMap.set(s, sstList.length);
    sstList.push(s);
    return sstList.length - 1;
  }

  // Convertit header + rows → cells matrix with shared strings
  const allRows: CsvRow[] = [header, ...rows];
  const matrix: Cell[][] = allRows.map((r) =>
    header.map((_, i) => toCell(r[i]))
  );
  // Pre-intern strings
  for (const r of matrix) {
    for (const c of r) {
      if (c && c.t === "s") internShared(c.v);
    }
  }

  const maxCol = header.length;
  const refA = `A1:${columnLetter(maxCol - 1)}${matrix.length}`;

  // ---------- sheet1.xml ----------
  let sh = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  sh += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">';
  sh += "<sheetPr><outlinePr summaryRight=\"1\" summaryBelow=\"1\"/></sheetPr>";
  sh += "<dimension ref=\"" + refA + "\"/>";
  sh += '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>';
  sh += "<sheetFormatPr defaultRowHeight=\"15\"/>";
  // Largeurs de colonne (meilleure lisibilité)
  sh += "<cols>";
  const widths = [5, 17, 15, 7, 46, 10, 36, 36, 70, 70, 10, 13, 17, 17, 60, 38, 38];
  for (let i = 0; i < maxCol; i++) {
    const w = widths[i] ?? 20;
    sh += `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`;
  }
  sh += "</cols>";
  sh += "<sheetData>";
  for (let r = 0; r < matrix.length; r++) {
    const rowNum = r + 1;
    const s = r === 0 ? 1 : 0;   // style 1 pour header (gras+bordure)
    sh += `<row r="${rowNum}"${r === 0 ? " customHeight=\"1\" ht=\"24\"" : ""}>`;
    for (let c = 0; c < maxCol; c++) {
      const cell = matrix[r][c];
      if (!cell) continue;
      const ref = columnLetter(c) + rowNum;
      if (cell.t === "n" && Number.isFinite(cell.v) && typeof cell.v === "number") {
        sh += `<c r="${ref}" s="${s}"><v>${cell.v}</v></c>`;
      } else if (cell.t === "s") {
        const idx = internShared(cell.v);
        sh += `<c r="${ref}" t="shared" s="${s}"><v>${idx}</v></c>`;
      }
    }
    sh += "</row>";
  }
  sh += "</sheetData>";
  sh += `<autoFilter ref="${refA}"/>`;
  sh += "</worksheet>";

  // ---------- sharedStrings.xml ----------
  let ss = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  ss += `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sstList.length}" uniqueCount="${sstList.length}">`;
  for (const v of sstList) ss += `<si><t xml:space="preserve">${xmlEsc(v)}</t></si>`;
  ss += "</sst>";

  // ---------- styles.xml (header gras + bordure) ----------
  let st = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  st += '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';
  st += "<fonts count=\"2\">";
  st += "<font><sz val=\"11\"/><name val=\"Calibri\"/><family val=\"2\"/></font>";
  st += "<font><b/><sz val=\"11\"/><name val=\"Calibri\"/><family val=\"2\"/><color rgb=\"FF18222E\"/></font>";
  st += "</fonts>";
  st += "<fills count=\"2\">";
  st += "<fill><patternFill patternType=\"none\"/></fill>";
  st += "<fill><patternFill patternType=\"solid\"><fgColor rgb=\"FFEAF1FF\"/><bgColor indexed=\"64\"/></patternFill></fill>";
  st += "</fills>";
  st += "<borders count=\"1\"><border><left/><right/><top/><bottom/><diagonal/></border></borders>";
  st += "<cellStyleXfs count=\"1\"><xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\"/></cellStyleXfs>";
  // cellXfs index 0 = normal, index 1 = header gras + fill bleu
  st += "<cellXfs count=\"2\">";
  st += '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>';
  st += '<xf numFmtId="0" fontId="1" fillId="1" borderId="0" xfId="0" applyFont="1" applyFill="1"/>';
  st += "</cellXfs>";
  st += "<cellStyles count=\"1\"><cellStyle name=\"Normal\" xfId=\"0\" builtinId=\"0\"/></cellStyles>";
  st += '<dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>';
  st += "</styleSheet>";

  // ---------- workbook.xml ----------
  let wb = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  wb += '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">';
  wb += "<sheets><sheet name=\"Erreurs TCF\" sheetId=\"1\" r:id=\"rId1\"/></sheets>";
  wb += "</workbook>";

  // ---------- workbook rels ----------
  const wbRels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>' +
    "</Relationships>";

  // ---------- _rels/.rels ----------
  const rootRels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    "</Relationships>";

  // ---------- [Content_Types].xml ----------
  const ct =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>' +
    "</Types>";

  const enc = new TextEncoder();
  const files: ZipFileIn[] = [
    { name: "[Content_Types].xml", data: enc.encode(ct) },
    { name: "_rels/.rels",          data: enc.encode(rootRels) },
    { name: "xl/workbook.xml",      data: enc.encode(wb) },
    { name: "xl/_rels/workbook.xml.rels", data: enc.encode(wbRels) },
    { name: "xl/styles.xml",        data: enc.encode(st) },
    { name: "xl/sharedStrings.xml", data: enc.encode(ss) },
    { name: "xl/worksheets/sheet1.xml",  data: enc.encode(sh) },
  ];
  return buildZip(files);
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const qCode = searchParams.get("code");
  const qGravite = searchParams.get("gravite");
  const qEcrites = searchParams.get("ecrites");

  let query = supabase.from("erreurs_suivi").select("*");
  if (qCode && qCode !== "tous") query = query.eq("code", qCode);
  if (qGravite && qGravite !== "toutes") query = query.eq("gravite", qGravite);
  if (qEcrites === "non") query = query.eq("ecrit_10x_fois", false);
  if (qEcrites === "oui") query = query.eq("ecrit_10x_fois", true);
  query = query.order("prochaine_revision", { ascending: true, nullsFirst: false }).order("gravite", { ascending: true }).order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const liste = ((data as ErreurSuivi[]) || []).filter(Boolean);
  const rows = rowsOf(liste);

  const bin = xlsxBinary(HEADERS, rows);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(Buffer.from(bin.buffer, bin.byteOffset, bin.byteLength) as any, {
    status: 200,
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="erreurs-tcf-${stamp}.xlsx"`,
      "content-length": String(bin.length),
    },
  });
}
