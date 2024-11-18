function getBetterCustomValidityMessage(inputEl) {
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

// ==
// METHODS & EVENT LISTENER
// ==

function inputSetupValidity() {
  if (!this.willValidate) {
    return;
  }

  this.fieldEl.classList.remove('field-error');

  if (this.fieldEl.customValidityValidations) {
    for (const getCustomValidityMessage of this.fieldEl.customValidityValidations) {
      const message = getCustomValidityMessage(this);
      if (message) {
        this.setCustomValidity(message);
        return;
      }
    }
  }

  const message = getBetterCustomValidityMessage(this);
  if (message) {
    this.setCustomValidity(message);
    return;
  }

  this.validity.customError && this.setCustomValidity('');
};

function inputCheckValidity(...args) {
  this.setupValidity();
  return this.originalCheckValidity(...args);
}

function inputReportValidity(...args) {
  this.setupValidity();
  return this.originalReportValidity(...args);
};

function inputInvalidEventListener(event) {
  // UNCOMMENT WHEN PREVENTING BROWSER ERROR MESSAGE POP UP ON SUBMIT
  // event.preventDefault();

  if (!this.willValidate) {
    return;
  }

  this.errorEl.textContent = this.validationMessage;
  this.fieldEl.classList.add('field-error');
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

function formResetEventListener(event) {
  for (const inputEl of this.elements) {
    inputEl.fieldEl && inputEl.fieldEl.classList.remove('field-error');
  }
};

function formSubmitEventListener(event) {
  if (!this.reportValidity()) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
};

// ==
// EXPORTS
// ==

export function addFieldValidation(fieldEl) {
  const errorEl = fieldEl.querySelector('.field-error-text');

  for (const inputEl of fieldEl.querySelectorAll('input, select, textarea')) {
    inputEl.fieldEl = fieldEl;
    inputEl.errorEl = errorEl;

    inputEl.setupValidity = inputSetupValidity;

    inputEl.originalCheckValidity = inputEl.originalCheckValidity || inputEl.checkValidity;
    inputEl.checkValidity = inputCheckValidity;

    inputEl.originalReportValidity = inputEl.originalReportValidity || inputEl.reportValidity;
    inputEl.reportValidity = inputReportValidity;

    inputEl.addEventListener('input', inputCheckValidity);

    inputEl.addEventListener('invalid', inputInvalidEventListener);
  }

  return fieldEl;
}

export function removeFieldValidation(fieldEl) {
  for (const inputEl of fieldEl.querySelectorAll('input, select, textarea')) {
    inputEl.removeEventListener('invalid', inputInvalidEventListener);

    inputEl.removeEventListener('input', inputCheckValidity);

    if (inputEl.originalCheckValidity) {
      inputEl.checkValidity = inputEl.originalCheckValidity;
      delete inputEl.originalCheckValidity;
    }

    if (inputEl.originalReportValidity) {
      inputEl.reportValidity = inputEl.originalReportValidity;
      delete inputEl.originalReportValidity;
    }

    delete inputEl.setupValidity;

    delete inputEl.fieldEl;
    delete inputEl.errorEl;
  }

  return fieldEl;
}

export function addFormValidation(formEl) {
  formEl.originalReportValidity = formEl.originalReportValidity || formEl.reportValidity;
  formEl.reportValidity = formReportValidity;

  formEl.hasNoValidate = formEl.hasAttribute('novalidate');
  formEl.setAttribute('novalidate', '');

  formEl.addEventListener('reset', formResetEventListener);
  formEl.addEventListener('submit', formSubmitEventListener);

  for (const fieldEl of formEl.querySelectorAll('.field')) {
    addFieldValidation(fieldEl);
  }

  return formEl;
}

export function removeFormValidation(formEl) {
  for (const fieldEl of formEl.querySelectorAll('.field')) {
    removeFieldValidation(fieldEl);
  }

  formEl.removeEventListener('reset', formResetEventListener);
  formEl.removeEventListener('submit', formSubmitEventListener);

  if (formEl.hasNoValidate !== undefined) {
    !formEl.hasNoValidate && formEl.removeAttribute('novalidate');
    delete formEl.hasNoValidate;
  }

  if (formEl.originalReportValidity) {
    formEl.reportValidity = formEl.originalReportValidity;
    delete formEl.originalReportValidity;
  }

  return formEl;
}
