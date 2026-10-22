export type ColumnId = "todo" | "doing" | "done";

export type Category = "study" | "work" | "life" | "market_update" | "other";

export interface CategoryMeta {
  id: Category;
  label: string;
  color: string;       // badge background
  textColor: string;   // badge text
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "study",         label: "Study",         color: "bg-blue-100",   textColor: "text-blue-700" },
  { id: "work",          label: "Work",           color: "bg-violet-100", textColor: "text-violet-700" },
  { id: "life",          label: "Life",           color: "bg-emerald-100",textColor: "text-emerald-700" },
  { id: "market_update", label: "Market Update",  color: "bg-amber-100",  textColor: "text-amber-700" },
  { id: "other",         label: "Other",          color: "bg-slate-100",  textColor: "text-slate-600" },
];

export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: Category;
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
  { id: "todo",  title: "Todo",  accent: "bg-slate-400" },
  { id: "doing", title: "Doing", accent: "bg-amber-400" },
  { id: "done",  title: "Done",  accent: "bg-emerald-400" },
];
