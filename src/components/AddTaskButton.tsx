import { Plus, X, CalendarDays } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Category, ColumnId } from "../types";
import { CATEGORIES } from "../types";
import { cn } from "../lib/utils";

interface Props {
  columnId: ColumnId;
  onAdd: (title: string, description?: string, category?: Category, dueDate?: string) => void;
}

export function AddTaskButton({ columnId, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [dueDate, setDueDate] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setCategory(undefined);
      setDueDate("");
    }
  }, [open]);

  const submit = () => {
    if (!title.trim()) return;
    onAdd(title, description, category, dueDate || undefined);
    setTitle("");
    setDescription("");
    setCategory(undefined);
    setDueDate("");
    inputRef.current?.focus();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground",
          "transition-colors duration-200 hover:bg-muted/70 hover:text-foreground",
        )}
      >
        <Plus className="h-4 w-4" />
        Add task
      </button>
    );
  }

  return (
    <div
      className="rounded-xl border border-border/70 bg-card p-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200"
      onDragOver={(e) => e.stopPropagation()}
    >
      <textarea
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Task title…"
        rows={2}
        className="w-full resize-none bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Description (optional)…"
        rows={2}
        className="mt-1 w-full resize-none bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/60 focus:outline-none"
      />

      {/* Due date */}
      <div className="mt-2.5">
        <p className="mb-1.5 text-xs text-muted-foreground">Due date & time (optional)</p>
        <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1.5">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-transparent text-xs text-foreground focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>
      </div>

      {/* Category picker */}
      <div className="mt-2.5">
        <p className="mb-1.5 text-xs text-muted-foreground">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(category === cat.id ? undefined : cat.id)}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-150",
                cat.color,
                cat.textColor,
                category === cat.id
                  ? "ring-2 ring-offset-1 ring-offset-card opacity-100"
                  : "opacity-60 hover:opacity-100",
                category === cat.id && cat.textColor.replace("text-", "ring-"),
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={submit}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Add
        </button>
        <button
          onClick={() => setOpen(false)}
          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="h-3 w-3" /> Cancel
        </button>
      </div>
      <span className="sr-only" hidden>{columnId}</span>
    </div>
  );
}
