/*
 * Nastavení šablony přednáškových slidů.
 * Hodnoty slouží jako výchozí – uživatel je může měnit v menu (klávesa M)
 * a pokud je zapnuté rememberSettings, uloží se do prohlížeče.
 */
window.SLIDES_CONFIG = {
  /* Režim zobrazení: 'present' (prezentační) | 'support' (podpůrný) | 'combined' (kombinovaný)
     | 'speaker' (řečnický – prezentace v samostatném okně pro projektor, zde aktuální
     a další snímek, časomíra a podpůrná část; rozvržení sdílí s kombinovaným režimem) */
  viewMode: 'present',

  /* Rozmístění v kombinovaném a řečnickém režimu:
     'present-left'   – prezentace vlevo, podpůrná část vpravo
     'present-right'  – podpůrná část vlevo, prezentace vpravo
     'present-top'    – prezentace nahoře, podpůrná část dole
     'present-bottom' – podpůrná část nahoře, prezentace dole */
  combinedLayout: 'present-left',

  /* Podíl prezentační části v kombinovaném režimu (v %) a jeho povolený rozsah */
  splitRatio: 50,
  splitMin: 10,
  splitMax: 90,

  /* Kolik % výšky okna (počítáno odspodu) musí zabírat následující podpůrný snímek,
     aby se při scrollování přepnul prezentační snímek (0–100) */
  switchThreshold: 25,

  /* Tlačítko menu na každém snímku (true), nebo jen na prvním (false) */
  menuButtonOnAllSlides: false,

  /* Barevný režim: klíč z themeFiles (cesty jsou relativní ke složce šablony) */
  theme: 'light',
  themeFiles: {
    light: 'css/theme-light.css',
    dark: 'css/theme-dark.css',
    contrast: 'css/theme-contrast.css'
  },

  /* Zobrazit číslo snímku a celkový počet snímků */
  showSlideNumbers: true,

  /* Ovládací šipky na obrazovce */
  showNavArrows: true,
  navArrowsPosition: 'sides',       // 'sides' – po stranách | 'bottom-right' – vpravo dole | 'bottom-center' – dole uprostřed

  /* Časomíra v řečnickém pohledu: zobrazit, délka přednášky v minutách (1–600).
     Po načtení je připravená a spouští se ručně. */
  showTimer: true,
  timerMinutes: 45,

  /* Rychlost plynulého posunu podpůrné části šipkami nahoru/dolů na obrazovce (px za sekundu) */
  autoScrollSpeed: 120,

  /* Export pro tisk */
  exportWhat: 'present',            // 'present' | 'support' | 'both'
  exportPresentLayout: 'one',       // 'one' – snímek na stránku (na šířku) | 'two' – dva snímky na stránku (na výšku)
  exportSupportLayout: 'newpage',   // 'newpage' – každý snímek na nové stránce | 'continuous' – plynule za sebou
  exportBothOrientation: 'landscape', // 'landscape' – zmenšený snímek pod textem | 'portrait' – otočený snímek přes celou stránku
  printTheme: 'light',              // barevný režim tisku; null = aktuální režim

  /* Posun podpůrné části šipkami nahoru/dolů (px) */
  scrollStep: 80,

  /* Pamatovat si nastavení z menu v prohlížeči (localStorage) */
  rememberSettings: true,
  storageKey: 'prednaska-nastaveni'
};
