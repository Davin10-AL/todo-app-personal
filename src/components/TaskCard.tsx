import { useEffect, useRef, useState } from "react";
import { Trash2, CheckCircle2, Circle, CheckCheck } from "lucide-react";
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
  onAdvance,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDrop,
  isDragging,
  isDropTarget,
}: Props) {
  const [showActions, setShowActions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDropTarget && cardRef.current) {
      cardRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isDropTarget]);

  const nextColumn = NEXT_COLUMN[task.columnId];
  const isDone = task.columnId === "done";

  const CheckIcon = isDone ? CheckCheck : nextColumn ? Circle : CheckCircle2;

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

        {/* Delete button */}
        <button
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          className={cn(
            "shrink-0 rounded-md p-1 text-muted-foreground transition-all duration-200",
            "hover:bg-destructive/10 hover:text-destructive",
            showActions ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
