

(function() {})();
  /**
 * Initializing regex for emai, name, phone, zip and storing theme globally 
 * handle used to store current handle on the basis of which conditions  can be applied
 */

let selectors={
    'email_pattern': /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    'name_pattern': /^[A-Za-z\s\-]+$/,
    'phone_pattern': /^[0-9]+$/,
    'zip_pattern': /^[0-9-a-z-A-Z]+$/,
    'handle' : (location.href).split('/')[4]
  },
  initialiseSelectors = (selectors, handle) => {
    switch(handle){
      case 'login': {
        ['[action="/account/login"]', '[action="/account/recover"]'].forEach((formSelector, index)=>{
          let form = document.querySelector(formSelector),
          submitBtn=form.querySelector('[type="submit"]'),
          inputFields=(index==0)?(form.querySelectorAll('[name*=customer]')):(form.querySelector('[name="email"]'));
          createErrorContainer(form, index);
          (index==0)?(addEventsToMultipleFields(form, submitBtn, inputFields, selectors, 'customer')):(addEventsToSingleField(form, submitBtn, inputFields, selectors));
        });
        break;
      }
      case 'register': {
        let form = document.querySelector('[action="/account"]'),
        // console.log(form);
        submitBtn=form.querySelector('[type="submit"]'),
        inputFields= form.querySelectorAll('[name*=customer]');
        createErrorContainer(form, 0); 
        addEventsToMultipleFields(form, submitBtn, inputFields, selectors, 'customer');
        break;
      }
      case 'addresses': {
        let form=document.querySelector('[action="/account/addresses"]'),
        submitBtn=form.querySelector('button'),
        inputFields= form.querySelectorAll('[name*=address]');
        createErrorContainer(form, 0); 
        addEventsToMultipleFields(form, submitBtn, inputFields, selectors, 'address');
        break;
      }
      case 'contact-us': {
        /**
         * here we need to add custom class to contact us form because there can be multiple Contact forms including footer newsletter and newsletter popups 
         */
        let form=document.querySelector('[action="/contact#contact_form"]'),
        submitBtn=form.querySelector('[type="submit"]'),
        inputFields= form.querySelectorAll('[name*=contact]');
        createErrorContainer(form, 0); 
        addEventsToMultipleFields(form, submitBtn, inputFields, selectors, 'contact');
        break;
      }
      case 'reset': {
        let form=document.querySelector('[action="/account/reset"]'),
        submitBtn=form.querySelector('button'),
        inputFields= form.querySelectorAll('[name*=customer]');
        createErrorContainer(form, 0); 
        addEventsToMultipleFields(form, submitBtn, inputFields, selectors, 'customer');
        break;
      }
      case 'login#recover': {
        initialiseSelectors(selectors, 'login');
        break;
      }
      case 'contact': {
        initialiseSelectors(selectors, 'contact-us');
        break;
      }
    }
  },
  createErrorContainer = (form, index) =>{
    let errorHtml=`<span class="error-svg-container"> <svg focusable="false" width="18" height="26" class="icon icon--form-error" viewBox="0 0 18 26"> <circle cx="9" cy="13" r="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"></circle> <path d="M8.993 15.262a.972.972 0 00-.979.968c0 .539.44.99.98.99a.99.99 0 00.978-.99.972.972 0 00-.979-.968zm-.78-.649h1.561V8.706H8.212v5.907z" fill="currentColor"></path> </svg> </span> <span class="form--error">**Email required</span>`,
      styleHtml=`<style>.form--error-container{color:red;text-align:center;font-size:16px;margin-bottom:24px;background:#fdf0f0;padding:13px 18px;display:flex;justify-content:flex-start}.error-svg-container{margin-right:10px}.hide{display:none!important}[type=submit]:disabled{cursor:not-allowed!important}</style>`;
    (index==0)?(document.head.innerHTML+=styleHtml):(document.head.innerHTML+='');
    const newNode = document.createElement("div");
    newNode.classList.add('form--error-container', 'hide');
    form.insertBefore(newNode, form.querySelectorAll('input')[0]);
    form.querySelector('.form--error-container').innerHTML=errorHtml;
  },
  addEventsToMultipleFields = (form, button, inputFields, selectors, formType) => {
    disableSubmitBtn(button, true);
    inputFields.forEach((field)=>{
      let fieldType=(field.getAttribute('name').split(formType+'[')[1]).split(']')[0];
      (['last_name', 'first_name', 'email', 'name', 'country', 'city', 'phone', 'address1', 'zip', 'password', 'password_confirmation'].includes(fieldType))?((['last_name', 'country'].includes(fieldType))?(field.setAttribute('data-status', 'true')):(field.setAttribute('data-status', 'false'))):(field.setAttribute('no-status', ''));
      ['input', 'blur', 'change'].forEach(evt => {
        field.addEventListener(evt, (e)=>{
          validateDetails(form, button, e.currentTarget, selectors, fieldType);
        });
      });
    });
  },
  addEventsToSingleField = (form, button, inputField, selectors) =>{
    disableSubmitBtn(button, true);
    ['input', 'blur', 'change'].forEach(evt => {
      inputField.addEventListener(evt, (e)=>{
        validateDetails(form, button, e.currentTarget, selectors, 'email');
      })
    })
  },
  disableSubmitBtn = (button, status) => {
    (status)?(button.setAttribute('disabled','')):(button.removeAttribute('disabled'));
  },
  validateDetails = (form, button, field, selectors, type) => {
    let isBlank=(field.value=='')?(true):(false),
    errorSpan = form.querySelector('.form--error-container .form--error');
    switch(type){
      case 'email': {
        let isInvalidString = (!field.value.match(selectors.email_pattern) || field.value.match(selectors.phone_pattern))?(true):(false);
        (isBlank)?(manageError('Email required', errorSpan, field, button, form)):((isInvalidString)?(manageError('Invalid Email.', errorSpan, field, button, form)):(manageError('', errorSpan, field, button, form)));
        break;
      }
      case 'password': {
        let isShortString=(field.value.length<8)?(true):(false),
        isResetPasswordError=((selectors.handle=='reset') && ((form.querySelector('[name="customer[password_confirmation]"]').value).length>7))?(true):(false);
        (isBlank)?(manageError('Password required', errorSpan, field, button, form)):((isShortString)?(manageError('Min. 8 characters required', errorSpan, field, button, form)):(manageError('', errorSpan, field, button, form), (isResetPasswordError)?(validateDetails(form, button, form.querySelector('[name="customer[password_confirmation]"]'), selectors, 'password_confirmation')):(console.log())));
        break;
      }
      case 'first_name': {
        let isInvalidString=(!field.value.match(selectors.name_pattern))?(true):(false),
        isShortString=(field.value.length<3)?(true):(false);
        (isBlank)?(manageError('Name required', errorSpan, field, button, form)):((isInvalidString)?(manageError('Invalid name', errorSpan, field, button, form)):((isShortString)?(manageError('Min. 3 characters required', errorSpan, field, button, form)):(manageError('', errorSpan, field, button, form))));
        break;
      }
      case 'last_name': {
        let isInvalidString=(!field.value.match(selectors.name_pattern))?(true):(false);
        (isBlank)?(manageError('', errorSpan, field, button, form)):((isInvalidString)?(manageError('Invalid Last name', errorSpan, field, button, form)):(manageError('', errorSpan, field, button, form)));
        break;
      }
      case 'phone': {
        let isInvalidString=(!field.value.match(selectors.phone_pattern))?(true):(false),
        isInvalidlength=(field.value.length<8 || field.value.length > 15)?(true):(false);
        (isBlank)?(manageError('Phone required', errorSpan, field, button, form)):((isInvalidString)?(manageError('Invalid Phone Number', errorSpan, field, button, form)):((isInvalidlength)?(manageError('Digit count should be between 8-15', errorSpan, field, button, form)):(manageError('', errorSpan, field, button, form))));
        break;
      }
      case 'address1': {
        let isShortString=(field.value.length<3)?(true):(false);
        (isBlank)?(manageError('Address required', errorSpan, field, button, form)):((isShortString)?(manageError('Min. 3 characters required', errorSpan, field, button, form)):(manageError('', errorSpan, field, button, form)));
        break;
      }
      case 'city': {
        let isInvalidString=(!field.value.match(selectors.name_pattern))?(true):(false),
        isShortString=(field.value.length<3)?(true):(false);
        (isBlank)?(manageError('City required', errorSpan, field, button, form)):((isInvalidString)?(manageError('Invalid City', errorSpan, field, button, form)):((isShortString)?(manageError('Min. 3 characters required', errorSpan, field, button, form)):(manageError('', errorSpan, field, button, form))));
        break;
      }
      case 'zip': {
        let isInvalidString=(!field.value.match(selectors.zip_pattern))?(true):(false),
        isShortString=(field.value.length<3)?(true):(false);
        (isBlank)?(manageError('Zip Code required', errorSpan, field, button, form)):((isInvalidString)?(manageError('Invalid Zip Code', errorSpan, field, button, form)):((isShortString)?(manageError('Min. 3 characters required', errorSpan, field, button, form)):(manageError('', errorSpan, field, button, form))));
        break;
      }
      case 'country': {
        let isInvalidString=(field.value.includes('-'))?(true):(false);
        (isInvalidString)?(manageError('Select Country', errorSpan, field, button, form)):(manageError('', errorSpan, field, button, form));
        break;
      }
      case 'name': {
        validateDetails(form, button, field, selectors, 'first_name');
        break;
      }
      case 'password_confirmation': {
        let isShortString=(field.value.length<8)?(true):(false),
        isNotSame = ((form.querySelector('[name="customer[password]"]').value)!=field.value)?(true):(false);
        (isBlank)?(manageError('Confirm password required', errorSpan, field, button, form)):((isShortString)?(manageError('Min. 8 characters required', errorSpan, field, button, form)):((isNotSame)?(manageError('Both passwords should be same', errorSpan, field, button, form)):(manageError('', errorSpan, field, button, form))));
        break;
      }
    }  
  },
  manageError = (message, errorSpan, field, button, form) => {
    (message.trim()!='')?(errorSpan.innerHTML=message, field.setAttribute('data-status', 'false'), errorSpan.parentElement.classList.remove('hide'), disableSubmitBtn(button, true)):(errorSpan.innerHTML='', field.setAttribute('data-status', 'true'), errorSpan.parentElement.classList.add('hide'), checkStatus(form, button));
  },
  checkStatus = (form, button) => {
    let inputFields=form.querySelectorAll('[data-status]'), trueStatus=0;
    inputFields.forEach((field)=>{
      (field.getAttribute('data-status')=='true')?(trueStatus+=1):(trueStatus+=0);
    });
    (trueStatus==inputFields.length)?(disableSubmitBtn(button, false)):(disableSubmitBtn(button, true));
  };
setTimeout(()=>{
initialiseSelectors(selectors, selectors.handle);}, 1500)
