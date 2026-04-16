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
/* timer + otp logic */

/**
 * @param {scope} globals
 */
function startOtpTimer(globals) {
  const form = globals.form;
  const timerField = form.validate_otp.timer;
  const resendBtn = form.validate_otp.resend_otp;

  let seconds = 30;

  if (!timerField) return;

  // Disable resend button when timer starts
  if (resendBtn) {
    globals.functions.setProperty(resendBtn, {
      enabled: false,
    });
  }

  // Clear existing timer
  if (window.otpTimerInterval) {
    clearInterval(window.otpTimerInterval);
  }

  // Set initial time
  globals.functions.setProperty(timerField, {
    value: '00:30',
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
        value: 'Time expired',
      });

      const attempts = form.$properties?.otpAttempts || 0;

      // Enable resend only if attempts < 3
      if (resendBtn && attempts < 3) {
        globals.functions.setProperty(resendBtn, {
          enabled: true,
        });
      }
    }
  }, 1000);
}

/**
 * @param {scope} globals
 */
function resendOtp(globals) {
  console.log("🔥 resendOtp triggered");

  const form = globals.form;
  const resendBtn = form.validate_otp.resend_otp;
  const timerField = form.validate_otp.timer;

  const existingProps = form.$properties || {};
  const attempts = existingProps.otpAttempts || 0;

  console.log("Current attempts:", attempts);

  // ❌ Block after 3 attempts
  if (attempts >= 3) {
    globals.functions.setProperty(timerField, {
      value: 'Maximum resend attempts reached',
    });

    if (resendBtn) {
      globals.functions.setProperty(resendBtn, {
        enabled: false,
      });
    }

    return;
  }

  const updatedAttempts = attempts + 1;

  // ✅ Store attempts safely
  globals.functions.setProperty(form, {
    properties: {
      ...existingProps,
      otpAttempts: updatedAttempts,
    },
  });

  console.log("New attempt:", updatedAttempts);

  // Disable resend immediately
  if (resendBtn) {
    globals.functions.setProperty(resendBtn, {
      enabled: false,
    });
  }

  // 👉 API already called via rule
  console.log("New OTP generated");

  // Restart timer
  startOtpTimer(globals);
}

/**
 * @param {scope} globals
 */
function stopOtpTimer() {
  if (window.otpTimerInterval) {
    clearInterval(window.otpTimerInterval);
    window.otpTimerInterval = null;
  }
}

/**
 * Initialize OTP (first time)
 * @param {scope} globals
 */
function initOtp(globals) {
  const form = globals.form;
  const existingProps = form.$properties || {};

  globals.functions.setProperty(form, {
    properties: {
      ...existingProps,
      otpAttempts: 0,
    },
  });

  console.log("OTP initialized");

  startOtpTimer(globals);
}

/**
 * Debug helper
 * @param {scope} globals
 */
function debugForm(globals) {
  window.myForm = globals.form;
  console.log('myForm', window.myForm);
  return '';
}

// export functions
export {
  getFullName,
  days,
  submitFormArrayToString,
  maskMobileNumber,
  startOtpTimer,
  stopOtpTimer,
  resendOtp,
  initOtp,
  debugForm
};

