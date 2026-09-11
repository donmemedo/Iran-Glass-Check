import { Check, OctagonAlert, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import type { Dict } from "@/lib/i18n";
import type { CheckStatusKey } from "@/lib/types";

const TONE = { ok: "ok", attention: "warn", critical: "crit" } as const;
const ICON = { ok: Check, attention: TriangleAlert, critical: OctagonAlert };

/** Status never rides on colour alone — icon and word carry it too. */
export function StatusChip({
  status,
  dict,
  className,
}: {
  status: CheckStatusKey;
  dict: Dict;
  className?: string;
}) {
  const Icon = ICON[status];
  return (
    <Badge tone={TONE[status]} className={className}>
      <Icon className="size-3" strokeWidth={2.4} />
      {dict.checks.severity[status]}
    </Badge>
  );
}
