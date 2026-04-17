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

      globals.functions.setProperty(validateBtn, {
        enabled: false,
      });

      const attempts = window.otpAttempts || 0;

      // Enable resend only if attempts < 3
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
  console.log("🔥 resendOtp");

  const form = globals.form;
  const resendBtn = form.validate_otp.resend_otp;
  const timerField = form.validate_otp.timer;
  const attemptsField = form.validate_otp.attempts_text;

  let attempts = window.otpAttempts || 0;

  // ❗ If already exceeded
  if (attempts >= 3) {
    alert("You have exceeded maximum OTP attempts. Please try again after 15 minutes.");

    globals.functions.setProperty(timerField, {
      value: "Maximum attempts reached",
    });

    globals.functions.setProperty(resendBtn, {
      enabled: false,
    });

    globals.functions.setProperty(attemptsField, {
      value: "No attempts left",
    });

    // 🔒 ensure lock exists
    window.otpLockUntil = window.otpLockUntil || (Date.now() + 15 * 60 * 1000);

    // 👉 CORRECT NAVIGATION
    globals.functions.navigateTo(form.generate_otp);

    return;
  }

  // ✅ increment attempts
  attempts++;
  window.otpAttempts = attempts;

  const remaining = 3 - attempts;

  globals.functions.setProperty(attemptsField, {
    value:
      remaining > 0
        ? `${remaining} attempts left`
        : "No attempts left",
  });

  globals.functions.setProperty(resendBtn, {
    enabled: false,
  });

  console.log("📩 OTP resent");

  // ❗ If this click reaches limit
  if (attempts >= 3) {
    // 🔒 set lock
    window.otpLockUntil = Date.now() + 15 * 60 * 1000;

    alert("You have exceeded maximum OTP attempts. Please try again after 15 minutes.");

    globals.form.navigateTo("generate_otp");

    return;
  }

  startOtpTimer(globals);
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

  // ✅ initialize attempts
  window.otpAttempts = 0;

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
};
