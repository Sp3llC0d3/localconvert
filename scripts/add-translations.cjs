// scripts/add-translations.cjs
// Adds missing i18n keys to all locale files
// Run: node scripts/add-translations.cjs

const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '..', 'messages');

const translations = {
  ar: {
    navbar: { image_tools: "أدوات الصور", tools: "الأدوات" },
    image_tools: {
      title: "أدوات الصور",
      subtitle: "تتم جميع العمليات بالكامل في متصفحك. ملفاتك لا تغادر جهازك أبدًا.",
      badge: "محلية بالكامل 100% — بدون رفع، بدون خادم",
      tools: {
        rotate_name: "تدوير الصورة", rotate_desc: "تدوير الصورة بمقدار °90 أو °180 أو °270",
        crop_name: "اقتصاص الصورة", crop_desc: "ارسم مستطيلًا لاقتصاص أي منطقة",
        watermark_name: "علامة مائية على الصورة", watermark_desc: "أضف نصًا على أي صورة",
        meme_name: "مولّد الميمات", meme_desc: "أضف نصًا في أعلى وأسفل أي صورة"
      }
    },
    pdf_new_tools: {
      page_numbers_name: "إضافة أرقام الصفحات", page_numbers_desc: "إضافة ترقيم تسلسلي لكل صفحة",
      metadata_name: "تعديل البيانات الوصفية", metadata_desc: "عرض وتعديل العنوان والمؤلف وخصائص PDF الأخرى",
      crop_name: "اقتصاص PDF", crop_desc: "قص الهوامش من صفحات PDF",
      pdf_to_ppt_name: "PDF → PowerPoint", pdf_to_ppt_desc: "تحويل كل صفحة PDF إلى شريحة عرض تقديمي",
      sign_name: "توقيع PDF", sign_desc: "ارسم أو اكتب أو ارفع توقيعًا",
      edit_name: "تعديل PDF", edit_desc: "أضف نصًا إلى أي صفحة في ملف PDF"
    }
  },
  ba: {
    navbar: { image_tools: "Alati za slike", tools: "Alati" },
    image_tools: {
      title: "Alati za slike",
      subtitle: "Sve operacije se izvršavaju u potpunosti u vašem pregledniku. Vaši fajlovi nikada ne napuštaju vaš uređaj.",
      badge: "100% lokalno — bez otpremanja, bez servera",
      tools: {
        rotate_name: "Rotiraj sliku", rotate_desc: "Rotirajte sliku za 90°, 180° ili 270°",
        crop_name: "Izreži sliku", crop_desc: "Nacrtajte pravougaonik za izrezivanje bilo kojeg dijela",
        watermark_name: "Vodeni žig na slici", watermark_desc: "Dodajte tekst na bilo koju sliku",
        meme_name: "Generator mimova", meme_desc: "Dodajte tekst na vrh i dno bilo koje slike"
      }
    },
    pdf_new_tools: {
      page_numbers_name: "Dodaj brojeve stranica", page_numbers_desc: "Dodajte sekvencijalno numerisanje na svaku stranicu",
      metadata_name: "Uredi metapodatke", metadata_desc: "Pregledajte i uredite naslov, autora i druge PDF svojstva",
      crop_name: "Izreži PDF", crop_desc: "Obrežite margine sa PDF stranica",
      pdf_to_ppt_name: "PDF → PowerPoint", pdf_to_ppt_desc: "Pretvorite svaku PDF stranicu u slajd prezentacije",
      sign_name: "Potpiši PDF", sign_desc: "Nacrtajte, ukucajte ili otpremite potpis",
      edit_name: "Uredi PDF", edit_desc: "Dodajte tekst na bilo koju stranicu PDF-a"
    }
  },
  de: {
    navbar: { image_tools: "Bildwerkzeuge", tools: "Werkzeuge" },
    image_tools: {
      title: "Bildwerkzeuge",
      subtitle: "Alle Vorgänge werden vollständig in Ihrem Browser ausgeführt. Ihre Dateien verlassen niemals Ihr Gerät.",
      badge: "100 % lokal — kein Upload, kein Server",
      tools: {
        rotate_name: "Bild drehen", rotate_desc: "Bild um 90°, 180° oder 270° drehen",
        crop_name: "Bild zuschneiden", crop_desc: "Zeichnen Sie ein Rechteck, um einen Bereich zuzuschneiden",
        watermark_name: "Wasserzeichen", watermark_desc: "Text auf ein beliebiges Bild stempeln",
        meme_name: "Meme-Generator", meme_desc: "Text oben und unten auf ein beliebiges Bild setzen"
      }
    },
    pdf_new_tools: {
      page_numbers_name: "Seitenzahlen hinzufügen", page_numbers_desc: "Fortlaufende Nummerierung auf jeder Seite hinzufügen",
      metadata_name: "Metadaten bearbeiten", metadata_desc: "Titel, Autor und andere PDF-Eigenschaften anzeigen und bearbeiten",
      crop_name: "PDF zuschneiden", crop_desc: "Ränder von PDF-Seiten abschneiden",
      pdf_to_ppt_name: "PDF → PowerPoint", pdf_to_ppt_desc: "Jede PDF-Seite in eine Präsentationsfolie umwandeln",
      sign_name: "PDF unterschreiben", sign_desc: "Unterschrift zeichnen, eintippen oder hochladen",
      edit_name: "PDF bearbeiten", edit_desc: "Text auf jeder Seite einer PDF hinzufügen"
    }
  },
  el: {
    navbar: { image_tools: "Εργαλεία εικόνας", tools: "Εργαλεία" },
    image_tools: {
      title: "Εργαλεία εικόνας",
      subtitle: "Όλες οι λειτουργίες εκτελούνται εξ ολοκλήρου στον περιηγητή σας. Τα αρχεία σας δεν φεύγουν ποτέ από τη συσκευή σας.",
      badge: "100% τοπικά — χωρίς μεταφορτώσεις, χωρίς διακομιστή",
      tools: {
        rotate_name: "Περιστροφή εικόνας", rotate_desc: "Περιστρέψτε μια εικόνα κατά 90°, 180° ή 270°",
        crop_name: "Περικοπή εικόνας", crop_desc: "Σχεδιάστε ένα ορθογώνιο για να περικόψετε οποιαδήποτε περιοχή",
        watermark_name: "Υδατογράφημα εικόνας", watermark_desc: "Προσθέστε κείμενο σε οποιαδήποτε εικόνα",
        meme_name: "Δημιουργός meme", meme_desc: "Προσθέστε κείμενο πάνω και κάτω σε οποιαδήποτε εικόνα"
      }
    },
    pdf_new_tools: {
      page_numbers_name: "Προσθήκη αριθμών σελίδων", page_numbers_desc: "Προσθέστε διαδοχική αρίθμηση σε κάθε σελίδα",
      metadata_name: "Επεξεργασία μεταδεδομένων", metadata_desc: "Προβολή και επεξεργασία τίτλου, συγγραφέα και άλλων ιδιοτήτων PDF",
      crop_name: "Περικοπή PDF", crop_desc: "Κόψτε τα περιθώρια από σελίδες PDF",
      pdf_to_ppt_name: "PDF → PowerPoint", pdf_to_ppt_desc: "Μετατρέψτε κάθε σελίδα PDF σε διαφάνεια παρουσίασης",
      sign_name: "Υπογραφή PDF", sign_desc: "Σχεδιάστε, πληκτρολογήστε ή ανεβάστε μια υπογραφή",
      edit_name: "Επεξεργασία PDF", edit_desc: "Προσθέστε κείμενο σε οποιαδήποτε σελίδα ενός PDF"
    }
  },
  es: {
    navbar: { image_tools: "Herramientas de imagen", tools: "Herramientas" },
    image_tools: {
      title: "Herramientas de imagen",
      subtitle: "Todas las operaciones se ejecutan completamente en su navegador. Sus archivos nunca salen de su dispositivo.",
      badge: "100% local — sin subidas, sin servidor",
      tools: {
        rotate_name: "Rotar imagen", rotate_desc: "Rotar una imagen 90°, 180° o 270°",
        crop_name: "Recortar imagen", crop_desc: "Dibuje un rectángulo para recortar cualquier área",
        watermark_name: "Marca de agua", watermark_desc: "Estampar texto en cualquier imagen",
        meme_name: "Generador de memes", meme_desc: "Agregar texto arriba y abajo en cualquier imagen"
      }
    },
    pdf_new_tools: {
      page_numbers_name: "Agregar números de página", page_numbers_desc: "Agregar numeración secuencial a cada página",
      metadata_name: "Editar metadatos", metadata_desc: "Ver y editar título, autor y otras propiedades del PDF",
      crop_name: "Recortar PDF", crop_desc: "Recortar márgenes de las páginas del PDF",
      pdf_to_ppt_name: "PDF → PowerPoint", pdf_to_ppt_desc: "Convertir cada página del PDF en una diapositiva de presentación",
      sign_name: "Firmar PDF", sign_desc: "Dibuje, escriba o cargue una firma",
      edit_name: "Editar PDF", edit_desc: "Agregar texto a cualquier página de un PDF"
    }
  },
  fr: {
    navbar: { image_tools: "Outils image", tools: "Outils" },
    image_tools: {
      title: "Outils image",
      subtitle: "Toutes les opérations s'exécutent entièrement dans votre navigateur. Vos fichiers ne quittent jamais votre appareil.",
      badge: "100 % local — aucun téléversement, aucun serveur",
      tools: {
        rotate_name: "Pivoter l'image", rotate_desc: "Pivoter une image de 90°, 180° ou 270°",
        crop_name: "Rogner l'image", crop_desc: "Dessinez un rectangle pour rogner n'importe quelle zone",
        watermark_name: "Filigrane", watermark_desc: "Appliquer un texte sur n'importe quelle image",
        meme_name: "Générateur de mèmes", meme_desc: "Ajouter du texte en haut et en bas de n'importe quelle image"
      }
    },
    pdf_new_tools: {
      page_numbers_name: "Ajouter des numéros de page", page_numbers_desc: "Ajouter une numérotation séquentielle à chaque page",
      metadata_name: "Modifier les métadonnées", metadata_desc: "Afficher et modifier le titre, l'auteur et d'autres propriétés du PDF",
      crop_name: "Rogner le PDF", crop_desc: "Rogner les marges des pages du PDF",
      pdf_to_ppt_name: "PDF → PowerPoint", pdf_to_ppt_desc: "Convertir chaque page du PDF en diapositive de présentation",
      sign_name: "Signer le PDF", sign_desc: "Dessinez, saisissez ou importez une signature",
      edit_name: "Modifier le PDF", edit_desc: "Ajouter du texte sur n'importe quelle page d'un PDF"
    }
  },
  hr: {
    navbar: { image_tools: "Alati za slike", tools: "Alati" },
    image_tools: {
      title: "Alati za slike",
      subtitle: "Sve operacije izvršavaju se u potpunosti u vašem pregledniku. Vaše datoteke nikada ne napuštaju vaš uređaj.",
      badge: "100% lokalno — bez učitavanja, bez poslužitelja",
      tools: {
        rotate_name: "Rotiraj sliku", rotate_desc: "Rotirajte sliku za 90°, 180° ili 270°",
        crop_name: "Izreži sliku", crop_desc: "Nacrtajte pravokutnik za izrezivanje bilo kojeg područja",
        watermark_name: "Vodeni žig na slici", watermark_desc: "Dodajte tekst na bilo koju sliku",
        meme_name: "Generator memova", meme_desc: "Dodajte tekst na vrh i dno bilo koje slike"
      }
    },
    pdf_new_tools: {
      page_numbers_name: "Dodaj brojeve stranica", page_numbers_desc: "Dodajte sekvencijalno numeriranje na svaku stranicu",
      metadata_name: "Uredi metapodatke", metadata_desc: "Pregledajte i uredite naslov, autora i druga PDF svojstva",
      crop_name: "Izreži PDF", crop_desc: "Obrežite margine sa PDF stranica",
      pdf_to_ppt_name: "PDF → PowerPoint", pdf_to_ppt_desc: "Pretvorite svaku PDF stranicu u slajd prezentacije",
      sign_name: "Potpiši PDF", sign_desc: "Nacrtajte, upišite ili učitajte potpis",
      edit_name: "Uredi PDF", edit_desc: "Dodajte tekst na bilo koju stranicu PDF-a"
    }
  },
  id: {
    navbar: { image_tools: "Alat Gambar", tools: "Alat" },
    image_tools: {
      title: "Alat Gambar",
      subtitle: "Semua operasi dijalankan sepenuhnya di peramban Anda. File Anda tidak pernah meninggalkan perangkat Anda.",
      badge: "100% lokal — tanpa unggahan, tanpa server",
      tools: {
        rotate_name: "Putar Gambar", rotate_desc: "Putar gambar sebesar 90°, 180°, atau 270°",
        crop_name: "Potong Gambar", crop_desc: "Gambar persegi panjang untuk memotong area mana pun",
        watermark_name: "Tanda Air pada Gambar", watermark_desc: "Tambahkan teks pada gambar apa pun",
        meme_name: "Generator Meme", meme_desc: "Tambahkan teks atas dan bawah pada gambar apa pun"
      }
    },
    pdf_new_tools: {
      page_numbers_name: "Tambah Nomor Halaman", page_numbers_desc: "Tambahkan penomoran berurutan ke setiap halaman",
      metadata_name: "Edit Metadata", metadata_desc: "Lihat dan edit judul, penulis, dan properti PDF lainnya",
      crop_name: "Potong PDF", crop_desc: "Pangkas margin dari halaman PDF",
      pdf_to_ppt_name: "PDF → PowerPoint", pdf_to_ppt_desc: "Ubah setiap halaman PDF menjadi slide presentasi",
      sign_name: "Tanda Tangani PDF", sign_desc: "Gambar, ketik, atau unggah tanda tangan",
      edit_name: "Edit PDF", edit_desc: "Tambahkan teks ke halaman mana pun dari PDF"
    }
  },
  it: {
    navbar: { image_tools: "Strumenti immagine", tools: "Strumenti" },
    image_tools: {
      title: "Strumenti immagine",
      subtitle: "Tutte le operazioni vengono eseguite interamente nel tuo browser. I tuoi file non lasciano mai il tuo dispositivo.",
      badge: "100% locale — nessun caricamento, nessun server",
      tools: {
        rotate_name: "Ruota immagine", rotate_desc: "Ruota un'immagine di 90°, 180° o 270°",
        crop_name: "Ritaglia immagine", crop_desc: "Disegna un rettangolo per ritagliare qualsiasi area",
        watermark_name: "Filigrana sull'immagine", watermark_desc: "Applica un testo su qualsiasi immagine",
        meme_name: "Generatore di meme", meme_desc: "Aggiungi testo in alto e in basso su qualsiasi immagine"
      }
    },
    pdf_new_tools: {
      page_numbers_name: "Aggiungi numeri di pagina", page_numbers_desc: "Aggiungi numerazione sequenziale a ogni pagina",
      metadata_name: "Modifica metadati", metadata_desc: "Visualizza e modifica titolo, autore e altre proprietà del PDF",
      crop_name: "Ritaglia PDF", crop_desc: "Taglia i margini dalle pagine del PDF",
      pdf_to_ppt_name: "PDF → PowerPoint", pdf_to_ppt_desc: "Converti ogni pagina del PDF in una diapositiva di presentazione",
      sign_name: "Firma PDF", sign_desc: "Disegna, digita o carica una firma",
      edit_name: "Modifica PDF", edit_desc: "Aggiungi testo a qualsiasi pagina di un PDF"
    }
  },
  ja: {
    navbar: { image_tools: "画像ツール", tools: "ツール" },
    image_tools: {
      title: "画像ツール",
      subtitle: "すべての処理はブラウザ内で完結します。ファイルがデバイスの外に送信されることはありません。",
      badge: "100%ローカル処理 — アップロード・サーバー不要",
      tools: {
        rotate_name: "画像の回転", rotate_desc: "画像を90°、180°、270°に回転",
        crop_name: "画像の切り抜き", crop_desc: "四角形を描いて任意の領域を切り抜き",
        watermark_name: "透かしの追加", watermark_desc: "任意の画像にテキストを追加",
        meme_name: "ミーム作成", meme_desc: "任意の画像の上下にテキストを追加"
      }
    },
    pdf_new_tools: {
      page_numbers_name: "ページ番号の追加", page_numbers_desc: "各ページに連番を追加",
      metadata_name: "メタデータの編集", metadata_desc: "タイトル、著者などのPDFプロパティを表示・編集",
      crop_name: "PDFの切り抜き", crop_desc: "PDFページの余白をトリミング",
      pdf_to_ppt_name: "PDF → PowerPoint", pdf_to_ppt_desc: "PDFの各ページをプレゼンテーションスライドに変換",
      sign_name: "PDFに署名", sign_desc: "手書き、テキスト入力、または画像で署名を追加",
      edit_name: "PDFの編集", edit_desc: "PDFの任意のページにテキストを追加"
    }
  },
  ko: {
    navbar: { image_tools: "이미지 도구", tools: "도구" },
    image_tools: {
      title: "이미지 도구",
      subtitle: "모든 작업은 브라우저에서 완전히 실행됩니다. 파일이 기기 밖으로 전송되지 않습니다.",
      badge: "100% 로컬 처리 — 업로드 없음, 서버 없음",
      tools: {
        rotate_name: "이미지 회전", rotate_desc: "이미지를 90°, 180° 또는 270° 회전",
        crop_name: "이미지 자르기", crop_desc: "사각형을 그려 원하는 영역을 자르기",
        watermark_name: "이미지 워터마크", watermark_desc: "이미지에 텍스트 삽입",
        meme_name: "밈 생성기", meme_desc: "이미지 상단과 하단에 텍스트 추가"
      }
    },
    pdf_new_tools: {
      page_numbers_name: "페이지 번호 추가", page_numbers_desc: "각 페이지에 순차 번호 매기기 추가",
      metadata_name: "메타데이터 편집", metadata_desc: "제목, 저자 등 PDF 속성 보기 및 편집",
      crop_name: "PDF 자르기", crop_desc: "PDF 페이지의 여백 잘라내기",
      pdf_to_ppt_name: "PDF → PowerPoint", pdf_to_ppt_desc: "각 PDF 페이지를 프레젠테이션 슬라이드로 변환",
      sign_name: "PDF 서명", sign_desc: "그리기, 입력 또는 서명 이미지 업로드",
      edit_name: "PDF 편집", edit_desc: "PDF의 원하는 페이지에 텍스트 추가"
    }
  },
  "pt-BR": {
    navbar: { image_tools: "Ferramentas de imagem", tools: "Ferramentas" },
    image_tools: {
      title: "Ferramentas de imagem",
      subtitle: "Todas as operações são executadas inteiramente no seu navegador. Seus arquivos nunca saem do seu dispositivo.",
      badge: "100% local — sem uploads, sem servidor",
      tools: {
        rotate_name: "Girar imagem", rotate_desc: "Girar uma imagem em 90°, 180° ou 270°",
        crop_name: "Cortar imagem", crop_desc: "Desenhe um retângulo para cortar qualquer área",
        watermark_name: "Marca d'água", watermark_desc: "Carimbar texto em qualquer imagem",
        meme_name: "Gerador de memes", meme_desc: "Adicionar texto na parte superior e inferior de qualquer imagem"
      }
    },
    pdf_new_tools: {
      page_numbers_name: "Adicionar números de página", page_numbers_desc: "Adicionar numeração sequencial a cada página",
      metadata_name: "Editar metadados", metadata_desc: "Visualizar e editar título, autor e outras propriedades do PDF",
      crop_name: "Cortar PDF", crop_desc: "Aparar margens das páginas do PDF",
      pdf_to_ppt_name: "PDF → PowerPoint", pdf_to_ppt_desc: "Converter cada página do PDF em um slide de apresentação",
      sign_name: "Assinar PDF", sign_desc: "Desenhe, digite ou envie uma assinatura",
      edit_name: "Editar PDF", edit_desc: "Adicionar texto a qualquer página de um PDF"
    }
  },
  tr: {
    navbar: { image_tools: "Görsel Araçları", tools: "Araçlar" },
    image_tools: {
      title: "Görsel Araçları",
      subtitle: "Tüm işlemler tamamen tarayıcınızda gerçekleştirilir. Dosyalarınız hiçbir zaman cihazınızdan çıkmaz.",
      badge: "100% yerel — yükleme yok, sunucu yok",
      tools: {
        rotate_name: "Görsel Döndür", rotate_desc: "Görseli 90°, 180° veya 270° döndürün",
        crop_name: "Görsel Kırp", crop_desc: "Herhangi bir alanı kırpmak için dikdörtgen çizin",
        watermark_name: "Filigran Ekle", watermark_desc: "Herhangi bir görsele metin ekleyin",
        meme_name: "Meme Oluşturucu", meme_desc: "Herhangi bir görselin üstüne ve altına metin ekleyin"
      }
    },
    pdf_new_tools: {
      page_numbers_name: "Sayfa Numarası Ekle", page_numbers_desc: "Her sayfaya sıralı numaralandırma ekleyin",
      metadata_name: "Meta Verileri Düzenle", metadata_desc: "Başlık, yazar ve diğer PDF özelliklerini görüntüleyin ve düzenleyin",
      crop_name: "PDF Kırp", crop_desc: "PDF sayfalarındaki kenar boşluklarını kırpın",
      pdf_to_ppt_name: "PDF → PowerPoint", pdf_to_ppt_desc: "Her PDF sayfasını bir sunum slaydına dönüştürün",
      sign_name: "PDF İmzala", sign_desc: "İmza çizin, yazın veya yükleyin",
      edit_name: "PDF Düzenle", edit_desc: "Bir PDF'nin herhangi bir sayfasına metin ekleyin"
    }
  },
  "zh-Hans": {
    navbar: { image_tools: "图片工具", tools: "工具" },
    image_tools: {
      title: "图片工具",
      subtitle: "所有操作完全在您的浏览器中运行。您的文件绝不会离开您的设备。",
      badge: "100% 本地处理 — 无上传、无服务器",
      tools: {
        rotate_name: "旋转图片", rotate_desc: "将图片旋转 90°、180° 或 270°",
        crop_name: "裁剪图片", crop_desc: "绘制矩形以裁剪任意区域",
        watermark_name: "图片水印", watermark_desc: "在任意图片上添加文字",
        meme_name: "表情包生成器", meme_desc: "在任意图片的顶部和底部添加文字"
      }
    },
    pdf_new_tools: {
      page_numbers_name: "添加页码", page_numbers_desc: "为每页添加连续编号",
      metadata_name: "编辑元数据", metadata_desc: "查看和编辑标题、作者及其他 PDF 属性",
      crop_name: "裁剪 PDF", crop_desc: "裁剪 PDF 页面的边距",
      pdf_to_ppt_name: "PDF → PowerPoint", pdf_to_ppt_desc: "将每页 PDF 转换为演示文稿幻灯片",
      sign_name: "签署 PDF", sign_desc: "手绘、键入或上传签名",
      edit_name: "编辑 PDF", edit_desc: "在 PDF 的任意页面添加文字"
    }
  },
  "zh-Hant": {
    navbar: { image_tools: "圖片工具", tools: "工具" },
    image_tools: {
      title: "圖片工具",
      subtitle: "所有操作完全在您的瀏覽器中執行。您的檔案絕不會離開您的裝置。",
      badge: "100% 本機處理 — 無上傳、無伺服器",
      tools: {
        rotate_name: "旋轉圖片", rotate_desc: "將圖片旋轉 90°、180° 或 270°",
        crop_name: "裁剪圖片", crop_desc: "繪製矩形以裁剪任意區域",
        watermark_name: "圖片浮水印", watermark_desc: "在任意圖片上加入文字",
        meme_name: "迷因產生器", meme_desc: "在任意圖片的頂部和底部加入文字"
      }
    },
    pdf_new_tools: {
      page_numbers_name: "新增頁碼", page_numbers_desc: "為每頁新增連續編號",
      metadata_name: "編輯中繼資料", metadata_desc: "檢視及編輯標題、作者和其他 PDF 屬性",
      crop_name: "裁剪 PDF", crop_desc: "裁切 PDF 頁面的邊距",
      pdf_to_ppt_name: "PDF → PowerPoint", pdf_to_ppt_desc: "將每頁 PDF 轉換為簡報投影片",
      sign_name: "簽署 PDF", sign_desc: "手繪、輸入或上傳簽名",
      edit_name: "編輯 PDF", edit_desc: "在 PDF 的任意頁面新增文字"
    }
  }
};

for (const [locale, trans] of Object.entries(translations)) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ Skipping ${locale}.json (not found)`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Add navbar keys
  if (!data.navbar.image_tools) data.navbar.image_tools = trans.navbar.image_tools;
  if (!data.navbar.tools) data.navbar.tools = trans.navbar.tools;

  // Add image_tools section
  if (!data.image_tools) {
    data.image_tools = trans.image_tools;
  }

  // Add new PDF tool keys
  if (data.pdf_tools && data.pdf_tools.tools) {
    const newTools = trans.pdf_new_tools;
    for (const [key, value] of Object.entries(newTools)) {
      if (!data.pdf_tools.tools[key]) {
        data.pdf_tools.tools[key] = value;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, '\t') + '\n', 'utf8');
  console.log(`✓ Updated ${locale}.json`);
}

console.log('\nDone! Run: npx @inlang/paraglide-js compile');
