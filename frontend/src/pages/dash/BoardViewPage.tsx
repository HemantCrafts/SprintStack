import KanbanBoard from "@components/kanban/KanbanBoard";
import { useParams } from "react-router-dom";

const BoardViewPage = () => {
  const {boardId} = useParams();

  return (
    <div className="bg-offWhite dark:bg-background min-h-full"><KanbanBoard boardId={boardId || ''}/></div>
  )
}

export default BoardViewPage