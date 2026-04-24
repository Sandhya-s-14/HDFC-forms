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

/* ===== Get nearest step (optional highlight logic) ===== */
function getNearestStep(value, steps) {
  return steps.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

/* ===== Update UI ===== */
function updateUI(input, wrapper, stepsArray, type) {
  const value = parseInt(input.value);

  const formatted =
    type === "loan"
      ? formatINR(value)
      : formatMonths(value);

  const valueBox = wrapper.parentElement.querySelector(".loan-value-box");
  if (valueBox) valueBox.innerText = formatted;

  /* ===== Smooth progress ===== */
  const min = parseInt(input.min);
  const max = parseInt(input.max);

  const percent = ((value - min) / (max - min)) * 100;
  wrapper.style.setProperty("--percent", percent);

  /* ===== OPTIONAL: nearest step highlight ===== */
  const nearest = getNearestStep(value, stepsArray);
  wrapper.setAttribute("data-step", nearest);
}

/* ===== Click anywhere ===== */
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
export default async function decorate(fieldDiv) {
  const input = fieldDiv.querySelector("input");

  const originalMax = parseInt(input.max);

  const isLoan = originalMax > 100000;
  const type = isLoan ? "loan" : "tenure";

  const stepsArray = isLoan ? LOAN_STEPS : TENURE_STEPS;

  /* ===== CONTINUOUS slider ===== */
  input.type = "range";
  input.min = stepsArray[0];
  input.max = stepsArray[stepsArray.length - 1];

  // Smooth movement
  input.step = isLoan ? 1000 : 1;

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

  wrapper.appendChild(input);
  wrapper.appendChild(labels);

  /* ===== Events ===== */
  input.addEventListener("input", () => {
    updateUI(input, wrapper, stepsArray, type);
  });

  enableTrackClick(wrapper, input);

  /* ===== Initial ===== */
  updateUI(input, wrapper, stepsArray, type);

  return fieldDiv;
}