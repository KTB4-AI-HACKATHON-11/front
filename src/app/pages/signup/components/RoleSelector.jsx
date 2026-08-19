import { BriefcaseBusiness, Check, UserRoundCheck } from "lucide-react";

const roles = [
  {
    value: "MANAGER",
    label: "매니저",
    description: "그룹과 태스크를 관리해요",
    icon: BriefcaseBusiness,
  },
  {
    value: "WORKER",
    label: "알바",
    description: "배정된 태스크를 수행해요",
    icon: UserRoundCheck,
  },
];

export default function RoleSelector({ value, onChange }) {
  return (
    <div className="signup-role-list">
      {roles.map(({ value: roleValue, label, description, icon: Icon }) => (
        <button
          type="button"
          className={`signup-role ${value === roleValue ? "signup-role--selected" : ""}`}
          key={roleValue}
          onClick={() => onChange(roleValue)}
        >
          <span className="signup-role__icon"><Icon size={18} /></span>
          <span className="signup-role__copy"><strong>{label}</strong><small>{description}</small></span>
          <span className="signup-role__check">{value === roleValue && <Check size={13} strokeWidth={3} />}</span>
        </button>
      ))}
    </div>
  );
}
