(function () {
  const rotatorSection = document.getElementById("value-rotator-section");
  const rotatorTrack = document.getElementById("value-rotator-track");

  if (!rotatorSection || !rotatorTrack) return;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function updateRotator() {
    const rect = rotatorSection.getBoundingClientRect();
    const viewH = window.innerHeight;

    const progress = clamp(
      (viewH - rect.top) / (viewH + rect.height * 0.45),
      0,
      1
    );

    const translateX = -18 + progress * 38;
    const rotate = -7 + progress * 12;

    rotatorTrack.style.transform =
      `translate3d(${translateX}vw, 0, 0) rotate(${rotate}deg)`;
  }

  updateRotator();
  window.addEventListener("scroll", updateRotator, { passive: true });
  window.addEventListener("resize", updateRotator);
})();
