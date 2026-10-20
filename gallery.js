// Pause embedded films while their gallery preview is offscreen.
const frame = document.querySelector('.feature__player iframe');
if (frame && 'IntersectionObserver' in window) {
  let visible = false;
  const notify = () => frame.contentWindow?.postMessage({type:'css-motion:visibility', visible}, location.origin);
  frame.addEventListener('load', notify);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; notify(); }, {threshold:.05}).observe(frame);
}
