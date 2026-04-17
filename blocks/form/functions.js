/**
 * Get Full Name
 * @name getFullName Concats first name and last name
 * @param {string} firstname in Stringformat
 * @param {string} lastname in Stringformat
 * @return {string}
 */
function getFullName(firstname, lastname) {
  return `${firstname} ${lastname}`.trim();
}

/**
 * Custom submit function
 * @param {scope} globals
 */
function submitFormArrayToString(globals) {
  const data = globals.functions.exportData();
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data[key] = data[key].join(',');
    }
  });
  globals.functions.submitForm(data, true, 'application/json');
}

/**
 * Calculate the number of days between two dates.
 * @param {*} endDate
 * @param {*} startDate
 * @returns {number} returns the number of days between two dates
 */
function days(endDate, startDate) {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // return zero if dates are valid
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diffInMs = Math.abs(end.getTime() - start.getTime());
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

/**
* Masks the first 5 digits of the mobile number with *
* @param {*} mobileNumber
* @returns {string} returns the mobile number with first 5 digits masked
*/
function maskMobileNumber(mobileNumber) {
  if (!mobileNumber) {
    return '';
  }
  const value = mobileNumber.toString();
  // Mask first 5 digits and keep the rest
  return ` ${'*'.repeat(5)}${value.substring(5)}`;
}

//---------------------------------------I addded this-----------------------------------------------------//
/* ================= OTP TIMER ================= */

function startOtpTimer(globals) {
  const form = globals.form;
  const timerField = form.validate_otp.timer;
  const resendBtn = form.validate_otp.resend_otp;
  const validateBtn = form.validate_otp.validate_otp;

  let seconds = 30;

  if (!timerField) return;

  // Disable resend button
  globals.functions.setProperty(resendBtn, { enabled: false });

  // Enable validate button
  globals.functions.setProperty(validateBtn, { enabled: true });

  // Reset expiry flag
  globals.functions.setProperty(form, {
    properties: {
      ...form.$properties,
      otpExpired: false,
    },
  });

  // Clear previous timer
  if (window.otpTimerInterval) {
    clearInterval(window.otpTimerInterval);
  }

  globals.functions.setProperty(timerField, {
    value: "00:30",
  });

  window.otpTimerInterval = setInterval(() => {
    seconds--;

    const formatted =
      seconds >= 10 ? `00:${seconds}` : `00:0${seconds}`;

    if (seconds >= 0) {
      globals.functions.setProperty(timerField, {
        value: formatted,
      });
    }

    if (seconds <= 0) {
      clearInterval(window.otpTimerInterval);

      globals.functions.setProperty(timerField, {
        value: "Time expired",
      });

      globals.functions.setProperty(form, {
        properties: {
          ...form.$properties,
          otpExpired: true,
        },
      });

      globals.functions.setProperty(validateBtn, {
        enabled: false,
      });

      const attempts = Number(form.$properties?.otpAttempts || 0);

      if (attempts < 3) {
        globals.functions.setProperty(resendBtn, {
          enabled: true,
        });
      }
    }
  }, 1000);
}

/* ================= RESEND OTP ================= */

function resendOtp(globals) {
  console.log("🔥 resendOtp triggered");

  const form = globals.form;
  const resendBtn = form.validate_otp.resend_otp;
  const timerField = form.validate_otp.timer;
  const attemptsField = form.validate_otp.attempts_text;

  let attempts = Number(form.$properties?.otpAttempts || 0);

  if (attempts >= 3) {
    globals.functions.setProperty(timerField, {
      value: "Maximum attempts reached",
    });

    globals.functions.setProperty(resendBtn, {
      enabled: false,
    });

    globals.functions.setProperty(attemptsField, {
      value: "No attempts left",
      readOnly: true,
    });

    return;
  }

  attempts += 1;

  globals.functions.setProperty(form, {
    properties: {
      ...form.$properties,
      otpAttempts: attempts,
    },
  });

  const remaining = 3 - attempts;

  globals.functions.setProperty(attemptsField, {
    value:
      remaining > 0
        ? `${remaining} attempts left`
        : "No attempts left",
    readOnly: true,
  });

  globals.functions.setProperty(resendBtn, {
    enabled: false,
  });

  console.log("📩 New OTP generated");

  startOtpTimer(globals);
}

/* ================= INVALID OTP HANDLER ================= */

function handleInvalidOtp(globals) {
  console.log("❌ Invalid OTP");

  const form = globals.form;
  const attemptsField = form.validate_otp.attempts_text;
  const validateBtn = form.validate_otp.validate_otp;
  const resendBtn = form.validate_otp.resend_otp;

  let attempts = Number(form.$properties?.otpAttempts || 0);

  if (attempts >= 3) return;

  attempts += 1;

  globals.functions.setProperty(form, {
    properties: {
      ...form.$properties,
      otpAttempts: attempts,
    },
  });

  const remaining = 3 - attempts;

  globals.functions.setProperty(attemptsField, {
    value:
      remaining > 0
        ? `${remaining} attempts left`
        : "No attempts left",
    readOnly: true,
  });

  if (attempts >= 3) {
    globals.functions.setProperty(validateBtn, {
      enabled: false,
    });

    globals.functions.setProperty(resendBtn, {
      enabled: false,
    });

    console.log("🔒 Max attempts reached");

    // Optional navigation
    // globals.functions.navigateTo("error_page");
  }
}

/* ================= STOP TIMER ================= */

function stopOtpTimer() {
  if (window.otpTimerInterval) {
    clearInterval(window.otpTimerInterval);
    window.otpTimerInterval = null;
  }
}

/* ================= INIT OTP ================= */

function initOtp(globals) {
  const form = globals.form;
  const attemptsField = form.validate_otp.attempts_text;

  globals.functions.setProperty(form, {
    properties: {
      ...form.$properties,
      otpAttempts: 0,
      otpExpired: false,
    },
  });

  globals.functions.setProperty(attemptsField, {
    value: "3 attempts left",
    readOnly: true,
  });

  console.log("✅ OTP initialized");

  startOtpTimer(globals);
}

/* ================= DEBUG ================= */

function debugForm(globals) {
  window.myForm = globals.form;
  console.log("myForm", window.myForm);
  return "";
}

//----------------------OFFER PAGE-------------------------------
function fetchOffer(globals) {
  console.log("🔥 fetchOffer triggered");

  const form = globals.form;

  // ✅ Correct OTP field
  const otp = form.validate_otp.enter_otp.validate_box?.value;

  // ❗ Mobile is NOT in this panel
  // So either:
  // 1. Fetch from previous step
  // 2. Hardcode (for now)
  const mobile = form.mobile?.value || "9876543210";

  console.log("Mobile:", mobile);
  console.log("OTP:", otp);

  if (!mobile || !otp) {
    console.log("❌ Missing mobile or OTP");
    return;
  }

  fetch("https://lugged-delay-rift.ngrok-free.dev/api/verify-otp-offer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mobile, otp }),
  })
    .then((res) => res.json())
    .then((result) => {
      console.log("API Response:", result);

      if (result.status === "SUCCESS") {
        const data = result.data;

        globals.functions.setProperty(form.offer_page.loan_amount, {
          value: data.offerAmount,
          displayValue: String(data.offerAmount),
        });

        globals.functions.setProperty(form.offer_page.loan_tenture, {
          value: data.tenure,
          displayValue: String(data.tenure),
        });

        globals.functions.setProperty(form.offer_page.rate_of_interest, {
          value: data.rateOfInterest,
          displayValue: String(data.rateOfInterest),
        });

        globals.functions.setProperty(form.offer_page.taxes, {
          value: data.taxes,
          displayValue: String(data.taxes),
        });

        calculateEMI(globals);
      }
    })
    .catch((err) => {
      console.error("API Error:", err);
    });
}

/**
 * Calculate EMI dynamically
 * @param {scope} globals
 */
function calculateEMI(globals) {
  console.log("🔥 EMI triggered");

  const form = globals.form;

  const loan = Number(form.offer_page.loan_amount?.value);
  const tenure = Number(form.offer_page.loan_tenture?.value);
  const roi = Number(form.offer_page.rate_of_interest?.value);

  console.log("Values:", loan, tenure, roi);

  const emiField = form.offer_page.emi;

  if (!loan || !tenure || !roi) {
    console.log("❌ Missing values for EMI");
    return;
  }

  const r = roi / 12 / 100;

  const emi =
    (loan * r * Math.pow(1 + r, tenure)) /
    (Math.pow(1 + r, tenure) - 1);

  const roundedEMI = Math.round(emi);

  // ✅ IMPORTANT: set both value + displayValue
  globals.functions.setProperty(emiField, {
    value: roundedEMI,
    displayValue: String(roundedEMI),
  });
}

export {
  getFullName,
  days,
  submitFormArrayToString,
  maskMobileNumber,
  startOtpTimer,
  stopOtpTimer,
  resendOtp,
  initOtp,
  debugForm,
  fetchOffer,
  calculateEMI,
};
