(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const body = document.body;

  document.getElementById("year").textContent = new Date().getFullYear();

  function runLoader() {
    const loader = document.querySelector(".page-loader");
    const number = loader?.querySelector("strong");
    const line = loader?.querySelector(".loader-line i");

    if (!loader || reduceMotion || typeof gsap === "undefined") {
      loader?.remove();
      return;
    }

    const counter = { value: 0 };
    const timeline = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => loader.remove()
    });

    timeline
      .to(counter, {
        value: 100,
        duration: 1.35,
        onUpdate: () => {
          number.textContent = String(Math.round(counter.value)).padStart(2, "0");
        }
      }, 0)
      .to(line, { width: "100%", duration: 1.35 }, 0)
      .to(loader, { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, "+=0.08")
      .from(".hero-title .title-row", {
        yPercent: 120,
        rotate: 3,
        duration: 1,
        stagger: 0.08,
        ease: "power4.out"
      }, "-=0.25")
      .from(".hero-kicker span, .hero-statement > *, .round-link, .hero-sticker", {
        opacity: 0,
        y: 28,
        duration: 0.65,
        stagger: 0.06,
        ease: "power3.out"
      }, "-=0.7");
  }

  function initSmoothScroll() {
    if (reduceMotion || typeof Lenis === "undefined") return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 0.88,
      touchMultiplier: 1.15
    });

    lenis.on("scroll", () => {
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.update();
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = link.getAttribute("href");
        if (!target || target === "#") return;
        const element = document.querySelector(target);
        if (!element) return;
        event.preventDefault();
        lenis.scrollTo(element, { offset: 0, duration: 1.15 });
      });
    });
  }

  function initMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) return;

    const closeMenu = () => {
      body.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
    };

    toggle.addEventListener("click", () => {
      const willOpen = !body.classList.contains("menu-open");
      body.classList.toggle("menu-open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
      menu.setAttribute("aria-hidden", String(!willOpen));
    });

    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  function initCursor() {
    if (isTouch || reduceMotion || typeof gsap === "undefined") return;

    const cursor = document.querySelector(".custom-cursor");
    if (!cursor) return;

    const setX = gsap.quickTo(cursor, "x", { duration: 0.24, ease: "power3" });
    const setY = gsap.quickTo(cursor, "y", { duration: 0.24, ease: "power3" });

    window.addEventListener("pointermove", (event) => {
      setX(event.clientX);
      setY(event.clientY);
    });

    document.querySelectorAll("a, button, .tilt-card").forEach((element) => {
      element.addEventListener("pointerenter", () => cursor.classList.add("is-hovering"));
      element.addEventListener("pointerleave", () => cursor.classList.remove("is-hovering"));
    });
  }

  function initMagneticElements() {
    if (isTouch || reduceMotion || typeof gsap === "undefined") return;

    document.querySelectorAll(".magnetic").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        gsap.to(element, {
          x: x * 0.22,
          y: y * 0.22,
          duration: 0.35,
          ease: "power3.out"
        });
      });

      element.addEventListener("pointerleave", () => {
        gsap.to(element, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.45)" });
      });
    });
  }

  function initTiltCards() {
    if (isTouch || reduceMotion || typeof gsap === "undefined") return;

    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -9;
        const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 11;

        gsap.to(card, {
          rotateX: rx,
          rotateY: ry,
          transformPerspective: 950,
          transformOrigin: "center",
          duration: 0.35,
          ease: "power2.out"
        });
      });

      card.addEventListener("pointerleave", () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.45)"
        });
      });
    });
  }

  function initThreeScene() {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas || typeof THREE === "undefined") return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 11.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: window.devicePixelRatio < 2
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x07080b, 0);

    const world = new THREE.Group();
    scene.add(world);

    const ambient = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambient);

    const redLight = new THREE.PointLight(0xef233c, 55, 24);
    redLight.position.set(-4, 3, 5);
    scene.add(redLight);

    const blueLight = new THREE.PointLight(0x1357ff, 65, 26);
    blueLight.position.set(4, -2, 6);
    scene.add(blueLight);

    const whiteLight = new THREE.DirectionalLight(0xffffff, 2.2);
    whiteLight.position.set(0, 6, 8);
    scene.add(whiteLight);

    const redMaterial = new THREE.MeshStandardMaterial({
      color: 0xef233c,
      roughness: 0.28,
      metalness: 0.72
    });

    const blueMaterial = new THREE.MeshStandardMaterial({
      color: 0x1357ff,
      roughness: 0.3,
      metalness: 0.68
    });

    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x101117,
      roughness: 0.22,
      metalness: 0.86
    });

    const wireRed = new THREE.MeshBasicMaterial({
      color: 0xef233c,
      wireframe: true,
      transparent: true,
      opacity: 0.68
    });

    const wireBlue = new THREE.MeshBasicMaterial({
      color: 0x4d7cff,
      wireframe: true,
      transparent: true,
      opacity: 0.58
    });

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.55, 0.44, 180, 18, 2, 3),
      redMaterial
    );
    knot.position.set(2.1, 0.25, 0.2);
    knot.rotation.set(0.5, -0.4, 0.2);
    world.add(knot);

    const webSphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.25, 2),
      wireBlue
    );
    webSphere.position.set(-2.7, -0.6, -1.1);
    world.add(webSphere);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.25, 0.12, 12, 120),
      blueMaterial
    );
    ring.position.set(-2.7, -0.6, -1.05);
    ring.rotation.set(0.85, 0.25, 0.2);
    world.add(ring);

    const blackCore = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.82, 0),
      darkMaterial
    );
    blackCore.position.set(-2.7, -0.6, -0.85);
    world.add(blackCore);

    const wireCube = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.5, 1.5, 3, 3, 3),
      wireRed
    );
    wireCube.position.set(4.5, -2.15, -1.8);
    wireCube.rotation.set(0.55, 0.5, 0.2);
    world.add(wireCube);

    const octa = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.9, 0),
      blueMaterial
    );
    octa.position.set(-4.9, 2.1, -1.3);
    octa.rotation.set(0.3, 0.8, 0.3);
    world.add(octa);

    const smallRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.85, 0.18, 14, 60),
      redMaterial
    );
    smallRing.position.set(4.1, 2.25, -1.4);
    smallRing.rotation.set(1.1, 0.2, 0.4);
    world.add(smallRing);

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 240;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 17;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particlesGeometry,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.026,
        transparent: true,
        opacity: 0.55
      })
    );
    scene.add(particles);

    const pointer = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    window.addEventListener("pointermove", (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    });

    function resize() {
      const rect = canvas.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();

      const mobile = window.innerWidth < 820;
      world.scale.setScalar(mobile ? 0.72 : 1);
      world.position.set(mobile ? 0.7 : 0, mobile ? -0.1 : 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    let time = 0;
    function animate() {
      time += 0.006;
      current.x += (pointer.x - current.x) * 0.035;
      current.y += (pointer.y - current.y) * 0.035;

      if (!reduceMotion) {
        world.rotation.y = current.x * 0.16;
        world.rotation.x = current.y * -0.09;
        knot.rotation.x += 0.0027;
        knot.rotation.y += 0.0035;
        webSphere.rotation.x -= 0.0012;
        webSphere.rotation.y += 0.0022;
        ring.rotation.z += 0.0015;
        blackCore.rotation.x += 0.003;
        blackCore.rotation.y -= 0.004;
        wireCube.rotation.x -= 0.002;
        wireCube.rotation.y += 0.003;
        octa.rotation.x += 0.003;
        octa.rotation.y += 0.002;
        smallRing.rotation.z -= 0.004;
        particles.rotation.y = time * 0.05;
        particles.position.y = Math.sin(time) * 0.08;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.to(world.rotation, {
        z: Math.PI * 0.4,
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.2
        }
      });

      gsap.to(camera.position, {
        z: 8.5,
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.2
        }
      });
    }
  }

  function formatNumber(value) {
    return Math.round(value).toLocaleString("en-IN");
  }

  function initScrollAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || reduceMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".manifesto h2, .section-heading h2, .abilities-intro h2, .timeline-heading h2, .credentials-copy h2").forEach((heading) => {
      gsap.from(heading, {
        y: 90,
        opacity: 0,
        rotate: 1.5,
        duration: 1.1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: heading,
          start: "top 86%",
          once: true
        }
      });
    });

    gsap.from(".manifesto-copy .eyebrow, .manifesto-foot > *", {
      y: 30,
      opacity: 0,
      stagger: 0.12,
      duration: 0.8,
      scrollTrigger: {
        trigger: ".manifesto-copy",
        start: "top 76%",
        once: true
      }
    });

    document.querySelectorAll(".metric-number").forEach((number) => {
      const target = Number(number.dataset.count || 0);
      const suffix = number.dataset.suffix || "";
      const count = { value: 0 };

      gsap.to(count, {
        value: target,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => {
          number.textContent = `${formatNumber(count.value)}${suffix}`;
        },
        scrollTrigger: {
          trigger: number,
          start: "top 88%",
          once: true
        }
      });
    });

    gsap.from(".metric-card", {
      y: 80,
      opacity: 0,
      rotate: () => gsap.utils.random(-3, 3),
      stagger: 0.1,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".metric-stage",
        start: "top 83%",
        once: true
      }
    });

    gsap.utils.toArray(".ability-panel").forEach((panel) => {
      const copy = panel.querySelector(".panel-copy");
      const listItems = panel.querySelectorAll("li");

      gsap.from(copy, {
        x: -70,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: panel,
          start: "top 72%",
          once: true
        }
      });

      gsap.from(listItems, {
        x: 35,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        scrollTrigger: {
          trigger: panel,
          start: "top 67%",
          once: true
        }
      });
    });

    const line = document.querySelector(".timeline-line i");
    if (line) {
      gsap.to(line, {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: ".timeline-wrap",
          start: "top 65%",
          end: "bottom 65%",
          scrub: true
        }
      });
    }

    gsap.utils.toArray(".timeline-card").forEach((card, index) => {
      gsap.from(card, {
        x: index % 2 === 0 ? -85 : 85,
        opacity: 0,
        rotate: index % 2 === 0 ? -6 : 6,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 82%",
          once: true
        }
      });
    });

    gsap.from(".os-window", {
      y: 120,
      rotateX: 12,
      opacity: 0,
      transformPerspective: 1000,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".os-window",
        start: "top 82%",
        once: true
      }
    });

    gsap.utils.toArray(".os-progress b").forEach((bar) => {
      const finalWidth = bar.style.width;
      gsap.fromTo(bar, { width: 0 }, {
        width: finalWidth,
        duration: 1.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: bar,
          start: "top 90%",
          once: true
        }
      });
    });

    gsap.from(".badge-card", {
      y: 110,
      opacity: 0,
      rotateY: 18,
      stagger: 0.12,
      duration: 0.9,
      transformPerspective: 1000,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".badge-stage",
        start: "top 82%",
        once: true
      }
    });

    gsap.from(".contact-title > *", {
      x: (index) => index % 2 === 0 ? -100 : 100,
      opacity: 0,
      stagger: 0.1,
      duration: 1,
      ease: "power4.out",
      scrollTrigger: {
        trigger: ".contact-title",
        start: "top 80%",
        once: true
      }
    });

    gsap.to(".hero-title", {
      yPercent: 18,
      opacity: 0.22,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(".sticker-red", {
      y: 130,
      rotate: 22,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    ScrollTrigger.refresh();
  }

  function initHeaderBehaviour() {
    if (typeof gsap === "undefined" || reduceMotion) return;

    let lastScroll = 0;
    const header = document.querySelector(".site-header");
    if (!header) return;

    window.addEventListener("scroll", () => {
      const current = window.scrollY;
      const movingDown = current > lastScroll && current > 180;
      gsap.to(header, {
        yPercent: movingDown ? -110 : 0,
        duration: 0.35,
        ease: "power2.out"
      });
      lastScroll = current;
    }, { passive: true });
  }

  window.addEventListener("DOMContentLoaded", () => {
    runLoader();
    initSmoothScroll();
    initMenu();
    initCursor();
    initMagneticElements();
    initTiltCards();
    initThreeScene();
    initScrollAnimations();
    initHeaderBehaviour();
  });
})();
