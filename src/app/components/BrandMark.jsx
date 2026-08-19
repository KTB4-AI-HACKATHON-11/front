import { Check } from "lucide-react";

export default function BrandMark({ compact = false }) {
  return (
    <div className="brand-mark" aria-label="CheckOn">
      <span className="brand-mark__icon">
        <Check size={compact ? 14 : 17} strokeWidth={3} />
      </span>
      <span className={compact ? "brand-mark__name brand-mark__name--compact" : "brand-mark__name"}>
        CheckOn
      </span>
    </div>
  );
}
