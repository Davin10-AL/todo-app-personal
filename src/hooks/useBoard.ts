import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Category, ColumnId, Task, Tasks } from "../types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

// Map dari database row ke Task object
function rowToTask(row: {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  column_id: string;
  created_at: number;
}): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    category: (row.category as Category) ?? undefined,
    columnId: row.column_id as ColumnId,
    createdAt: row.created_at,
  };
}

export function useBoard() {
  const [tasks, setTasks] = useState<Tasks>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch semua tasks dari Supabase saat pertama load
  useEffect(() => {
    let cancelled = false;

    async function fetchTasks() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const taskMap: Tasks = {};
      for (const row of data ?? []) {
        taskMap[row.id] = rowToTask(row);
      }
      setTasks(taskMap);
      setLoading(false);
    }

    fetchTasks();

    // Realtime subscription — update otomatis kalau ada perubahan
    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const task = rowToTask(payload.new as Parameters<typeof rowToTask>[0]);
            setTasks((prev) => ({ ...prev, [task.id]: task }));
          } else if (payload.eventType === "UPDATE") {
            const task = rowToTask(payload.new as Parameters<typeof rowToTask>[0]);
            setTasks((prev) => ({ ...prev, [task.id]: task }));
          } else if (payload.eventType === "DELETE") {
            const id = (payload.old as { id: string }).id;
            setTasks((prev) => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const addTask = useCallback(
    async (columnId: ColumnId, title: string, description?: string, category?: Category) => {
      const trimmed = title.trim();
      if (!trimmed) return;

      const id = uid();
      const newTask = {
        id,
        title: trimmed,
        description: description?.trim() || null,
        category: category ?? null,
        column_id: columnId,
        created_at: Date.now(),
      };

      // Optimistic update
      setTasks((prev) => ({
        ...prev,
        [id]: rowToTask(newTask),
      }));

      const { error } = await supabase.from("tasks").insert(newTask);
      if (error) {
        // Rollback kalau gagal
        setTasks((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        console.error("Failed to add task:", error.message);
      }
    },
    [],
  );

  const deleteTask = useCallback(async (id: string) => {
    // Optimistic update
    setTasks((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete task:", error.message);
      // Kita tidak rollback delete karena kompleks, tapi bisa refetch
    }
  }, []);

  const moveTask = useCallback(
    async (id: string, toColumn: ColumnId, toIndex?: number) => {
      setTasks((prev) => {
        const task = prev[id];
        if (!task) return prev;

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

        // Fire and forget update ke Supabase
        supabase
          .from("tasks")
          .update({ column_id: updated.columnId, created_at: updated.createdAt })
          .eq("id", id)
          .then(({ error }) => {
            if (error) console.error("Failed to move task:", error.message);
          });

        return { ...prev, [id]: updated };
      });
    },
    [],
  );

  const editTask = useCallback(
    async (id: string, title: string, description?: string, category?: Category) => {
      const trimmed = title.trim();
      if (!trimmed) return;

      // Optimistic update
      setTasks((prev) => {
        const task = prev[id];
        if (!task) return prev;
        return {
          ...prev,
          [id]: { ...task, title: trimmed, description: description?.trim() || undefined, category },
        };
      });

      const { error } = await supabase
        .from("tasks")
        .update({ title: trimmed, description: description?.trim() || null, category: category ?? null })
        .eq("id", id);

      if (error) {
        console.error("Failed to edit task:", error.message);
      }
    },
    [],
  );

  return { tasks, addTask, editTask, deleteTask, moveTask, loading, error };
}
