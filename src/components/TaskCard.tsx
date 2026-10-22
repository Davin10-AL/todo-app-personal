import { useEffect, useRef, useState } from "react";
import { Trash2, CheckCircle2, Circle, CheckCheck, Pencil, X, Check } from "lucide-react";
import type { ColumnId, Task } from "../types";
import { cn } from "../lib/utils";

const NEXT_COLUMN: Record<ColumnId, ColumnId | null> = {
  todo: "doing",
  doing: "done",
  done: null,
};

interface Props {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, description?: string) => void;
  onAdvance: (id: string, toColumn: ColumnId) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDragEnter: () => void;
  onDrop: (e: React.DragEvent) => void;
  isDragging: boolean;
  isDropTarget: boolean;
}

export function TaskCard({
  task,
  onDelete,
  onEdit,
  onAdvance,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDrop,
  isDragging,
  isDropTarget,
}: Props) {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description ?? "");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDropTarget && cardRef.current) {
      cardRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isDropTarget]);

  // Focus title saat edit mode terbuka
  useEffect(() => {
    if (isEditing) {
      titleRef.current?.focus();
      titleRef.current?.select();
    }
  }, [isEditing]);

  const openEdit = () => {
    setEditTitle(task.title);
    setEditDesc(task.description ?? "");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const submitEdit = () => {
    if (!editTitle.trim()) return;
    onEdit(task.id, editTitle, editDesc);
    setIsEditing(false);
  };

  const nextColumn = NEXT_COLUMN[task.columnId];
  const isDone = task.columnId === "done";
  const CheckIcon = isDone ? CheckCheck : nextColumn ? Circle : CheckCircle2;

  // Mode edit — tampilkan form inline
  if (isEditing) {
    return (
      <div
        ref={cardRef}
        onDragOver={(e) => e.stopPropagation()}
        className="rounded-xl border border-primary/50 bg-card p-3.5 shadow-sm ring-1 ring-primary/30"
      >
        <textarea
          ref={titleRef}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submitEdit();
            }
            if (e.key === "Escape") cancelEdit();
          }}
          placeholder="Task title…"
          rows={2}
          className="w-full resize-none bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />
        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submitEdit();
            }
            if (e.key === "Escape") cancelEdit();
          }}
          placeholder="Description (optional)…"
          rows={2}
          className="mt-1 w-full resize-none bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        <div className="mt-2.5 flex items-center gap-2">
          <button
            onClick={submitEdit}
            disabled={!editTitle.trim()}
            aria-label="Save changes"
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Check className="h-3 w-3" />
            Save
          </button>
          <button
            onClick={cancelEdit}
            aria-label="Cancel edit"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Mode normal
  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        "group relative rounded-xl border border-border/70 bg-card p-3.5 shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md hover:border-border",
        isDone && "opacity-70",
        isDragging && "opacity-40 scale-[0.98]",
        isDropTarget && "ring-2 ring-slate-400 ring-offset-2 ring-offset-background",
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* Checklist button */}
        <button
          onClick={() => nextColumn && onAdvance(task.id, nextColumn)}
          disabled={isDone}
          aria-label={isDone ? "Task completed" : `Move to ${nextColumn}`}
          className={cn(
            "mt-0.5 shrink-0 rounded-full transition-all duration-200",
            isDone
              ? "text-emerald-500 cursor-default"
              : "text-muted-foreground hover:text-emerald-500 hover:scale-110",
          )}
        >
          <CheckIcon className="h-4 w-4" />
        </button>

        {/* Title & description */}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-medium leading-snug text-foreground",
              isDone && "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-3">{task.description}</p>
          )}
        </div>

        {/* Action buttons — Edit & Delete */}
        <div className={cn(
          "flex shrink-0 items-center gap-0.5 transition-all duration-200",
          showActions ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}>
          <button
            onClick={openEdit}
            aria-label="Edit task"
            className="rounded-md p-1 text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
            className="rounded-md p-1 text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
