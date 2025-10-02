export default function DaisyToast({ message }) {
    return (
        <div className="toast toast-bottom toast-center">
            <div className="alert alert-success">
                <span>{message}</span>
            </div>
        </div>
    );
}