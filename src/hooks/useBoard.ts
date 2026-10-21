import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { ColumnId, Task, Tasks } from "../types";

const STORAGE_KEY = "kanban.tasks.v1";

const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36));

export function useBoard() {
  const [tasks, setTasks] = useLocalStorage<Tasks>(STORAGE_KEY, {});

  const addTask = useCallback(
    (columnId: ColumnId, title: string, description?: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const id = uid();
      setTasks((prev) => ({
        ...prev,
        [id]: { id, title: trimmed, description: description?.trim() || undefined, columnId, createdAt: Date.now() },
      }));
    },
    [setTasks],
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [setTasks],
  );

  const moveTask = useCallback(
    (id: string, toColumn: ColumnId, toIndex?: number) => {
      setTasks((prev) => {
        const task = prev[id];
        if (!task) return prev;
        const sameCol = task.columnId === toColumn;

        const colTasks = Object.values(prev)
          .filter((t) => t.columnId === toColumn && t.id !== id)
          .sort((a, b) => a.createdAt - b.createdAt);

        const updated: Task = { ...task, columnId: toColumn };
        if (toIndex === undefined) {
          updated.createdAt = Date.now();
        } else {
          const anchor = colTasks[toIndex];
          const before = colTasks[toIndex - 1];
          if (anchor) updated.createdAt = anchor.createdAt - 1;
          else if (before) updated.createdAt = before.createdAt + 1;
          else updated.createdAt = Date.now();
        }

        if (sameCol) {
          colTasks.splice(Math.max(0, toIndex ?? colTasks.length), 0, updated);
        }

        return { ...prev, [id]: updated };
      });
    },
    [setTasks],
  );

  return { tasks, addTask, deleteTask, moveTask };
}
