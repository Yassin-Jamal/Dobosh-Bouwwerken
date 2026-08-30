# Dobosh Bouwwerken — statische site

Een kopie van `dobosh-build-hub.base44.app` als gewone HTML, CSS en JavaScript. Geen React, geen
Base44, geen dependencies — je kunt de map op elke webhost zetten en het werkt.

De opmaak komt letterlijk van de originele site: `css/site.css` is de echte stylesheet van de
Base44-app en de pagina's gebruiken dezelfde klassen en structuur. Daardoor rendert de kopie
identiek in plaats van "erop lijkend". De tekst van alle vijf de pagina's is teken voor teken
gelijk aan het origineel.

## Bekijken

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Open daarna http://localhost:8080/

Draait Café Koos al op poort 8080? Kies dan een andere:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1 -Port 8090
```

## Structuur

```
index.html … contact.html   De 5 pagina's (gegenereerd — niet met de hand bewerken)

parts/_header.html          Header + navigatie      \
parts/_mobile.html          Mobiel menu             |  gedeeld door alle pagina's
parts/_footer.html          Footer                  /
parts/<pagina>.html         De inhoud van die pagina

build.ps1                   Bouwt de 5 pagina's uit parts/. Hier staan ook de titels en
                            de meta-omschrijvingen per pagina.
serve.ps1                   Lokaal previewservertje

css/site.css                De stylesheet van de originele site (Tailwind, gecompileerd)
css/app.css                 Kleine aanvulling: infaden, mobiel menu, projectenfilter
js/app.js                   Mobiel menu, infaden bij scrollen, projectenfilter, carousel, lightbox
images/                     De foto's (86 in gebruik)
```

## Iets aanpassen

**Belangrijk:** bewerk `parts/`, niet de HTML in de hoofdmap. Draai daarna `build.ps1` — dat
overschrijft de vijf pagina's. Zo hoef je header en footer maar op één plek te wijzigen.

```bash
powershell -ExecutionPolicy Bypass -File build.ps1
```

**Teksten en secties** — in `parts/<pagina>.html`.

**Header, footer of navigatie** — in `parts/_header.html`, `_mobile.html` of `_footer.html`.
Welk menu-item oplicht bepaalt `build.ps1` per pagina automatisch.

**Titels en Google-omschrijvingen** — de lijst `$pages` onderaan `build.ps1`.

**Projecten** — elke foto is een kaartje in `parts/projecten.html`. De categorie voor het filter
komt uit de `alt`-tekst van de foto ("Badkamer Renovatie 5" hoort bij de knop *Badkamer*). Wil je
een foto toevoegen, kopieer dan een bestaand kaartje en pas `src` en `alt` aan.

**Twee foto's onder één kaartje** (de carousel) — dat regelt `data-slides="images/a.jpg|images/b.jpg"`
op de kaart; `js/app.js` wisselt ze met de pijltjes.

## Wat er anders werkt dan op de originele site

Op de originele site deed React het bewegende werk. Dat is hier met gewone JavaScript nagebouwd:

- **Infaden bij scrollen** — met een `IntersectionObserver`. Er zit een vangnet in: doet die het
  niet, dan valt hij terug op scrollen en uiteindelijk op "gewoon alles tonen". De tekst kan dus
  nooit onzichtbaar blijven staan, ook niet als JavaScript uitvalt.
- **Mobiel menu, projectenfilter, carousel en lightbox** — allemaal in `js/app.js`.
- **De reviews staan in een lopende band** (het origineel had een raster van drie).
  Ze schuiven van rechts naar links en staan stil zodra je er met de muis overheen gaat.
  `js/app.js` verdubbelt de kaarten zodat de band naadloos rondloopt, en berekent de
  snelheid mee met het aantal reviews. Zonder JavaScript kun je ze zijwaarts scrollen.

  Een review toevoegen doe je gewoon door een kaart bij te zetten in
  `parts/index.html` — de band past zich vanzelf aan.

> **Let op bij het stylen:** `css/site.css` is de *gecompileerde* stylesheet van de
> originele site en bevat alleen klassen die daar al gebruikt werden. Een nieuwe
> Tailwind-klasse als `w-[380px]` of `mr-6` doet dus niets. Zulke aanpassingen horen in
> `css/app.css` (zie `.review-card` daar als voorbeeld).

## Let op

- **De kaart op de contactpagina** is een Google Maps-embed en heeft internet nodig. In de
  embed-link staat een verzonnen plaats-ID (`0x47c5b7f1b1b1b1b1:0x1`); die komt zo uit de
  originele site. Werkt de kaart niet goed, haal dan via Google Maps → *Delen* → *Kaart insluiten*
  een nieuwe embed-link op en vervang de `src` van de `<iframe>` in `parts/contact.html`.
- **Er staan twee verschillende adressen op de site**, net als op het origineel: de contactpagina
  en de footer noemen *Vreeswijkstraat 370, 2546 CJ*, maar het blok "Werkgebied" op de homepage
  noemt *Willem Pijperstraat 214, 2551 CR*. Even nalopen welke klopt.
- **De contactpagina heeft geen formulier** — net als het origineel: er staan knoppen die naar
  `tel:` en `mailto:` linken. Er gaat dus niets naar een server, en er is ook niets kwijtgeraakt.
- In `images/` staan nog vijf ongebruikte bestanden (vier dubbele downloads met `(1)` in de naam
  en een tweede logo). Die mag je weggooien; dat scheelt ongeveer 1,3 MB.
- `css/site.css` is de gecompileerde stylesheet van de originele site. Losse klassen aanpassen
  werkt daarom niet zoals in een normaal CSS-bestand. Eigen aanpassingen kun je kwijt in
  `css/app.css`, die wordt er ná site.css bij geladen.
