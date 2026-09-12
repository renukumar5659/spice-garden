const emptyStateStyles = `
  .empty-state-modern {
    width: 100%;
    max-width: 560px;
    margin: 24px auto;
    padding: 30px 22px;
    box-sizing: border-box;
    text-align: center;
    border: 1px solid #dedede;
    border-radius: 12px;
    background: #fff;
  }

  .empty-state-modern-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #dedede;
    border-radius: 10px;
    font-size: 22px;
  }

  .empty-state-modern h3 {
    margin: 0 0 7px;
    font-size: 17px;
    line-height: 1.35;
  }

  .empty-state-modern p {
    margin: 0 auto 16px;
    max-width: 430px;
    font-size: 13px;
    line-height: 1.55;
    opacity: 0.72;
  }

  .empty-state-modern-action {
    display: flex;
    justify-content: center;
  }

  @media (max-width: 520px) {
    .empty-state-modern {
      margin: 18px auto;
      padding: 24px 16px;
    }

    .empty-state-modern h3 {
      font-size: 16px;
    }

    .empty-state-modern p {
      font-size: 12px;
    }
  }
`;

export default function EmptyState({
  icon = "🍽️",
  title,
  message,
  action,
}) {
  return (
    <>
      <style>{emptyStateStyles}</style>

      <div className="empty-state-modern">
        <div className="empty-state-modern-icon" aria-hidden="true">
          {icon}
        </div>

        <h3>{title}</h3>

        <p>{message}</p>

        {action && (
          <div className="empty-state-modern-action">
            {action}
          </div>
        )}
      </div>
    </>
  );
}
