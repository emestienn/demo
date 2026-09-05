export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-ink-700 rounded-2xl">
      {Icon && <Icon size={32} className="text-ink-500 mb-3" />}
      <h3 className="font-display text-lg text-bone-100">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-bone-200/60 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
