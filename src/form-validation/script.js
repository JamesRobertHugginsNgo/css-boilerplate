function resetInput(inputEl) {
  const { fieldEl } = inputEl.formValidation;
  fieldEl.classList.remove('field-error');

  inputEl.validity.customError && inputEl.setCustomValidity('');
}

function preValidateInput(inputEl) {
  resetInput(inputEl);

  const { validators } = inputEl.formValidation;
  for (const validator of validators) {
    validator(inputEl);
    if (inputEl.validity.customError) {
      return;
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

  const { fieldEl } = this.formValidation;
  fieldEl.classList.add('field-show-error');
}

function inputInvalidEventListener() {
  const { errorEl, fieldEl } = this.formValidation;

  if (errorEl) {
    errorEl.textContent = this.validationMessage;
  }

  fieldEl.classList.add('field-error');
}

function formResetEventListener() {
  for (const inputEl of this.elements) {
    inputEl.formValidation?.hide();
  }
}

function formSubmitListener(event) {
  for (const inputEl of this.elements) {
    inputEl.formValidation?.show();
  }

  if (!this.reportValidity()) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}

// ==
// ADD INPUT VALIDATION
// ==

export default function addFormValidation(el, validators = []) {
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
      addFormValidation(inputEl, validators);
    }

    return
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
    validators,
    hide() {
      fieldEl.classList.remove('field-show-error');
    },
    show() {
      fieldEl.classList.add('field-show-error');
    }
  };

  el.addEventListener('input', inputInputEventListener);
  el.addEventListener('invalid', inputInvalidEventListener);

  el.form.addEventListener('reset', resetEventListener);

  checkInputValidity(el);
}

// ==
// REMOVE INPUT VALIDATION
// ==

export function removeFormValidation(el) {
  if (!el.formValidation) {
    return;
  }

  if (el instanceof HTMLFormElement) {
    for (const inputEl of el.elements) {
      removeFormValidation(inputEl);
    }

    el.removeEventListener('reset', formResetEventListener);
    el.removeEventListener('submit', formSubmitListener);

    const { novalidate } = el.formValidation;
    !novalidate && el.removeAttribute('novalidate');

    delete el.formValidation;

    return;
  }

  resetInput(el);

  const { resetEventListener } = el.formValidation;
  el.form.removeEventListener('reset', resetEventListener);

  el.removeEventListener('input', inputInputEventListener);
  el.removeEventListener('invalid', inputInvalidEventListener);

  delete el.formValidation;
}
