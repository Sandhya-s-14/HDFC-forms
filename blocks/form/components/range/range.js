/* ===== Step Values ===== */
const LOAN_STEPS = [50000, 200000, 400000, 600000, 800000, 1000000, 1500000];
const TENURE_STEPS = [12, 24, 36, 48, 60, 72, 84];

/* ===== Formatters ===== */
function formatINR(value) {
  return "₹" + Number(value).toLocaleString("en-IN");
}

function formatMonths(value) {
  return value + " months";
}

/* ===== Get nearest step ===== */
function getNearestStep(value, steps) {
  return steps.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

/* ===== Update UI ===== */
function updateUI(input, wrapper, stepsArray, type) {
  const rawValue = parseInt(input.value);

  // ✅ Snap ONLY for display
  const snappedValue = getNearestStep(rawValue, stepsArray);

  // Format
  const formatted =
    type === "loan"
      ? formatINR(snappedValue)
      : formatMonths(snappedValue);

  // Update value box
  const valueBox = wrapper.parentElement.querySelector(".loan-value-box");
  if (valueBox) valueBox.innerText = formatted;

  // ✅ Smooth progress (based on raw value)
  const min = parseInt(input.min);
  const max = parseInt(input.max);

  const percent = ((rawValue - min) / (max - min)) * 100;
  wrapper.style.setProperty("--percent", percent);
}

/* ===== Click anywhere on track ===== */
function enableTrackClick(wrapper, input) {
  wrapper.addEventListener("click", (e) => {
    if (e.target !== input) {
      const rect = wrapper.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;

      const min = parseInt(input.min);
      const max = parseInt(input.max);

      const newValue = Math.round(min + percent * (max - min));
      input.value = newValue;

      input.dispatchEvent(new Event("input"));
    }
  });
}

/* ===== Main Decorate ===== */
export default async function decorate(fieldDiv) {
  const input = fieldDiv.querySelector("input");

  const originalMax = parseInt(input.max);

  // Detect type
  const isLoan = originalMax > 100000;
  const type = isLoan ? "loan" : "tenure";

  const stepsArray = isLoan ? LOAN_STEPS : TENURE_STEPS;

  /* ===== Continuous Slider ===== */
  input.type = "range";
  input.min = stepsArray[0];
  input.max = stepsArray[stepsArray.length - 1];
  input.step = isLoan ? 1000 : 1; // smooth movement

  /* ===== Wrapper ===== */
  const wrapper = document.createElement("div");
  wrapper.className = "range-widget-wrapper decorated";
  input.after(wrapper);

  /* ===== Value Box ===== */
  const valueBox = document.createElement("div");
  valueBox.className = "loan-value-box";
  fieldDiv.insertBefore(valueBox, wrapper);

  /* ===== Labels ===== */
  const labels = document.createElement("div");
  labels.className = "range-labels";

  stepsArray.forEach((val) => {
    const span = document.createElement("span");

    if (type === "loan") {
      span.innerText =
        val >= 100000
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

  /* ===== Snap on release (KEY FIX) ===== */
  input.addEventListener("change", () => {
    const rawValue = parseInt(input.value);

    const nearest = getNearestStep(rawValue, stepsArray);

    input.value = nearest;

    input.dispatchEvent(new Event("input"));
  });

  enableTrackClick(wrapper, input);

  /* ===== Initial ===== */
  updateUI(input, wrapper, stepsArray, type);

  return fieldDiv;
}