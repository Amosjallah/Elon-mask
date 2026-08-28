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

  // ==========================================================================
  // Address Autocomplete Options Feature
  // ==========================================================================
  const addressInput = document.getElementById('address');
  const addressDropdown = document.getElementById('addressDropdown');
  const cityInput = document.getElementById('city');
  const zipInput = document.getElementById('zipCode');
  const countrySelect = document.getElementById('country');

  // Curated database of standard addresses with associated city & zip
  const sampleAddresses = [
    { street: "45500 Fremont Blvd", city: "Fremont", state: "CA", zip: "94538", country: "US" },
    { street: "1 Tesla Road", city: "Austin", state: "TX", zip: "78725", country: "US" },
    { street: "350 5th Ave", city: "New York", state: "NY", zip: "10118", country: "US" },
    { street: "1600 Amphitheatre Pkwy", city: "Mountain View", state: "CA", zip: "94043", country: "US" },
    { street: "1 Apple Park Way", city: "Cupertino", state: "CA", zip: "95014", country: "US" },
    { street: "100 California St", city: "San Francisco", state: "CA", zip: "94111", country: "US" },
    { street: "500 Howard St", city: "San Francisco", state: "CA", zip: "94105", country: "US" },
    { street: "742 Evergreen Terrace", city: "Springfield", state: "OR", zip: "97477", country: "US" },
    { street: "200 Park Ave", city: "New York", state: "NY", zip: "10166", country: "US" },
    { street: "10 Downing Street", city: "London", state: "Greater London", zip: "SW1A 2AA", country: "UK" },
    { street: "221B Baker Street", city: "London", state: "Greater London", zip: "NW1 6XE", country: "UK" },
    { street: "100 Bay Street", city: "Toronto", state: "ON", zip: "M5J 2N8", country: "CA" },
    { street: "1 Martin Place", city: "Sydney", state: "NSW", zip: "2000", country: "AU" },
    { street: "Friedrichstraße 44", city: "Berlin", state: "Berlin", zip: "10117", country: "DE" },
    { street: "10 Avenue des Champs-Élysées", city: "Paris", state: "Île-de-France", zip: "75008", country: "FR" },
    { street: "Roppongi Hills 6-10-1", city: "Minato", state: "Tokyo", zip: "106-6108", country: "JP" },
    { street: "1 Raffles Place", city: "Singapore", state: "Singapore", zip: "048616", country: "SG" },
    { street: "Sheikh Zayed Rd, Downtown", city: "Dubai", state: "Dubai", zip: "00000", country: "UAE" }
  ];

  let selectedIndex = -1;

  if (addressInput && addressDropdown) {
    function getMatchingAddresses(query) {
      const q = query.trim().toLowerCase();
      if (!q) {
        return sampleAddresses.slice(0, 5);
      }

      let matches = sampleAddresses.filter(item => 
        item.street.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.zip.toLowerCase().includes(q)
      );

      if (matches.length < 5) {
        const dynamicSuffixes = [
          { suffix: "St", city: "New York", zip: "10001" },
          { suffix: "Ave", city: "Los Angeles", zip: "90001" },
          { suffix: "Blvd", city: "Austin", zip: "78701" },
          { suffix: "Rd", city: "San Francisco", zip: "94101" },
          { suffix: "Way", city: "Chicago", zip: "60601" }
        ];

        const cleanQ = query.trim();
        dynamicSuffixes.forEach(ds => {
          if (matches.length < 6) {
            const formattedStreet = cleanQ.match(/\b(st|ave|blvd|rd|way|drive|dr|lane|ln)\b/i) 
              ? cleanQ 
              : `${cleanQ} ${ds.suffix}`;
            const fullAdd = {
              street: formattedStreet.charAt(0).toUpperCase() + formattedStreet.slice(1),
              city: ds.city,
              state: "CA",
              zip: ds.zip,
              country: "US"
            };
            if (!matches.some(m => m.street.toLowerCase() === fullAdd.street.toLowerCase())) {
              matches.push(fullAdd);
            }
          }
        });
      }

      return matches.slice(0, 6);
    }

    function renderDropdown(matches, query) {
      if (!matches.length) {
        addressDropdown.innerHTML = `<div class="address-suggestion-item" style="color: #718096; cursor: default;">No matching addresses found</div>`;
        addressDropdown.classList.remove('hidden');
        return;
      }

      const svgPin = `<svg class="address-suggestion-icon" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

      addressDropdown.innerHTML = matches.map((item, idx) => {
        const fullDisplay = `${item.street}, ${item.city}, ${item.zip}`;
        let highlightedText = fullDisplay;
        
        if (query && query.trim()) {
          const reg = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
          highlightedText = fullDisplay.replace(reg, '<strong>$1</strong>');
        }

        return `<div class="address-suggestion-item ${idx === selectedIndex ? 'active' : ''}" data-index="${idx}">
          ${svgPin}
          <span class="address-suggestion-text">${highlightedText}</span>
        </div>`;
      }).join('');

      addressDropdown.classList.remove('hidden');

      const items = addressDropdown.querySelectorAll('.address-suggestion-item[data-index]');
      items.forEach(el => {
        el.addEventListener('mousedown', (e) => {
          e.preventDefault();
          const idx = parseInt(el.getAttribute('data-index'), 10);
          selectAddress(matches[idx]);
        });
      });
    }

    function selectAddress(item) {
      if (!item) return;
      addressInput.value = item.street;
      if (cityInput && item.city) {
        cityInput.value = item.city;
      }
      if (zipInput && item.zip) {
        zipInput.value = item.zip;
      }
      if (countrySelect && item.country) {
        countrySelect.value = item.country;
      }
      hideDropdown();
    }

    function hideDropdown() {
      addressDropdown.classList.add('hidden');
      selectedIndex = -1;
    }

    addressInput.addEventListener('input', () => {
      selectedIndex = -1;
      const matches = getMatchingAddresses(addressInput.value);
      renderDropdown(matches, addressInput.value);
    });

    addressInput.addEventListener('focus', () => {
      const matches = getMatchingAddresses(addressInput.value);
      renderDropdown(matches, addressInput.value);
    });

    addressInput.addEventListener('keydown', (e) => {
      const items = addressDropdown.querySelectorAll('.address-suggestion-item[data-index]');
      if (addressDropdown.classList.contains('hidden') || !items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        const matches = getMatchingAddresses(addressInput.value);
        renderDropdown(matches, addressInput.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        const matches = getMatchingAddresses(addressInput.value);
        renderDropdown(matches, addressInput.value);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const matches = getMatchingAddresses(addressInput.value);
        if (matches[selectedIndex]) {
          selectAddress(matches[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        hideDropdown();
      }
    });

    document.addEventListener('click', (e) => {
      if (!addressInput.contains(e.target) && !addressDropdown.contains(e.target)) {
        hideDropdown();
      }
    });
  }

  // ==========================================================================
  // Video Player Click Handler (Plays Video when clicked anywhere on the site)
  // ==========================================================================
  const mediaVideoBoxes = document.querySelectorAll('.media-video-box');

  mediaVideoBoxes.forEach(box => {
    box.style.cursor = 'pointer';

    box.addEventListener('click', () => {
      const videoSrc = box.getAttribute('data-video') || 'ev.mp4';
      let videoElem = box.querySelector('video');

      // If a video element exists but its src points to an image file, fix the src to the video file
      if (videoElem && (videoElem.src.includes('.jpg') || videoElem.src.includes('.jpeg') || videoElem.src.includes('.png') || !videoElem.controls)) {
        videoElem.src = videoSrc;
        videoElem.controls = true;
        videoElem.autoplay = true;
        videoElem.playsInline = true;
        videoElem.setAttribute('playsinline', '');
        videoElem.style.width = '100%';
        videoElem.style.height = '100%';
        videoElem.style.objectFit = 'cover';
      }

      if (!videoElem) {
        // Create HTML5 video element
        videoElem = document.createElement('video');
        videoElem.src = videoSrc;
        videoElem.controls = true;
        videoElem.autoplay = true;
        videoElem.playsInline = true;
        videoElem.setAttribute('playsinline', '');
        videoElem.style.width = '100%';
        videoElem.style.height = '100%';
        videoElem.style.objectFit = 'cover';

        // Hide static image thumbnail & play button overlay
        const img = box.querySelector('img');
        const playBtn = box.querySelector('.play-btn-overlay');
        if (img) img.style.display = 'none';
        if (playBtn) playBtn.style.display = 'none';

        box.appendChild(videoElem);
      }

      // Hide play button if present
      const playBtn = box.querySelector('.play-btn-overlay');
      if (playBtn) playBtn.style.display = 'none';

      // Play video
      videoElem.play().catch(err => {
        console.log('Video play trigger:', err);
      });
    });
  });
});
