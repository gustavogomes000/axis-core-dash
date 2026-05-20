// Minimal CSV parser with quoted field support (RFC 4180-ish)
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const t = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  while (i < t.length) {
    const c = t[i];
    if (inQuotes) {
      if (c === '"') {
        if (t[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === "," || c === ";" || c === "\t") { row.push(field); field = ""; i++; continue; }
    if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
    field += c; i++;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  // Trim trailing empty rows
  while (rows.length && rows[rows.length - 1].every((x) => !x.trim())) rows.pop();
  return rows;
}

export function detectDelimiter(firstLine: string): "," | ";" | "\t" {
  const c = (firstLine.match(/,/g) || []).length;
  const s = (firstLine.match(/;/g) || []).length;
  const t = (firstLine.match(/\t/g) || []).length;
  if (s >= c && s >= t) return ";";
  if (t >= c && t >= s) return "\t";
  return ",";
}