function getBetterCustomValidityMessage(inputEl) {
  // if (inputEl.validity.customError) {
  //   return;
  // }
  // if (inputEl.validity.badInput) {
  //   return;
  // }
  // if (inputEl.validity.patternMismatch) {
  //   return;
  // }
  // if (inputEl.validity.rangeOverflow) {
  //   return;
  // }
  // if (inputEl.validity.rangeUnderflow) {
  //   return;
  // }
  // if (inputEl.validity.stepMismatch) {
  //   return;
  // }
  // if (inputEl.validity.tooLong) {
  //   return;
  // }
  // if (inputEl.validity.tooShort) {
  //   return;
  // }
  // if (inputEl.validity.typeMismatch) {
  //   return;
  // }
  // if (inputEl.validity.valueMissing) {
  //   return;
  // }
}

// ==
// METHOD OVERRIDES
// ==

function inputCheckValidity(...args) {
  const { setup } = this.formValidation;
  setup();

  return this.constructor.prototype.checkValidity.call(this, ...args);
}

function inputReportValidity(...args) {
  const { setup } = this.formValidation;
  setup();

  return this.constructor.prototype.reportValidity.call(this, ...args);
};

// ==
// EVENT LISTENERS
// ==

function inputInputEventListener(event) {
  inputCheckValidity.call(this);
};

function inputInvalidEventListener(event) {
  // UNCOMMENT WHEN PREVENTING BROWSER ERROR MESSAGE POP UP ON SUBMIT
  // THIS PREVENTS THE POPUP
  // event.preventDefault();

  if (!this.willValidate) {
    return;
  }

  const { errorEl, fieldEl } = this.formValidation;

  if (errorEl) {
    errorEl.textContent = this.validationMessage;
  }

  fieldEl.classList.add('field-error');
};

// ==
// INPUT FORM VALIDATION FUNCTIONS
// ==

function inputFormValidationReset(inputEl) {
  const { fieldEl } = inputEl.formValidation;
  fieldEl.classList.remove('field-error');

  inputEl.validity.customError && inputEl.setCustomValidity('');
}

function inputFormValidationSetup(inputEl) {
  if (!inputEl.willValidate) {
    return;
  }

  const { validators, reset } = inputEl.formValidation;

  reset();

  if (validators) {
    for (const getCustomValidityMessage of validators) {
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
}

function inputFormValidationRemove(inputEl) {
  inputEl.removeEventListener('input', inputInputEventListener);
  inputEl.removeEventListener('invalid', inputInvalidEventListener);

  inputEl.checkValidity = inputEl.constructor.prototype.checkValidity;
  inputEl.reportValidity = inputEl.constructor.prototype.reportValidity;

  const { reset } = inputEl.formValidation;
  reset();

  delete inputEl.formValidation;
}

// ==
// ADD INPUT VALIDATION
// ==

export function addInputValidation(inputEl) {
  if (!inputEl.willValidate || inputEl.formValidation) {
    return;
  }

  const fieldEl = inputEl.closest('.field');
  if (!fieldEl) {
    return;
  }

  inputEl.formValidation = {
    fieldEl,
    errorEl: fieldEl.querySelector('.field-error-text'),
    reset() {
      inputFormValidationReset(inputEl);
    },
    setup() {
      inputFormValidationSetup(inputEl);
    },
    remove() {
      inputFormValidationRemove(inputEl);
    }
  };

  inputEl.checkValidity = inputCheckValidity;
  inputEl.reportValidity = inputReportValidity;

  inputEl.addEventListener('input', inputInputEventListener);
  inputEl.addEventListener('invalid', inputInvalidEventListener);
}

////////////////////////////////////////////////////////////////////////////////

function formSetup(formEl) {
  for (const inputEl of formEl.elements) {
    inputEl.formValidation?.setup?.()
  }
}

// ==
// METHOD OVERRIDE
// ==

function formCheckValidity(...args) {
  formSetup(this);
  return this.constructor.prototype.checkValidity.call(this, ...args);
};

function formReportValidity(...args) {
  formSetup(this);

  const isValid = this.constructor.prototype.reportValidity.call(this, ...args);

  // UNCOMMENT WHEN PREVENTING BROWSER ERROR MESSAGE POP UP ON SUBMIT
  // THIS RESTORE FOCUS FUNCTIONALITY
  // if (!isValid) {
  //   this.querySelector(':invalid')?.focus();
  // }

  return isValid;
};

// ==
// EVENT LISTENERS
// ==

function formResetEventListener(event) {
  for (const inputEl of this.elements) {
    inputEl.formValidation?.reset?.()
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
// FORM FORM VALIDATION FUNCTIONS
// ==

function formFormValidationRemove(formEl) {
  for (const inputEl of formEl.elements) {
    inputEl.formValidation?.remove?.()
  }

  formEl.removeEventListener('reset', formResetEventListener);

  const { hasAttributeNoValidate } = formEl.formValidation;
  hasAttributeNoValidate === false && formEl.removeAttribute('novalidate');
  formEl.removeEventListener('submit', formSubmitEventListener);

  formEl.checkValidity = formEl.constructor.prototype.checkValidity;
  formEl.reportValidity = formEl.constructor.prototype.reportValidity;

  delete formEl.formValidation;
}

// ==
// ADD FORM VALIDATION
// ==

export default function addFormValidation(formEl) {
  if (formEl.formValidation) {
    return;
  }

  formEl.formValidation = {
    hasAttributeNoValidate: formEl.hasAttribute('novalidate'),
    remove() {
      formFormValidationRemove(formEl);
    }
  };

  formEl.checkValidity = formCheckValidity
  formEl.reportValidity = formReportValidity;

  formEl.setAttribute('novalidate', '');
  formEl.addEventListener('submit', formSubmitEventListener);

  formEl.addEventListener('reset', formResetEventListener);

  for (const inputEl of formEl.elements) {
    addInputValidation(inputEl);
  }
}
