import { dismissSaveError, retryFailedSave, useSaveFailed } from '../lib/saveStatus.js';

// "Не получилось сохранить" banner at the bottom of any screen (task Z-16).
// Texts approved by Yana (V-52, 2026-11-16).
export default function SaveNotice() {
  const failed = useSaveFailed();
  if (!failed) return null;
  return (
    <div className="save-notice" role="alert">
      <p className="save-notice-text">
        Не получилось сохранить. Проверь интернет-соединение.
      </p>
      <div className="save-notice-actions">
        <button type="button" className="save-notice-retry" onClick={retryFailedSave}>
          Повторить
        </button>
        <button type="button" className="save-notice-close" onClick={dismissSaveError} aria-label="Закрыть">
          ×
        </button>
      </div>
    </div>
  );
}
