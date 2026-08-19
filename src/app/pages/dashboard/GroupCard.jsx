import { motion } from "motion/react";
import { Users, CheckCircle2, Clock, ChevronRight } from "lucide-react";

export default function GroupCard({ group, index }) {
  const pct = Math.round((group.responseCount / group.memberCount) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-black/5 p-5 hover:border-[#5B4BFA]/25 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <h3
              className="text-[#0D0D1A] truncate text-[15px]"
              style={{ fontFamily: "Onest, sans-serif", fontWeight: 600 }}
            >
              {group.name}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF0FF] text-[#5B4BFA] flex-shrink-0">
              {group.tag}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                group.status === "active"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-[#F7F7F9] text-[#AAAABB]"
              }`}
            >
              {group.status === "active" ? "진행 중" : "완료"}
            </span>
          </div>

          <p className="text-sm text-[#6B6B7B] line-clamp-1 mb-3">{group.description}</p>

          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-[#AAAABB]">
              <Users size={11} />
              {group.memberCount}명
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#AAAABB]">
              <CheckCircle2 size={11} />
              {group.responseCount}개 응답
            </span>
            {group.pendingCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-amber-500">
                <Clock size={11} />
                {group.pendingCount}개 미응답
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-[#CCCCCC]">
              <Clock size={11} />
              {group.lastActivity}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0 min-w-[80px]">
          <div className="text-right">
            <p
              className="text-2xl text-[#0D0D1A] leading-none"
              style={{ fontFamily: "Onest, sans-serif", fontWeight: 700 }}
            >
              {pct}%
            </p>
            <p className="text-[11px] text-[#AAAABB] mt-0.5">응답률</p>
          </div>
          <div className="w-20 h-1.5 bg-[#F7F7F9] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5B4BFA] rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <ChevronRight
            size={15}
            className="text-[#CCCCCC] group-hover:text-[#5B4BFA] transition-colors mt-1"
          />
        </div>
      </div>
    </motion.div>
  );
}
