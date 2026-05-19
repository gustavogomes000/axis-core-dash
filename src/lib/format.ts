export const formatarMoeda = (v: number | string | null | undefined) => {
  const n = typeof v === "string" ? parseFloat(v) : v ?? 0;
  return (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const formatarCPF = (v?: string | null) => {
  if (!v) return "";
  const d = v.replace(/\D/g, "").padStart(11, "0").slice(-11);
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

export const formatarCNPJ = (v?: string | null) => {
  if (!v) return "";
  const d = v.replace(/\D/g, "").slice(-14);
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};

export const formatarTelefone = (v?: string | null) => {
  if (!v) return "";
  const d = v.replace(/\D/g, "");
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return v;
};

export const formatarData = (v?: string | Date | null) => {
  if (!v) return "";
  const d = typeof v === "string" ? new Date(v.includes("T") ? v : v + "T00:00:00") : v;
  return d.toLocaleDateString("pt-BR");
};

export const formatarDataHora = (v?: string | Date | null) => {
  if (!v) return "";
  const d = typeof v === "string" ? new Date(v) : v;
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const formatarCEP = (v?: string | null) => {
  if (!v) return "";
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d{3})/, "$1-$2");
};

export const apenasDigitos = (v?: string | null) => (v || "").replace(/\D/g, "");

export const linkWhatsApp = (telefone?: string | null, mensagem = "") => {
  const tel = apenasDigitos(telefone);
  const fone = tel.startsWith("55") ? tel : "55" + tel;
  return `https://wa.me/${fone}?text=${encodeURIComponent(mensagem)}`;
};