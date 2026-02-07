import "@/index.css";
import { mountWidget, useWidgetState, useDisplayMode, useSendFollowUpMessage } from "skybridge/web";
import { useToolInfo } from "../helpers";

type Selections = Record<string, { id: string; name: string; price: number }>;

function PlanWedding() {
  const { output, isPending } = useToolInfo<"plan-wedding">();
  const [displayMode, setDisplayMode] = useDisplayMode();
  const sendMessage = useSendFollowUpMessage();
  const [{ currentStep, selections = {} as Selections }, setState] = useWidgetState({
    currentStep: 0,
    selections: {} as Selections,
  });

  // Show inline teaser until user clicks to go fullscreen
  if (displayMode !== "fullscreen") {
    return (
      <div className="inline-teaser" data-llm="Widget is in inline mode, waiting for user to open fullscreen planner">
        <div className="teaser-icon">&#128141;</div>
        <h2>Your Wedding Planner is Ready</h2>
        <p>Browse venues, catering, music, and more — all in one place.</p>
        <button className="teaser-btn" onClick={() => setDisplayMode("fullscreen")}>
          Start Choosing &rarr;
        </button>
      </div>
    );
  }

  if (isPending || !output?.categories) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        <p>Preparing your wedding planner...</p>
      </div>
    );
  }

  const { categories, guestCount } = output;
  const totalSteps = categories.length;
  const clampedStep = Math.min(currentStep, totalSteps);
  const isSummary = clampedStep >= totalSteps;
  const current = !isSummary ? categories[clampedStep] : null;

  // Calculate total budget
  let totalBudget = 0;
  for (const cat of categories) {
    const sel = selections[cat.key];
    if (sel) {
      totalBudget += cat.isPerPerson ? sel.price * guestCount : sel.price;
    }
  }

  const completedCount = Object.keys(selections).length;
  const allComplete = completedCount === totalSteps;

  const goTo = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const selectOption = (option: { id: string; name: string; price: number }) => {
    setState((prev) => ({
      ...prev,
      selections: { ...prev.selections, ...(current ? { [current.key]: option } : {}) },
    }));
  };

  const goNext = () => {
    if (clampedStep < totalSteps) {
      setState((prev) => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, totalSteps) }));
    }
  };

  const goPrev = () => {
    if (clampedStep > 0) {
      setState((prev) => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 0) }));
    }
  };

  return (
    <div
      className="planner"
      data-llm={
        isSummary || !current
          ? `Viewing wedding plan summary: ${completedCount}/${totalSteps} selected, total $${totalBudget.toLocaleString()}`
          : selections[current.key]
            ? `On ${current.label}: selected "${selections[current.key].name}"`
            : `On ${current.label}: browsing options`
      }
    >
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>Wedding Planner</h1>
        </div>
        <ul className="step-list">
          {categories.map((cat, i) => {
            const isActive = clampedStep === i;
            const isDone = !!selections[cat.key];
            return (
              <li key={cat.key}>
                <button
                  className={`step-item ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
                  onClick={() => goTo(i)}
                >
                  <span className="step-number">{isDone ? "\u2713" : i + 1}</span>
                  <span className="step-label">{cat.label}</span>
                  {isDone && <span className="step-selected">{selections[cat.key].name}</span>}
                </button>
              </li>
            );
          })}
          <li>
            <button
              className={`step-item summary-step ${isSummary ? "active" : ""} ${allComplete ? "done" : ""}`}
              onClick={() => goTo(totalSteps)}
            >
              <span className="step-number">{allComplete ? "\u2713" : "\u2211"}</span>
              <span className="step-label">Summary</span>
            </button>
          </li>
        </ul>
        <div className="sidebar-budget">
          <span className="budget-label">Estimated Total</span>
          <span className="budget-amount">${totalBudget.toLocaleString()}</span>
        </div>
      </nav>

      {/* Main content */}
      <main className="main-content">
        {!isSummary && current ? (
          <>
            <div className="content-header">
              <div className="content-step">Step {clampedStep + 1} of {totalSteps}</div>
              <h2>{current.label}</h2>
              <p className="content-intro">{current.intro}</p>
            </div>

            <div className="options-grid">
              {current.options.map((option) => {
                const isSelected = selections[current.key]?.id === option.id;
                return (
                  <button
                    key={option.id}
                    className={`option-card ${isSelected ? "selected" : ""}`}
                    onClick={() => selectOption(option)}
                  >
                    <div className="card-image">
                      <img src={option.imageUrl} alt={option.name} loading="lazy" />
                      {isSelected && <div className="selected-badge">Selected</div>}
                    </div>
                    <div className="card-body">
                      <h3>{option.name}</h3>
                      <p className="card-desc">{option.description}</p>
                      <div className="card-tags">
                        {option.details.map((d, j) => (
                          <span key={j} className="tag">{d}</span>
                        ))}
                      </div>
                      <div className="card-price">
                        ${option.price.toLocaleString()}
                        {current.isPerPerson && <span className="price-unit">/person</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="nav-bar">
              <button className="nav-btn secondary" onClick={goPrev} disabled={clampedStep === 0}>
                &larr; Back
              </button>
              <button
                className="nav-btn primary"
                onClick={goNext}
                disabled={!selections[current.key]}
              >
                {clampedStep === totalSteps - 1 ? "View Summary" : "Next"}
                <span>&rarr;</span>
              </button>
            </div>
          </>
        ) : (
          /* Summary view */
          <>
            <div className="content-header">
              <h2>Your Wedding Plan</h2>
              <p className="content-intro">
                {completedCount} of {totalSteps} categories selected &middot; {guestCount} guests
              </p>
            </div>

            <div className="summary-list">
              {categories.map((cat) => {
                const sel = selections[cat.key];
                const selOption = sel ? cat.options.find((o) => o.id === sel.id) : null;
                const totalPrice = sel
                  ? cat.isPerPerson ? sel.price * guestCount : sel.price
                  : 0;

                return (
                  <div
                    key={cat.key}
                    className={`summary-item ${sel ? "" : "empty"}`}
                    onClick={() => goTo(categories.indexOf(cat))}
                  >
                    {selOption && (
                      <div className="summary-img">
                        <img src={selOption.imageUrl} alt={sel.name} />
                      </div>
                    )}
                    <div className="summary-info">
                      <span className="summary-category">{cat.label}</span>
                      {sel ? (
                        <>
                          <span className="summary-name">{sel.name}</span>
                          <span className="summary-price">
                            ${totalPrice.toLocaleString()}
                            {cat.isPerPerson && ` ($${sel.price}/person × ${guestCount})`}
                          </span>
                        </>
                      ) : (
                        <span className="summary-empty">Not yet selected — click to choose</span>
                      )}
                    </div>
                    <span className="summary-edit">{sel ? "Change" : "Select"}</span>
                  </div>
                );
              })}
            </div>

            <div className="summary-total">
              <span>Estimated Total</span>
              <span className="total-amount">${totalBudget.toLocaleString()}</span>
            </div>

            {allComplete && (
              <div className="nav-bar">
                <button
                  className="nav-btn primary share-btn"
                  onClick={() => {
                    const summary = categories
                      .map((cat) => {
                        const sel = selections[cat.key];
                        const price = cat.isPerPerson ? sel.price * guestCount : sel.price;
                        return `${cat.label}: ${sel.name} ($${price.toLocaleString()})`;
                      })
                      .join(", ");
                    sendMessage(
                      `The user has completed their wedding plan! Here's what they chose: ${summary}. Total: $${totalBudget.toLocaleString()} for ${guestCount} guests. ` +
                      `Please celebrate their choices, highlight how they complement each other, and offer any final tips.`,
                    );
                  }}
                >
                  Share Plan with Planner
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default PlanWedding;
mountWidget(<PlanWedding />);
