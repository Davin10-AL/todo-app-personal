export type ColumnId = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: ColumnId;
  createdAt: number;
}

export type Tasks = Record<string, Task>;

export interface ColumnMeta {
  id: ColumnId;
  title: string;
  accent: string;
}

export const COLUMNS: ColumnMeta[] = [
  { id: "todo", title: "Todo", accent: "bg-slate-400" },
  { id: "doing", title: "Doing", accent: "bg-amber-400" },
  { id: "done", title: "Done", accent: "bg-emerald-400" },
];
