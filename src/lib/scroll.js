export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function getScrollProgress({ scrollY, elementTop, elementHeight, viewportHeight }) {
  const distance = elementHeight - viewportHeight;
  if (distance <= 0) return 0;
  return clamp((scrollY - elementTop) / distance);
}
