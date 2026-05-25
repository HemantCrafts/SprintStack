import { RxTrash } from 'react-icons/rx';
import { Avatar, AvatarFallback } from '@components/ui/avatar';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@components/ui/select';
import { BoardMember, DisplayRole, getInitials } from '@/lib/boardMembers';
import { cn } from '@/lib/utils';

const roleBadgeStyles: Record<DisplayRole, string> = {
    OWNER: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    EDITOR: 'border-blue-500/40 bg-blue-500/10 text-blue-200',
    VIEWER: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
};

interface CollaboratorCardProps {
    member: BoardMember;
    isOwnerView: boolean;
    onRemove?: (collaboratorId: string) => void;
    onRoleChange?: (collaboratorId: string, role: 'EDITOR' | 'GUEST') => void;
    isRemoving?: boolean;
    isUpdatingRole?: boolean;
}

export default function CollaboratorCard({
    member,
    isOwnerView,
    onRemove,
    onRoleChange,
    isRemoving,
    isUpdatingRole,
}: CollaboratorCardProps) {
    const showManagement = isOwnerView && !member.isOwner && member.collaboratorId;

    return (
        <li
            className={cn(
                'group flex items-center gap-3 rounded-lg border border-border/60 bg-mainBackgroundColor/80 p-3',
                'transition-all duration-200 hover:border-primary/30 hover:bg-accent/40'
            )}
        >
            <div className="relative shrink-0">
                <Avatar className="h-10 w-10 border border-border/80">
                    <AvatarFallback className="bg-primary/15 text-sm font-medium text-primary">
                        {getInitials(member.username)}
                    </AvatarFallback>
                </Avatar>
                <span
                    className={cn(
                        'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background',
                        member.active ? 'bg-emerald-500' : 'bg-muted-foreground/50'
                    )}
                    title={member.active ? 'Active collaborator' : 'Invite pending'}
                    aria-hidden
                />
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{member.username}</p>
                <p className="truncate text-sm text-muted-foreground">{member.email || 'No email'}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                {showManagement && onRoleChange ? (
                    <Select
                        value={member.role === 'VIEWER' ? 'GUEST' : 'EDITOR'}
                        onValueChange={(value) =>
                            onRoleChange(member.collaboratorId!, value as 'EDITOR' | 'GUEST')
                        }
                        disabled={isUpdatingRole}
                    >
                        <SelectTrigger
                            className="h-8 w-[108px] border-border/60 bg-background/60 text-xs"
                            aria-label={`Change role for ${member.username}`}
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="EDITOR">Editor</SelectItem>
                            <SelectItem value="GUEST">Viewer</SelectItem>
                        </SelectContent>
                    </Select>
                ) : (
                    <Badge
                        variant="outline"
                        className={cn('text-[10px] uppercase tracking-wide', roleBadgeStyles[member.role])}
                    >
                        {member.role}
                    </Badge>
                )}

                {showManagement && onRemove && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
                        onClick={() => onRemove(member.collaboratorId!)}
                        disabled={isRemoving}
                        aria-label={`Remove ${member.username} from board`}
                    >
                        <RxTrash size={16} />
                    </Button>
                )}
            </div>
        </li>
    );
}
