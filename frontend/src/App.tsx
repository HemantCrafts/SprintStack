import { Outlet } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";

export default function App() {
    return (
        <div className="theme-transition min-h-screen bg-background text-foreground">
            <Outlet />
            <Toaster />
        </div>
    )
}