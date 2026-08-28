document.addEventListener('DOMContentLoaded', () => {
  // Navigation smooth scrolling for anchor links on current page
  const allNavLinks = document.querySelectorAll('a[href^="#"]');
  allNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          e.preventDefault();
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Floating "Get in touch" widget click event
  const widget = document.getElementById('getInTouchWidget');
  const inquirySection = document.getElementById('inquiry');
  const contactReasonSelect = document.getElementById('contactReason');

  if (widget) {
    widget.addEventListener('click', () => {
      if (inquirySection) {
        inquirySection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          if (contactReasonSelect) {
            contactReasonSelect.focus();
          }
        }, 600);
      } else {
        window.location.href = 'contact.html';
      }
    });
  }

  // Form submission handler
  const form = document.getElementById('networkInquiryForm');
  const successState = document.getElementById('submissionSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple validation check
      const requiredInputs = form.querySelectorAll('[required]');
      let isValid = true;

      requiredInputs.forEach(input => {
        if (input.type === 'checkbox') {
          if (!input.checked) {
            isValid = false;
            input.parentElement.style.color = '#e53e3e';
          } else {
            input.parentElement.style.color = '';
          }
        } else if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = '#e53e3e';
        } else {
          input.style.borderColor = '';
        }
      });

      if (isValid) {
        form.classList.add('hidden');
        if (successState) {
          successState.classList.remove('hidden');
        }
      }
    });
  }
});
