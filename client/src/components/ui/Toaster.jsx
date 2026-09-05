import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useToastStore } from "../../stores/toastStore.js";

const ICONS = {
  default: Info,
  success: CheckCircle2,
  error: XCircle,
};

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[min(360px,calc(100vw-2.5rem))]">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.variant] || ICONS.default;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              className="card-surface flex items-start gap-2.5 px-4 py-3 shadow-2xl"
            >
              <Icon
                size={18}
                className={
                  t.variant === "success" ? "text-neon-cyan mt-0.5" : t.variant === "error" ? "text-neon-pink mt-0.5" : "text-neon-blue mt-0.5"
                }
              />
              <p className="text-sm text-bone-100 leading-snug">{t.message}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
