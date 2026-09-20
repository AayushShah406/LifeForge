import React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  emptyMessage = "No records found.",
  className,
}: {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-surface-border bg-surface-50", className)}>
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-surface-100 text-xs font-mono uppercase tracking-wider text-slate-400 border-b border-surface-border">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={cn("px-5 py-3.5 font-semibold", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border/60">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-xs text-slate-400 font-mono">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr key={item.id || rowIdx} className="hover:bg-surface-100/60 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={cn("px-5 py-3.5 text-xs", col.className)}>
                    {col.cell ? col.cell(item) : (col.accessorKey ? String(item[col.accessorKey] ?? "") : "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
