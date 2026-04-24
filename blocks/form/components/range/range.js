/* ===== Step Values ===== */
const LOAN_STEPS = [50000, 200000, 400000, 600000, 800000, 1000000, 1500000];
const TENURE_STEPS = [12, 24, 36, 48, 60, 72, 84];

/* ===== Formatters ===== */
function formatINR(value) {
  return "₹" + value.toLocaleString("en-IN");
}

function formatMonths(value) {
  return value + " months";
}

/* ===== Find nearest step ===== */
function getNearestIndex(value, stepsArray) {
  let closestIndex = 0;
  let minDiff = Infinity;

  stepsArray.forEach((step, index) => {
    const diff = Math.abs(step - value);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = index;
    }
  });

  return closestIndex;
}

/* ===== Update UI ===== */
function updateUI(input, wrapper, stepsArray, type) {
  let rawValue = parseInt(input.value);

  // Snap to nearest step
  const index = getNearestIndex(rawValue, stepsArray);
  const snappedValue = stepsArray[index];

  input.value = snappedValue;

  // Format value
  const formatted =
    type === "loan"
      ? formatINR(snappedValue)
      : formatMonths(snappedValue);

  // Update value box
  const valueBox = wrapper.parentElement.querySelector(".loan-value-box");
  if (valueBox) valueBox.innerText = formatted;

  // Progress bar
  wrapper.style.setProperty("--total-steps", stepsArray.length - 1);
  wrapper.style.setProperty("--current-steps", index);
}

/* ===== Main Decorate ===== */
export default async function decorate(fieldDiv) {
  const input = fieldDiv.querySelector("input");

  // ✅ BEST detection: based on max value
  const originalMax = parseInt(input.max);

  const isLoan = originalMax > 100000;
  const stepsArray = isLoan ? LOAN_STEPS : TENURE_STEPS;
  const type = isLoan ? "loan" : "tenure";

  /* ===== Setup slider ===== */
  input.type = "range";
  input.min = stepsArray[0];
  input.max = stepsArray[stepsArray.length - 1];
  input.step = 1;

  /* ===== Wrapper ===== */
  const wrapper = document.createElement("div");
  wrapper.className = "range-widget-wrapper decorated";
  input.after(wrapper);

  /* ===== Value Box (TOP RIGHT) ===== */
  const valueBox = document.createElement("div");
  valueBox.className = "loan-value-box";
  fieldDiv.insertBefore(valueBox, wrapper);

  /* ===== Labels ===== */
  const labels = document.createElement("div");
  labels.className = "range-labels";

  stepsArray.forEach((val) => {
    const span = document.createElement("span");

    if (type === "loan") {
      span.innerText = val >= 100000
        ? val / 100000 + "L"
        : val / 1000 + "K";
    } else {
      span.innerText = val + "m";
    }

    labels.appendChild(span);
  });

  /* ===== Append ===== */
  wrapper.appendChild(input);
  wrapper.appendChild(labels);

  /* ===== Events ===== */
  input.addEventListener("input", () => {
    updateUI(input, wrapper, stepsArray, type);
  });

  input.addEventListener("change", () => {
    updateUI(input, wrapper, stepsArray, type);
  });

  /* ===== Initial Load ===== */
  updateUI(input, wrapper, stepsArray, type);

  return fieldDiv;
}