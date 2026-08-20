export const groups = [
  {
    id: "group-1",
    name: "성수 플래그십 스토어",
    description: "오픈 준비부터 마감 점검까지 현장 운영 업무를 관리합니다.",
    memberCount: 8,
    taskCount: 12,
    completedCount: 7,
    status: "active",
    accent: "mint",
    currentUserRole: "MANAGER",
  },
  {
    id: "group-2",
    name: "신입 크루 온보딩",
    description: "신규 입사자의 첫 주 체크리스트와 교육 이력을 확인합니다.",
    memberCount: 5,
    taskCount: 9,
    completedCount: 9,
    status: "completed",
    accent: "blue",
    currentUserRole: "WORKER",
  },
  {
    id: "group-3",
    name: "8월 프로모션 운영",
    description: "프로모션 소재, 재고, 매장 진열 상태를 함께 점검합니다.",
    memberCount: 11,
    taskCount: 15,
    completedCount: 4,
    status: "active",
    accent: "coral",
    currentUserRole: "WORKER",
  },
];

export const members = [
  { id: 1, name: "민준", role: "MANAGER", initial: "민", color: "violet" },
  { id: 2, name: "서연", role: "WORKER", initial: "서", color: "mint" },
  { id: 3, name: "도윤", role: "WORKER", initial: "도", color: "blue" },
  { id: 4, name: "하린", role: "WORKER", initial: "하", color: "coral" },
  { id: 5, name: "지호", role: "WORKER", initial: "지", color: "gold" },
];

export const tasks = [
  {
    id: "task-101",
    title: "오픈 전 매장 점검",
    assignee: "서연",
    status: "active",
    progress: 67,
    verification: "photo",
    subTaskCount: 6,
    completedSubTaskCount: 4,
  },
  {
    id: "task-102",
    title: "프로모션 POP 진열",
    assignee: "도윤",
    status: "waiting",
    progress: 25,
    verification: "none",
    subTaskCount: 4,
    completedSubTaskCount: 1,
  },
  {
    id: "task-103",
    title: "냉장 쇼케이스 온도 확인",
    assignee: "하린",
    status: "completed",
    progress: 100,
    verification: "none",
    subTaskCount: 3,
    completedSubTaskCount: 3,
  },
];

export const subTasks = [
  { id: "sub-1", title: "출입구와 유리문 청결 상태 확인", completed: true },
  { id: "sub-2", title: "조명과 디지털 사이니지 전원 켜기", completed: true },
  { id: "sub-3", title: "계산대 시재와 영수증 용지 확인", completed: true },
  { id: "sub-4", title: "메인 테이블 상품 진열 상태 확인", completed: true },
  { id: "sub-5", title: "오픈 준비가 끝난 매장 전경 촬영", completed: false, photo: true },
  { id: "sub-6", title: "특이사항을 매니저에게 공유", completed: false },
];
