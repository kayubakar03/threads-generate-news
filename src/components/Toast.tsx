import { useState, useEffect } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "info" | "error";
  text: string;
}

let toastListeners: ((messages: ToastMessage[]) => void)[] = [];
let currentToasts: ToastMessage[] = [];

export function showToast(text: string, type: "success" | "info" | "error" = "success") {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastMessage = { id, type, text };
  currentToasts = [...currentToasts, newToast];
  toastListeners.forEach((listener) => listener(currentToasts));

  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    toastListeners.forEach((listener) => listener(currentToasts));
  }, 3500);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          className={`pointer-events-auto flex items-center justify-between px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-in slide-in-from-bottom-2 ${
            toast.type === "success"
              ? "bg-emerald-950/90 text-emerald-100 border-emerald-700/60 backdrop-blur-md"
              : toast.type === "error"
              ? "bg-rose-950/90 text-rose-100 border-rose-700/60 backdrop-blur-md"
              : "bg-slate-900/90 text-slate-100 border-slate-700/60 backdrop-blur-md"
          }`}
        >
          <span>{toast.text}</span>
          <button
            onClick={() => {
              currentToasts = currentToasts.filter((t) => t.id !== toast.id);
              toastListeners.forEach((listener) => listener(currentToasts));
            }}
            className="ml-3 text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
