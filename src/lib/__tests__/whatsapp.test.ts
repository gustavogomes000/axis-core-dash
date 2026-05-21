import { describe, it, expect } from "vitest";
import { gerarLinkWhatsApp, aplicarTemplate } from "../whatsapp";

describe("whatsapp", () => {
  it("retorna null sem telefone", () => {
    expect(gerarLinkWhatsApp(null)).toBeNull();
    expect(gerarLinkWhatsApp("")).toBeNull();
  });

  it("adiciona DDI 55 quando ausente", () => {
    expect(gerarLinkWhatsApp("(11) 99999-9999")).toBe("https://wa.me/5511999999999");
  });

  it("não duplica DDI quando já informado", () => {
    const link = gerarLinkWhatsApp("+55 11 99999-9999");
    expect(link).toBe("https://wa.me/5511999999999");
  });

  it("codifica mensagem", () => {
    const link = gerarLinkWhatsApp("11999999999", "Olá João");
    expect(link).toContain("?text=Ol%C3%A1%20Jo%C3%A3o");
  });

  it("aplicarTemplate substitui placeholders", () => {
    const out = aplicarTemplate("Oi {nome}, total {total}", { nome: "Ana", total: "R$ 50" });
    expect(out).toBe("Oi Ana, total R$ 50");
  });

  it("aplicarTemplate trata null/undefined como vazio", () => {
    expect(aplicarTemplate("{a}-{b}", { a: null, b: undefined })).toBe("-");
  });
});