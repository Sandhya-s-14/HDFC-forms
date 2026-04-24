/* ===== Step Values (ONLY for labels) ===== */
const LOAN_STEPS = [50000, 200000, 400000, 600000, 800000, 1000000, 1500000];
const TENURE_STEPS = [12, 24, 36, 48, 60, 72, 84];

/* ===== Formatters ===== */
const formatINR = (v) => "₹" + Number(v).toLocaleString("en-IN");
const formatMonths = (v) => v + " months";

/* ===== Update UI ===== */
function updateUI(input, wrapper, type) {
  const value = parseInt(input.value);

  const min = parseInt(input.min);
  const max = parseInt(input.max);

  const percent = ((value - min) / (max - min)) * 100;

  // move value box
  const valueBox = wrapper.querySelector(".loan-value-box");
  if (valueBox) {
    valueBox.innerText =
      type === "loan" ? formatINR(value) : formatMonths(value);

    valueBox.style.left = percent + "%";
  }

  wrapper.style.setProperty("--percent", percent);
}

/* ===== Click ===== */
function enableTrackClick(wrapper, input) {
  wrapper.addEventListener("click", (e) => {
    if (e.target !== input) {
      const rect = wrapper.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;

      const min = parseInt(input.min);
      const max = parseInt(input.max);

      input.value = Math.round(min + percent * (max - min));
      input.dispatchEvent(new Event("input"));
    }
  });
}

/* ===== Main ===== */
export default function decorate(fieldDiv) {
  const input = fieldDiv.querySelector("input");

  const isLoan = parseInt(input.max) > 100000;
  const type = isLoan ? "loan" : "tenure";
  const stepsArray = isLoan ? LOAN_STEPS : TENURE_STEPS;

  /* ===== Continuous Slider ===== */
  input.type = "range";
  input.min = stepsArray[0];
  input.max = stepsArray[stepsArray.length - 1];
  input.step = isLoan ? 1000 : 1; // smooth

  /* ===== Wrapper ===== */
  const wrapper = document.createElement("div");
  wrapper.className = "range-widget-wrapper decorated";
  input.after(wrapper);

  /* ===== Value Box ===== */
  const valueBox = document.createElement("div");
  valueBox.className = "loan-value-box";
  wrapper.appendChild(valueBox);

  /* ===== Labels (equal spacing) ===== */
  const labels = document.createElement("div");
  labels.className = "range-labels";

  stepsArray.forEach((val, i) => {
    const span = document.createElement("span");

    span.innerText =
      type === "loan"
        ? val >= 100000
          ? val / 100000 + "L"
          : val / 1000 + "K"
        : val + "m";

    // evenly spaced labels
    const percent = (i / (stepsArray.length - 1)) * 100;
    span.style.left = percent + "%";

    labels.appendChild(span);
  });

  wrapper.appendChild(input);
  wrapper.appendChild(labels);

  input.addEventListener("input", () => updateUI(input, wrapper, type));
  enableTrackClick(wrapper, input);

  updateUI(input, wrapper, type);

  return fieldDiv;
}