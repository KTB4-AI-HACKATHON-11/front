// 매장 정보(Store Info) 표시용 유틸: 카테고리 라벨/색상 매핑과 백엔드 응답 변환을 담당합니다.

export const STORE_INFO_CATEGORIES = [
  { value: "LOCATION", label: "상품 위치", color: "mint" },
  { value: "PROMOTION", label: "행사·프로모션", color: "coral" },
  { value: "DELIVERY", label: "택배·입고", color: "blue" },
  { value: "EQUIPMENT", label: "장비 사용법", color: "gold" },
  { value: "RULE", label: "운영 규칙", color: "violet" },
  { value: "ETC", label: "기타", color: "gray" },
];

const CATEGORY_MAP = new Map(STORE_INFO_CATEGORIES.map((item) => [item.value, item]));

export function getCategoryMeta(category) {
  return CATEGORY_MAP.get(category) ?? { value: category, label: category || "기타", color: "gray" };
}

export function formatStoreInfoUpdatedAt(updatedAt) {
  if (!updatedAt) return "";

  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// 백엔드 응답을 화면에서 쓰는 모양으로 변환합니다.
export function toStoreInfoItem(item) {
  return {
    id: String(item.storeInfoId),
    category: item.category,
    title: item.title,
    content: item.content,
    updatedAt: item.updatedAt,
  };
}

// AI 백엔드(POST /v1/knowledge/answer)의 information 필드 상한입니다. 제품 백엔드는 그룹에 등록된 매장 정보를
// 전부 줄바꿈으로 합쳐 이 필드로 보내므로, 등록된 정보가 많아질수록 이 한도에 가까워집니다.
export const STORE_INFO_CHARACTER_LIMIT = 60000;
const STORE_INFO_WARNING_RATIO = 0.8;

/**
 * 등록된 매장 정보 전체를 합쳤을 때의 글자 수를 추정합니다.
 * 실제 전송 포맷(번호 매김, 구분 기호 등)은 제품 백엔드가 정하므로 정확한 값은 아니고,
 * AI 한도 초과를 미리 경고하기 위한 보수적인 근사치입니다.
 * @param {Array<{ title?: string, content?: string }>} items
 */
export function estimateStoreInfoUsage(items) {
  const total = (items ?? []).reduce(
    (sum, item) => sum + (item.title?.length ?? 0) + (item.content?.length ?? 0) + 2,
    0
  );

  return {
    total,
    limit: STORE_INFO_CHARACTER_LIMIT,
    isNearLimit: total / STORE_INFO_CHARACTER_LIMIT >= STORE_INFO_WARNING_RATIO,
  };
}
