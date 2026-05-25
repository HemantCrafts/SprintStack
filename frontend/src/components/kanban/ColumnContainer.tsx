import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { RxTrash, RxPlus } from 'react-icons/rx';
import { Column, Id, Task } from "./KanbanBoard";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import TaskCard from "./TaskCard";
import { useDeleteAnimation } from "@components/providers/DeleteAnimationProvider.tsx";

interface Props {
    column: Column;
    canEdit?: boolean;
    deleteColumn: (id: Id) => Promise<void>;
    updateColumn: (id: Id, title: string) => Promise<void>;

    createTask: (columnId: Id) => Promise<void>;
    updateTask: (id: Id, content: string) => Promise<void>;
    deleteTask: (id: Id) => Promise<void>;
    tasks: Task[];
}

function ColumnContainer({
    column,
    canEdit = true,
    deleteColumn,
    updateColumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
}: Props) {
    const { triggerDeleteAnimation } = useDeleteAnimation();
    const [editMode, setEditMode] = useState(false);

    const tasksIds = useMemo(() => {
        return tasks.map((task) => task.id);
    }, [tasks]);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
        disabled: editMode || !canEdit,
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-columnBackgroundColor opacity-40 border-2 border-destructive w-[320px] min-h-[200px] rounded-xl flex flex-col"
            ></div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-columnBackgroundColor border border-border w-[320px] rounded-xl flex flex-col shadow-sm"
            // Column is NOT fixed height — grows with tasks, max capped, footer always visible
        >
            {/* ─── Column header ─── */}
            <div
                {...(canEdit ? attributes : {})}
                {...(canEdit ? listeners : {})}
                onClick={() => { if (canEdit) setEditMode(true); }}
                className={`shrink-0 rounded-t-xl px-4 py-3 font-semibold border-b border-border flex items-center justify-between bg-card ${canEdit ? 'cursor-grab' : ''}`}
            >
                <div className="flex gap-2 items-center flex-1 min-w-0">
                    {/* Column title — display or edit */}
                    {!editMode ? (
                        <span className="bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-0.5 text-sm font-medium truncate max-w-[185px]">
                            {column.title}
                        </span>
                    ) : (
                        <input
                            className="bg-primary/10 text-primary border border-primary/30 rounded-full px-3 py-0.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 max-w-[185px] w-full"
                            value={column.title}
                            onChange={(e) => updateColumn(column.id, e.target.value)}
                            autoFocus
                            onBlur={() => { setEditMode(false); }}
                            onKeyDown={(e) => {
                                if (e.key !== "Enter") return;
                                setEditMode(false);
                            }}
                        />
                    )}
                    {/* Task count badge */}
                    <span className="text-xs text-muted-foreground font-normal shrink-0 bg-muted rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {tasks.length}
                    </span>
                </div>

                {canEdit && (
                    <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            triggerDeleteAnimation(e);
                            await deleteColumn(column.id);
                        }}
                        className="ml-2 shrink-0 p-1.5 rounded-md text-muted-foreground border border-transparent hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
                        title="Delete column"
                    >
                        <RxTrash size={14} />
                    </button>
                )}
            </div>

            {/* ─── Task list — scrollable, min 2 card heights ─── */}
            <div
                className="flex flex-col gap-3 py-3 px-3 overflow-x-hidden overflow-y-auto"
                style={{ minHeight: '100px', maxHeight: '460px' }}
            >
                <SortableContext items={tasksIds}>
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            canEdit={canEdit}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                        />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground/50 select-none">
                        <span className="text-2xl">📋</span>
                        <p className="text-xs">No tasks yet</p>
                    </div>
                )}
            </div>

            {canEdit && (
                <button
                    className="shrink-0 flex gap-2 items-center justify-center border-t border-border rounded-b-xl px-4 py-3 text-sm text-muted-foreground font-medium hover:bg-accent hover:text-accent-foreground active:bg-muted transition-all duration-150 ease-in-out"
                    onClick={() => { createTask(column.id); }}
                >
                    <RxPlus size={14} />
                    Add task
                </button>
            )}
        </div>
    );
}

export default ColumnContainer;