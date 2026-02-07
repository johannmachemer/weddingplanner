import "@/index.css";
import { mountWidget, useWidgetState, useSendFollowUpMessage } from "skybridge/web";
import { useToolInfo } from "../helpers";

function BrowseOptions() {
  const { output, isPending, responseMetadata } = useToolInfo<"browse-options">();
  const [{ selectedId }, setState] = useWidgetState({ selectedId: null as string | null });
  const sendMessage = useSendFollowUpMessage();

  if (isPending || !output) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        <p>Finding the best options for you...</p>
      </div>
    );
  }

  const { categoryLabel, step, totalSteps, nextCategory, nextCategoryLabel, isPerPerson, options } = output;
  const images = responseMetadata?.images || [];
  const selectedOption = options.find((o) => o.id === selectedId);

  return (
    <div
      className="browse-container"
      data-llm={
        selectedOption
          ? `Selected ${categoryLabel}: "${selectedOption.name}" ($${selectedOption.price}${isPerPerson ? "/person" : ""})`
          : `Browsing ${categoryLabel} — no selection yet`
      }
    >
      <div className="browse-header">
        <div className="step-indicator">
          Step {step} of {totalSteps}
        </div>
        <h2>{categoryLabel}</h2>
        <p className="browse-subtitle">Choose the perfect option for your wedding</p>
      </div>

      <div className="options-grid">
        {options.map((option, i) => (
          <button
            key={option.id}
            className={`option-card ${selectedId === option.id ? "selected" : ""}`}
            onClick={() => setState((prev) => ({ ...prev, selectedId: option.id }))}
          >
            <div className="card-image">
              <img src={images[i]} alt={option.name} loading="lazy" />
              {selectedId === option.id && <div className="selected-badge">Selected</div>}
            </div>
            <div className="card-content">
              <h3>{option.name}</h3>
              <p className="card-description">{option.description}</p>
              <div className="card-details">
                {option.details.map((detail, j) => (
                  <span key={j} className="detail-tag">
                    {detail}
                  </span>
                ))}
              </div>
              <div className="card-price">
                ${option.price.toLocaleString()}
                {isPerPerson && <span className="price-unit">/person</span>}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedId && (
        <div className="action-bar">
          <button
            className="continue-btn"
            onClick={() => {
              if (nextCategory) {
                sendMessage(
                  `The user selected "${selectedOption?.name}" ($${selectedOption?.price}${isPerPerson ? "/person" : ""}) for ${categoryLabel}. ` +
                  `Respond with a brief, warm acknowledgment of their choice — add a short expert insight about why it's a great pick. ` +
                  `Then introduce the next category (${nextCategoryLabel}) and call browse-options with category="${nextCategory}".`,
                );
              } else {
                sendMessage(
                  `The user selected "${selectedOption?.name}" for ${categoryLabel} — that completes all categories! ` +
                  `Briefly celebrate this final choice, then show the complete wedding plan by calling view-wedding-plan with all their selections.`,
                );
              }
            }}
          >
            {nextCategory ? `Continue to ${nextCategoryLabel}` : "View Wedding Plan"}
            <span className="btn-arrow">&rarr;</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default BrowseOptions;
mountWidget(<BrowseOptions />);
