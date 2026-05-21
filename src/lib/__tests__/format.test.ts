import { describe, it, expect } from "vitest";
import { formatarCPF, formatarCNPJ, formatarTelefone, formatarCEP, apenasDigitos } from "../format";

describe("format", () => {
  it("formatarCPF aplica máscara", () => {
    expect(formatarCPF("12345678901")).toBe("123.456.789-01");
  });
  it("formatarCNPJ aplica máscara", () => {
    expect(formatarCNPJ("12345678000199")).toBe("12.345.678/0001-99");
  });
  it("formatarTelefone celular 11 dígitos", () => {
    expect(formatarTelefone("11999999999")).toBe("(11) 99999-9999");
  });
  it("formatarTelefone fixo 10 dígitos", () => {
    expect(formatarTelefone("1133334444")).toBe("(11) 3333-4444");
  });
  it("formatarCEP aplica máscara", () => {
    expect(formatarCEP("01310100")).toBe("01310-100");
  });
  it("apenasDigitos remove não-dígitos", () => {
    expect(apenasDigitos("(11) 99999-9999")).toBe("11999999999");
  });
});