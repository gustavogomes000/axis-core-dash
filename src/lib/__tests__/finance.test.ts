import { describe, it, expect } from "vitest";
import { calcularParcelaPrice, gerarTabelaAmortizacao, calcularMultaMora, addMeses, round2 } from "../finance";

describe("finance", () => {
  it("calcularParcelaPrice sem juros divide igualmente", () => {
    expect(calcularParcelaPrice(1000, 0, 10)).toBe(100);
  });

  it("calcularParcelaPrice com juros (Price)", () => {
    const p = calcularParcelaPrice(1000, 5, 12);
    expect(round2(p)).toBeCloseTo(112.83, 1);
  });

  it("gerarTabelaAmortizacao gera n parcelas e quita saldo", () => {
    const tab = gerarTabelaAmortizacao(1000, 5, 12, "2026-01-10");
    expect(tab).toHaveLength(12);
    expect(tab[11].saldoApos).toBeCloseTo(0, 1);
    expect(tab[0].vencimento).toBe("2026-01-10");
    expect(tab[1].vencimento).toBe("2026-02-10");
  });

  it("calcularMultaMora zero quando em dia", () => {
    const r = calcularMultaMora(100, 0);
    expect(r).toEqual({ multa: 0, mora: 0, total: 100 });
  });

  it("calcularMultaMora aplica multa 2% e mora diária", () => {
    const r = calcularMultaMora(100, 10, 2, 0.0333);
    expect(r.multa).toBe(2);
    expect(r.mora).toBeCloseTo(0.33, 2);
    expect(r.total).toBeCloseTo(102.33, 2);
  });

  it("addMeses respeita último dia do mês", () => {
    expect(addMeses("2026-01-31", 1)).toBe("2026-02-28");
  });
});