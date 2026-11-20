/*
 * Settings of the lecture slides template.
 * The values are defaults – the user can change them in the menu (M key)
 * and, if rememberSettings is enabled, they are stored in the browser.
 */
window.SLIDES_CONFIG = {
  /* View mode: 'present' (presentation) | 'support' (supporting text) | 'combined'
     | 'speaker' (presentation in a separate window for the projector; this window shows
     the current and next slide, a timer and the supporting part; shares the layout with
     the combined mode) */
  viewMode: 'present',

  /* Layout in the combined and speaker modes:
     'present-left'   – presentation on the left, supporting part on the right
     'present-right'  – supporting part on the left, presentation on the right
     'present-top'    – presentation at the top, supporting part at the bottom
     'present-bottom' – supporting part at the top, presentation at the bottom */
  combinedLayout: 'present-left',

  /* Share of the presentation part in the combined mode (in %) and its allowed range */
  splitRatio: 50,
  splitMin: 10,
  splitMax: 90,

  /* How many % of the window height (measured from the bottom) the next supporting slide
     must occupy for the presentation slide to switch while scrolling (0–100) */
  switchThreshold: 25,

  /* Menu button on every slide (true), or only on the first one (false) */
  menuButtonOnAllSlides: false,

  /* Color theme: a key from themeFiles (paths are relative to the template folder) */
  theme: 'light',
  themeFiles: {
    light: 'css/theme-light.css',
    dark: 'css/theme-dark.css',
    contrast: 'css/theme-contrast.css'
  },

  /* Show the slide number and the total number of slides */
  showSlideNumbers: true,

  /* On-screen navigation arrows */
  showNavArrows: true,
  navArrowsPosition: 'sides',       // 'sides' – on the sides | 'bottom-right' – bottom right | 'bottom-center' – bottom center

  /* Timer in the speaker view: show it, lecture length in minutes (1–600).
     It is ready after loading and is started manually. */
  showTimer: true,
  timerMinutes: 45,

  /* Speed of the smooth scrolling of the supporting part by the on-screen up/down arrows
     (px per second) and its allowed range in the menu */
  autoScrollSpeed: 120,
  autoScrollSpeedMin: 20,
  autoScrollSpeedMax: 600,

  /* Scroll step of the supporting part by the keyboard up/down arrows (px per key press)
     and its allowed range in the menu */
  scrollStep: 80,
  scrollStepMin: 20,
  scrollStepMax: 400,

  /* Print export */
  exportWhat: 'present',            // 'present' | 'support' | 'both'
  exportPresentLayout: 'one',       // 'one' – one slide per page (landscape) | 'two' – two slides per page (portrait)
  exportSupportLayout: 'newpage',   // 'newpage' – each slide on a new page | 'continuous' – continuous flow
  exportBothOrientation: 'landscape', // 'landscape' – scaled-down slide below the text | 'portrait' – rotated slide over the whole page
  printTheme: 'light',              // color theme for printing; null = current theme

  /* Remember the menu settings in the browser (localStorage) */
  rememberSettings: true,
  storageKey: 'BadPresentation-settings'
};
