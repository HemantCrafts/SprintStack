import { BoardData, Collaborator, CollaboratorUser } from '@hooks/user/useBoard';

export type BoardRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface BoardAccess {
    role: BoardRole | null;
    canEdit: boolean;
    isOwner: boolean;
}

function resolveUserId(user: CollaboratorUser | string | undefined): string | null {
    if (!user) return null;
    if (typeof user === 'string') return user;
    return user._id;
}

export function getBoardAccess(boardData: BoardData | undefined, currentUserId?: string): BoardAccess {
    if (boardData?.access) {
        return boardData.access;
    }

    if (!boardData || !currentUserId) {
        return { role: null, canEdit: false, isOwner: false };
    }

    if (boardData.board.createdBy._id === currentUserId) {
        return { role: 'OWNER', canEdit: true, isOwner: true };
    }

    const collaborator = boardData.board.collaborators.find(
        (entry) => resolveUserId(entry.user as CollaboratorUser | string) === currentUserId
    );

    if (!collaborator) {
        return { role: null, canEdit: false, isOwner: false };
    }

    const role: BoardRole = collaborator.role === 'GUEST' || collaborator.role === 'VIEWER' ? 'VIEWER' : 'EDITOR';
    return {
        role,
        canEdit: role === 'EDITOR',
        isOwner: false,
    };
}
