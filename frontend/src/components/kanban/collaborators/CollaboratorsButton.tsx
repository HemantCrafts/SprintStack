import { HiOutlineUserGroup } from 'react-icons/hi2';
import { Button } from '@components/ui/button';
import { cn } from '@/lib/utils';

interface CollaboratorsButtonProps {
    onClick: () => void;
    className?: string;
}

export default function CollaboratorsButton({ onClick, className }: CollaboratorsButtonProps) {
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClick}
            className={cn(
                'gap-2 border-border/70 bg-transparent text-muted-foreground shadow-none',
                'hover:border-primary/40 hover:bg-accent/50 hover:text-foreground',
                className
            )}
            aria-haspopup="dialog"
            aria-label="View board collaborators"
        >
            <HiOutlineUserGroup size={18} aria-hidden />
            <span className="hidden sm:inline">Collaborators</span>
        </Button>
    );
}
