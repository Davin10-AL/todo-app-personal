import { useMemo, useState } from "react";
import { KanbanSquare, Loader2, AlertCircle, Sun, Moon } from "lucide-react";
import { COLUMNS, type Task } from "./types";
import { useBoard } from "./hooks/useBoard";
import { useTheme } from "./hooks/useTheme";
import { Column } from "./components/Column";

export default function App() {
  const { tasks, addTask, editTask, deleteTask, moveTask, loading, error } = useBoard();
  const { theme, toggleTheme } = useTheme();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const allTasks = useMemo<Task[]>(() => Object.values(tasks).sort((a, b) => a.createdAt - b.createdAt), [tasks]);
  const total = allTasks.length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-destructive">
          <AlertCircle className="h-8 w-8" />
          <p className="text-sm font-medium">Failed to connect to database</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-card/50 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <KanbanSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight tracking-tight text-foreground">Flowboard</h1>
            <p className="text-xs text-muted-foreground">{total} task{total === 1 ? "" : "s"} total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 sm:flex">
            {COLUMNS.map((c) => (
              <span key={c.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${c.accent}`} />
                {c.title}: {allTasks.filter((t) => t.columnId === c.id).length}
              </span>
            ))}
            <div className="ml-3 h-4 w-px bg-border" />
          </div>
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="flex h-full gap-4 overflow-x-auto p-4 sm:p-6">
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={tasks}
              allTasks={allTasks}
              onAdd={addTask}
              onEdit={editTask}
              onDelete={deleteTask}
              onMove={moveTask}
              onDragStateChange={setDraggingId}
              draggingId={draggingId}
            />
          ))}
          <div className="w-2 shrink-0" aria-hidden />
        </div>
      </main>
    </div>
  );
}
