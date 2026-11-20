# Šablona přednáškových slidů

HTML + CSS + JS šablona pro přednáškové slidy, která ke každému snímku přidává
podpůrný text ke čtení. Funguje bez instalace, bez build kroku a bez externích
závislostí – stačí otevřít `index.html` v prohlížeči.

Každý snímek má dvě části:

- **Prezentační část** – A4 na šířku, určená k promítání.
- **Podpůrná část** – A4 na výšku, komentář nebo výklad ke čtení.

## Vlastnosti

- **Čtyři režimy zobrazení**
  - *Prezentační* – na obrazovce je vždy jeden celý snímek.
  - *Podpůrný* – plynule scrollovací text všech snímků za sebou.
  - *Kombinovaný* – obrazovka rozdělená na prezentační a podpůrnou část
    (vlevo/vpravo nebo nahoře/dole, poměr nastavitelný 10 : 90 až 90 : 10).
    Obě části jsou synchronizované: při přechodu na další snímek se podpůrná
    část posune na jeho začátek a při scrollování podpůrné části se přepíná
    prezentační snímek.
  - *Řečnický* – prezentace se otevře v samostatném okně pro projektor (jen
    aktuální snímek). V hlavním okně je rozvržení jako v kombinovaném režimu,
    navíc s náhledem dalšího snímku a časomírou. Obě okna jsou synchronizovaná
    oběma směry.
- **Barevné režimy** – světlý, tmavý a vysoký kontrast.
- **Ovládací šipky na obrazovce** – volitelné, s nastavitelným umístěním;
  v podpůrné části šipky nahoru/dolů plynule posouvají text (najetím myší,
  nebo trvale kliknutím).
- **Menu** s nastavením zobrazení; nastavení se pamatuje v prohlížeči.
- **Export pro tisk** – jen prezentační část (jeden nebo dva snímky na
  stránku), jen podpůrná část (každý snímek na nové stránce nebo plynule),
  nebo obojí najednou.
- **Odkaz na konkrétní snímek** přes adresu, např. `index.html#3`.

## Rychlý start

1. Stáhněte nebo naklonujte repozitář.
2. Otevřete `index.html` v prohlížeči.
3. Upravte snímky v `index.html` a obrázky vložte do složky `img/`.

## Ovládání

| Klávesa | Akce |
| --- | --- |
| <kbd>←</kbd> <kbd>→</kbd> | předchozí / další snímek |
| <kbd>↑</kbd> <kbd>↓</kbd> | posun podpůrné části |
| <kbd>M</kbd> | otevře / zavře menu |
| <kbd>Esc</kbd> | zavře menu |

Menu lze otevřít i tlačítkem vlevo dole na prvním snímku (případně na každém
snímku, pokud je to v menu zapnuté).

## Řečnický pohled (projektor + monitor)

1. V menu (<kbd>M</kbd>) zvolte režim **Řečnický**. Otevře se nové okno jen
   s prezentačními snímky. Pokud ho prohlížeč zablokuje, povolte vyskakovací
   okna nebo použijte tlačítko **Otevřít okno pro projektor**.
2. Okno přetáhněte na projektor a dvojklikem ho přepněte na celou obrazovku.
3. Prezentaci ovládejte z hlavního okna. Šipky fungují i v okně na projektoru
   a obě okna zůstávají synchronizovaná.

V hlavním okně je pod aktuálním snímkem menší náhled dalšího snímku a
časomíra. Ukazuje čas od začátku (méně výrazně) a čas do konce. Po načtení je
připravená a spouští se ručně tlačítkem **Spustit**. Lze ji pozastavit nebo
restartovat. Délku přednášky a zobrazení časomíry nastavíte v menu.
Rozvržení a ostatní nastavení sdílí řečnický pohled s kombinovaným režimem.

## Struktura projektu

