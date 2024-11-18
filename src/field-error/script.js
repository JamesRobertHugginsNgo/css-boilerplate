function getBetterCustomValidityMessage(fieldEl, inputEl) {
  if (inputEl.validity.customError) {
    return;
  }
  if (inputEl.validity.badInput) {
    return; // CUSTOMIZE
  }
  if (inputEl.validity.patternMismatch) {
    return; // CUSTOMIZE
  }
  if (inputEl.validity.rangeOverflow) {
    return; // CUSTOMIZE
  }
  if (inputEl.validity.rangeUnderflow) {
    return; // CUSTOMIZE
  }
  if (inputEl.validity.stepMismatch) {
    return; // CUSTOMIZE
  }
  if (inputEl.validity.tooLong) {
    return; // CUSTOMIZE
  }
  if (inputEl.validity.tooShort) {
    return; // CUSTOMIZE
  }
  if (inputEl.validity.typeMismatch) {
    return; // CUSTOMIZE
  }
  if (inputEl.validity.valueMissing) {
    return; // CUSTOMIZE
  }
}

function setupValidity(fieldEl, inputEl) {
  if (!inputEl.willValidate) {
    return;
  }

  fieldEl.classList.contains('field-error') && fieldEl.classList.remove('field-error');
  inputEl.validity.customError && inputEl.setCustomValidity('');

  if (fieldEl.customValidityValidations) {
    for (const getCustomValidityMessage of fieldEl.customValidityValidations) {
      const message = getCustomValidityMessage(fieldEl, inputEl);
      if (message) {
        inputEl.setCustomValidity(message);
        return;
      }
    }
  }
};

function handleInvalid(fieldEl, inputEl, errorEl) {
  if (!inputEl.willValidate) {
    return;
  }

  const message = getBetterCustomValidityMessage(fieldEl, inputEl);
  message && inputEl.setCustomValidity(message);

  errorEl.textContent = inputEl.validationMessage;
  !fieldEl.classList.contains('field-error') && fieldEl.classList.add('field-error');
}

export function addFieldValidation(fieldEl) {
  const errorEl = fieldEl.querySelector('.field-error-text');

  for (const inputEl of fieldEl.querySelectorAll('input, select, textarea')) {
    inputEl.setupValidity = () => {
      setupValidity(fieldEl, inputEl);
    };

    inputEl.originalCheckValidity = inputEl.originalCheckValidity || inputEl.checkValidity;
    inputEl.checkValidity = (...args) => {
      inputEl.setupValidity();
      return inputEl.originalCheckValidity(...args);
    };

    inputEl.originalReportValidity = inputEl.originalReportValidity || inputEl.reportValidity;
    inputEl.reportValidity = (...args) => {
      inputEl.setupValidity();
      return inputEl.originalReportValidity(...args);
    };

    inputEl.inputEventListener = () => void inputEl.checkValidity();
    inputEl.addEventListener('input', inputEl.inputEventListener);

    inputEl.changeEventListener = () => void inputEl.checkValidity();
    inputEl.addEventListener('change', inputEl.changeEventListener);

    inputEl.invalidEventListener = (event) => {
      // UNCOMMENT WHEN PREVENTING BROWSER ERROR MESSAGE POP UP ON SUBMIT
      // event.preventDefault();
      handleInvalid(fieldEl, inputEl, errorEl);
    };
    inputEl.addEventListener('invalid', inputEl.invalidEventListener);
  }

  return fieldEl;
}

export function removeFieldValidation(fieldEl) {
  for (const inputEl of fieldEl.querySelectorAll('input, select, textarea')) {
    if (inputEl.invalidEventListener) {
      inputEl.removeEventListener('invalid', inputEl.invalidEventListener);
      delete inputEl.invalidEventListener;
    }

    if (inputEl.inputEventListener) {
      inputEl.removeEventListener('input', inputEl.inputEventListener);
      delete inputEl.inputEventListener;
    }

    if (inputEl.changeEventListener) {
      inputEl.removeEventListener('change', inputEl.changeEventListener);
      delete inputEl.changeEventListener;
    }

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

export function addFormValidation(formEl) {
  formEl.originalReportValidity = formEl.originalReportValidity || formEl.reportValidity;
  formEl.reportValidity = (...args) => {
    for (const elementEl of formEl.elements) {
      elementEl.setupValidity && elementEl.setupValidity();
    }
    const isValid = formEl.originalReportValidity(...args);
    if (!isValid) {
      // UNCOMMENT WHEN PREVENTING BROWSER ERROR MESSAGE POP UP ON SUBMIT
      // formEl.querySelector('.field-error input, .field-error select, .field-error textarea').focus();
    }
    return isValid;
  };

  formEl.hasNovalidate = formEl.hasAttribute('novalidate');
  !formEl.hasNovalidate && formEl.setAttribute('novalidate', '');

  formEl.submitEventListener = (event) => {
    if (!formEl.reportValidity()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
  };
  formEl.addEventListener('submit', formEl.submitEventListener);

  for (const fieldEl of formEl.querySelectorAll('.field')) {
    addFieldValidation(fieldEl);
  }

  return formEl;
}

export function removeFormValidation(formEl) {
  for (const fieldEl of formEl.querySelectorAll('.field')) {
    removeFieldValidation(fieldEl);
  }

  if (formEl.submitEventListener) {
    formEl.removeEventListener('submit', formEl.submitEventListener);
    delete formEl.submitEventListener;
  }

  !formEl.hasNovalidate && formEl.hasAttribute('novalidate') && formEl.removeAttribute('novalidate');

  if (formEl.originalReportValidity) {
    formEl.reportValidity = formEl.originalReportValidity;
    delete formEl.originalReportValidity;
  }

  return formEl;
}
