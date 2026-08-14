(() => {
  const journey = document.querySelector('[data-journey]');
  const progressBar = document.getElementById('page-progress-bar');
  const journeyRail = document.getElementById('journey-rail');
  const scenes = [...document.querySelectorAll('[data-scene]')];
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const portraitStack = document.querySelector('.portrait-stack');
  const caption = document.querySelector('[data-caption]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clamp = (n, min = 0, max = 1) => Math.min(Math.max(n, min), max);
  const smooth = t => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  const compact = () => window.innerWidth <= 900;

  const ranges = {
    hero: [0.00, 0.05, 0.15, 0.24],
    range: [0.14, 0.21, 0.31, 0.39],
    flow: [0.29, 0.35, 0.46, 0.54],
    transition: [0.46, 0.52, 0.59, 0.66],
    career: [0.58, 0.65, 0.75, 0.83],
    foundation: [0.75, 0.82, 0.94, 1.00]
  };

  const opacityFor = (p, range) => {
    const [start, fullIn, fullOut, end] = range;
    if (p <= start || p >= end) return 0;
    if (p >= fullIn && p <= fullOut) return 1;
    if (p < fullIn) return smooth(clamp((p - start) / (fullIn - start)));
    return 1 - smooth(clamp((p - fullOut) / (end - fullOut)));
  };

  const journeyProgress = () => {
    if (!journey) return 0;
    const rect = journey.getBoundingClientRect();
    const range = Math.max(journey.offsetHeight - window.innerHeight, 1);
    return clamp(-rect.top / range);
  };

  const setScene = (name, opacity, p) => {
    const scene = document.querySelector(`[data-scene="${name}"]`);
    if (!scene) return;
    scene.style.opacity = opacity.toFixed(3);
    scene.classList.toggle('is-active', opacity > 0.45);

    const range = ranges[name];
    const center = (range[1] + range[2]) / 2;
    const drift = clamp((p - center) / 0.22, -1, 1);
    let x = 0;
    let y = drift * -18;

    if (name === 'hero' || name === 'career') x = drift * -28;
    if (name === 'range' || name === 'foundation') x = drift * 28;
    if (name === 'flow' || name === 'transition') y = drift * -10;

    scene.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const updateScenes = p => {
    Object.entries(ranges).forEach(([name, range]) => setScene(name, opacityFor(p, range), p));
  };

  const updatePortrait = p => {
    if (!portraitStack) return;

    const swap = smooth(clamp((p - 0.49) / 0.16));
    const transitionPulse = 1 - Math.abs(clamp((p - 0.565) / 0.14, -1, 1));
    const y = lerp(6, -6, p);
    const scale = 1 + transitionPulse * 0.035;
    const rotateY = lerp(-1.6, 1.8, p);

    portraitStack.style.setProperty('--front-opacity', String(1 - swap));
    portraitStack.style.setProperty('--back-opacity', String(swap));
    portraitStack.style.setProperty('--front-y', `${lerp(0, -10, swap)}px`);
    portraitStack.style.setProperty('--back-y', `${lerp(10, 0, swap)}px`);
    portraitStack.style.setProperty('--front-scale', String(lerp(1, 1.025, swap)));
    portraitStack.style.setProperty('--back-scale', String(lerp(.985, 1, swap)));
    portraitStack.style.setProperty('--portrait-scale', String(scale));
    portraitStack.style.setProperty('--portrait-ry', `${rotateY}deg`);
    portraitStack.style.transform = `translate3d(-50%, calc(-48% + ${y}px), 0) scale(${scale}) rotateY(${rotateY}deg)`;

    if (caption) {
      caption.textContent = p < 0.57
        ? 'QUALITY · OPERATIONS · AUTOMATION'
        : 'SUPPORT · COMPLIANCE · LEADERSHIP';
    }
  };

  const updateFlow = p => {
    const local = smooth(clamp((p - 0.28) / 0.28));
    const far = lerp(-62, 18, local);
    const mid = lerp(-88, 34, local);
    const near = lerp(-112, 52, local);
    document.documentElement.style.setProperty('--flow-far-x', `${far}vw`);
    document.documentElement.style.setProperty('--flow-mid-x', `${mid}vw`);
    document.documentElement.style.setProperty('--flow-near-x', `${near}vw`);

    const quoteLocal = clamp((p - 0.45) / 0.23);
    document.documentElement.style.setProperty('--quote-x', `${lerp(-7, 7, quoteLocal)}vw`);
  };

  const updateAmbient = p => {
    const wave = Math.sin(p * Math.PI * 2);
    document.documentElement.style.setProperty('--red-x', `${lerp(-20, 70, p)}px`);
    document.documentElement.style.setProperty('--red-y', `${wave * 26}px`);
    document.documentElement.style.setProperty('--blue-x', `${lerp(30, -75, p)}px`);
    document.documentElement.style.setProperty('--blue-y', `${-wave * 20}px`);
    document.documentElement.style.setProperty('--line-one-x', `${lerp(-7, 14, p)}vw`);
    document.documentElement.style.setProperty('--line-two-x', `${lerp(8, -13, p)}vw`);
    document.documentElement.style.setProperty('--word-one-x', `${lerp(-10, 18, p)}vw`);
    document.documentElement.style.setProperty('--word-one-y', `${lerp(0, -7, p)}vh`);
    document.documentElement.style.setProperty('--word-two-x', `${lerp(12, -16, p)}vw`);
    document.documentElement.style.setProperty('--word-two-y', `${lerp(4, -5, p)}vh`);
    document.documentElement.style.setProperty('--word-three-x', `${lerp(-6, 11, p)}vw`);
    document.documentElement.style.setProperty('--word-three-y', `${lerp(5, -4, p)}vh`);
    document.documentElement.style.setProperty('--portrait-red-x', `${lerp(-18, 16, p)}px`);
    document.documentElement.style.setProperty('--portrait-red-y', `${wave * 10}px`);
    document.documentElement.style.setProperty('--portrait-blue-x', `${lerp(18, -14, p)}px`);
    document.documentElement.style.setProperty('--portrait-blue-y', `${-wave * 8}px`);
  };

  const updateProgress = p => {
    if (journeyRail) journeyRail.style.transform = `scaleX(${p})`;
    if (progressBar) {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      progressBar.style.transform = `scaleX(${clamp(window.scrollY / max)})`;
    }
  };

  const updateNav = p => {
    let active = p < 0.58 ? 'about' : 'experience';
    const contact = document.getElementById('contact');
    if (contact && contact.getBoundingClientRect().top < window.innerHeight * 0.45) active = 'contact';
    navLinks.forEach(link => link.classList.toggle('is-active', link.dataset.nav === active));
  };

  const render = () => {
    ticking = false;
    const p = journeyProgress();
    updateProgress(p);
    updateNav(p);

    if (compact() || reduced) return;
    updateScenes(p);
    updatePortrait(p);
    updateFlow(p);
    updateAmbient(p);
  };

  let ticking = false;
  const requestRender = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(render);
  };

  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender);
  render();
})();
