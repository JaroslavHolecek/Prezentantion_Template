# Šablona pro přednáškové slidy
Tento projekt slouží jako HTML+CSS+JS šablona pro přednáškové slidy

## Použité technologie
Šablona je vytvořena v čistém HTML+CSS+JS

## Základní struktura projektu
img/ - složka pro obrázky v prezentaci
css/ - složka s .css soubory (světlý, vysokokontrastní a tmavý režim)
js/ - složka se souborem .js s podporou interaktivity a souborem s nastavením hodnot

## Základní vlastnosti
Šablona obsahuje pro každý snímek dvě části.
První část je prezentační ve formátu přes šířku celé obrazovky a velikosti na šířku otočené A4 - typicky snímky k promítání.
Druhá část je podpůrná, také na šířku celé obrazovky a velikosti na výšku otočené A4 - typicky komentář ke čtení.
Je možné zobrazit prezentaci ve třech režimech - prezentační, kdy je vidět pouze prezentační část snímků a to tak, že vždy je na obrazovce jeden celý snímek - druhá možnost je podpůrná, kde je vidět podpůrná část snímku, která je plynule scrollovací a tedy je možné vidět i jen část jednoho a čast druhého snímku, které na sebe plynule navazují a jsou pouze nenápadně graficky oddělené - třetí režim je kombinovaný, kdy je obrazovka rozpůlená (možno zvolit zda horizontálně či vertikálně), na jedné straně je vidět vždy jeden prezentační snímek (v horizontální nebo vertikálním směru na středu obrazovky, podle zvolené orientace rozpůlení) a na druhé straně je vidět podpůrná část, stále plynule scrollovací. Je možné změnit umístění prezentační a podpůrné částí (vlevo/vpravo, vpravo/vlevo, nahoře/dole, dole/nahoře). V kombinovaném režimu jsou obě strany synchronizované tak, že pokud se na prezentační půlce přejde na další snímek, posune se i podpůrná část na začátek odpovídající tomuto snímku; pokud se scrolluje v podpurné části, pak je vidět odpovídající prezentační snímek k podpůrné části, která je právě na obrazovce - určující moment přepnutí je, že z následujícího podpůrného snímku je zabírá více než 1/4 odspodu okna (tato hodnota jde nastavit v nastavení).

## Ovládání
Přepínat mezi snímky je možné šípkami (vlevo/vpravo) na klávesnici, posouvat plynule nahoru a dolů podpůrnou část je možné šipkami (nahoru/dolů) na klávesnici

Mezi snímky je možné také přepínat "šipkami na obrazovce" (pokud je zapnuté jejich zobrazení). V prezentační části jsou to prosté dvě malé nenápadné (poloprůhledné) šipky vlevo a vpravo.
V podpůrné části jsou to ty stejné dvě šipky (které posunou zobrazení vždy na začátek následujícího/předchozího snímku) a navíc dvě obdobné šipky nahoru a dolů - pokud se ně ně najede (hover) myší, bude se zobrazení pomalu posouvat, pokud se na některou z nich klikne, zůstane "zaplá" i při odjetí kurzoru jinam (je možné mít zapnutou pouze jednu z nich zároveň, zapnutí se vypíná znovu kliknutím na zapnutou šipku - pokud se klikne na druhou, automaticky se zapnutí přepna na tuto druhou). Rychlost posunu lze nastavit v settings souboru


Menu (modální okno) je možné otevřít stisknutím tlačítka "m" na klávesnici. Zavírá se znovu pomocí "m" nebo "Esc"

Na prvním snímku je také vlevo dole vždy tlačítko pro otevření okna kliknutím pomocí myši

### Menu
V menu je možné:
Přepínat mezi třemi typy režimů zobrazení pomocí radiobuttonů
Přepnout, zda má být viditelné tlačítko pro zobrazení menu na každém snímku, nebo jen na prvním pomocí checkboxu
Přepnout mezi barevnými režimy pomocí radiobuttonů
Nastavit šířku či výšku rozdělení okna v kombinovaném režimu (defaultně 50-50, maximálně je možné 10-90 a naopak 90-10) pomocí slideru
Nastavit hodnotu při které se přepne prezentační snímek při scrollování v podpůrné části, počítáno odspodu okne (defaultně 25%, možno 0-100%)
Nastavit viditelnost čísla snímku a celkového počtu snímků
Nastavit viditelnost ovládacích šipek a jejich umístění na obrazovce

Dále je možné v menu Exportovat prezentaci pro tisk (otevře novou html stránku) - jen prezentační část (možno zvolit, zda má každý snímek mít svoji stránku (na šířku v plné velikosti) nebo zda mají být dva snímky na stránce (list na výšku, každý snímek zmenšený na polovinu)); jen podpůrnou část (zde je možné zvolit, zda má každý snímek začínat na začátku nové stránky, nebo zda na sebe mají plynule navazovat), nebo obojí najednou (při obojím najednou je vždy nejprve podpůrná část a pod ní prezentační snímek - v menu možno zvolit, zda chci prezentační snímky na šířku (jako v prezentaci, ale zmenšené) nebo na výšku (tedy otočené o 90 stupňů ale v plné velikosti stránky))

## Další vlastnosti
Šablona obsahuje Titulní snímek, kde je prostor pro název prezentace, podnázev, jméno autora, datum a obrázek

Každý běžný snímek pak obsahuje atributy Název a Podnázev a jeden atribut, který určuje, zda bude název a podnázev vidět na vrchu snímku (pokud ano, pak jsou vedle sebe, podnázev světlejší/méně zřetelný, v nízké liště na vrchu snímku)

Pokud je viditelný počet snímků, zobrazuje se vpravo nahoře v liště nadpisu, pokud je viditelná, pokud není, tak na stejném místě bez lišty.

## Vzorové snímky
Šablona obsahuje čtyři vzorové snímky, některé s lištou s nadpisem a některé bez.
Titulní, s bodovým textem, s obrázkem, s textem i obrázkem