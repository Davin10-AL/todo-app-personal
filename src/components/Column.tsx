import { useId, useRef, useState } from "react";
import type { ColumnId, ColumnMeta, Task, Tasks } from "../types";
import { TaskCard } from "./TaskCard";
import { AddTaskButton } from "./AddTaskButton";
import { cn } from "../lib/utils";

interface Props {
  column: ColumnMeta;
  tasks: Tasks;
  allTasks: Task[];
  onAdd: (columnId: ColumnId, title: string, description?: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, toColumn: ColumnId, toIndex?: number) => void;
  onDragStateChange: (id: string | null) => void;
  draggingId: string | null;
}

export function Column({
  column,
  tasks,
  allTasks,
  onAdd,
  onDelete,
  onMove,
  onDragStateChange,
  draggingId,
}: Props) {
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const colId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const columnTasks = allTasks
    .filter((t) => t.columnId === column.id)
    .sort((a, b) => a.createdAt - b.createdAt);

  const handleDragEnter = (index: number) => {
    if (draggingId && tasks[draggingId]?.columnId === column.id && columnTasks[index]?.id === draggingId) return;
    setDropIndex(index);
  };

  const handleListDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropIndex === null) setDropIndex(columnTasks.length);
  };

  const handleListDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    const targetIndex = dropIndex ?? columnTasks.length;
    onMove(id, column.id, targetIndex);
    setDropIndex(null);
    onDragStateChange(null);
  };

  const handleCardDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    onMove(id, column.id, index);
    setDropIndex(null);
    onDragStateChange(null);
  };

  return (
    <section className="flex h-full w-80 shrink-0 flex-col rounded-2xl border border-border/60 bg-muted/30">
      <header className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className={cn("h-2.5 w-2.5 rounded-full", column.accent)} />
          <h2 className="text-sm font-semibold tracking-tight text-foreground">{column.title}</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {columnTasks.length}
          </span>
        </div>
      </header>

      <div
        ref={listRef}
        onDragOver={handleListDragOver}
        onDrop={handleListDrop}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) setDropIndex(null);
        }}
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3"
        data-column={colId}
      >
        {columnTasks.map((task, index) => (
          <div key={task.id}>
            <TaskCard
              task={task}
              onDelete={onDelete}
              isDragging={draggingId === task.id}
              isDropTarget={dropIndex === index}
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", task.id);
                e.dataTransfer.effectAllowed = "move";
                onDragStateChange(task.id);
              }}
              onDragEnd={() => {
                setDropIndex(null);
                onDragStateChange(null);
              }}
              onDragEnter={() => handleDragEnter(index)}
              onDrop={(e) => handleCardDrop(e, index)}
            />
          </div>
        ))}

        {columnTasks.length === 0 && dropIndex === null && (
          <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-border/60 text-xs text-muted-foreground/70">
            Drop tasks here
          </div>
        )}

        <div className="mt-1">
          <AddTaskButton columnId={column.id} onAdd={(title, desc) => onAdd(column.id, title, desc)} />
        </div>
      </div>
    </section>
  );
}
