/** A small video-like controller for CSS animations. No animation engine required. */
export function createMotionPlayer(root) {
  if (root.motionPlayer) return root.motionPlayer;
  const document = root.ownerDocument;
  const window = document.defaultView;
  const stage = root.querySelector('[data-motion-stage]');
  const controls = root.querySelector('[data-motion-controls]');
  const toggle = root.querySelector('[data-motion-toggle]');
  const restart = root.querySelector('[data-motion-restart]');
  const seekInput = root.querySelector('[data-motion-seek]');
  const timeLabel = root.querySelector('[data-motion-time]');
  const speedInput = root.querySelector('[data-motion-speed]');
  const duration = Number(root.dataset.duration);
  if (!stage || !controls || !toggle || !restart || !seekInput || !timeLabel || !Number.isFinite(duration) || !(duration > 0)) {
    throw new TypeError('Motion player requires a stage, playback controls and a positive data-duration.');
  }
  // Unsupported browsers retain the static overview and hidden controls.
  if (!stage.getAnimations || !window.matchMedia) return null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cleanup = [];
  let frame = 0;
  let userPaused = false;
  let playing = false;
  let destroyed = false;
  let scrubbing = false;
  let visible = !window.IntersectionObserver;
  let hostVisible = true;
  let reduced = false;
  root.classList.add('is-ready');
  const animations = stage.getAnimations({subtree: true});
  const clock = animations.find(animation => animation.animationName === 'mvl-clock') || animations[0];
  if (!clock) { root.classList.remove('is-ready'); return null; }
  animations.forEach(animation => { animation.pause(); animation.currentTime = 0; });
  controls.hidden = false;

  const formatTime = seconds => Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
  const getTime = () => ((Number(clock.currentTime) || 0) % (duration * 1000)) / 1000;
  function listen(target, name, callback) {
    target.addEventListener(name, callback);
    cleanup.push(() => target.removeEventListener(name, callback));
  }
  function draw() {
    const seconds = getTime();
    seekInput.value = String(seconds);
    seekInput.setAttribute('aria-valuetext', `${formatTime(seconds)} of ${formatTime(duration)}`);
    seekInput.style.setProperty('--progress', `${seconds / duration * 100}%`);
    timeLabel.textContent = `${formatTime(seconds)} / ${formatTime(duration)}`;
  }
  function tick() {
    draw();
    if (playing && !destroyed) frame = window.requestAnimationFrame(tick);
  }
  function sync() {
    if (destroyed) return;
    reduced = reducedMotion.matches || document.documentElement.getAttribute('data-a11y-reduce-motion') === 'true';
    const next = !userPaused && !reduced && visible && hostVisible && !document.hidden && !scrubbing;
    root.classList.toggle('is-reduced', reduced);
    root.dataset.state = reduced ? 'reduced' : next ? 'playing' : 'paused';
    controls.hidden = reduced;
    toggle.textContent = userPaused ? '▶ Play' : 'Ⅱ Pause';
    toggle.setAttribute('aria-label', userPaused ? 'Play animation' : 'Pause animation');
    if (next !== playing) {
      playing = next;
      window.cancelAnimationFrame(frame);
      if (playing) {
        const position = Number(clock.currentTime) || 0;
        animations.forEach(animation => { animation.currentTime = position; animation.play(); });
        frame = window.requestAnimationFrame(tick);
      } else animations.forEach(animation => animation.pause());
    }
    draw();
  }
  function seek(seconds) {
    if (destroyed || !Number.isFinite(Number(seconds))) return;
    const position = Math.max(0, Math.min(duration - .001, Number(seconds))) * 1000;
    animations.forEach(animation => { animation.currentTime = position; });
    draw();
  }
  const api = {
    play() { userPaused = false; sync(); },
    pause() { userPaused = true; sync(); },
    restart() { seek(0); userPaused = false; sync(); },
    seek,
    get currentTime() { return getTime(); },
    get playing() { return playing; },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      playing = false;
      window.cancelAnimationFrame(frame);
      animations.forEach(animation => animation.cancel());
      cleanup.forEach(remove => remove());
      root.classList.remove('is-ready', 'is-reduced');
      delete root.dataset.state;
      controls.hidden = true;
      delete root.motionPlayer;
    }
  };
  listen(toggle, 'click', () => { userPaused = !userPaused; sync(); });
  listen(restart, 'click', () => api.restart());
  listen(seekInput, 'input', () => seek(seekInput.value));
  listen(seekInput, 'pointerdown', () => { scrubbing = true; sync(); });
  listen(window, 'pointerup', () => { scrubbing = false; sync(); });
  listen(window, 'pointercancel', () => { scrubbing = false; sync(); });
  if (speedInput) listen(speedInput, 'change', () => {
    const speed = Number(speedInput.value);
    if (Number.isFinite(speed) && speed > 0 && speed <= 4) {
      animations.forEach(animation => { animation.playbackRate = speed; });
    }
  });
  listen(document, 'visibilitychange', sync);
  if (reducedMotion.addEventListener) listen(reducedMotion, 'change', sync);
  else {
    reducedMotion.addListener(sync);
    cleanup.push(() => reducedMotion.removeListener(sync));
  }
  if (window.MutationObserver) {
    const observer = new window.MutationObserver(sync);
    observer.observe(document.documentElement, {attributes: true, attributeFilter: ['data-a11y-reduce-motion']});
    cleanup.push(() => observer.disconnect());
  }
  if (window.IntersectionObserver) {
    const observer = new window.IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }, {threshold: .05});
    observer.observe(root);
    cleanup.push(() => observer.disconnect());
  }
  // Gallery hosts can suspend an offscreen iframe without resetting manual pause.
  listen(window, 'message', event => {
    if (event.origin !== window.location.origin || event.source !== window.parent) return;
    if (event.data?.type !== 'css-motion:visibility' || typeof event.data.visible !== 'boolean') return;
    hostVisible = event.data.visible;
    sync();
  });
  root.motionPlayer = api;
  sync();
  return api;
}
