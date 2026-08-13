(() => {
  const clamp = (n, min = 0, max = 1) => Math.min(Math.max(n, min), max);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCompact = () => window.innerWidth <= 860;

  const progressBar = document.getElementById('page-progress-bar');
  const front = document.querySelector('[data-chapter="front"]');
  const back = document.querySelector('[data-chapter="back"]');
  const frontStates = [...document.querySelectorAll('[data-copy-step]')];
  const backStates = [...document.querySelectorAll('[data-back-step]')];
  const frontCounter = document.getElementById('front-step-counter');
  const backCounter = document.getElementById('back-step-counter');
  const frontRail = document.getElementById('front-rail');
  const backRail = document.getElementById('back-rail');
  const valueOrbit = document.getElementById('value-orbit');
  const frontPortrait = document.querySelector('.front-visual .portrait-stage');
  const backPortrait = document.querySelector('.back-visual .portrait-stage');
  const navLinks = [...document.querySelectorAll('[data-nav]')];

  const chapterProgress = section => {
    if (!section) return 0;
    const rect = section.getBoundingClientRect();
    const scrollable = Math.max(section.offsetHeight - window.innerHeight, 1);
    return clamp(-rect.top / scrollable);
  };

  const setActive = (states, index) => {
    states.forEach((state, i) => state.classList.toggle('is-active', i === index));
  };

  const stepFromProgress = (progress, count) => {
    if (count <= 1) return 0;
    return Math.min(count - 1, Math.floor(clamp(progress, 0, .9999) * count));
  };

  const updateGlobalProgress = () => {
    if (!progressBar) return;
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    progressBar.style.transform = `scaleX(${clamp(window.scrollY / max)})`;
  };

  const updateFront = () => {
    if (!front || isCompact()) return;
    const progress = chapterProgress(front);
    const step = stepFromProgress(progress, 3);
    setActive(frontStates, step);

    if (frontCounter) frontCounter.textContent = String(step + 1).padStart(2, '0');
    if (frontRail) frontRail.style.transform = `scaleX(${progress})`;

    if (!prefersReducedMotion && frontPortrait) {
      const local = (progress - .5) * 2;
      frontPortrait.style.transform = `translate3d(${local * -8}px, ${local * 7}px, 0) rotate(${local * -1.5}deg) scale(${1 + Math.abs(local) * .015})`;
    }

    if (valueOrbit) {
      const thirdStart = 2 / 3;
      const localThird = clamp((progress - thirdStart) / (1 - thirdStart));
      valueOrbit.classList.toggle('is-visible', step === 2);
      if (!prefersReducedMotion && step === 2) {
        const rotate = -34 + localThird * 92;
        const x = -34 + localThird * 68;
        valueOrbit.style.transform = `translate3d(${x}px, 0, 0) rotate(${rotate}deg)`;
      }
    }
  };

  const updateBack = () => {
    if (!back || isCompact()) return;
    const progress = chapterProgress(back);
    const step = stepFromProgress(progress, 2);
    setActive(backStates, step);

    if (backCounter) backCounter.textContent = String(step + 1).padStart(2, '0');
    if (backRail) backRail.style.transform = `scaleX(${progress})`;

    if (!prefersReducedMotion && backPortrait) {
      const local = (progress - .5) * 2;
      backPortrait.style.transform = `translate3d(${local * 7}px, ${local * -5}px, 0) rotate(${local * 1.2}deg)`;
    }
  };

  const updateNav = () => {
    if (!navLinks.length) return;
    const marker = window.innerHeight * .35;
    let active = 'about';
    ['about', 'experience', 'contact'].forEach(id => {
      const section = document.getElementById(id);
      if (section && section.getBoundingClientRect().top <= marker) active = id;
    });
    navLinks.forEach(link => link.classList.toggle('is-active', link.dataset.nav === active));
  };

  let ticking = false;
  const render = () => {
    ticking = false;
    updateGlobalProgress();
    updateFront();
    updateBack();
    updateNav();
  };

  const requestRender = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  };

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender);
  render();
})();
