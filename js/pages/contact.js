(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contact-form');
    const inputs = Array.from(contactForm.querySelectorAll('input, textarea'));
    const referralQuery = new URLSearchParams(window.location.search);
    const referralPlans = { standard: 'Starter, Premium & Pro Plan', elite: 'Elite Plan' };
    const selectedReferralPlan = referralPlans[referralQuery.get('plan')];
    const message = document.getElementById('contact-message');

    if (referralQuery.get('enquiry') === 'referral' && selectedReferralPlan && !message.value) {
      message.value = 'I would like to refer a friend through the ' + selectedReferralPlan + '. Please share the next steps.';
    }

    const serviceNames = new Map([
      ['job-placement', 'Job Placement'],
      ['background-verification', 'Background Verification'],
      ['it-training', 'IT Training']
    ]);
    const chosenService = serviceNames.get(referralQuery.get('service'));
    if (chosenService && !message.value) {
      message.value = 'I would like to learn more about ' + chosenService + '. Please share the next steps.';
    }

    const result = document.getElementById('contact-result');
    const status = document.getElementById('contact-status');
    contactForm.querySelector('button[type="submit"]').disabled = false;

    function validate(input) {
      input.setCustomValidity('');
      if (input.value && !input.value.trim()) {
        input.setCustomValidity('Please enter a value, not just spaces.');
      }
      if (input.name === 'phone' && input.value &&
          (!/^[+()\d\s.\-]+$/.test(input.value) || input.value.replace(/\D/g, '').length < 7)) {
        input.setCustomValidity('Please enter a phone number with at least 7 digits.');
      }
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        validate(input);
        result.hidden = true;
      });
    });

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      inputs.forEach(validate);
      if (!contactForm.reportValidity()) return;
      result.hidden = false;
      status.textContent = 'Your entries are valid. Thank you! Your inquiry has been prepared for info@futurenestplacements.com (in preview mode, no message has been sent).';
    });

    document.querySelectorAll('a[href="#contact-form"]').forEach(function (link) {
      link.addEventListener('click', function () {
        document.getElementById('contact-name').focus({ preventScroll: true });
      });
    });
  });
})();
