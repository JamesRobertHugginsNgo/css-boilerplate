function resetInput(inputEl) {
  const { errorEl, fieldEl } = inputEl.formValidation;

  if (inputEl.validity.customError) {
    inputEl.setCustomValidity('');
  }

  if (fieldEl instanceof HTMLFieldSetElement) {
    const validationMessages = [...fieldEl.elements]
      .map((el) => el.validationMessage)
      .filter((value, index, array) => value && array.indexOf(value) === index);
    if (validationMessages.length > 0) {
      errorEl.textContent = validationMessages.join(', ');
      return;
    }
  }

  fieldEl.classList.remove('field-error');
}

function preValidateInput(inputEl) {
  resetInput(inputEl);

  const { validators } = inputEl.formValidation;

  for (const validator of validators) {
    validator(inputEl);
    if (inputEl.validity.customError) {
      break;
    }
  }
}

function checkInputValidity(inputEl) {
  preValidateInput(inputEl);
  inputEl.checkValidity();
}

// ==
// EVENT LISTENERS
// ==

function inputInputEventListener() {
  checkInputValidity(this);

  const { showValidity } = this.formValidation;
  showValidity();
}

function inputInvalidEventListener() {
  const { errorEl, fieldEl } = this.formValidation;

  if (errorEl) {
    if (fieldEl instanceof HTMLFieldSetElement) {
      const validationMessages = [...fieldEl.elements]
        .map((el) => el.validationMessage)
        .filter((value, index, array) => value && array.indexOf(value) === index);
      errorEl.textContent = validationMessages.join(', ');
    } else {
      errorEl.textContent = this.validationMessage;
    }
  }

  fieldEl.classList.add('field-error');
}

function formResetEventListener() {
  for (const inputEl of this.elements) {
    inputEl.formValidation?.hideValidity();
  }
}

function formSubmitListener(event) {
  for (const inputEl of this.elements) {
    inputEl.formValidation?.showValidity();
  }

  if (!this.reportValidity()) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}

// ==
// ADD INPUT VALIDATION
// ==

export default function addFormValidation(el, callback) {
  if (el.formValidation) {
    return;
  }

  if (el instanceof HTMLFormElement) {
    el.formValidation = {
      novalidate: el.hasAttribute('novalidate')
    };

    el.setAttribute('novalidate', '');

    el.addEventListener('reset', formResetEventListener);
    el.addEventListener('submit', formSubmitListener);

    for (const inputEl of el.elements) {
      addFormValidation(inputEl, callback);
    }

    callback?.(el);

    return;
  }

  if (!el.willValidate) {
    return;
  }

  const fieldEl = el.closest('.field');
  if (!fieldEl) {
    return;
  }

  const resetEventListener = function () {
    setTimeout(function () {
      checkInputValidity(el);
    }, 0);
  };

  el.formValidation = {
    fieldEl,
    errorEl: fieldEl.querySelector('.field-error-text'),
    resetEventListener,
    validators: [],
    checkInputValidity() { // TODO - FIGURE OUT IF THIS IS NEEDED
      checkInputValidity(el);
    },
    hideValidity() {
      fieldEl.classList.remove('field-show-error');
    },
    showValidity() {
      fieldEl.classList.add('field-show-error');
    }
  };

  el.addEventListener('input', inputInputEventListener);
  el.addEventListener('invalid', inputInvalidEventListener);

  el.form.addEventListener('reset', resetEventListener);

  callback?.(el);

  checkInputValidity(el);
}

// ==
// REMOVE INPUT VALIDATION
// ==

export function removeFormValidation(el, callback) {
  if (!el.formValidation) {
    return;
  }

  if (el instanceof HTMLFormElement) {
    callback?.(el);

    for (const inputEl of el.elements) {
      removeFormValidation(inputEl);
    }

    el.removeEventListener('reset', formResetEventListener);
    el.removeEventListener('submit', formSubmitListener);

    const { novalidate = true } = el.formValidation;
    if (!novalidate) {
      el.removeAttribute('novalidate');
    }

    delete el.formValidation;

    return;
  }

  callback?.(el);

  resetInput(el);

  const { resetEventListener } = el.formValidation;
  el.form.removeEventListener('reset', resetEventListener);

  el.removeEventListener('input', inputInputEventListener);
  el.removeEventListener('invalid', inputInvalidEventListener);

  delete el.formValidation;
}
