/* Casegalleri: Ét billede ad gangen, pile, swipe og lightbox.
   Finder automatisk billeder med class="case-detail-image" direkte i
   .case-detail-media. Tilføj flere <img> i HTML for flere slides.
   Denne fil påvirker ikke forsiden. */
(() => {
  const arrowIcon = (right) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${right ? 'M8.5 5l7 7-7 7' : 'M15.5 5l-7 7 7 7'}"/></svg>`;
  document.querySelectorAll('.case-detail-media').forEach((media) => {
    const images = Array.from(media.children).filter(
      (element) => element.matches('img.case-detail-image')
    );
    if (!images.length) return;

    // Husk hvor det første billede stod, før billederne flyttes ind i slideren.
    const position = document.createComment('Galleri placeres her');
    media.insertBefore(position, images[0]);

    const slider = document.createElement('div');
    slider.className = 'case-gallery-slider';
    slider.setAttribute('role', 'region');
    slider.setAttribute('aria-label', 'Billedgalleri fra projektet');

    const stage = document.createElement('div');
    stage.className = 'case-gallery-slider__stage';
    const imageButtons = images.map((img, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'case-gallery-slider__open';
      button.setAttribute('aria-label', `Vis billede ${index + 1} i stor størrelse`);
      button.appendChild(img);
      stage.appendChild(button);
      return button;
    });

    const previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'case-gallery-slider__arrow case-gallery-slider__arrow--prev';
    previous.setAttribute('aria-label', 'Forrige billede');
    previous.innerHTML = arrowIcon(false);

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'case-gallery-slider__arrow case-gallery-slider__arrow--next';
    next.setAttribute('aria-label', 'Næste billede');
    next.innerHTML = arrowIcon(true);

    // Placerer slideren, hvor det første billede stod, og samler alle billederne.
    // Eventuelle videoelementer i .case-detail-media bliver stående.
    media.replaceChild(slider, position);
    slider.append(stage, previous, next);

    const dialog = document.createElement('dialog');
    dialog.className = 'case-lightbox';
    dialog.setAttribute('aria-label', 'Billede i stor størrelse');
    dialog.innerHTML = `
      <button class="case-lightbox__close" type="button" aria-label="Luk">&times;</button>
      <button class="case-lightbox__arrow case-lightbox__arrow--prev" type="button" aria-label="Forrige billede">${arrowIcon(false)}</button>
      <figure class="case-lightbox__figure">
        <img class="case-lightbox__image" alt="" />
      </figure>
      <button class="case-lightbox__arrow case-lightbox__arrow--next" type="button" aria-label="Næste billede">${arrowIcon(true)}</button>
    `;
    document.body.appendChild(dialog);

    const fullImage = dialog.querySelector('.case-lightbox__image');
    const modalPrevious = dialog.querySelector('.case-lightbox__arrow--prev');
    const modalNext = dialog.querySelector('.case-lightbox__arrow--next');
    const modalClose = dialog.querySelector('.case-lightbox__close');
    let currentIndex = 0;
    let lastSwipe = -Infinity;
    const multiple = images.length > 1;

    previous.hidden = !multiple;
    next.hidden = !multiple;
    modalPrevious.hidden = !multiple;
    modalNext.hidden = !multiple;

    let dragOffset = 0;
    let initialized = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function show(index) {
      const old = currentIndex;
      const direction = index >= old ? 1 : -1;
      currentIndex = (index + images.length) % images.length;
      const changed = initialized && old !== currentIndex;
      imageButtons.forEach((button, i) => {
        button.getAnimations().forEach(animation => animation.cancel());
        button.hidden = i !== currentIndex;
      });
      if (changed && !reducedMotion.matches && !dialog.open) {
        const outgoing = imageButtons[old];
        const incoming = imageButtons[currentIndex];
        outgoing.hidden = false;
        outgoing.inert = true;
        incoming.inert = false;
        const options = { duration: 1000, easing: 'cubic-bezier(.22,.8,.25,1)' };
        const exit = outgoing.animate([{transform:`translateX(${dragOffset}px)`}, {transform:`translateX(${-direction * 100}%)`}], options);
        incoming.animate([{transform:`translateX(calc(${direction * 100}% + ${dragOffset}px))`}, {transform:'translateX(0)'}], options);
        exit.onfinish = () => { if (currentIndex !== old) outgoing.hidden = true; };
      }
      imageButtons.forEach((button, i) => { button.inert = i !== currentIndex; });
      if (dialog.open) {
        const img = images[currentIndex];
        fullImage.src = img.currentSrc || img.src;
        fullImage.alt = img.alt || 'Billede fra projektet';
        fullImage.getAnimations().forEach(animation => animation.cancel());
        if (changed && !reducedMotion.matches) fullImage.animate([
          { opacity: .35, transform: `translateX(${direction * 20}px)` },
          { opacity: 1, transform: 'translateX(0)' }
        ], { duration: 260, easing: 'ease-out' });
      }
      dragOffset = 0;
      initialized = true;
    }

    function openLarge(index) {
      show(index);
      const img = images[currentIndex];
      fullImage.src = img.currentSrc || img.src;
      fullImage.alt = img.alt || 'Billede fra projektet';
      dialog.showModal();
      modalClose.focus();
    }

    // Swipe vandret; lodret scroll på mobil fungerer stadig som normalt.
    function enableSwipe(element, change) {
      let startX = 0;
      let startY = 0;
      let active = false;
      let axis = null;
      const preview = element === stage;
      function reset() {
        imageButtons.forEach(button => { button.style.transform = ''; });
        dragOffset = 0;
        active = false;
      }
      element.addEventListener('touchstart', (event) => {
        if (!multiple || event.touches.length !== 1) { reset(); return; }
        active = true;
        axis = null;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
      }, { passive: true });
      element.addEventListener('touchmove', (event) => {
        if (!active || !preview || reducedMotion.matches || event.touches.length !== 1) return;
        const dx = event.touches[0].clientX - startX;
        const dy = event.touches[0].clientY - startY;
        if (!axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'x' : 'y';
        if (axis !== 'x') return;
        dragOffset = Math.max(-stage.clientWidth * .65, Math.min(stage.clientWidth * .65, dx));
        imageButtons[currentIndex].style.transform = `translateX(${dragOffset}px)`;
      }, { passive: true });
      element.addEventListener('touchcancel', reset, { passive: true });
      element.addEventListener('touchend', (event) => {
        if (!active || event.changedTouches.length !== 1) { reset(); return; }
        const dx = event.changedTouches[0].clientX - startX;
        const dy = event.changedTouches[0].clientY - startY;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          lastSwipe = performance.now();
          imageButtons.forEach(button => { button.style.transform = ''; });
          change(dx < 0 ? 1 : -1);
        } else if (preview && dragOffset && !reducedMotion.matches) {
          imageButtons[currentIndex].animate([{transform:`translateX(${dragOffset}px)`},{transform:"translateX(0)"}], {duration:220,easing:"ease-out"});
        }
        reset();
      }, { passive: true });
    }

    // Vandret swipe med to fingre på trackpad/mousepad.
    // Kun tydeligt vandrette bevægelser håndteres, så sidens lodrette scroll bevares.
    function enableTrackpad(element, change) {
      let distanceX = 0;
      let previousEventTime = -Infinity;
      let changedInGesture = false;

      element.addEventListener('wheel', (event) => {
        if (!multiple || event.ctrlKey) return; // Ctrl + scroll bruges ofte til zoom.

        const horizontal = Math.abs(event.deltaX);
        const vertical = Math.abs(event.deltaY);
        if (horizontal < 2 || horizontal <= vertical * 1.2) return;

        // Undgå at browseren navigerer tilbage/frem ved vandret trackpad-swipe.
        event.preventDefault();
        const now = performance.now();

        // En pause i wheel-events betyder en ny swipe-bevægelse.
        if (now - previousEventTime > 220) {
          distanceX = 0;
          changedInGesture = false;
        }
        previousEventTime = now;
        if (changedInGesture) return;

        const unit = event.deltaMode === 1 ? 16 :
          event.deltaMode === 2 ? element.clientWidth : 1;
        distanceX += event.deltaX * unit;

        if (Math.abs(distanceX) >= 45) {
          changedInGesture = true;
          change(distanceX > 0 ? 1 : -1);
        }
      }, { passive: false });
    }

    imageButtons.forEach((button, index) => {
      button.addEventListener('click', (event) => {
        // Undgå, at et swipe efterfølges af et utilsigtet klik.
        if (performance.now() - lastSwipe < 450) {
          event.preventDefault();
          return;
        }
        openLarge(index);
      });
    });

    previous.addEventListener('click', () => show(currentIndex - 1));
    next.addEventListener('click', () => show(currentIndex + 1));
    slider.addEventListener('keydown', (event) => {
      if (!multiple || dialog.open) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        show(currentIndex + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    enableSwipe(stage, (direction) => show(currentIndex + direction));
    enableTrackpad(slider, (direction) => show(currentIndex + direction));

    modalPrevious.addEventListener('click', () => show(currentIndex - 1));
    modalNext.addEventListener('click', () => show(currentIndex + 1));
    modalClose.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      imageButtons[currentIndex].focus();
    });
    dialog.addEventListener('keydown', (event) => {
      if (!multiple) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        show(currentIndex + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    enableSwipe(dialog.querySelector('.case-lightbox__figure'),
      (direction) => show(currentIndex + direction));
    enableTrackpad(dialog.querySelector('.case-lightbox__figure'),
      (direction) => show(currentIndex + direction));

    show(0);
  });
})();
