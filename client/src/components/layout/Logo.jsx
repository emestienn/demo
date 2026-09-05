import { Link } from "react-router-dom";

export default function Logo({ className = "" }) {
  return (
    <Link to="/" className={`flex items-center gap-2 shrink-0 ${className}`}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-neon-cyan/50">
        <span className="h-2 w-2 rounded-full bg-neon-cyan shadow-glow" />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-bone-50">
        DONGNE
      </span>
    </Link>
  );
}
