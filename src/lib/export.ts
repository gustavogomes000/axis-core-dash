// Utilitários simples para exportar dados como CSV e abrir uma janela imprimível para PDF.

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "string" ? v : String(v);
  if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportarCSV(filename: string, rows: Record<string, unknown>[], headers?: { key: string; label: string }[]) {
  if (!rows.length && !headers) return;
  const cols = headers ?? Object.keys(rows[0] ?? {}).map((k) => ({ key: k, label: k }));
  const head = cols.map((c) => csvCell(c.label)).join(";");
  const body = rows.map((r) => cols.map((c) => csvCell(r[c.key])).join(";")).join("\n");
  const csv = "\uFEFF" + head + "\n" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : filename + ".csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function imprimirHTML(titulo: string, corpoHtml: string) {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" /><title>${titulo}</title>
    <style>
      *{box-sizing:border-box} body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111;padding:32px;max-width:900px;margin:0 auto}
      h1{font-size:22px;margin:0 0 4px} h2{font-size:16px;margin:24px 0 8px;border-bottom:1px solid #ddd;padding-bottom:4px}
      .muted{color:#666;font-size:12px}
      table{width:100%;border-collapse:collapse;margin-top:8px;font-size:13px}
      th,td{padding:8px;border-bottom:1px solid #eee;text-align:left}
      th{background:#fafafa;font-weight:600} td.r,th.r{text-align:right}
      .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:12px}
      .card{border:1px solid #eee;border-radius:8px;padding:12px}
      .card .l{font-size:11px;text-transform:uppercase;color:#666}
      .card .v{font-size:18px;font-weight:700;margin-top:4px}
      .pos{color:#0a7d2c} .neg{color:#b00020}
      @media print{ button{display:none} }
    </style></head><body>${corpoHtml}
    <div style="margin-top:24px" class="muted">Gerado em ${new Date().toLocaleString("pt-BR")}</div>
    <script>setTimeout(()=>window.print(),300)</script>
    </body></html>`);
  w.document.close();
}