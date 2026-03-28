// scripts/add-tool-translations.cjs
// Adds tools_common and tool_pages keys to all non-English locale files.
// Run: node scripts/add-tool-translations.cjs

const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'messages');

// Translations organized by locale
const translations = {
  de: {
    tools_common: {
      back_pdf: "← PDF-Werkzeuge", back_image: "← Bildwerkzeuge",
      privacy_note: "✓ Ihre Dateien verlassen niemals Ihr Gerät.", privacy_note_browser: "✓ Vollständig in Ihrem Browser erzeugt.",
      upload_pdf: "PDF-Datei hinzufügen", upload_pdfs: "PDF-Dateien hinzufügen",
      upload_image: "Bild hierher ziehen", upload_images: "Mehrere Bilder hierher ziehen",
      upload_pdf_protected: "Passwortgeschützte PDF hinzufügen", upload_images_pdf: "Bilddateien hinzufügen (JPG, PNG, WEBP)",
      loading_thumbs: "Miniaturansichten laden…", ready: "Fertig!", output: "Ausgabe:", failed: "Fehlgeschlagen.",
      failed_read_pdf: "PDF konnte nicht gelesen werden.",
      page_of: "Seite {currentPage} / {pageCount}", pages_remaining: "{count} Seite(n) übrig",
      pages_selected: "{count} Seite(n) ausgewählt", images_selected: "{count} Bild(er) ausgewählt",
      results_ready: "{count} Ergebnis(se) bereit",
      apply_all_pages: "Auf alle Seiten anwenden", save_all: "Alle speichern",
      download: "Herunterladen", save: "Speichern", clear: "Löschen", reset: "Zurücksetzen",
      show: "Anzeigen", hide: "Verbergen",
      text: "Text", opacity: "Deckkraft", font_size: "Schriftgröße", rotation: "Drehung",
      position: "Position", center: "Mitte", tile: "Kachel", angle: "Winkel",
      format: "Format", quality: "Qualität", size: "Größe",
      left: "Links", right: "Rechts", top: "Oben", bottom: "Unten",
      operation: "Vorgang", rotate: "Drehen", watermark: "Wasserzeichen", crop: "Zuschneiden", meme: "Meme",
      foreground: "Vordergrund", background: "Hintergrund"
    },
    tool_pages: {
      merge: { title: "PDF zusammenführen", desc: "Mehrere PDFs zu einer kombinieren.", btn: "PDFs zusammenführen", btn_busy: "Zusammenführen…", err_min: "Mindestens 2 PDF-Dateien hinzufügen.", err_fail: "Zusammenführen fehlgeschlagen.", save: "Zusammengeführte PDF speichern" },
      split: { title: "PDF teilen", desc: "Seiten extrahieren oder jede Seite einzeln speichern.", select_pages: "Seiten auswählen", split_all: "Alle Seiten teilen", download_selected: "Ausgewählte Seiten herunterladen", btn_busy: "Verarbeiten…", err_select: "Mindestens eine Seite auswählen.", err_extract: "Seite konnte nicht extrahiert werden.", err_fail: "Teilen fehlgeschlagen.", help: "Klicken zum Umschalten, ● für einzelne Seite" },
      rotate_pdf: { title: "Seiten drehen", desc: "Einzelne Seiten oder die gesamte PDF drehen.", rotation: "Drehung", apply_to: "Anwenden auf", all_pages: "Alle Seiten", selected_pages: "Ausgewählte Seiten", btn_busy: "Verarbeiten…", err_fail: "Drehen fehlgeschlagen.", help: "Klicken zum Umschalten" },
      organize: { title: "Seiten organisieren", desc: "Ziehen zum Neuordnen oder Pfeile verwenden.", drag_reorder: "Ziehen zum Neuordnen", move_up: "Nach oben", move_down: "Nach unten", delete_page: "Seite löschen", no_pages: "Keine Seiten übrig.", btn: "Organisierte PDF speichern", btn_busy: "Speichern…" },
      images_to_pdf: { title: "Bilder → PDF", desc: "JPG, PNG oder WEBP in eine PDF konvertieren.", err_min: "Mindestens ein Bild hinzufügen.", err_fail: "Konvertierung fehlgeschlagen.", btn: "In PDF konvertieren", btn_busy: "Konvertieren…", save: "PDF speichern" },
      pdf_to_images: { title: "PDF → Bilder", desc: "Jede PDF-Seite als JPG oder PNG exportieren.", resolution: "Auflösung", btn: "Als Bilder exportieren", btn_busy: "Konvertiere Seite {progress} von {total}…", err_fail: "Konvertierung fehlgeschlagen." },
      pdf_to_ppt: { title: "PDF zu PowerPoint", desc: "Jede PDF-Seite in eine Folie umwandeln.", slide_size: "Foliengröße", widescreen: "16:9 Breitbild", standard: "4:3 Standard", btn: "In PPTX konvertieren", btn_busy: "Konvertiere Seite {progress} von {total}…", save: "PPTX speichern" },
      compress: { title: "PDF komprimieren", desc: "Dateigröße durch JPEG-Rendering reduzieren.", warning: "Komprimierte PDFs haben nur Bildseiten. Text ist <b>nicht</b> auswählbar.", note: "Hinweis:", preset_low: "Geringe Kompression", preset_low_desc: "~20–40% kleiner, gute Qualität", preset_med: "Mittel", preset_med_desc: "~50–70% kleiner, gute Qualität", preset_high: "Hohe Kompression", preset_high_desc: "~70–90% kleiner, sichtbarer Verlust", jpeg_quality: "JPEG-Qualität", input: "Eingabe:", saved: "gespart", original: "Original", compressed: "Komprimiert", btn: "PDF komprimieren", btn_busy: "Komprimiere Seite {progress} von {total}…", err_fail: "Kompression fehlgeschlagen.", save: "Komprimierte PDF speichern" },
      watermark_pdf: { title: "Wasserzeichen hinzufügen", desc: "Einstellungen anpassen und live auf der Seite sehen.", btn: "Auf alle Seiten anwenden", btn_busy: "Anwenden…", err_text: "Wasserzeichentext eingeben.", save: "PDF mit Wasserzeichen speichern" },
      page_numbers: { title: "Seitenzahlen hinzufügen", desc: "Seitenzahl live aktualisiert sehen.", position: "Position", start_from: "Beginnen bei", skip_first: "Erste Seite überspringen (z.B. Deckblatt)", bottom_left: "Unten links", bottom_center: "Unten Mitte", bottom_right: "Unten rechts", top_left: "Oben links", top_center: "Oben Mitte", top_right: "Oben rechts", btn: "Auf alle Seiten anwenden", btn_busy: "Nummern hinzufügen…", save: "Nummerierte PDF speichern" },
      metadata: { title: "Metadaten bearbeiten", desc: "Titel, Autor und andere PDF-Eigenschaften anzeigen und bearbeiten.", reading: "Metadaten lesen…", field_title: "Titel", field_author: "Autor", field_subject: "Betreff", field_keywords: "Schlüsselwörter", keywords_placeholder: "Wort1, Wort2", field_creator: "Ersteller", producer: "Erstellt mit:", created: "Erstellt:", modified: "Geändert:", none: "—", btn: "Metadaten speichern", btn_busy: "Speichern…", err_read: "Metadaten konnten nicht gelesen werden.", err_update: "Metadaten konnten nicht aktualisiert werden.", save: "Aktualisierte PDF speichern" },
      crop_pdf: { title: "PDF zuschneiden", desc: "Ränder ziehen oder Werte eingeben.", aria_drag: "Ränder ziehen zum Zuschneiden", err_margins: "Ränder zu groß — kein Bereich übrig.", btn: "PDF zuschneiden", btn_busy: "Zuschneiden…", save: "Zugeschnittene PDF speichern" },
      sign: { title: "PDF unterschreiben", desc: "Unterschrift erstellen, dann auf die Seite klicken.", step1: "1. Unterschrift erstellen", step2: "2. Auf die Seite klicken zum Platzieren", draw: "Zeichnen", type: "Tippen", upload: "Hochladen", your_name: "Ihr Name", click_place: "Klicken zum Platzieren", err_pdf: "PDF hinzufügen.", err_sig: "Erst eine Unterschrift erstellen.", err_place: "Auf die Seite klicken zum Platzieren.", btn_busy: "Unterschreiben…", save: "Unterschriebene PDF speichern" },
      edit: { title: "PDF bearbeiten", desc: "Auf die Seite klicken um Text zu platzieren.", placeholder: "Text zum Platzieren…", pt: "pt", keyboard_help: "Strg+Z Rückgängig · Entf Löschen · Pfeiltasten Verschieben · Esc Abwählen", aria_editor: "PDF-Seiteneditor", remove_text: "Text entfernen", err_text: "Auf die Seite klicken um Text zu platzieren.", err_pdf: "PDF hinzufügen.", elements_placed: "{count} Element(e) platziert", btn_busy: "Anwenden…", save: "Bearbeitete PDF speichern" },
      password: { title: "PDF mit Passwort schützen", desc: "PDF mit Passwort verschlüsseln und Berechtigungen festlegen.", password_label: "Passwort", password_placeholder: "Passwort eingeben…", owner_toggle: "Separates Besitzer-Passwort festlegen", owner_label: "Besitzer-Passwort", owner_placeholder: "Besitzer-Passwort…", owner_help: "Besitzer-Passwort gewährt vollen Zugriff.", permissions_label: "Berechtigungen", allow_printing: "Drucken erlauben", allow_copying: "Text kopieren erlauben", allow_editing: "Bearbeiten erlauben", info: "Verschlüsselung erfolgt vollständig in Ihrem Browser.", err_pdf: "PDF-Datei hinzufügen.", err_password: "Passwort eingeben.", err_min_length: "Passwort muss mindestens 4 Zeichen haben.", err_fail: "Verschlüsselung fehlgeschlagen.", btn: "PDF schützen", btn_busy: "Verschlüsseln…", result: "Geschützt!", save: "Geschützte PDF speichern" },
      unlock: { title: "PDF entsperren", desc: "Passwortschutz von einer PDF entfernen.", info: "Entfernt Einschränkungen (Drucken, Kopieren, Bearbeiten). Funktioniert mit den meisten passwortgeschützten Dateien.", err_pdf: "PDF-Datei hinzufügen.", err_fail: "Entsperren fehlgeschlagen.", btn: "PDF entsperren", btn_busy: "Entsperren…", result: "Entsperrt!", save: "Entsperrte PDF speichern" },
      rotate_image: { title: "Bild drehen", desc: "Winkel auswählen und sofort sehen.", save: "Gedrehtes Bild speichern" },
      crop_image: { title: "Bild zuschneiden", desc: "Ecken, Kanten ziehen oder neuen Bereich zeichnen.", circle: "Kreis", free: "Frei", err_area: "Zuschneidebereich auswählen.", btn: "Bild zuschneiden", btn_busy: "Zuschneiden…", save: "Zugeschnittenes Bild speichern" },
      watermark_image: { title: "Bild mit Wasserzeichen", desc: "Einstellungen anpassen und live sehen.", save: "Bild mit Wasserzeichen speichern" },
      meme: { title: "Meme-Generator", desc: "Tippen und live sehen.", top_text: "Oberer Text", bottom_text: "Unterer Text", save: "Meme speichern" },
      batch: { title: "Stapelverarbeitung", desc: "Gleiche Operation auf mehrere Bilder anwenden.", trim: "Beschneiden", trim_help: "Beschneidet {percent}% von jeder Kante.", err_images: "Erst Bilder hinzufügen.", err_text: "Mindestens eine Textzeile eingeben.", err_watermark: "Wasserzeichentext eingeben.", btn: "{count} Bild(er) verarbeiten", btn_busy: "Verarbeite {progress} / {total}…" },
      qr: { title: "QR-Code Generator", desc: "QR-Code erzeugen und live sehen.", text_url: "Text oder URL", error_correction: "Fehlerkorrektur", low: "Niedrig (7%)", medium: "Mittel (15%)", quartile: "Viertel (25%)", high: "Hoch (30%)", save: "QR-Code speichern", save_file: "qrcode.png herunterladen" }
    }
  }
};

// For other locales, use a simplified copy with the main strings translated
// We'll handle the full 15 locales with key translations

const locales = ['ar','ba','de','el','es','fr','hr','id','it','ja','ko','pt-BR','tr','zh-Hans','zh-Hant'];

// Read en.json to get the structure
const enPath = path.join(dir, 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

for (const locale of locales) {
  const fp = path.join(dir, locale + '.json');
  if (!fs.existsSync(fp)) continue;
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));

  if (locale === 'de' && translations.de) {
    data.tools_common = translations.de.tools_common;
    data.tool_pages = translations.de.tool_pages;
  } else {
    // For non-German locales, copy English as placeholder
    // These will be machine-translatable later
    data.tools_common = enData.tools_common;
    data.tool_pages = enData.tool_pages;
  }

  fs.writeFileSync(fp, JSON.stringify(data, null, '\t') + '\n', 'utf8');
  console.log('✓ ' + locale);
}
console.log('Done! German fully translated, others use English as placeholder.');
