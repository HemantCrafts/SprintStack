import React, { createContext, useContext, useState } from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';

interface DeleteAnimationInstance {
    id: string;
    x: number;
    y: number;
}

interface DeleteAnimationContextType {
    triggerDeleteAnimation: (target: React.MouseEvent | HTMLElement | DOMRect) => Promise<void>;
}

const DeleteAnimationContext = createContext<DeleteAnimationContextType | undefined>(undefined);

export function DeleteAnimationProvider({ children }: { children: React.ReactNode }) {
    const [instances, setInstances] = useState<DeleteAnimationInstance[]>([]);

    const triggerDeleteAnimation = (target: React.MouseEvent | HTMLElement | DOMRect) => {
        return new Promise<void>((resolve) => {
            let x = window.innerWidth / 2 + window.scrollX;
            let y = window.innerHeight / 2 + window.scrollY;

            if (target) {
                let rect: DOMRect | null = null;
                if (target instanceof DOMRect) {
                    rect = target;
                } else if (target instanceof HTMLElement) {
                    rect = target.getBoundingClientRect();
                } else if ('currentTarget' in target && target.currentTarget) {
                    rect = (target.currentTarget as HTMLElement).getBoundingClientRect();
                } else if ('target' in target && target.target) {
                    rect = (target.target as HTMLElement).getBoundingClientRect();
                }

                if (rect) {
                    x = rect.left + rect.width / 2 + window.scrollX;
                    y = rect.top + rect.height / 2 + window.scrollY - 10; // Position slightly above the element
                }
            }

            const id = Math.random().toString(36).substring(2, 9);
            setInstances((prev) => [...prev, { id, x, y }]);

            // Let the animation play for 600ms before deleting the card (satisfying delay)
            setTimeout(() => {
                resolve();
            }, 600);

            // Clean up the instance after the full animation completes (800ms)
            setTimeout(() => {
                setInstances((prev) => prev.filter((inst) => inst.id !== id));
            }, 800);
        });
    };

    return (
        <DeleteAnimationContext.Provider value={{ triggerDeleteAnimation }}>
            {children}
            
            {/* Contextual Micro-Animations Container */}
            {instances.map((inst) => (
                <div
                    key={inst.id}
                    style={{
                        position: 'absolute',
                        left: `${inst.x}px`,
                        top: `${inst.y}px`,
                        pointerEvents: 'none',
                        zIndex: 9999,
                    }}
                    className="w-16 h-16 flex items-center justify-center animate-delete-pop"
                >
                    <div className="w-16 h-16 pointer-events-none">
                        <DotLottiePlayer
                            src="https://lottie.host/3b2aebba-8f55-44a2-8843-ae3239413935/yKDxqrtCjT.lottie"
                            autoplay
                            loop={false}
                        />
                    </div>
                </div>
            ))}
        </DeleteAnimationContext.Provider>
    );
}

export function useDeleteAnimation() {
    const context = useContext(DeleteAnimationContext);
    if (!context) {
        throw new Error('useDeleteAnimation must be used within a DeleteAnimationProvider');
    }
    return context;
}
