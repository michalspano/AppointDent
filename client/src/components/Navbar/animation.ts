import { createSignal } from 'solid-js'

export const [notify, setNotify] = createSignal(false) // Opens notification modal
export const [hamburger, setHamburger] = createSignal(false) // Opens the hamburger menu on mobile
export const [fadeOut, setFadeOut] = createSignal(false) // Fade out switch
export const [fadeIn, setFadeIn] = createSignal(false) // Fade in switch
export const [slideOut, setSlideOut] = createSignal(false) // Slide out switch
export const [slideIn, setSlideIn] = createSignal(false) // Slide in switch

/**
 * Toggles notification modal, animates using fading animation.
 */
export function toggleNotification (): void {
  if ((notify())) {
    setFadeIn(false)
    setFadeOut(true)
    setTimeout(() => {
      setNotify(false)
    }, 200)
  } else {
    setFadeIn(true)
    setFadeOut(false)
    setNotify(true)
  }
}

/**
 * Toggles mobile hamburger menu, animates with a sliding animation.
 */
export function toggleHamburger (): void {
  if (hamburger()) {
    setSlideIn(false)
    setSlideOut(true)
    setTimeout(() => {
      setHamburger(false)
    }, 200)
  } else {
    setSlideIn(true)
    setSlideOut(false)
    setHamburger(true)
  }
}
