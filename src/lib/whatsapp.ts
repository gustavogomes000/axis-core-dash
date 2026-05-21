/**
 * Gera link de WhatsApp clicável (wa.me) a partir de telefone BR + mensagem.
 * Aceita formatos comuns: "(11) 99999-9999", "+55 11 99999-9999", "11999999999".
 * Garante prefixo internacional (55) quando aplicável.
 */
export function gerarLinkWhatsApp(telefone: string | null | undefined, mensagem?: string): string | null {
  if (!telefone) return null;
  let digits = String(telefone).replace(/\D/g, "");
  if (!digits) return null;
  // Adiciona DDI Brasil se vier sem
  if (digits.length <= 11) digits = "55" + digits;
  const texto = mensagem ? `?text=${encodeURIComponent(mensagem)}` : "";
  return `https://wa.me/${digits}${texto}`;
}

/**
 * Substitui variáveis em template estilo {nome}, {valor}, etc.
 */
export function aplicarTemplate(template: string, vars: Record<string, string | number | null | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k];
    return v === null || v === undefined ? "" : String(v);
  });
}