```
.
├── index.html            # ukázková prezentace (používá soubory ze složky template/)
├── img/                  # obrázky ukázkové prezentace
└── template/             # samostatná kopie šablony
    ├── index.html        # výchozí prezentace se čtyřmi vzorovými snímky
    ├── img/              # obrázky
    ├── css/
    │   ├── base.css          # rozvržení a komponenty
    │   ├── theme-light.css   # světlý režim
    │   ├── theme-dark.css    # tmavý režim
    │   ├── theme-contrast.css# vysoký kontrast
    │   └── print.css         # styly pro tisk
    └── js/
        ├── settings.js   # výchozí nastavení
        └── app.js        # interaktivita
```

Prezentace může ležet uvnitř i mimo složku `template/` – stačí v ní správně
odkázat na `template/css/base.css`, `template/js/settings.js` a
`template/js/app.js`. Šablona si cesty ke svým stylům dopočítá sama.

## Tvorba snímků

Každý snímek je `<section class="slide">` uvnitř `<main id="slides">`:

```html
<section class="slide" data-title="Název" data-subtitle="Podnázev" data-show-header="true">
  <div class="present">
    <!-- prezentační část -->
    <ul class="bullets">
      <li>První bod</li>
      <li>Druhý bod</li>
    </ul>
  </div>
  <div class="support">
    <!-- podpůrná část -->
    <h2>Název</h2>
    <p>Podrobný výklad ke snímku…</p>
  </div>
</section>
```

### Atributy snímku

| Atribut | Význam |
| --- | --- |
| `data-title` | název snímku |
| `data-subtitle` | podnázev snímku |
| `data-show-header` | `"true"` zobrazí název a podnázev v liště nahoře, `"false"` lištu skryje |

Titulní snímek má navíc třídu `title-slide` a obsahuje prvky `.t-title`,
`.t-subtitle`, `.t-author`, `.t-date` a obrázek `.t-image`.

### Užitečné třídy

| Třída | Použití |
| --- | --- |
| `.bullets` | odrážky v prezentační části |
| `.fig` | obrázek s popiskem (`<figure>`), přizpůsobí se velikosti snímku |
| `.split` | rozdělení snímku na dva sloupce |
| `.note` | zvýrazněná poznámka v podpůrné části |

### Vzorové snímky

Šablona obsahuje čtyři vzorové snímky: titulní, s bodovým textem, s obrázkem
a s textem i obrázkem.

## Nastavení

Výchozí hodnoty jsou v souboru [`template/js/settings.js`](template/js/settings.js).
Většinu z nich lze měnit i za běhu v menu. Nejdůležitější:

| Klíč | Výchozí hodnota | Význam |
| --- | --- | --- |
| `viewMode` | `'present'` | režim zobrazení: `present`, `support`, `combined` |
| `combinedLayout` | `'present-left'` | rozmístění v kombinovaném režimu |
| `splitRatio` | `50` | podíl prezentační části v kombinovaném režimu (%) |
| `switchThreshold` | `25` | kolik % výšky okna odspodu musí zabírat další podpůrný snímek, aby se přepnul prezentační snímek |
| `theme` | `'light'` | barevný režim: `light`, `dark`, `contrast` |
| `showSlideNumbers` | `true` | zobrazit číslo snímku a celkový počet |
| `menuButtonOnAllSlides` | `false` | tlačítko menu na každém snímku |
| `showNavArrows` | `true` | zobrazit ovládací šipky |
| `navArrowsPosition` | `'sides'` | umístění šipek: `sides`, `bottom-right`, `bottom-center` |
| `showTimer` | `true` | zobrazit časomíru v řečnickém pohledu |
| `timerMinutes` | `45` | délka přednášky pro odpočet časomíry (min) |
| `autoScrollSpeed` | `120` | rychlost plynulého posunu podpůrné části (px/s) |
| `scrollStep` | `80` | posun podpůrné části klávesami ↑ ↓ (px) |
| `printTheme` | `'light'` | barevný režim při tisku (`null` = aktuální) |
| `rememberSettings` | `true` | ukládat nastavení z menu do `localStorage` |

Pokud změna v `settings.js` nemá efekt, je pravděpodobně přebitá uloženým
nastavením z prohlížeče – v menu použijte **Obnovit výchozí nastavení**.

## Licence

Projekt je šířen pod licencí [GNU General Public License v3.0](LICENSE).
