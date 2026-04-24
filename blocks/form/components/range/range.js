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
  const actualValue = parseInt(input.value);

  // Snap to nearest step
  const index = getNearestIndex(actualValue, stepsArray);
  const snappedValue = stepsArray[index];

  // Force slider to snap
  input.value = snappedValue;

  const valueBox = wrapper.parentElement.querySelector('.loan-value-box');

  const formatted = type === "loan"
    ? formatINR(snappedValue)
    : formatMonths(snappedValue);

  if (valueBox) valueBox.innerText = formatted;

  // Progress
  wrapper.style.setProperty('--total-steps', stepsArray.length - 1);
  wrapper.style.setProperty('--current-steps', index);
}

/* ===== Main Decorate ===== */
export default async function decorate(fieldDiv) {
  const input = fieldDiv.querySelector('input');

  // Detect using label text (stable enough here)
  const label = fieldDiv.closest('.number-wrapper')?.previousElementSibling?.innerText || "";
  const type = label.includes("Amount") ? "loan" : "tenure";

  const stepsArray = type === "loan" ? LOAN_STEPS : TENURE_STEPS;

  /* ===== IMPORTANT: use real values (NOT index) ===== */
  input.type = 'range';
  input.min = stepsArray[0];
  input.max = stepsArray[stepsArray.length - 1];
  input.step = 1; // allow smooth movement

  /* ===== Wrapper ===== */
  const wrapper = document.createElement('div');
  wrapper.className = 'range-widget-wrapper decorated';
  input.after(wrapper);

  /* ===== Value Box ===== */
  const valueBox = document.createElement('div');
  valueBox.className = 'loan-value-box';
  fieldDiv.insertBefore(valueBox, wrapper);

  /* ===== Labels ===== */
  const labels = document.createElement('div');
  labels.className = 'range-labels';

  stepsArray.forEach(val => {
    const span = document.createElement('span');

    if (type === "loan") {
      span.innerText = val >= 100000
        ? (val / 100000) + "L"
        : (val / 1000) + "K";
    } else {
      span.innerText = val + "m";
    }

    labels.appendChild(span);
  });

  /* ===== Append ===== */
  wrapper.appendChild(input);
  wrapper.appendChild(labels);

  /* ===== Events ===== */
  input.addEventListener('input', () => {
    updateUI(input, wrapper, stepsArray, type);
  });

  input.addEventListener('change', () => {
    updateUI(input, wrapper, stepsArray, type);
  });

  /* ===== Initial ===== */
  updateUI(input, wrapper, stepsArray, type);

  return fieldDiv;
}
