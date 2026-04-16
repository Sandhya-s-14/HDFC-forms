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
/**
* Masks the first 5 digits of the mobile number with *
* @param {globals}
*/
let otpTimer;
let timeLeft = 60;
let attemptsLeft = 3;

function startOtpTimer(globals) {
  clearInterval(otpTimer);
  timeLeft = 60;

  const field = document.querySelector('[name="timer"]');

  if (!field) {
    console.log("Timer field not found");
    return;
  }

  otpTimer = setInterval(() => {
    field.value = `Time left: ${timeLeft}s`;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(otpTimer);
      field.value = "OTP expired";
      attemptsLeft = 0;
    }
  }, 1000);
}

function handleOtpFailure(globals) {
    attemptsLeft--;

    if (attemptsLeft <= 0) {
        var btn = guideBridge.resolveNode("validate_otp");

        if (btn) {
            btn.enabled = false;
        }

        alert("Max attempts reached!");
        clearInterval(otpTimer);
    } else {
        alert("Wrong OTP. Attempts left: " + attemptsLeft);
    }
}
// eslint-disable-next-line import/prefer-default-export
export {
  getFullName, days, submitFormArrayToString, maskMobileNumber, startOtpTimer, handleOtpFailure, 
};

