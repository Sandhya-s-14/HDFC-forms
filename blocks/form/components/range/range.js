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
  const index = parseInt(input.value);
  const value = stepsArray[index];

  const formatted =
    type === "loan"
      ? formatINR(value)
      : formatMonths(value);

  const valueBox = wrapper.parentElement.querySelector(".loan-value-box");
  if (valueBox) valueBox.innerText = formatted;

  // ✅ PERFECT alignment
  const percent = (index / (stepsArray.length - 1)) * 100;
  wrapper.style.setProperty("--percent", percent);
}

/* ===== Click Track ===== */
function enableTrackClick(wrapper, input, stepsArray) {
  wrapper.addEventListener("click", (e) => {
    if (e.target !== input) {
      const rect = wrapper.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;

      const index = Math.round(percent * (stepsArray.length - 1));

      input.value = index;
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

  /* ===== INDEX BASED SLIDER ===== */
  input.type = "range";
  input.min = 0;
  input.max = stepsArray.length - 1;
  input.step = 1;

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

  enableTrackClick(wrapper, input, stepsArray);

  /* ===== Initial ===== */
  input.value = stepsArray.length - 1;
  updateUI(input, wrapper, stepsArray, type);

  return fieldDiv;
}