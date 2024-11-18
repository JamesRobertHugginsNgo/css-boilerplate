// ==
// HELPER FUNCTIONS
// ==

function getBetterCustomValidityMessage(fieldEl, inputEl) {
  // if (inputEl.validity.customError) {
  //   return;
  // }
  // if (inputEl.validity.badInput) {
  //   return; // CUSTOMIZE
  // }
  // if (inputEl.validity.patternMismatch) {
  //   return; // CUSTOMIZE
  // }
  // if (inputEl.validity.rangeOverflow) {
  //   return; // CUSTOMIZE
  // }
  // if (inputEl.validity.rangeUnderflow) {
  //   return; // CUSTOMIZE
  // }
  // if (inputEl.validity.stepMismatch) {
  //   return; // CUSTOMIZE
  // }
  // if (inputEl.validity.tooLong) {
  //   return; // CUSTOMIZE
  // }
  // if (inputEl.validity.tooShort) {
  //   return; // CUSTOMIZE
  // }
  // if (inputEl.validity.typeMismatch) {
  //   return; // CUSTOMIZE
  // }
  // if (inputEl.validity.valueMissing) {
  //   return; // CUSTOMIZE
  // }
}

function setupValidity(fieldEl, inputEl) {
  if (!inputEl.willValidate) {
    return;
  }

  fieldEl.classList.contains('field-error') && fieldEl.classList.remove('field-error');

  if (fieldEl.customValidityValidations) {
    for (const getCustomValidityMessage of fieldEl.customValidityValidations) {
      const message = getCustomValidityMessage(fieldEl, inputEl);
      if (message) {
        inputEl.setCustomValidity(message);
        return;
      }
    }
  }

  const message = getBetterCustomValidityMessage(fieldEl, inputEl);
  if (message) {
    inputEl.setCustomValidity(message);
    return;
  }

  inputEl.validity.customError && inputEl.setCustomValidity('');
};

function handleInvalid(fieldEl, inputEl, errorEl) {
  if (!inputEl.willValidate) {
    return;
  }

  errorEl.textContent = inputEl.validationMessage;
  !fieldEl.classList.contains('field-error') && fieldEl.classList.add('field-error');
}

// ==
// METHOD OVERRIDE
// ==

function inputCheckValidity(...args) {
  this.setupValidity();
  return this.originalCheckValidity(...args);
}

function inputReportValidity(...args) {
  this.setupValidity();
  return this.originalReportValidity(...args);
};

function formReportValidity(...args) {
  for (const inputEl of this.elements) {
    inputEl.setupValidity && inputEl.setupValidity();
  }
  const isValid = this.originalReportValidity(...args);
  if (!isValid) {
    // UNCOMMENT WHEN PREVENTING BROWSER ERROR MESSAGE POP UP ON SUBMIT
    // this.querySelector('.field-error input, .field-error select, .field-error textarea').focus();
  }
  return isValid;
};

// ==
// EVENT LISTENER
// ==

function formSubmitEventListener(event) {
  if (!this.reportValidity()) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
};

// ==
// ADD FIELD VALIDATION
// ==

export function addFieldValidation(fieldEl) {
  const errorEl = fieldEl.querySelector('.field-error-text');

  for (const inputEl of fieldEl.querySelectorAll('input, select, textarea')) {
    inputEl.setupValidity = () => {
      setupValidity(fieldEl, inputEl);
    };

    inputEl.originalCheckValidity = inputEl.originalCheckValidity || inputEl.checkValidity;
    inputEl.checkValidity = inputCheckValidity;

    inputEl.originalReportValidity = inputEl.originalReportValidity || inputEl.reportValidity;
    inputEl.reportValidity = inputReportValidity;

    inputEl.addEventListener('input', inputCheckValidity);
    inputEl.addEventListener('change', inputCheckValidity);

    inputEl.invalidEventListener = (event) => {
      // UNCOMMENT WHEN PREVENTING BROWSER ERROR MESSAGE POP UP ON SUBMIT
      // event.preventDefault();
      handleInvalid(fieldEl, inputEl, errorEl);
    };
    inputEl.addEventListener('invalid', inputEl.invalidEventListener);
  }

  return fieldEl;
}

// ==
// REMOVE FIELD VALIDATION
// ==

export function removeFieldValidation(fieldEl) {
  for (const inputEl of fieldEl.querySelectorAll('input, select, textarea')) {
    if (inputEl.invalidEventListener) {
      inputEl.removeEventListener('invalid', inputEl.invalidEventListener);
      delete inputEl.invalidEventListener;
    }

    inputEl.removeEventListener('input', inputCheckValidity);
    inputEl.removeEventListener('change', inputCheckValidity);

    if (inputEl.originalCheckValidity) {
      inputEl.checkValidity = inputEl.originalCheckValidity;
      delete inputEl.originalCheckValidity;
    }

    if (inputEl.originalReportValidity) {
      inputEl.reportValidity = inputEl.originalReportValidity;
      delete inputEl.originalReportValidity;
    }

    inputEl.setupValidity && delete inputEl.setupValidity;
  }

  return fieldEl;
}

// ==
// ADD FORM VALIDATION
// ==

export function addFormValidation(formEl) {
  formEl.originalReportValidity = formEl.originalReportValidity || formEl.reportValidity;
  formEl.reportValidity = formReportValidity;

  formEl.hasNoValidate = formEl.hasAttribute('novalidate');
  !formEl.hasNoValidate && formEl.setAttribute('novalidate', '');

  formEl.addEventListener('submit', formSubmitEventListener);

  for (const fieldEl of formEl.querySelectorAll('.field')) {
    addFieldValidation(fieldEl);
  }

  return formEl;
}

// ==
// REMOVE FORM VALIDATION
// ==

export function removeFormValidation(formEl) {
  for (const fieldEl of formEl.querySelectorAll('.field')) {
    removeFieldValidation(fieldEl);
  }

  formEl.removeEventListener('submit', formSubmitEventListener);

  if (formEl.hasNoValidate !== undefined) {
    !formEl.hasNoValidate && formEl.hasAttribute('novalidate') && formEl.removeAttribute('novalidate');
    delete formEl.hasNoValidate;
  }

  if (formEl.originalReportValidity) {
    formEl.reportValidity = formEl.originalReportValidity;
    delete formEl.originalReportValidity;
  }

  return formEl;
}
