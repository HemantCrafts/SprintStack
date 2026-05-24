export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div
                className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-opacity-50"
                role="status"
                aria-label="Loading"
            />
        </div>
    )
}
