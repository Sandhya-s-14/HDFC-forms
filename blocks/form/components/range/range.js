/* ===== Step Values ===== */
const LOAN_STEPS = [50000, 200000, 400000, 600000, 800000, 1000000, 1500000];
const TENURE_STEPS = [12, 24, 36, 48, 60, 72, 84];

/* ===== Formatters ===== */
function formatINR(value) {
  return "₹" + value.toLocaleString("en-IN");
}

function formatLabel(value, isLoan) {
  if (!isLoan) return value + "m";
  if (value >= 100000) return (value / 100000) + "L";
  return (value / 1000) + "K";
}

/* ===== Update UI ===== */
function updateUI(input, wrapper, stepsArray, isLoan) {
  const index = parseInt(input.value);
  const actualValue = stepsArray[index];

  const bubble = wrapper.querySelector('.range-bubble');
  const valueBox = wrapper.parentElement.querySelector('.loan-value-box');

  // Format display value
  const formatted = isLoan ? formatINR(actualValue) : actualValue + " months";

  // Update UI
  if (bubble) bubble.innerText = formatted;
  if (valueBox) valueBox.innerText = formatted;

  // AEM progress variables
  wrapper.style.setProperty('--total-steps', stepsArray.length - 1);
  wrapper.style.setProperty('--current-steps', index);
}

/* ===== Main Decorate Function ===== */
export default async function decorate(fieldDiv) {
  const input = fieldDiv.querySelector('input');

  // Detect type
  const isLoan = fieldDiv.innerText.includes("Loan Amount");

  const stepsArray = isLoan ? LOAN_STEPS : TENURE_STEPS;

  /* ===== Convert to step slider ===== */
  input.type = 'range';
  input.min = 0;
  input.max = stepsArray.length - 1;
  input.step = 1;
  input.value = stepsArray.length - 1;

  /* ===== Wrapper ===== */
  const wrapper = document.createElement('div');
  wrapper.className = 'range-widget-wrapper decorated';
  input.after(wrapper);

  /* ===== Bubble (optional, can hide via CSS) ===== */
  const bubble = document.createElement('span');
  bubble.className = 'range-bubble';

  /* ===== Labels ===== */
  const labels = document.createElement('div');
  labels.className = 'range-labels';

  stepsArray.forEach(val => {
    const span = document.createElement('span');
    span.innerText = formatLabel(val, isLoan);
    labels.appendChild(span);
  });

  /* ===== Value Box ===== */
  const valueBox = document.createElement('div');
  valueBox.className = 'loan-value-box';

  fieldDiv.insertBefore(valueBox, wrapper);

  /* ===== Append elements ===== */
  wrapper.appendChild(bubble);
  wrapper.appendChild(input);
  wrapper.appendChild(labels);

  /* ===== Events ===== */
  input.addEventListener('input', () => {
    updateUI(input, wrapper, stepsArray, isLoan);
  });

  /* ===== Initial Render ===== */
  updateUI(input, wrapper, stepsArray, isLoan);

  return fieldDiv;
}