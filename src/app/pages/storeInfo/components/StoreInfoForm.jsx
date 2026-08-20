import { Save, X } from "lucide-react";
import { useState } from "react";
import { STORE_INFO_CATEGORIES } from "../../../lib/storeInfoDisplay";

const TITLE_MAX_LENGTH = 60;
const CONTENT_MAX_LENGTH = 1000;

export default function StoreInfoForm({ mode, initialValue, isSubmitting, errorMessage, onSubmit, onClose }) {
  const [category, setCategory] = useState(initialValue?.category ?? STORE_INFO_CATEGORIES[0].value);
  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [content, setContent] = useState(initialValue?.content ?? "");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setValidationError("제목을 입력해주세요.");
      return;
    }

    if (!trimmedContent) {
      setValidationError("내용을 입력해주세요.");
      return;
    }

    setValidationError("");
    onSubmit({ category, title: trimmedTitle, content: trimmedContent });
  };

  return (
    <div className="store-info-modal__backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="store-info-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-info-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="store-info-modal__header">
          <h2 id="store-info-modal-title">{mode === "edit" ? "매장 정보 수정" : "매장 정보 추가"}</h2>
          <button className="icon-button" type="button" title="닫기" onClick={onClose} disabled={isSubmitting}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="store-info-field">
            <label className="field-label" htmlFor="store-info-category">카테고리</label>
            <select
              id="store-info-category"
              className="text-input"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              disabled={isSubmitting}
            >
              {STORE_INFO_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          <div className="store-info-field">
            <label className="field-label" htmlFor="store-info-title">
              제목<span className="field-label__required">*</span>
            </label>
            <input
              id="store-info-title"
              className="text-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 우산 비치 위치"
              maxLength={TITLE_MAX_LENGTH}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="store-info-field">
            <label className="field-label" htmlFor="store-info-content">
              내용<span className="field-label__required">*</span>
            </label>
            <textarea
              id="store-info-content"
              className="text-area"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="워커가 물어봤을 때 AI가 그대로 답할 수 있도록 구체적으로 작성해주세요."
              maxLength={CONTENT_MAX_LENGTH}
              disabled={isSubmitting}
              required
            />
            <div className="store-info-field__meta">
              <span>{content.length}/{CONTENT_MAX_LENGTH}</span>
            </div>
          </div>

          {(validationError || errorMessage) && (
            <p className="task-create-form__error" role="alert">{validationError || errorMessage}</p>
          )}

          <div className="store-info-modal__actions">
            <button className="ghost-button" type="button" onClick={onClose} disabled={isSubmitting}>
              취소
            </button>
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : <><Save size={15} /> 저장하기</>}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
