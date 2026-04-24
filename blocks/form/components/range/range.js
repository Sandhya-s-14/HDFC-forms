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
  let percent = 0;
  let displayValue = "";

  if (type === "loan") {
    // ✅ index-based (FIXED)
    const index = parseInt(input.value);
    const value = stepsArray[index];

    displayValue = formatINR(value);
    percent = (index / (stepsArray.length - 1)) * 100;

  } else {
    // ✅ continuous (months)
    const value = parseInt(input.value);
    const min = parseInt(input.min);
    const max = parseInt(input.max);

    displayValue = formatMonths(value);
    percent = ((value - min) / (max - min)) * 100;
  }

  // ===== Value Box =====
  const valueBox = wrapper.querySelector(".loan-value-box");

  if (valueBox) {
    valueBox.innerText = displayValue;
    valueBox.style.left = percent + "%";
  }

  // ===== Progress Bar =====
  wrapper.style.setProperty("--percent", percent);
}

/* ===== Click anywhere on track ===== */
function enableTrackClick(wrapper, input, stepsArray, type) {
  wrapper.addEventListener("click", (e) => {
    if (e.target !== input) {
      const rect = wrapper.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;

      if (type === "loan") {
        // index-based click
        const index = Math.round(percent * (stepsArray.length - 1));
        input.value = index;
      } else {
        // continuous click
        const min = parseInt(input.min);
        const max = parseInt(input.max);
        input.value = Math.round(min + percent * (max - min));
      }

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

  if (type === "loan") {
    // ✅ FIX: index-based slider
    input.min = 0;
    input.max = stepsArray.length - 1;
    input.step = 1;
  } else {
    // months stays continuous
    input.min = stepsArray[0];
    input.max = stepsArray[stepsArray.length - 1];
    input.step = 1;
  }

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

  enableTrackClick(wrapper, input, stepsArray, type);

  /* ===== Initial ===== */
  input.value = type === "loan" ? stepsArray.length - 1 : stepsArray[0];
  updateUI(input, wrapper, stepsArray, type);

  return fieldDiv;
}