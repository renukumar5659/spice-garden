const loadingStyles = `
  .loading-modern {
    width: 100%;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  .loading-modern-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #dedede;
    border-top-color: #222;
    border-radius: 50%;
    box-sizing: border-box;
    animation: loading-modern-spin 0.8s linear infinite;
  }

  @keyframes loading-modern-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 520px) {
    .loading-modern {
      min-height: 100px;
    }

    .loading-modern-spinner {
      width: 26px;
      height: 26px;
    }
  }
`;

export default function Loading() {
  return (
    <>
      <style>{loadingStyles}</style>

      <div className="loading-modern" role="status" aria-label="Loading">
        <span className="loading-modern-spinner" aria-hidden="true" />
      </div>
    </>
  );
}
