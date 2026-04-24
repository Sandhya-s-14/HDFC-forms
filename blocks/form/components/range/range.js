/* ===== Formatters ===== */
function formatINR(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}

function formatMonths(value) {
  return value + " months";
}

/* ===== Update Bubble + Value Box ===== */
function updateBubble(input, element) {
  const step = input.step || 1;
  const max = input.max || 0;
  const min = input.min || 1;
  const value = input.value || 1;

  const current = Math.ceil((value - min) / step);
  const total = Math.ceil((max - min) / step);

  const bubble = element.querySelector('.range-bubble');
  const valueBox = element.parentElement.querySelector('.loan-value-box');

  // Bubble positioning (existing logic)
  const bubbleWidth = bubble.getBoundingClientRect().width || 31;
  const left = `${(current / total) * 100}% - ${(current / total) * bubbleWidth}px`;

  // ===== Formatting logic =====
  let formattedValue;
  if (parseInt(max) > 100000) {
    formattedValue = formatINR(value);       // Loan Amount
  } else {
    formattedValue = formatMonths(value);    // Tenure
  }

  // Update UI
  bubble.innerText = formattedValue;

  if (valueBox) {
    valueBox.innerText = formattedValue;
  }

  // AEM CSS variables (DO NOT REMOVE)
  const steps = {
    '--total-steps': total,
    '--current-steps': current,
  };

  const style = Object.entries(steps)
    .map(([varName, varValue]) => `${varName}:${varValue}`)
    .join(';');

  bubble.style.left = `calc(${left})`;
  element.setAttribute('style', style);
}

/* ===== Main Decorate Function ===== */
export default async function decorate(fieldDiv, fieldJson) {
  const input = fieldDiv.querySelector('input');

  // Ensure range type
  input.type = 'range';
  input.min = input.min || 1;
  input.max = input.max || 100;
  input.step = fieldJson?.properties?.stepValue || 1;

  // Wrapper
  const div = document.createElement('div');
  div.className = 'range-widget-wrapper decorated';
  input.after(div);

  // Bubble
  const hover = document.createElement('span');
  hover.className = 'range-bubble';

  // Min / Max labels
  const rangeMinEl = document.createElement('span');
  rangeMinEl.className = 'range-min';

  const rangeMaxEl = document.createElement('span');
  rangeMaxEl.className = 'range-max';

  rangeMinEl.innerText = `${input.min || 1}`;
  rangeMaxEl.innerText = `${input.max}`;

  // ===== Value Box (NEW - Image 2 style) =====
  const valueBox = document.createElement('div');
  valueBox.className = 'loan-value-box';

  // Insert value box above slider
  fieldDiv.insertBefore(valueBox, div);

  // Append elements
  div.appendChild(hover);
  div.appendChild(input);
  div.appendChild(rangeMinEl);
  div.appendChild(rangeMaxEl);

  // Event listener
  input.addEventListener('input', (e) => {
    updateBubble(e.target, div);
  });

  // Initial render
  updateBubble(input, div);

  return fieldDiv;
}