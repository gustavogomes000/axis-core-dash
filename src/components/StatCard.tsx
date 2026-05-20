import { Card, CardContent } from "@/components/ui/card";

export function StatCard({ label, value, hint, icon: Icon, tone = "primary" }: { label: string; value: string | number; hint?: string; icon?: React.ComponentType<{ className?: string }>; tone?: "primary" | "secondary" | "destructive" | "muted" }) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    destructive: "bg-destructive/10 text-destructive",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="text-2xl font-bold mt-1 truncate">{value}</div>
            {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
          </div>
          {Icon && <div className={`h-10 w-10 rounded-lg grid place-items-center ${tones[tone]}`}><Icon className="h-5 w-5" /></div>}
        </div>
      </CardContent>
    </Card>
  );
}