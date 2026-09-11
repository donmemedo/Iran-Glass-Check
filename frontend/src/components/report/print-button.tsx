"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ label }: { label: string }) {
  return (
    <Button variant="glass" size="sm" onClick={() => window.print()} className="no-print">
      <Printer className="size-3.5" strokeWidth={1.9} />
      {label}
    </Button>
  );
}
