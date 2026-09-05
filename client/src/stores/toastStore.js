import { create } from "zustand";

let idCounter = 0;

export const useToastStore = create((set) => ({
  toasts: [],
  push: (message, variant = "default") => {
    const id = ++idCounter;
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3800);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function toast(message, variant) {
  useToastStore.getState().push(message, variant);
}
