export default function DaisyToast({ message }) {
    return (
        <div className="toast toast-bottom toast-center">
            <div className="alert bg-(--tertiary) text-(--on-tertiary)">
                <span>{message}</span>
            </div>
        </div>
    );
}