import { RxPlus, RxReload, RxGear } from 'react-icons/rx';
import {LuLoader2} from 'react-icons/lu';
import { nanoid } from 'nanoid';
import { useMemo, useState, useEffect, useRef } from "react";
import ColumnContainer from "./ColumnContainer";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";
import useBoard from '@hooks/user/useBoard';
import { useToast } from '@components/ui/use-toast';
import { Button } from '@components/ui/button';
import { useRefetch } from '@/stores/useRefetch';
import LoadingSpinner from '@components/LoadingSpinner';
// import { Button } from '@components/ui/button';
import InviteCollaboratorModal from '@components/modals/InviteCollaboratorModal';
import EditBoardSheet from '@components/modals/EditBoardSheet';
import CollaboratorsModal from '@components/modals/CollaboratorsModal';
import CollaboratorsButton from '@components/kanban/collaborators/CollaboratorsButton';
import useUser from '@hooks/user/useUser';
import debounce from 'lodash/debounce';
import { getBoardAccess } from '@/lib/boardAccess';
import { Badge } from '@components/ui/badge';

export type Id = string | number;

export type Column = {
    id: Id;
    title: string;
};

export type Task = {
    id: Id;
    columnId: Id;
    content: string;
    label?: string | undefined;
};

interface KanbanBoardProps extends React.HTMLAttributes<HTMLDivElement> {
    boardId: string | null;
}

