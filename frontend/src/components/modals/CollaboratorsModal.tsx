import { useMemo, useState } from 'react';
import { RxCopy } from 'react-icons/rx';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@components/ui/dialog';
import { Input } from '@components/ui/input';
import { Button } from '@components/ui/button';
import { BoardData } from '@hooks/user/useBoard';
import { buildBoardMembers } from '@/lib/boardMembers';
import CollaboratorCard from '@components/kanban/collaborators/CollaboratorCard';
import { useToast } from '@components/ui/use-toast';

interface CollaboratorsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    boardData: BoardData | undefined;
    boardId: string;
    currentUserId?: string;
    onRemoveCollaborator?: (collaboratorId: string) => Promise<void>;
    onEditCollaboratorRole?: (collaboratorId: string, role: 'EDITOR' | 'GUEST') => Promise<void>;
    isRemoving?: boolean;
    isUpdatingRole?: boolean;
}

export default function CollaboratorsModal({
    open,
    onOpenChange,
    boardData,
    boardId,
    currentUserId,
    onRemoveCollaborator,
    onEditCollaboratorRole,
    isRemoving,
    isUpdatingRole,
}: CollaboratorsModalProps) {
    const { toast } = useToast();
    const [search, setSearch] = useState('');

    const members = useMemo(() => buildBoardMembers(boardData), [boardData]);
    const isOwnerView = boardData?.board.createdBy._id === currentUserId;

    const filteredMembers = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return members;
        return members.filter(
            (member) =>
                member.username.toLowerCase().includes(query) ||
                member.email.toLowerCase().includes(query) ||
                member.role.toLowerCase().includes(query)
        );
    }, [members, search]);

    const inviteLink = `${window.location.origin}/dash/boards/${boardId}/invite`;

    async function copyInviteLink() {
        try {
            await navigator.clipboard.writeText(inviteLink);
            toast({ title: 'Invite link copied', description: 'Share this link with collaborators.' });
        } catch {
            toast({
                variant: 'destructive',
                title: 'Copy failed',
                description: 'Unable to copy invite link to clipboard.',
            });
        }
    }

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) setSearch('');
        onOpenChange(nextOpen);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="max-h-[85vh] w-[calc(100%-2rem)] max-w-lg overflow-hidden border-border/80 bg-background p-0 shadow-2xl sm:rounded-xl"
                aria-describedby="collaborators-modal-description"
            >
                <DialogHeader className="space-y-1 border-b border-border/60 px-6 py-5 text-left">
                    <DialogTitle>Board Collaborators</DialogTitle>
                    <DialogDescription id="collaborators-modal-description">
                        {members.length} {members.length === 1 ? 'person has' : 'people have'} access to this board
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 px-6 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Input
                            type="search"
                            placeholder="Search by name, email, or role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border-border/70 bg-mainBackgroundColor/60"
                            aria-label="Search collaborators"
                        />
                        {isOwnerView && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={copyInviteLink}
                                className="shrink-0 gap-2 border-border/70"
                            >
                                <RxCopy size={16} aria-hidden />
                                Copy invite link
                            </Button>
                        )}
                    </div>

                    {filteredMembers.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                            No collaborators match your search.
                        </p>
                    ) : (
                        <ul className="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto pr-1" role="list">
                            {filteredMembers.map((member) => (
                                <CollaboratorCard
                                    key={member.id}
                                    member={member}
                                    isOwnerView={!!isOwnerView}
                                    onRemove={
                                        onRemoveCollaborator
                                            ? (id) => void onRemoveCollaborator(id)
                                            : undefined
                                    }
                                    onRoleChange={
                                        onEditCollaboratorRole
                                            ? (id, role) => void onEditCollaboratorRole(id, role)
                                            : undefined
                                    }
                                    isRemoving={isRemoving}
                                    isUpdatingRole={isUpdatingRole}
                                />
                            ))}
                            {(boardData?.board.collaborators.length ?? 0) === 0 && !search.trim() && (
                                <li className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                                    No collaborators added yet.
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
