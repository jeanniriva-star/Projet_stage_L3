interface ErrorAlertProps {
  message: string;
  className?: string;
}

function ErrorAlert({ message, className = "" }: ErrorAlertProps) {
  return (
    <div
      className={`rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 ${className}`}
    >
      {message}
    </div>
  );
}

export default ErrorAlert;