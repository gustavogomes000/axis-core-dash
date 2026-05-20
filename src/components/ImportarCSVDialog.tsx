import { useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { parseCSV } from "@/lib/csv";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/providers/EmpresaProvider";
import { useQueryClient } from "@tanstack/react-query";

export interface CampoMap {
  /** chave do banco */
  key: string;
  /** rótulo amigável */
  label: string;
  /** obrigatório? */
  required?: boolean;
  /** transformação opcional do valor bruto da célula */
  transform?: (v: string) => any;
}

export interface ImportarCSVProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  titulo: string;
  tabela: string;
  campos: CampoMap[];
  invalidate: string[];
  exemploCSV: string;
  exemploNome: string;
}

export function ImportarCSVDialog({ open, onOpenChange, titulo, tabela, campos, invalidate, exemploCSV, exemploNome }: ImportarCSVProps) {
  const { empresaAtiva } = useEmpresa();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<string[][]>([]);
  const [header, setHeader] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({}); // campo.key -> nome_coluna_csv
  const [importando, setImportando] = useState(false);

  const handleFile = async (file: File) => {
    const text = await file.text();
    const parsed = parseCSV(text);
    if (parsed.length < 2) { toast.error("Arquivo vazio ou sem dados"); return; }
    const head = parsed[0].map((s) => s.trim());
    setHeader(head);
    setRows(parsed.slice(1));
    // auto-map por nome similar
    const auto: Record<string, string> = {};
    campos.forEach((c) => {
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      const found = head.find((h) => norm(h) === norm(c.label) || norm(h) === norm(c.key));
      if (found) auto[c.key] = found;
    });
    setMapping(auto);
  };

  const preview = useMemo(() => rows.slice(0, 5), [rows]);

  const importar = async () => {
    const faltando = campos.filter((c) => c.required && !mapping[c.key]).map((c) => c.label);
    if (faltando.length) { toast.error("Mapeie os campos obrigatórios: " + faltando.join(", ")); return; }
    setImportando(true);
    try {
      const records = rows.map((r) => {
        const obj: any = { empresa_id: empresaAtiva?.id };
        campos.forEach((c) => {
          const col = mapping[c.key];
          if (!col) return;
          const idx = header.indexOf(col);
          if (idx < 0) return;
          const raw = (r[idx] ?? "").trim();
          if (raw === "") return;
          obj[c.key] = c.transform ? c.transform(raw) : raw;
        });
        return obj;
      }).filter((o) => campos.filter((c) => c.required).every((c) => o[c.key]));

      if (!records.length) { toast.error("Nenhuma linha válida encontrada"); setImportando(false); return; }

      // insere em lotes de 100
      let inseridos = 0;
      for (let i = 0; i < records.length; i += 100) {
        const lote = records.slice(i, i + 100);
        const { error } = await (supabase as any).from(tabela).insert(lote);
        if (error) throw error;
        inseridos += lote.length;
      }
      invalidate.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      toast.success(`${inseridos} registros importados com sucesso!`);
      onOpenChange(false);
      setRows([]); setHeader([]); setMapping({});
    } catch (e: any) {
      toast.error("Erro ao importar: " + (e.message ?? "desconhecido"));
    } finally {
      setImportando(false);
    }
  };

  const baixarExemplo = () => {
    const blob = new Blob([exemploCSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = exemploNome; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>
            Importe vários registros de uma planilha. Aceita CSV separado por vírgula, ponto-e-vírgula ou tabulação.
          </DialogDescription>
        </DialogHeader>

        {rows.length === 0 ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">Selecione um arquivo .csv do seu computador</p>
              <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <Button onClick={() => inputRef.current?.click()}><Upload className="h-4 w-4 mr-2" /> Selecionar arquivo</Button>
            </div>
            <div className="flex items-start gap-2 text-sm bg-muted/40 rounded-md p-3">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <div>Primeira linha deve ser o cabeçalho com os nomes das colunas.</div>
                <button onClick={baixarExemplo} className="text-primary underline text-xs mt-1">Baixar planilha de exemplo</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {rows.length} linha(s) detectada(s). Confira o mapeamento das colunas:
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-56 overflow-auto pr-1">
              {campos.map((c) => (
                <div key={c.key} className="space-y-1">
                  <Label className="text-xs">
                    {c.label} {c.required && <span className="text-destructive">*</span>}
                  </Label>
                  <Select value={mapping[c.key] ?? "__none"} onValueChange={(v) => setMapping((m) => ({ ...m, [c.key]: v === "__none" ? "" : v }))}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="— ignorar —" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">— ignorar —</SelectItem>
                      {header.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="border rounded-md overflow-auto max-h-48">
              <Table>
                <TableHeader>
                  <TableRow>{header.map((h) => <TableHead key={h} className="whitespace-nowrap">{h}</TableHead>)}</TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((r, i) => (
                    <TableRow key={i}>
                      {header.map((_, j) => <TableCell key={j} className="whitespace-nowrap text-xs">{r[j] ?? ""}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">Prévia das 5 primeiras linhas.</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); setRows([]); setHeader([]); setMapping({}); }}>Cancelar</Button>
          {rows.length > 0 && (
            <Button onClick={importar} disabled={importando}>
              {importando ? "Importando…" : `Importar ${rows.length} registros`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}