// Cálculos financeiros Tabela Price
export function calcularParcelaPrice(principal: number, taxaMensal: number, n: number): number {
  if (n <= 0) return 0;
  const i = taxaMensal / 100;
  if (i === 0) return principal / n;
  return (principal * i) / (1 - Math.pow(1 + i, -n));
}

export interface ParcelaPrice {
  numero: number;
  valor: number;
  juros: number;
  amortizacao: number;
  saldoAntes: number;
  saldoApos: number;
  vencimento: string; // ISO yyyy-mm-dd
}

export function addMeses(dataIso: string, meses: number): string {
  const d = new Date(dataIso + "T00:00:00");
  const dia = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + meses);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(dia, lastDay));
  return d.toISOString().slice(0, 10);
}

export function gerarTabelaAmortizacao(
  principal: number,
  taxaMensal: number,
  n: number,
  primeiroVencimentoIso: string,
): ParcelaPrice[] {
  const parcela = calcularParcelaPrice(principal, taxaMensal, n);
  const i = taxaMensal / 100;
  const out: ParcelaPrice[] = [];
  let saldo = principal;
  for (let k = 1; k <= n; k++) {
    const juros = saldo * i;
    const amort = parcela - juros;
    const saldoApos = Math.max(0, saldo - amort);
    out.push({
      numero: k,
      valor: round2(parcela),
      juros: round2(juros),
      amortizacao: round2(amort),
      saldoAntes: round2(saldo),
      saldoApos: round2(saldoApos),
      vencimento: addMeses(primeiroVencimentoIso, k - 1),
    });
    saldo = saldoApos;
  }
  return out;
}

export function calcularMultaMora(
  valorParcela: number,
  diasAtraso: number,
  multaPct = 2,
  jurosMoraDia = 0.0333,
): { multa: number; mora: number; total: number } {
  if (diasAtraso <= 0) return { multa: 0, mora: 0, total: valorParcela };
  const multa = (valorParcela * multaPct) / 100;
  const mora = (valorParcela * jurosMoraDia * diasAtraso) / 100;
  return { multa: round2(multa), mora: round2(mora), total: round2(valorParcela + multa + mora) };
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function diasAtraso(vencimentoIso: string): number {
  const v = new Date(vencimentoIso + "T00:00:00").getTime();
  const hoje = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00").getTime();
  return Math.max(0, Math.floor((hoje - v) / 86400000));
}