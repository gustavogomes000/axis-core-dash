import { describe, it, expect } from "vitest";
import { hasPermission } from "@/components/RoleGate";

describe("hasPermission", () => {
  it("admin pode tudo", () => {
    (["view","write","delete","approve","config","score"] as const).forEach((a) =>
      expect(hasPermission("admin", a)).toBe(true),
    );
  });

  it("vendedor escreve mas não aprova nem configura", () => {
    expect(hasPermission("vendedor", "write")).toBe(true);
    expect(hasPermission("vendedor", "approve")).toBe(false);
    expect(hasPermission("vendedor", "config")).toBe(false);
    expect(hasPermission("vendedor", "delete")).toBe(false);
  });

  it("caixa não deleta nem aprova", () => {
    expect(hasPermission("caixa", "write")).toBe(true);
    expect(hasPermission("caixa", "delete")).toBe(false);
    expect(hasPermission("caixa", "approve")).toBe(false);
  });

  it("estoquista escreve mas não aprova", () => {
    expect(hasPermission("estoquista", "write")).toBe(true);
    expect(hasPermission("estoquista", "approve")).toBe(false);
  });

  it("visualizador é somente leitura", () => {
    expect(hasPermission("visualizador", "view")).toBe(true);
    expect(hasPermission("visualizador", "write")).toBe(false);
  });

  it("gerente aprova mas não configura", () => {
    expect(hasPermission("gerente", "approve")).toBe(true);
    expect(hasPermission("gerente", "config")).toBe(false);
    expect(hasPermission("gerente", "delete")).toBe(true);
  });

  it("sem papel não tem permissão", () => {
    expect(hasPermission(null, "view")).toBe(false);
  });
});