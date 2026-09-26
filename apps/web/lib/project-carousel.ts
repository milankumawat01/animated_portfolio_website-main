export function wrapSlide(index: number, count: number) {
  return count > 0 ? ((index % count) + count) % count : 0
}

export function slideOffset(index: number, active: number, count: number) {
  const distance = wrapSlide(index - active, count)
  return distance > count / 2 ? distance - count : distance
}
