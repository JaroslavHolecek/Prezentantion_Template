# Lecture Slides Template

**English** | [Čeština](README.cs.md)

An HTML + CSS + JS template for lecture slides that adds a supporting text for
reading to every slide. It works without installation, without a build step and
without external dependencies – just open `template/index.html` in a browser.

Each slide has two parts:

- **Presentation part** – landscape A4, meant for projecting.
- **Supporting part** – portrait A4, a commentary or explanation for reading.

## Features

- **Four view modes**
  - *Presentation* – one whole slide is always on the screen.
  - *Supporting* – smoothly scrolling text of all slides one after another.
  - *Combined* – the screen is split into the presentation and the supporting
    part (left/right or top/bottom, ratio adjustable from 10 : 90 to 90 : 10).
    Both parts are synchronized: moving to the next slide scrolls the
    supporting part to its beginning, and scrolling the supporting part
    switches the presentation slide.
  - *Speaker* – the presentation opens in a separate window for the projector
    (current slide only). The main window has the same layout as the combined
    mode, plus a preview of the next slide and a timer. Both windows are
    synchronized in both directions.
- **Color themes** – light, dark and high contrast.
- **On-screen navigation arrows** – optional, with adjustable position; in the
  supporting part the up/down arrows scroll the text smoothly (on hover, or
  permanently after a click). The scrolling speed and the keyboard scroll step
  can be set in the menu.
- **Menu** with display settings; the settings are remembered in the browser.
- **Print export** – the presentation part only (one or two slides per page),
  the supporting part only (each slide on a new page or continuously), or both
  at once.
- **Link to a specific slide** via the URL, e.g. `index.html#3`.

> The user interface and the sample slides are in Czech. All texts are plain
> HTML in `template/index.html` and `template/js/app.js`, so they are easy to
> translate.

## Quick start

1. Download or clone the repository.
2. Open `template/index.html` in a browser.
3. Edit the slides in `template/index.html` and put images into the
   `template/img/` folder.

## Controls

| Key | Action |
| --- | --- |
| <kbd>←</kbd> <kbd>→</kbd> | previous / next slide |
| <kbd>↑</kbd> <kbd>↓</kbd> | scroll the supporting part |
| <kbd>M</kbd> | open / close the menu |
| <kbd>Esc</kbd> | close the menu |

The menu can also be opened with the button in the bottom left corner of the
first slide (or of every slide, if enabled in the menu).

## Speaker view (projector + monitor)

1. In the menu (<kbd>M</kbd>) choose the **Speaker** mode (*Řečnický*). A new
   window with the presentation slides only opens. If the browser blocks it,
   allow pop-ups or use the **Open projector window** button (*Otevřít okno
   pro projektor*).
2. Drag the window to the projector and double-click it to switch to
   fullscreen.
3. Control the presentation from the main window. The arrows also work in the
   projector window and both windows stay synchronized.

Below the current slide, the main window shows a smaller preview of the next
slide and a timer. It shows the elapsed time (less prominently) and the
remaining time. After loading it is ready and is started manually with the
**Start** button (*Spustit*). It can be paused or restarted. The lecture length
and the timer visibility are set in the menu. The speaker view shares the
layout and other settings with the combined mode.

## Project structure

```
.
└── template/             # the template
    ├── index.html        # default presentation with four sample slides
    ├── img/              # images
    ├── css/
    │   ├── base.css          # layout and components
    │   ├── theme-light.css   # light theme
    │   ├── theme-dark.css    # dark theme
    │   ├── theme-contrast.css# high contrast
    │   └── print.css         # print styles
    └── js/
        ├── settings.js   # default settings
        └── app.js        # interactivity
```

A presentation can live inside or outside the `template/` folder – it just has
to link `template/css/base.css`, `template/js/settings.js` and
`template/js/app.js` correctly. The template resolves the paths to its
stylesheets by itself.

## Creating slides

Each slide is a `<section class="slide">` inside `<main id="slides">`:

```html
<section class="slide" data-title="Title" data-subtitle="Subtitle" data-show-header="true">
  <div class="present">
    <!-- presentation part -->
    <ul class="bullets">
      <li>First point</li>
      <li>Second point</li>
    </ul>
  </div>
  <div class="support">
    <!-- supporting part -->
    <h2>Title</h2>
    <p>Detailed explanation of the slide…</p>
  </div>
</section>
```

### Slide attributes

| Attribute | Meaning |
| --- | --- |
| `data-title` | slide title |
| `data-subtitle` | slide subtitle |
| `data-show-header` | `"true"` shows the title and subtitle in the top bar, `"false"` hides the bar |

The title slide additionally has the class `title-slide` and contains the
elements `.t-title`, `.t-subtitle`, `.t-author`, `.t-date` and an image
`.t-image`.

### Useful classes

| Class | Usage |
| --- | --- |
| `.bullets` | bullet points in the presentation part |
| `.fig` | image with a caption (`<figure>`), fits the slide size |
| `.split` | splits the slide into two columns |
| `.note` | highlighted note in the supporting part |

### Sample slides

The template contains four sample slides: a title slide, a slide with bullet
points, a slide with an image, and a slide with text and an image.

## Settings

The default values are in [`template/js/settings.js`](template/js/settings.js).
Most of them can also be changed at runtime in the menu. The most important ones:

| Key | Default | Meaning |
| --- | --- | --- |
| `viewMode` | `'present'` | view mode: `present`, `support`, `combined`, `speaker` |
| `combinedLayout` | `'present-left'` | layout in the combined and speaker modes |
| `splitRatio` | `50` | share of the presentation part in the combined mode (%) |
| `switchThreshold` | `25` | how many % of the window height (from the bottom) the next supporting slide must occupy to switch the presentation slide |
| `theme` | `'light'` | color theme: `light`, `dark`, `contrast` |
| `showSlideNumbers` | `true` | show the slide number and the total count |
| `menuButtonOnAllSlides` | `false` | menu button on every slide |
| `showNavArrows` | `true` | show the navigation arrows |
| `navArrowsPosition` | `'sides'` | arrow position: `sides`, `bottom-right`, `bottom-center` |
| `showTimer` | `true` | show the timer in the speaker view |
| `timerMinutes` | `45` | lecture length for the timer countdown (min) |
| `autoScrollSpeed` | `120` | speed of the smooth scrolling of the supporting part by the on-screen arrows (px/s), menu range `autoScrollSpeedMin`–`autoScrollSpeedMax` |
| `scrollStep` | `80` | scroll step of the supporting part by the ↑ ↓ keys (px), menu range `scrollStepMin`–`scrollStepMax` |
| `printTheme` | `'light'` | color theme for printing (`null` = current) |
| `rememberSettings` | `true` | store the menu settings in `localStorage` |

If a change in `settings.js` has no effect, it is probably overridden by the
settings stored in the browser – use **Reset to defaults** (*Obnovit výchozí
nastavení*) in the menu.

## License

The project is licensed under the [GNU General Public License v3.0](LICENSE).
