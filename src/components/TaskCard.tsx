import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import type { Task } from "../types";
import { cn } from "../lib/utils";

interface Props {
  task: Task;
  onDelete: (id: string) => void;
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
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDrop,
  isDragging,
  isDropTarget,
}: Props) {
  const [showDelete, setShowDelete] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDropTarget && cardRef.current) {
      cardRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isDropTarget]);

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      className={cn(
        "group relative rounded-xl border border-border/70 bg-card p-3.5 shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md hover:border-border",
        isDragging && "opacity-40 scale-[0.98]",
        isDropTarget && "ring-2 ring-slate-400 ring-offset-2 ring-offset-background",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-foreground pr-1">{task.title}</p>
        <button
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          className={cn(
            "shrink-0 rounded-md p-1 text-muted-foreground transition-all duration-200",
            "hover:bg-destructive/10 hover:text-destructive",
            showDelete ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {task.description && (
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-3">{task.description}</p>
      )}
    </div>
  );
}