function KanbanBoard({ boardId }: KanbanBoardProps) {
    const { toast } = useToast();

    const userQuery = useUser();
    const thisBoard = useBoard(boardId || '');

    const [columns, setColumns] = useState<Column[]>([]);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    const [tasks, setTasks] = useState<Task[]>([]);

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [openCollaborators, setOpenCollaborators] = useState(false);

    const { data: boardData, isLoading, refetch, isFetching, isError, error } = thisBoard.getBoardQuery; // { isError} as well 
    const queryRefetch = useRefetch();

    const taskRef = useRef<{from: Task | null, to: Task | number | null}>({from: null, to: null});
    const debouncedUpdateTask = useRef(
        debounce(async (id: Id, content: string, label?: string) => {
            try {
                await thisBoard.editCardMutation.mutateAsync({ cardId: id, data: { title: content, label: label } });
            } catch (error) {
                console.error(error);
                toast({
                    variant: "destructive",
                    title: "An error occurred.",
                    description: "Unable to edit."
                });
                refetch();
            }
        }, 500)
    ).current;


    const boardAccess = useMemo(
        () => getBoardAccess(boardData, userQuery.data?._id),
        [boardData, userQuery.data?._id]
    );
    const canEdit = boardAccess.canEdit;
    const isBoardOwner = boardAccess.isOwner;

    useEffect(() => {
        if (!isLoading) {
            setColumns(boardData?.columns || []);
            setTasks(boardData?.tasks || []);
        }
    }, [isLoading, boardData]);

    useEffect(() => {
        const shouldQueryBeEnabled = activeColumn === null && activeTask === null;
        if (queryRefetch.isEnabled !== shouldQueryBeEnabled) {
            queryRefetch.setEnabled(shouldQueryBeEnabled);
        }
    }, [activeColumn, activeTask, queryRefetch])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    if (isError) {
        return (
            <div className="m-auto px-[40px] pb-[30px] w-full text-center">
                <h1 className="text-8xl my-5">⚠</h1>
                <h1 className="text-xl font-bold">{error.message}</h1>
                <p>Either the board does not exist or you do not have access.</p>
            </div>
        )
    }

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (
        <>
            <div className="m-auto w-full px-[40px] pb-[30px]">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-xl font-bold">{boardData?.board.title || "Untitled Board"}</h1>
                    {!isBoardOwner && boardAccess.role && (
                        <Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-200 text-[10px] uppercase tracking-wide">
                            {boardAccess.role === 'VIEWER' ? 'View only' : 'Collaborator'}
                        </Badge>
                    )}
                    <CollaboratorsButton onClick={() => setOpenCollaborators(true)} />
                    <CollaboratorsModal
                        open={openCollaborators}
                        onOpenChange={setOpenCollaborators}
                        boardData={boardData}
                        boardId={boardId || ''}
                        currentUserId={userQuery.data?._id}
                        onRemoveCollaborator={isBoardOwner ? removeCollaborator : undefined}
                        onEditCollaboratorRole={isBoardOwner ? editCollaboratorRole : undefined}
                        isRemoving={thisBoard.removeCollaboratorMutation.isLoading}
                        isUpdatingRole={thisBoard.editCollaboratorMutation.isLoading}
                    />
                    <div className="flex-1" />
                    <div className="flex items-center gap-3 shrink-0">
                        {isBoardOwner && (
                            <EditBoardSheet boardData={boardData}>
                                <Button variant="ghost" aria-label="Board settings"><RxGear className="cursor-pointer" size={24} /></Button>
                            </EditBoardSheet>
                        )}
                        { (isFetching || isLoading) ? <LuLoader2 size={24} className="animate-spin" /> : <RxReload size={24} className="cursor-pointer" onClick={() => refetch()}/> }
                        { 
                            isBoardOwner &&  
                            <InviteCollaboratorModal inviteCollaborator={inviteCollaborator}>
                                <Button variant="ghost">Invite</Button>
                            </InviteCollaboratorModal>
                        }
                    </div>
                </div>
                {boardData?.board.description && (
                    <p className="mt-1 text-muted-foreground">{boardData.board.description}</p>
                )}
            </div>
            <div className="m-auto flex h-full w-full items-start overflow-x-auto overflow-y-hidden px-[40px]">
                <DndContext
                    sensors={canEdit ? sensors : []}
                    onDragStart={canEdit ? onDragStart : undefined}
                    onDragEnd={canEdit ? onDragEnd : undefined}
                    onDragOver={canEdit ? onDragOver : undefined}
                >
                    <div className="flex gap-4 items-start">
                        <div className="flex gap-4 items-start">
                            <SortableContext items={columnsId}>
                                {columns.map((col) => (
                                    <ColumnContainer
                                        key={col.id}
                                        column={col}
                                        canEdit={canEdit}
                                        deleteColumn={deleteColumn}
                                        updateColumn={updateColumn}
                                        createTask={createTask}
                                        deleteTask={deleteTask}
                                        updateTask={updateTask}
                                        tasks={tasks.filter((task) => task.columnId === col.id)}
                                    />
                                ))}
                            </SortableContext>
                        </div>
                        {canEdit && (
                            <button
                                onClick={async () => {
                                    await createNewColumn();
                                }}
                                disabled={isFetching}
                                className="h-[50px] w-[320px] min-w-[320px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-dashed border-border hover:border-primary/40 hover:bg-accent p-4 flex gap-2 items-center text-muted-foreground hover:text-accent-foreground transition-all duration-200"
                            >
                                <RxPlus />
                                Add Column
                            </button>
                        )}
                    </div>

                    {createPortal(
                        <DragOverlay>
                            {activeColumn && (
                                <ColumnContainer
                                    column={activeColumn}
                                    canEdit={canEdit}
                                    deleteColumn={deleteColumn}
                                    updateColumn={updateColumn}
                                    createTask={createTask}
                                    deleteTask={deleteTask}
                                    updateTask={updateTask}
                                    tasks={tasks.filter(
                                        (task) => task.columnId === activeColumn.id
                                    )}
                                />
                            )}
                            {activeTask && (
                                <TaskCard
                                    task={activeTask}
                                    canEdit={canEdit}
                                    deleteTask={deleteTask}
                                    updateTask={updateTask}
                                />
                            )}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            </div>
        </>
    );

    async function createTask(columnId: Id) {
        const newTask: Task = {
            id: generateId(),
            columnId,
            content: `Task ${tasks.length + 1}`,
        };

        try {
            await thisBoard.addCardMutation.mutateAsync({ columnId, title: newTask.content, taskId: newTask.id });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "An error occured.", description: "Unable to create new card." });
            refetch();
        }

        setTasks([...tasks, newTask]);
    }

    async function deleteTask(id: Id) {
        debouncedUpdateTask.cancel();
        
        const newTasks = tasks.filter((task) => task.id !== id);
        setTasks(newTasks);

        try {
            await thisBoard.deleteCardMutation.mutateAsync(id);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "An error occured.", description: "Unable to delete." });
            refetch();
        }

    }

    async function updateTask(id: Id, content: string, label?: string) {
        const newTasks = tasks.map((task) => {
            if (task.id !== id) return task;
            return { ...task, content, label };
        });

        
        setTasks(newTasks);

        debouncedUpdateTask(id ,content, label);
        // try {
        //     await thisBoard.editCardMutation.mutateAsync({cardId: id, data: {title: content}});
        // } catch (error) {
        //     console.error(error);
        //     toast({ variant: "destructive", title: "An error occured.", description: "Unable to edit." });
        //     refetch();
        // }
    }

    async function createNewColumn() {
        const columnToAdd: Column = {
            id: generateId(),
            title: `Column ${columns.length + 1}`,
        };
        setColumns([...columns, columnToAdd]);

        try {
            await thisBoard.addListMutation.mutateAsync({ columnId: columnToAdd.id, title: columnToAdd.title });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "An error occured.", description: "Unable to create new column." });
            refetch();
        }

    }

    async function deleteColumn(id: Id) {
        const filteredColumns = columns.filter((col) => col.id !== id);
        setColumns(filteredColumns);

        const newTasks = tasks.filter((t) => t.columnId !== id);
        setTasks(newTasks);

        try {
            await thisBoard.deleteListMutation.mutateAsync(id);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "An error occured.", description: "Unable to delete." });
            refetch();
        }
    }

    async function updateColumn(id: Id, title: string) {
        const newColumns = columns.map((col) => {
            if (col.id !== id) return col;
            return { ...col, title };
        });

        setColumns(newColumns);

        try {
            await thisBoard.editListMutation.mutateAsync({listId: id, data: {title}});
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "An error occured.", description: "Unable to edit." });
            refetch();
        }
    }

    async function moveTask(from: Task, to: Task | number) {
        let pos: number;
        if (typeof to === 'object') {
            pos = tasks.filter((task) => task.columnId === to.columnId).findIndex(e => e.id === to.id);
        } else {
            pos = to;
        }
        console.log("Index pos " + pos);
        try {
            const res = await thisBoard.moveCardMutation.mutateAsync({
                 cardId: from.id, 
                 data: {
                     columnId: typeof to !== 'number' ? to.columnId : from.columnId,
                     position: pos,
                     
                }
            });
            if (res.success) {
                return true;
            }
        } catch (error) {
            console.error(error);
        }

        return false;
    }

    async function removeCollaborator(collaboratorId: string) {
        try {
            await thisBoard.removeCollaboratorMutation.mutateAsync(collaboratorId);
            toast({ title: 'Collaborator removed', description: 'They no longer have access to this board.' });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'An error occurred.',
                description: 'Unable to remove collaborator.',
            });
        }
    }

    async function editCollaboratorRole(collaboratorId: string, role: 'EDITOR' | 'GUEST') {
        try {
            await thisBoard.editCollaboratorMutation.mutateAsync({ collaboratorId, data: { role } });
            toast({ title: 'Role updated', description: 'Collaborator permissions have been updated.' });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'An error occurred.',
                description: 'Unable to update collaborator role.',
            });
        }
    }

    async function inviteCollaborator(collaboratorEmail: string) {
        try {
            // todo: Make role dynamic.
            const res = await thisBoard.inviteCollaboratorMutation.mutateAsync({userEmail: collaboratorEmail, role: "EDITOR"});
            if (res.success) {
                return true;
            }
        } catch (error) {
            // todo: Handle client-side errors better.
            console.error(error);
        }

        return false;
    }

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
            taskRef.current.from = event.active.data.current.task;
            return;
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveTask(null);
        setActiveColumn(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveAColumn = active.data.current?.type === "Column";
        const isOverAColumn = over.data.current?.type === "Column";
        const isActiveATask = active.data.current?.type === "Task";
        const isOverATask = over.data.current?.type === "Task";

        if (isActiveAColumn) {
            setColumns((columns) => {
                const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
    
                const overColumnIndex = columns.findIndex((col) => col.id === overId);
    
                return arrayMove(columns, activeColumnIndex, overColumnIndex);
            });
        } else if (isActiveATask)  {
            let from: Task, to: Task | number;
            // Dropping a task over another task.
            if (isActiveATask && isOverATask) {
                setTasks((tasks) => {
                    const activeIndex = tasks.findIndex((t) => t.id === activeId);
                    const overIndex = tasks.findIndex((t) => t.id === overId);
                    from = tasks[activeIndex];
                    
                    // Different column
                    if (tasks[activeIndex].columnId != tasks[overIndex].columnId) {
                        to = tasks[overIndex - 1];
                        tasks[activeIndex].columnId = tasks[overIndex].columnId;
                        moveTask(from, to);
                        return arrayMove(tasks, activeIndex, overIndex - 1);
                    }
    
                    const tasksWithinList = tasks.filter(t => t.columnId === tasks[activeIndex].columnId);
                    const destIndex = tasksWithinList.findIndex(t => t.id === overId);
                    // same column, diff pos
                    to = destIndex;
                    moveTask(from, to);
                    return arrayMove(tasks, activeIndex, overIndex + 1);
                });
            }
    
            // Dropping a task over a column
            if (isActiveATask && isOverAColumn) {
                setTasks((tasks) => {
                    const activeIndex = tasks.findIndex((t) => t.id === activeId);
    
                    tasks[activeIndex].columnId = overId;
                    from = tasks[activeIndex]
                    to = tasks.filter(e => e.id === overId).length; // To call the query
                    moveTask(from, to);
                    return arrayMove(tasks, activeIndex, activeIndex);
                });
            }
        }
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

    }
}

function generateId() {
    return nanoid();
}

export default KanbanBoard;