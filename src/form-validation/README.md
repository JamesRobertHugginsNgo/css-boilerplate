# Form Validation

## Add Form Validation Function

``` JavaScript
import addFormValidation from './script.js';
addFormValidation(document.querySelector('form'));
```

### Setups Validation

Overrides the form's `checkValidity` and `reportValidity` methods to include a call to the input's `formValidation.setup` function, if it has one, before calling the original method. This hook allows the input to perform ui cleanup and set a custom error message.

From testing, the form's default `checkValidity` and `reportValidity` methods did not trigger the input's equivalent methods requiring the override.

Also from testing, the default form validation does not call neither the form's `checkValidity` method nor the `reportValidity` method. The function adds a `novalidate` attribute to stop the default validation and adds a `"submit"` event listener that calls its `reportValidity` method and stop event propagation if it returns `false`.

### Reset With Cleanup

Adds a `"reset"` event listener that calls the input's `formValidation.reset` function. This hook allows the input to perform ui cleanup.

### Adds Input Form Validation

Loops all the form's elements and uses the `addInputValidation` function to initialize it.

### Remove Function

Adds `formValidation.remove` function to the form, that can be used to remove changes made by this function.

## Add Input Validation Function

``` JavaScript
import { addInputValidation } from './script.js';
addInputValidation(document.querySelector('input'));
```

Adds form vallidation functionality to an input that does not yet have the `formValidation` property and is within an element with `field` class name.

## Resources

- https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement
