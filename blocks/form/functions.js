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
  const validateBtn = form.validate_otp.validate_otp;

  let seconds = 30;

  if (!timerField) return;

  // Disable resend button when timer starts
  if (resendBtn) {
    globals.functions.setProperty(resendBtn, {
      enabled: false,
    });
  }

  // Enable validate button when timer starts
  if (validateBtn) {
    globals.functions.setProperty(validateBtn, {
      enabled: true,
    });
  }

  // Reset expiry flag
  globals.functions.setProperty(form, {
    properties: {
      ...form.$properties,
      otpExpired: false,
    },
  });

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

      // ✅ Mark OTP expired
      globals.functions.setProperty(form, {
        properties: {
          ...form.$properties,
          otpExpired: true,
        },
      });

      // ❌ Disable validate button
      if (validateBtn) {
        globals.functions.setProperty(validateBtn, {
          enabled: false,
        });
      }

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
  const attemptsField = form.validate_otp.attempts_text;

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

    if (attemptsField) {
      globals.functions.setProperty(attemptsField, {
        value: 'No attempts left',
        readOnly: true,
      });
    }

    return;
  }

  const updatedAttempts = attempts + 1;

  // ✅ Store attempts
  globals.functions.setProperty(form, {
    properties: {
      ...existingProps,
      otpAttempts: updatedAttempts,
    },
  });

  console.log("New attempt:", updatedAttempts);

  // Update attempts UI
  if (attemptsField) {
    const remaining = 3 - updatedAttempts;

    globals.functions.setProperty(attemptsField, {
      value:
        remaining > 0
          ? `${remaining}/3 attempts left`
          : 'No attempts left',
      readOnly: true,
    });
  }

  // Disable resend immediately
  if (resendBtn) {
    globals.functions.setProperty(resendBtn, {
      enabled: false,
    });
  }

  console.log("New OTP generated");

  // Restart timer (also resets expiry)
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
  const attemptsField = form.validate_otp.attempts_text;

  globals.functions.setProperty(form, {
    properties: {
      ...existingProps,
      otpAttempts: 0,
      otpExpired: false, // ✅ reset expiry
    },
  });

  // Initial attempts UI
  if (attemptsField) {
    globals.functions.setProperty(attemptsField, {
      value: '3/3 attempts left',
      readOnly: true,
    });
  }

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

//----------------------OFFER PAGE-------------------------------
/**
 * Fetch Offer Data
 * @param {scope} globals
 */
async function fetchOffer(globals) {
  const form = globals.form;

  const mobile = form.validate_otp.mobile?.value;
  const otp = form.validate_otp.otp?.value;

  if (!mobile || !otp) return;

  try {
    const res = await fetch("https://your-ngrok-url/api/verify-otp-offer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mobile, otp }),
    });

    const result = await res.json();

    if (result.status === "SUCCESS") {
      const data = result.data;

      globals.functions.setProperty(form.offer_page.loan_amount, {
        value: data.offerAmount,
      });

      globals.functions.setProperty(form.offer_page.loan_tenture, {
        value: data.tenure,
      });

      globals.functions.setProperty(form.offer_page.rate_of_interest, {
        value: data.rateOfInterest,
      });

      globals.functions.setProperty(form.offer_page.taxes, {
        value: data.taxes,
      });

      // Calculate EMI after setting values
      calculateEMI(globals);

    } else {
      globals.functions.setProperty(form.offer_page.error_message, {
        value: "Invalid OTP",
      });
    }

  } catch (err) {
    console.error("API error", err);
  }
}

/**
 * Calculate EMI
 * @param {scope} globals
 */
function calculateEMI(globals) {
  const form = globals.form;

  const loan = Number(form.offer_page.loan_amount?.value);
  const tenure = Number(form.offer_page.loan_tenture?.value);
  const roi = Number(form.offer_page.rate_of_interest?.value);

  const emiField = form.offer_page.emi;

  if (!loan || !tenure || !roi) return;

  const r = roi / 12 / 100;

  const emi =
    (loan * r * Math.pow(1 + r, tenure)) /
    (Math.pow(1 + r, tenure) - 1);

  globals.functions.setProperty(emiField, {
    value: Math.round(emi),
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
