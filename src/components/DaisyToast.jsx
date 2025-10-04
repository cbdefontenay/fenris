export default function DaisyToast({ message }) {
    return (
        <div className="toast toast-bottom toast-center">
            <div className="alert bg-(--secondary) text(--on-secondary)">
                <span>{message}</span>
            </div>
        </div>
    );
}