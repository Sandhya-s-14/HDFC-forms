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
 
function getActualValue(input, stepsArray) {
  const sliderValue = Number(input.value);
  const lowerIndex = Math.floor(sliderValue);
  const upperIndex = Math.ceil(sliderValue);
 
  if (lowerIndex === upperIndex) {
    return stepsArray[lowerIndex];
  }
 
  const lowerValue = stepsArray[lowerIndex];
  const upperValue = stepsArray[upperIndex];
  const percentage = sliderValue - lowerIndex;
 
  return lowerValue + (upperValue - lowerValue) * percentage;
}
 
function formatActualValue(value, type) {
  if (type === "loan") {
    return Math.round(value / 1000) * 1000;
  }
 
  return Math.round(value);
}
 
/* ===== Update UI ===== */
function updateUI(input, wrapper, stepsArray, type) {
  const sliderValue = Number(input.value);
 
  const rawActualValue = getActualValue(input, stepsArray);
  const actualValue = formatActualValue(rawActualValue, type);
 
  const percent = (sliderValue / (stepsArray.length - 1)) * 100;
 
  input.dataset.actualValue = actualValue;
 
  const valueBox = wrapper.querySelector(".loan-value-box");
 
  if (valueBox) {
    valueBox.innerText =
      type === "loan" ? formatINR(actualValue) : formatMonths(actualValue);
 
    valueBox.style.left = percent + "%";
  }
 
  wrapper.style.setProperty("--percent", `${percent}%`);
}
 
/* ===== Click anywhere on track ===== */
function enableTrackClick(wrapper, input, stepsArray) {
  wrapper.addEventListener("click", (e) => {
    if (e.target !== input) {
      const rect = wrapper.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
 
      const indexValue = percent * (stepsArray.length - 1);
 
      input.value = indexValue;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
}
 
/* ===== Main ===== */
export default function decorate(fieldDiv) {
  const input = fieldDiv.querySelector("input");
  if (!input) return fieldDiv;
 
  const isLoan =
    fieldDiv.classList.contains("field-loanamount") ||
    fieldDiv.classList.contains("field-loanamt");
 
  const type = isLoan ? "loan" : "tenure";
  const stepsArray = isLoan ? LOAN_STEPS : TENURE_STEPS;
 
  const originalValue = Number(input.value || stepsArray[0]);
 
  input.type = "range";
  input.min = 0;
  input.max = stepsArray.length - 1;
  input.step = 0.01;
 
  const exactIndex = stepsArray.indexOf(originalValue);
  input.value = exactIndex >= 0 ? exactIndex : 0;
 
  const wrapper = document.createElement("div");
  wrapper.className = "range-widget-wrapper decorated";
  input.after(wrapper);
 
  const valueBox = document.createElement("div");
  valueBox.className = "loan-value-box";
  wrapper.appendChild(valueBox);
 
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
      input.value = i;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
 
    labels.appendChild(span);
  });
 
  wrapper.appendChild(input);
  wrapper.appendChild(labels);
 
  input.addEventListener("input", () => {
    updateUI(input, wrapper, stepsArray, type);
  });
 
  enableTrackClick(wrapper, input, stepsArray);
 
  updateUI(input, wrapper, stepsArray, type);
 
  return fieldDiv;
}