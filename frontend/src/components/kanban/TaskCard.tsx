import { useEffect, useState } from "react";
import { RxTrash } from 'react-icons/rx';
import { AiOutlineTags } from 'react-icons/ai';
import { Id, Task } from "./KanbanBoard";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AddLabelPopover } from "@components/modals/AddLabelPopover";
import { Badge } from "@/components/ui/badge";
import { useDeleteAnimation } from "@components/providers/DeleteAnimationProvider.tsx";

interface Props {
    task: Task;
    canEdit?: boolean;
    deleteTask: (id: Id) => Promise<void>;
    updateTask: (id: Id, content: string, label?: string) => Promise<void>;
}

function TaskCard({ task, canEdit = true, deleteTask, updateTask }: Props) {
    const { triggerDeleteAnimation } = useDeleteAnimation();
    const [mouseIsOver, setMouseIsOver] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [labelText, setLabelText] = useState<string | undefined>(task.label);
    useEffect(() => {
        updateTask(task.id, task.content, labelText);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [labelText]);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
        disabled: editMode || !canEdit,
    });

    const style = {
        transition: isDragging ? transition : `${transition ?? ''} opacity 0.28s ease, transform 0.28s ease, max-height 0.35s ease`,
        transform: CSS.Transform.toString(transform),
        // Animate card collapsing away on delete
        ...(isDeleting ? {
            opacity: 0,
            transform: `${CSS.Transform.toString(transform) ?? ''} scale(0.92) translateY(-6px)`,
            maxHeight: '0px',
            padding: '0px',
            marginBottom: '0px',
            overflow: 'hidden',
        } : {
            maxHeight: '200px',
        }),
    };

    const toggleEditMode = () => {
        if (!canEdit) return;
        setEditMode((prev) => !prev);
        setMouseIsOver(false);
    };

    const handleDelete = (e: React.MouseEvent) => {
        // 1. Start card exit animation immediately (CSS transition handles it)
        setIsDeleting(true);
        setMouseIsOver(false);

        // 2. Fire the contextual Lottie near the button — no await, runs in parallel
        triggerDeleteAnimation(e);

        // 3. After the exit animation completes (~320ms), remove from DOM
        setTimeout(() => {
            deleteTask(task.id);
        }, 340);
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={{ transition, transform: CSS.Transform.toString(transform) }}
                className="opacity-30 bg-mainBackgroundColor rounded-xl p-3 h-[80px] min-h-[80px] items-center flex text-left cursor-grab relative border border-border"
            />
        );
    }

    if (editMode) {
        return (
            <div
                ref={setNodeRef}
                style={{ transition, transform: CSS.Transform.toString(transform) }}
                {...attributes}
                {...listeners}
                className="bg-card border border-ring shadow-md rounded-xl p-3 min-h-[80px] items-center flex text-left hover:ring-2 hover:ring-inset hover:ring-destructive/50 cursor-grab relative text-card-foreground"
            >
                <textarea
                    className="h-full w-full min-h-[56px] resize-none border-none rounded bg-transparent text-foreground focus:outline-none text-sm leading-relaxed"
                    value={task.content}
                    autoFocus
                    placeholder="Task content here"
                    onBlur={toggleEditMode}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && e.shiftKey) {
                            toggleEditMode();
                        }
                    }}
                    onChange={(e) => updateTask(task.id, e.target.value)}
                />
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(canEdit ? attributes : {})}
            {...(canEdit ? listeners : {})}
            onDoubleClick={toggleEditMode}
            className={`bg-card border border-border shadow-sm rounded-xl p-3 min-h-[80px] flex flex-col gap-1.5 text-left relative task text-card-foreground hover:border-border/80 hover:shadow-md transition-shadow ${canEdit ? 'cursor-grab' : 'cursor-default'}`}
            onMouseEnter={() => { setMouseIsOver(true); }}
            onMouseLeave={() => { setMouseIsOver(false); }}
        >
            {/* Label badge */}
            {task?.label && (
                <Badge className="self-start text-xs bg-accent text-accent-foreground border border-border/60 hover:bg-accent/80 cursor-default">
                    {task.label}
                </Badge>
            )}

            {/* Task text */}
            <div className="w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap select-none text-sm leading-relaxed text-foreground">
                {task.content}
            </div>

            {/* Action buttons — slide in on hover, always below content */}
            {canEdit && (
            <div
                className={`
                    flex items-center gap-1.5 mt-auto pt-1 
                    transition-all duration-200 ease-in-out
                    ${mouseIsOver && !isDeleting ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-1'}
                `}
            >
                <AddLabelPopover labelText={labelText} setLabelText={setLabelText}>
                    <button
                        className="
                            flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                            bg-muted text-muted-foreground border border-border
                            hover:bg-secondary hover:text-secondary-foreground
                            transition-all duration-150 ease-in-out hover:scale-[1.03]
                            cursor-pointer whitespace-nowrap
                        "
                    >
                        <AiOutlineTags size={12} />
                        Label
                    </button>
                </AddLabelPopover>

                <button
                    onClick={handleDelete}
                    className="
                        flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                        bg-destructive/10 text-destructive border border-destructive/25
                        hover:bg-destructive hover:text-destructive-foreground hover:border-destructive hover:shadow-sm
                        transition-all duration-150 ease-in-out hover:scale-[1.03] active:scale-95
                        cursor-pointer whitespace-nowrap
                    "
                >
                    <RxTrash size={12} />
                    Delete
                </button>
            </div>
            )}
        </div>
    );
}

export default TaskCard;