/* ===== Step Values ===== */
const LOAN_STEPS = [50000, 200000, 400000, 600000, 800000, 1000000, 1500000];
const TENURE_STEPS = [12, 24, 36, 48, 60, 72, 84];

/* ===== Formatters ===== */
function formatINR(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}

function formatMonths(value) {
  return Math.round(value) + " months";
}

/* ===== Get interpolated value ===== */
function getActualValue(input, stepsArray) {
  const sliderValue = Number(input._sliderValue);

  const lowerIndex = Math.floor(sliderValue);
  const upperIndex = Math.ceil(sliderValue);

  if (lowerIndex === upperIndex) {
    return stepsArray[lowerIndex];
  }

  const lowerValue = stepsArray[lowerIndex];
  const upperValue = stepsArray[upperIndex];

  return lowerValue + (upperValue - lowerValue) * (sliderValue - lowerIndex);
}

/* ===== Normalize values ===== */
function normalizeValue(value, type) {
  return type === "loan"
    ? Math.round(value / 1000) * 1000
    : Math.round(value);
}

/* ===== Update UI ===== */
function updateUI(input, wrapper, stepsArray, type) {
  const sliderValue = Number(input._sliderValue);

  const rawValue = getActualValue(input, stepsArray);
  const actualValue = normalizeValue(rawValue, type);

  const percent = (sliderValue / (stepsArray.length - 1)) * 100;

  const valueBox = wrapper.querySelector(".loan-value-box");

  if (valueBox) {
    valueBox.innerText =
      type === "loan" ? formatINR(actualValue) : formatMonths(actualValue);

    valueBox.style.left = percent + "%";
  }

  wrapper.style.setProperty("--percent", percent);

  // 🔥 store actual value for API
  input._actualValue = actualValue;
}

/* ===== Click on track ===== */
function enableTrackClick(wrapper, input, stepsArray) {
  wrapper.addEventListener("click", (e) => {
    if (e.target === input) return;

    const rect = input.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;

    const clamped = Math.max(0, Math.min(1, percent));
    const value = clamped * (stepsArray.length - 1);

    // ✅ ONLY update slider state (NOT input.value)
    input._sliderValue = value;

    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

/* ===== Main ===== */
export default function decorate(fieldDiv) {
  const input = fieldDiv.querySelector("input");
  if (!input) return fieldDiv;

  const originalMax = Number(input.getAttribute("max"));
  const isLoan = originalMax > 100000;

  const type = isLoan ? "loan" : "tenure";
  const stepsArray = isLoan ? LOAN_STEPS : TENURE_STEPS;

  /* ===== Slider Setup ===== */
  input.type = "range";
  input.min = 0;
  input.max = stepsArray.length - 1;
  input.step = 0.01;

  const initialValue = Number(input.value || stepsArray[0]);
  const stepIndex = stepsArray.indexOf(initialValue);

  input._sliderValue = stepIndex >= 0 ? stepIndex : 0;

  /* ===== VALUE OVERRIDE (KEEP THIS) ===== */
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  );

  Object.defineProperty(input, "value", {
    get() {
      if (this._actualValue !== undefined) {
        return this._actualValue; // API reads this
      }
      return originalDescriptor.get.call(this);
    },
    set(val) {
      this._sliderValue = Number(val); // sync slider
      originalDescriptor.set.call(this, val);
    }
  });

  /* ===== Wrapper ===== */
  const wrapper = document.createElement("div");
  wrapper.className = "range-widget-wrapper decorated";
  input.after(wrapper);

  /* ===== Value Box ===== */
  const valueBox = document.createElement("div");
  valueBox.className = "loan-value-box";
  wrapper.appendChild(valueBox);

  /* ===== Labels ===== */
  const labels = document.createElement("div");
  labels.className = "range-labels";

  stepsArray.forEach((val, i) => {
    const span = document.createElement("span");

    span.innerText =
      type === "loan"
        ? val === 50000
          ? "50K"
          : val / 100000 + "L"
        : val + "m";

    span.style.left = `${(i / (stepsArray.length - 1)) * 100}%`;

    span.addEventListener("click", () => {
      input._sliderValue = i;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    labels.appendChild(span);
  });

  wrapper.appendChild(input);
  wrapper.appendChild(labels);

  /* ===== Events ===== */
  input.addEventListener("input", () => {
    // 🔥 sync when user drags thumb
    input._sliderValue = Number(originalDescriptor.get.call(input));

    updateUI(input, wrapper, stepsArray, type);
  });

  enableTrackClick(wrapper, input, stepsArray);

  updateUI(input, wrapper, stepsArray, type);

  return fieldDiv;
}