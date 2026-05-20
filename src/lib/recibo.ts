import { formatarData, formatarMoeda } from "./format";

export interface ItemRecibo {
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
}

export interface DadosRecibo {
  empresa: string;
  numero: string | number;
  data: string;
  cliente?: string | null;
  itens: ItemRecibo[];
  subtotal: number;
  desconto: number;
  total: number;
  forma_pagamento?: string | null;
  parcelas?: number;
  observacoes?: string | null;
}

export function abrirRecibo(dados: DadosRecibo) {
  const w = window.open("", "_blank", "width=420,height=640");
  if (!w) return;
  const linhas = dados.itens
    .map(
      (i) =>
        `<tr><td>${escapar(i.nome_produto)}</td><td style="text-align:right">${i.quantidade}</td><td style="text-align:right">${formatarMoeda(i.preco_unitario)}</td><td style="text-align:right">${formatarMoeda(i.total)}</td></tr>`,
    )
    .join("");
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Recibo #${dados.numero}</title>
<style>
  body{font-family:ui-sans-serif,system-ui,Arial,sans-serif;color:#111;padding:24px;max-width:420px;margin:0 auto;font-size:13px}
  h1{font-size:18px;margin:0 0 4px}
  .muted{color:#666;font-size:12px}
  hr{border:none;border-top:1px dashed #999;margin:12px 0}
  table{width:100%;border-collapse:collapse;margin:8px 0}
  th,td{padding:4px 0;border-bottom:1px dotted #ddd;font-weight:400;text-align:left;font-size:12px}
  .tot{display:flex;justify-content:space-between;margin:2px 0}
  .tot.big{font-size:15px;font-weight:700;margin-top:6px}
  .center{text-align:center;margin-top:18px}
  button{padding:8px 16px;border:1px solid #333;background:#111;color:#fff;border-radius:6px;cursor:pointer;font-size:13px}
  @media print{ button{display:none} }
</style></head><body>
  <h1>${escapar(dados.empresa)}</h1>
  <div class="muted">Recibo nº ${escapar(String(dados.numero))} · ${escapar(formatarData(dados.data))}</div>
  ${dados.cliente ? `<div style="margin-top:8px"><strong>Cliente:</strong> ${escapar(dados.cliente)}</div>` : ""}
  <hr/>
  <table>
    <thead><tr><th>Item</th><th style="text-align:right">Qtd</th><th style="text-align:right">Preço</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>${linhas}</tbody>
  </table>
  <div class="tot"><span>Subtotal</span><span>${formatarMoeda(dados.subtotal)}</span></div>
  ${dados.desconto ? `<div class="tot"><span>Desconto</span><span>− ${formatarMoeda(dados.desconto)}</span></div>` : ""}
  <div class="tot big"><span>TOTAL</span><span>${formatarMoeda(dados.total)}</span></div>
  ${dados.forma_pagamento ? `<div class="muted" style="margin-top:6px">Pagamento: ${escapar(dados.forma_pagamento)}${dados.parcelas && dados.parcelas > 1 ? ` em ${dados.parcelas}x` : ""}</div>` : ""}
  ${dados.observacoes ? `<div class="muted" style="margin-top:6px">${escapar(dados.observacoes)}</div>` : ""}
  <div class="center"><button onclick="window.print()">Imprimir / Salvar PDF</button></div>
</body></html>`);
  w.document.close();
}

function escapar(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function textoReciboWhatsApp(dados: DadosRecibo): string {
  const linhas = dados.itens
    .map((i) => `• ${i.quantidade}x ${i.nome_produto} — ${formatarMoeda(i.total)}`)
    .join("\n");
  return [
    `*${dados.empresa}* — Recibo #${dados.numero}`,
    `Data: ${formatarData(dados.data)}`,
    dados.cliente ? `Cliente: ${dados.cliente}` : "",
    "",
    linhas,
    "",
    `Subtotal: ${formatarMoeda(dados.subtotal)}`,
    dados.desconto ? `Desconto: − ${formatarMoeda(dados.desconto)}` : "",
    `*TOTAL: ${formatarMoeda(dados.total)}*`,
    dados.forma_pagamento ? `Pagamento: ${dados.forma_pagamento}${dados.parcelas && dados.parcelas > 1 ? ` em ${dados.parcelas}x` : ""}` : "",
    "",
    "Obrigado pela preferência!",
  ]
    .filter(Boolean)
    .join("\n");
}