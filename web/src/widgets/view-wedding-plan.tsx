import "@/index.css";
import { mountWidget } from "skybridge/web";
import { useToolInfo } from "../helpers";

function ViewWeddingPlan() {
  const { output, isPending, responseMetadata } = useToolInfo<"view-wedding-plan">();

  if (isPending || !output) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        <p>Preparing your wedding plan...</p>
      </div>
    );
  }

  const { planItems, guestCount, totalBudget, categoriesCompleted, totalCategories } = output;
  const images = responseMetadata?.images || [];

  return (
    <div
      className="plan-container"
      data-llm={`Wedding plan: ${categoriesCompleted}/${totalCategories} categories, ${guestCount} guests, total $${totalBudget.toLocaleString()}`}
    >
      <div className="plan-header">
        <h2>Your Wedding Plan</h2>
        <p className="plan-subtitle">
          {guestCount} guests &middot; {categoriesCompleted} of {totalCategories} categories selected
        </p>
      </div>

      <div className="plan-items">
        {planItems.map((item, i) => (
          <div key={item.category} className="plan-item">
            <div className="plan-item-image">
              <img src={images[i]} alt={item.name} loading="lazy" />
            </div>
            <div className="plan-item-info">
              <span className="plan-item-category">{item.categoryLabel}</span>
              <h3>{item.name}</h3>
              <div className="plan-item-price">
                ${item.totalPrice.toLocaleString()}
                {item.isPerPerson && (
                  <span className="price-breakdown">
                    (${item.price}/person &times; {guestCount})
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="plan-total">
        <span>Estimated Total</span>
        <span className="total-amount">${totalBudget.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default ViewWeddingPlan;
mountWidget(<ViewWeddingPlan />);
