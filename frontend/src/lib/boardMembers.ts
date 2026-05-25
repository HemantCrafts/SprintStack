import { BoardData, Collaborator, CollaboratorUser } from '@hooks/user/useBoard';

export type DisplayRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface BoardMember {
    id: string;
    collaboratorId?: string;
    username: string;
    email: string;
    role: DisplayRole;
    active: boolean;
    isOwner: boolean;
}

function resolveUser(user: CollaboratorUser | string): CollaboratorUser | null {
    if (typeof user === 'string') return null;
    return user;
}

function mapCollaboratorRole(role: Collaborator['role']): DisplayRole {
    if (role === 'GUEST' || role === 'VIEWER') return 'VIEWER';
    return 'EDITOR';
}

export function buildBoardMembers(boardData: BoardData | undefined): BoardMember[] {
    if (!boardData) return [];

    const owner: BoardMember = {
        id: boardData.board.createdBy._id,
        username: boardData.board.createdBy.username,
        email: boardData.board.createdBy.email ?? '',
        role: 'OWNER',
        active: true,
        isOwner: true,
    };

    const collaborators = boardData.board.collaborators
        .map((collaborator): BoardMember | null => {
            const user = resolveUser(collaborator.user);
            if (!user) return null;

            if (user._id === boardData.board.createdBy._id) return null;

            return {
                id: user._id,
                collaboratorId: collaborator._id,
                username: user.username,
                email: user.email,
                role: mapCollaboratorRole(collaborator.role),
                active: collaborator.active,
                isOwner: false,
            };
        })
        .filter((member): member is BoardMember => member !== null);

    return [owner, ...collaborators];
}

export function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
