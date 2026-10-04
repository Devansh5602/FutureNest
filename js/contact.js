/* Front-end preview only: never sends, persists or clears a visitor's message. */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const inputs = Array.from(contactForm.querySelectorAll('input, textarea'));
    const referralQuery = new URLSearchParams(window.location.search);
    const referralPlans = { standard: 'Starter, Premium & Pro Plan', elite: 'Elite Plan' };
    const selectedReferralPlan = referralPlans[referralQuery.get('plan')];
    const message = document.getElementById('contact-message');
    if (referralQuery.get('enquiry') === 'referral' && selectedReferralPlan && !message.value) {
      message.value = 'I would like to refer a friend through the ' + selectedReferralPlan + '. Please share the next steps.';
    }

    const serviceNames = new Map([['job-placement', 'Job Placement'], ['background-verification', 'Background Verification'], ['it-training', 'IT Training']]);
    const chosenService = serviceNames.get(referralQuery.get('service'));
    if (chosenService && !message.value) message.value = 'I would like to learn more about ' + chosenService + '. Please share the next steps.';
    const result = document.getElementById('contact-result');
    const status = document.getElementById('contact-status');
    contactForm.querySelector('button[type="submit"]').disabled = false;
    function validate(input) {
      input.setCustomValidity('');
      if (input.value && !input.value.trim()) input.setCustomValidity('Please enter a value, not just spaces.');
      if (input.name === 'phone' && input.value &&
          (!/^[+()\d\s.\-]+$/.test(input.value) || input.value.replace(/\D/g, '').length < 7)) {
        input.setCustomValidity('Please enter a phone number with at least 7 digits.');
      }
    }
    inputs.forEach(input => input.addEventListener('input', () => {
      validate(input);
      result.hidden = true;
    }));
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      inputs.forEach(validate);
      if (!contactForm.reportValidity()) return;
      result.hidden = false;
      status.textContent = 'Your entries are valid. This form is a preview; no message has been sent.';
    });
    document.querySelectorAll('a[href="#contact-form"]').forEach(link => {
      link.addEventListener('click', () => {
        document.getElementById('contact-name').focus({ preventScroll:true });
      });
    });
    // The existing static site has no subscription service; never claim a fake signup.
    const form = document.querySelector('.fn-sub');
    form.addEventListener('submit', event => {
      event.preventDefault();
      document.getElementById('subscription-status').textContent =
        'Online signup is not available yet. Please contact us to request updates.';
    });

    // Keep closed mobile navigation out of the tab order and trap focus while open.
    const menu = document.getElementById('mobile-nav');
    const opener = document.getElementById('hamburger-btn');
    const main = document.getElementById('main-content');
    const footer = document.querySelector('.fn-footer');
    function syncMenu() {
      const open = opener.getAttribute('aria-expanded') === 'true';
      menu.inert = !open;
      main.inert = open;
      footer.inert = open;
      opener.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      if (open) menu.querySelector('a').focus({ preventScroll: true });
    }
    if (menu && opener) {
      syncMenu();
      new MutationObserver(syncMenu).observe(opener, { attributes: true, attributeFilter: ['aria-expanded'] });
      document.addEventListener('keydown', event => {
        if (opener.getAttribute('aria-expanded') !== 'true') return;
        if (event.key === 'Escape') { opener.focus({ preventScroll: true }); return; }
        if (event.key !== 'Tab') return;
        const links = [opener, ...menu.querySelectorAll('a, button')];
        const current = links.indexOf(document.activeElement);
        event.preventDefault();
        links[(current + (event.shiftKey ? -1 : 1) + links.length) % links.length].focus();
      });
      matchMedia('(min-width: 1025px)').addEventListener('change', event => {
        if (event.matches && opener.getAttribute('aria-expanded') === 'true') opener.click();
      });
    }
    // Restore focus even though navigation.js closes the menu earlier in the event.
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && opener.getAttribute('aria-expanded') === 'true') {
        opener.focus({ preventScroll: true });
      }
    }, true);
    document.querySelector('.fn-skip').addEventListener('click', () => main.focus({ preventScroll: true }));
  });
})();
