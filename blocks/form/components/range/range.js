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

/* ===== Update UI ===== */
function updateUI(input, wrapper, stepsArray, type) {
  let value = parseInt(input.value);

  const min = parseInt(input.min);
  const max = parseInt(input.max);

  let percent = ((value - min) / (max - min)) * 100;

  // 🔥 SNAP LOGIC FOR LOAN ONLY
  if (type === "loan") {
    let closest = stepsArray.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );

    value = closest;

    percent =
      (stepsArray.indexOf(closest) / (stepsArray.length - 1)) * 100;
  }

  // ===== Value Box =====
  const valueBox = wrapper.querySelector(".loan-value-box");

  if (valueBox) {
    valueBox.innerText =
      type === "loan" ? formatINR(value) : formatMonths(value);

    valueBox.style.left = percent + "%";
  }

  // ===== Progress Bar =====
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

/* ===== Main ===== */
export default function decorate(fieldDiv) {
  const input = fieldDiv.querySelector("input");

  const isLoan = parseInt(input.max) > 100000;
  const type = isLoan ? "loan" : "tenure";

  const stepsArray = isLoan ? LOAN_STEPS : TENURE_STEPS;

  /* ===== Slider Setup ===== */
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
  wrapper.appendChild(valueBox);

  /* ===== Labels ===== */
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

  /* ===== Append ===== */
  wrapper.appendChild(input);
  wrapper.appendChild(labels);

  /* ===== Events ===== */
  input.addEventListener("input", () => {
    updateUI(input, wrapper, stepsArray, type);
  });

  enableTrackClick(wrapper, input);

  /* ===== Initial Render ===== */
  updateUI(input, wrapper, stepsArray, type);

  return fieldDiv;
}