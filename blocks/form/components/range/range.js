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

/* ===== Update UI ===== */
function updateUI(input, wrapper, stepsArray, type) {
  const index = parseInt(input.value);
  const actualValue = stepsArray[index];

  const valueBox = wrapper.parentElement.querySelector('.loan-value-box');

  let formatted;
  if (type === "loan") {
    formatted = formatINR(actualValue);
  } else {
    formatted = formatMonths(actualValue);
  }

  if (valueBox) valueBox.innerText = formatted;

  // AEM progress
  wrapper.style.setProperty('--total-steps', stepsArray.length - 1);
  wrapper.style.setProperty('--current-steps', index);
}

/* ===== Main Decorate ===== */
export default async function decorate(fieldDiv, fieldJson) {
  const input = fieldDiv.querySelector('input');

  // ✅ Correct detection using label
  const labelText = fieldDiv.querySelector('label')?.innerText || "";

  const type = labelText.includes("Amount") ? "loan" : "tenure";

  const stepsArray = type === "loan" ? LOAN_STEPS : TENURE_STEPS;

  /* ===== Convert to step slider ===== */
  input.type = 'range';
  input.min = 0;
  input.max = stepsArray.length - 1;
  input.step = 1;
  input.value = stepsArray.length - 1;

  /* ===== Remove unwanted duplicate text ===== */
  const existingText = fieldDiv.querySelectorAll("p");
  existingText.forEach(el => el.remove());

  /* ===== Wrapper ===== */
  const wrapper = document.createElement('div');
  wrapper.className = 'range-widget-wrapper decorated';
  input.after(wrapper);

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

  /* ===== Value Box ===== */
  const valueBox = document.createElement('div');
  valueBox.className = 'loan-value-box';

  fieldDiv.insertBefore(valueBox, wrapper);

  /* ===== Append ===== */
  wrapper.appendChild(input);
  wrapper.appendChild(labels);

  /* ===== Events ===== */
  input.addEventListener('input', () => {
    updateUI(input, wrapper, stepsArray, type);
  });

  /* ===== Initial ===== */
  updateUI(input, wrapper, stepsArray, type);

  return fieldDiv;
}