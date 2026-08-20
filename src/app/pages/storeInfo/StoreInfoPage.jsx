import { CircleAlert, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import AppShell from "../../components/AppShell";
import StatusState from "../../components/StatusState";
import { ApiError } from "../../api/client";
import { getGroupDetail } from "../../api/groupApi";
import { createStoreInfo, deleteStoreInfo, getStoreInfoList, updateStoreInfo } from "../../api/storeInfoApi";
import {
  STORE_INFO_CATEGORIES,
  estimateStoreInfoUsage,
  formatStoreInfoUpdatedAt,
  getCategoryMeta,
  toStoreInfoItem,
} from "../../lib/storeInfoDisplay";
import StoreInfoForm from "./components/StoreInfoForm";
import "./StoreInfoPage.css";

const FILTER_ALL = "ALL";

export default function StoreInfoPage({ user }) {
  const { groupId } = useParams();
  const [currentGroup, setCurrentGroup] = useState(null);
  const [isGroupLoading, setIsGroupLoading] = useState(true);
  const [groupLoadError, setGroupLoadError] = useState(null);
  const [items, setItems] = useState([]);
  const [isListLoading, setIsListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(FILTER_ALL);
  const [modalState, setModalState] = useState(null); // null | { mode: "create" } | { mode: "edit", item }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const hasValidMemberSession = Boolean(user?.memberId);

  useEffect(() => {
    if (!hasValidMemberSession) {
      setIsGroupLoading(false);
      return;
    }

    let cancelled = false;

    async function loadGroup() {
      setIsGroupLoading(true);
      try {
        const group = await getGroupDetail({ groupId, memberId: user.memberId });
        if (!cancelled) setCurrentGroup(group);
      } catch (error) {
        if (!cancelled) {
          setCurrentGroup(null);
          setGroupLoadError(error);
        }
      } finally {
        if (!cancelled) setIsGroupLoading(false);
      }
    }

    loadGroup();
    return () => {
      cancelled = true;
    };
  }, [groupId, hasValidMemberSession, user?.memberId]);

  const hasManagerAccess = currentGroup?.role === "MANAGER";

  useEffect(() => {
    if (!hasManagerAccess) {
      setIsListLoading(false);
      return;
    }

    let cancelled = false;

    async function loadList() {
      setIsListLoading(true);
      setListError("");
      try {
        const data = await getStoreInfoList({ groupId, requesterId: user.memberId });
        if (!cancelled) setItems((data ?? []).map(toStoreInfoItem));
      } catch (error) {
        if (!cancelled) {
          setItems([]);
          setListError(
            error instanceof ApiError ? error.message : "매장 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요."
          );
        }
      } finally {
        if (!cancelled) setIsListLoading(false);
      }
    }

    loadList();
    return () => {
      cancelled = true;
    };
  }, [groupId, hasManagerAccess, user?.memberId]);

  const filteredItems = useMemo(
    () => (categoryFilter === FILTER_ALL ? items : items.filter((item) => item.category === categoryFilter)),
    [items, categoryFilter]
  );
  const usage = useMemo(() => estimateStoreInfoUsage(items), [items]);

  const closeModal = () => {
    if (isSubmitting) return;
    setModalState(null);
    setFormError("");
  };

  const handleSubmit = async ({ category, title, content }) => {
    setIsSubmitting(true);
    setFormError("");
    try {
      if (modalState.mode === "edit") {
        const updated = await updateStoreInfo({
          groupId,
          storeInfoId: modalState.item.id,
          managerId: user.memberId,
          category,
          title,
          content,
        });
        setItems((current) =>
          current.map((item) =>
            item.id === modalState.item.id
              ? toStoreInfoItem(updated ?? { storeInfoId: modalState.item.id, category, title, content, updatedAt: modalState.item.updatedAt })
              : item
          )
        );
      } else {
        const created = await createStoreInfo({ groupId, managerId: user.memberId, category, title, content });
        setItems((current) => [toStoreInfoItem(created), ...current]);
      }
      setModalState(null);
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : "매장 정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (deletingId) return;
    if (!window.confirm(`"${item.title}" 항목을 삭제할까요? 삭제하면 되돌릴 수 없습니다.`)) return;

    setDeletingId(item.id);
    try {
      await deleteStoreInfo({ groupId, storeInfoId: item.id, managerId: user.memberId });
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (error) {
      setListError(
        error instanceof ApiError ? error.message : "매장 정보를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (!hasValidMemberSession) {
    return <StatusState user={user} type="login" />;
  }

  if (isGroupLoading) {
    return (
      <AppShell user={user} title="매장 정보를 불러오는 중" description="잠시만 기다려주세요." backTo="/groups">
        <p className="group-grid__empty">그룹 정보를 불러오는 중이에요...</p>
      </AppShell>
    );
  }

  if (!currentGroup) {
    return (
      <StatusState
        user={user}
        type={groupLoadError instanceof ApiError && groupLoadError.status === 403 ? "access" : "group"}
        description={groupLoadError instanceof ApiError ? groupLoadError.message : undefined}
      />
    );
  }

  if (!hasManagerAccess) {
    return (
      <StatusState
        user={user}
        type="access"
        description="매장 정보 관리는 매니저만 이용할 수 있습니다. 그룹 상세로 돌아가주세요."
        actionLabel="그룹 상세로 이동"
        actionPath={`/groups/${groupId}`}
      />
    );
  }

  return (
    <AppShell
      user={user}
      title="매장 정보 관리"
      description={`${currentGroup.name}의 알바생이 AI에게 물어볼 수 있는 매장 정보를 등록·관리합니다.`}
      backTo={`/groups/${groupId}`}
      breadcrumbs={[
        { label: "내 그룹", path: "/groups" },
        { label: currentGroup.name, path: `/groups/${groupId}` },
        { label: "매장 정보 관리", path: `/groups/${groupId}/store-info`, current: true },
      ]}
      actions={
        <button className="primary-button" type="button" onClick={() => setModalState({ mode: "create" })}>
          <Plus size={16} />
          <span>정보 추가</span>
        </button>
      }
    >
      {usage.isNearLimit && (
        <div className="store-info-usage-warning page-card">
          <CircleAlert size={15} />
          <p>
            등록된 매장 정보가 많아 AI가 참고하는 글자 수 한도(약 {usage.limit.toLocaleString()}자)에 가까워졌어요
            (현재 약 {usage.total.toLocaleString()}자). 오래되었거나 중복된 항목을 정리해주세요. 한도를 넘으면 새로
            등록한 정보가 AI 답변에 반영되지 않을 수 있어요.
          </p>
        </div>
      )}

      <section className="page-card store-info-panel">
        <div className="store-info-filter" role="tablist" aria-label="매장 정보 카테고리">
          <button
            type="button"
            className={`store-info-filter__tab ${categoryFilter === FILTER_ALL ? "is-active" : ""}`}
            onClick={() => setCategoryFilter(FILTER_ALL)}
          >
            전체 <span>{items.length}</span>
          </button>
          {STORE_INFO_CATEGORIES.map((category) => {
            const count = items.filter((item) => item.category === category.value).length;
            return (
              <button
                key={category.value}
                type="button"
                className={`store-info-filter__tab ${categoryFilter === category.value ? "is-active" : ""}`}
                onClick={() => setCategoryFilter(category.value)}
              >
                {category.label} <span>{count}</span>
              </button>
            );
          })}
          <span className={`store-info-filter__usage ${usage.isNearLimit ? "is-warning" : ""}`}>
            약 {usage.total.toLocaleString()}/{usage.limit.toLocaleString()}자
          </span>
        </div>

        {isListLoading ? (
          <p className="group-grid__empty">매장 정보를 불러오는 중이에요...</p>
        ) : listError ? (
          <p className="task-create-form__error" role="alert">{listError}</p>
        ) : filteredItems.length === 0 ? (
          <div className="store-info-empty">
            <p>
              {items.length === 0
                ? "아직 등록된 매장 정보가 없어요. 알바생이 AI에게 물어봐도 답변할 수 없으니 먼저 정보를 등록해주세요."
                : "이 카테고리에 등록된 정보가 없어요."}
            </p>
            <button className="secondary-button" type="button" onClick={() => setModalState({ mode: "create" })}>
              <Plus size={14} />
              <span>정보 추가하기</span>
            </button>
          </div>
        ) : (
          <ul className="store-info-list">
            {filteredItems.map((item) => {
              const meta = getCategoryMeta(item.category);
              return (
                <li key={item.id} className="store-info-card">
                  <div className="store-info-card__top">
                    <span className={`store-info-pill store-info-pill--${meta.color}`}>{meta.label}</span>
                    <div className="store-info-card__actions">
                      <button
                        className="icon-button"
                        type="button"
                        title="수정"
                        onClick={() => setModalState({ mode: "edit", item })}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="icon-button"
                        type="button"
                        title="삭제"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.content}</p>
                  {item.updatedAt && <small>{formatStoreInfoUpdatedAt(item.updatedAt)} 수정됨</small>}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {modalState && (
        <StoreInfoForm
          mode={modalState.mode}
          initialValue={modalState.mode === "edit" ? modalState.item : null}
          isSubmitting={isSubmitting}
          errorMessage={formError}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </AppShell>
  );
}
