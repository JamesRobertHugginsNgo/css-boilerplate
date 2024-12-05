const inputElMap = new Map(), formElMap = new Map(); // Stores element metadata

function getBetterCustomValidityMessage(inputEl) {
  // if (inputEl.validity.customError) {
  //   return; // CUSTOMIZE
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

function setupInputValidity(inputEl) {
  if (!inputEl.willValidate) {
    return;
  }

  const { fieldEl } = inputElMap.get(inputEl);
  fieldEl.classList.remove('field-error');

  if (fieldEl.customValidityValidations) {
    for (const getCustomValidityMessage of fieldEl.customValidityValidations) {
      const message = getCustomValidityMessage(inputEl);
      if (message) {
        inputEl.setCustomValidity(message);
        return;
      }
    }
  }

  const message = getBetterCustomValidityMessage(inputEl);
  if (message) {
    inputEl.setCustomValidity(message);
    return;
  }

  inputEl.validity.customError && inputEl.setCustomValidity('');
};

// ==
// METHOD OVERRIDES
// ==

function inputCheckValidity(...args) {
  setupInputValidity(this);
  return this.constructor.prototype.checkValidity.call(this, ...args);
}

function inputReportValidity(...args) {
  setupInputValidity(this);
  return this.constructor.prototype.reportValidity.call(this, ...args);
};

function formReportValidity(...args) {
  for (const inputEl of this.elements) {
    inputElMap.has(inputEl) && setupInputValidity(inputEl);
  }

  const isValid = this.constructor.prototype.reportValidity.call(this, ...args);

  // UNCOMMENT WHEN PREVENTING BROWSER ERROR MESSAGE POP UP ON SUBMIT
  // THIS RESTORE FOCUS FUNCTIONALITY
  // if (!isValid) {
  //   this.querySelector('.field-error input, .field-error select, .field-error textarea').focus();
  // }

  return isValid;
};

// ==
// EVENT LISTENERS
// ==

function inputInvalidEventListener(event) {
  // UNCOMMENT WHEN PREVENTING BROWSER ERROR MESSAGE POP UP ON SUBMIT
  // THIS PREVENTS THE POPUP
  // event.preventDefault();

  if (!this.willValidate) {
    return;
  }

  const { errorEl, fieldEl } = inputElMap.get(this);
  errorEl.textContent = this.validationMessage;
  fieldEl.classList.add('field-error');
};

function formResetEventListener(event) {
  for (const inputEl of this.elements) {
    const { fieldEl } = inputElMap.get(inputEl) || {};
    fieldEl && fieldEl.classList.remove('field-error');
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
    inputElMap.set(inputEl, { errorEl, fieldEl });

    inputEl.checkValidity = inputCheckValidity;
    inputEl.reportValidity = inputReportValidity;

    inputEl.addEventListener('input', inputCheckValidity);
    inputEl.addEventListener('invalid', inputInvalidEventListener);
  }

  return fieldEl;
}

export function removeFieldValidation(fieldEl) {
  for (const inputEl of fieldEl.querySelectorAll('input, select, textarea')) {
    inputEl.removeEventListener('input', inputCheckValidity);
    inputEl.removeEventListener('invalid', inputInvalidEventListener);

    inputEl.checkValidity = inputEl.constructor.prototype.checkValidity;
    inputEl.reportValidity = inputEl.constructor.prototype.reportValidity;

    inputElMap.delete(inputEl);
  }

  return fieldEl;
}

export function addFormValidation(formEl) {
  formElMap.set(formEl, {
    hasAttributeNoValidate: formEl.hasAttribute('novalidate')
  });

  formEl.reportValidity = formReportValidity;
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

  const { hasAttributeNoValidate } = formElMap.get(formEl) || {};
  formEl.reportValidity = formEl.constructor.prototype.reportValidity;
  hasAttributeNoValidate === false && formEl.removeAttribute('novalidate');

  formElMap.delete(formEl);

  return formEl;
}
