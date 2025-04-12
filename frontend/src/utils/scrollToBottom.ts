export const scrollToBottom = (container: HTMLElement, duration = 300) => {
  const start = container.scrollTop;
  const end = container.scrollHeight;
  const distance = end - start;
  const startTime = performance.now();

  function animateScroll(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    container.scrollTop = start + distance * easeInOutQuad(progress);

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  }

  function easeInOutQuad(t: number) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  requestAnimationFrame(animateScroll);
};
