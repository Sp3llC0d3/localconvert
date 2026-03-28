// scripts/translate-all.cjs
// Translates all untranslated keys across all non-English locales
// Run: node scripts/translate-all.cjs

const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '..', 'messages');

// All translations keyed by locale
const translations = {
  ar: {
    upload: {
      title: "أدواتك الخاصة للملفات والأكواد.",
      subtitle: "36 أداة لملفات PDF والصور وسير عمل المطورين — تعمل بالكامل في متصفحك. بدون رفع، بدون حسابات، مجانية للأبد."
    },
    landing: {
      pills: {
        tools_count: "36+ أداة",
        works_offline: "يعمل بدون إنترنت"
      },
      toolkit: {
        label: "ورشتك",
        title: "كل أداة تعمل في متصفحك",
        pdf_title: "أدوات PDF",
        pdf_desc: "دمج، تقسيم، ضغط، علامة مائية، توقيع، تعديل، و12 أداة أخرى",
        pdf_count: "18 أداة",
        image_title: "أدوات الصور",
        image_desc: "اقتصاص، تغيير الحجم، فلاتر، تمويه، علامة مائية، ميم، والمزيد",
        image_count: "10 أدوات",
        dev_title: "أدوات المطورين",
        dev_desc: "JSON، هاش، Base64، ماركداون، مقارنة النصوص، والمزيد",
        dev_count: "8 أدوات",
        explore: "استكشف ←"
      },
      formats: {
        title: "200+ تحويل صيغة",
        label: "المحوّل"
      },
      privacy: {
        point2: "جميع الأدوات الـ36 تعمل بالكامل في متصفحك — بدون رفع للخادم"
      },
      faq: {
        q3: "ماذا يمكن لـ LocalConvert فعله؟",
        a3: "تحويل أكثر من 200 صيغة ملفات (صور، صوت، فيديو، مستندات)، 18 أداة PDF (دمج، تقسيم، ضغط، علامة مائية، توقيع، تعديل، والمزيد)، 10 أدوات صور (اقتصاص، تغيير الحجم، فلاتر، تمويه، علامة مائية)، و8 أدوات للمطورين (JSON، هاش، Base64، مقارنة، ماركداون)."
      }
    },
    image_tools: {
      categories: { edit: "تعديل", create: "إنشاء" },
      tools: {
        filters_name: "فلاتر الصور",
        filters_desc: "ضبط السطوع والتباين والتشبع والبُني ودرجة اللون",
        video_to_gif_name: "فيديو إلى GIF",
        video_to_gif_desc: "تحويل مقطع فيديو إلى صورة GIF متحركة"
      }
    },
    dev_tools: {
      title: "أدوات المطورين",
      subtitle: "تنسيق، ترميز، وتشفير — كلها في متصفحك. لا شيء يغادر جهازك.",
      badge: "100% محلي — بدون رفع، بدون خادم",
      categories: { format: "تنسيق وتحويل", analyze: "تحليل" },
      tools: {
        json_name: "منسّق JSON",
        json_desc: "تنسيق وتصغير والتحقق من JSON",
        hash_name: "مولّد الهاش",
        hash_desc: "SHA-256 و SHA-1 و SHA-512",
        base64_name: "ترميز/فك ترميز Base64",
        base64_desc: "ترميز أو فك ترميز Base64",
        markdown_name: "معاينة ماركداون",
        markdown_desc: "ماركداون إلى HTML مباشرة",
        diff_name: "مقارنة النصوص",
        diff_desc: "مقارنة نصين وعرض الفروقات",
        word_count_name: "عدّاد الكلمات",
        word_count_desc: "كلمات، أحرف، وقت القراءة",
        url_encode_name: "ترميز/فك ترميز URL",
        url_encode_desc: "ترميز أو فك ترميز عناوين URL",
        css_minify_name: "تصغير CSS",
        css_minify_desc: "تصغير كود CSS"
      }
    },
    tools_common: {
      back_dev: "← أدوات المطورين"
    }
  },

  de: {
    upload: {
      title: "Ihr privates Toolkit für Dateien & Code.",
      subtitle: "36 Werkzeuge für PDFs, Bilder und Entwickler-Workflows — alles in Ihrem Browser. Kein Upload, kein Konto, für immer kostenlos."
    },
    landing: {
      pills: {
        tools_count: "36+ Werkzeuge",
        works_offline: "Offline nutzbar"
      },
      toolkit: {
        label: "Ihre Werkstatt",
        title: "Jedes Werkzeug läuft in Ihrem Browser",
        pdf_title: "PDF-Werkzeuge",
        pdf_desc: "Zusammenführen, teilen, komprimieren, Wasserzeichen, signieren, bearbeiten und 12 mehr",
        pdf_count: "18 Werkzeuge",
        image_title: "Bildwerkzeuge",
        image_desc: "Zuschneiden, skalieren, Filter, weichzeichnen, Wasserzeichen, Meme und mehr",
        image_count: "10 Werkzeuge",
        dev_title: "Entwicklerwerkzeuge",
        dev_desc: "JSON, Hash, Base64, Markdown, Diff und mehr",
        dev_count: "8 Werkzeuge",
        explore: "Entdecken →"
      },
      formats: {
        title: "200+ Formatkonvertierungen",
        label: "Konverter"
      },
      privacy: {
        point2: "Alle 36 Werkzeuge laufen vollständig in Ihrem Browser — kein Server-Upload"
      },
      faq: {
        q3: "Was kann LocalConvert?",
        a3: "Über 200 Dateiformate konvertieren (Bilder, Audio, Video, Dokumente), 18 PDF-Werkzeuge (zusammenführen, teilen, komprimieren, Wasserzeichen, signieren, bearbeiten und mehr), 10 Bildwerkzeuge (zuschneiden, skalieren, Filter, weichzeichnen, Wasserzeichen) und 8 Entwicklerwerkzeuge (JSON, Hash, Base64, Diff, Markdown)."
      }
    },
    image_tools: {
      categories: { edit: "Bearbeiten", create: "Erstellen" },
      tools: {
        filters_name: "Bildfilter",
        filters_desc: "Helligkeit, Kontrast, Sättigung, Sepia und Farbton anpassen",
        video_to_gif_name: "Video zu GIF",
        video_to_gif_desc: "Ein Video in ein animiertes GIF umwandeln"
      }
    },
    dev_tools: {
      title: "Entwicklerwerkzeuge",
      subtitle: "Formatieren, kodieren und hashen — alles in Ihrem Browser. Nichts verlässt Ihr Gerät.",
      badge: "100 % lokal — kein Upload, kein Server",
      categories: { format: "Formatieren & Transformieren", analyze: "Analysieren" },
      tools: {
        json_name: "JSON-Formatierer",
        json_desc: "JSON formatieren, minimieren und validieren",
        hash_name: "Hash-Generator",
        hash_desc: "SHA-256, SHA-1, SHA-512",
        base64_name: "Base64 Kodieren/Dekodieren",
        base64_desc: "Base64 kodieren oder dekodieren",
        markdown_name: "Markdown-Vorschau",
        markdown_desc: "Live Markdown zu HTML",
        diff_name: "Textvergleich",
        diff_desc: "Zwei Texte vergleichen und Unterschiede anzeigen",
        word_count_name: "Wortzähler",
        word_count_desc: "Wörter, Zeichen, Lesezeit",
        url_encode_name: "URL Kodieren/Dekodieren",
        url_encode_desc: "URLs kodieren oder dekodieren",
        css_minify_name: "CSS Minimieren",
        css_minify_desc: "CSS-Code minimieren"
      }
    },
    tools_common: {
      back_dev: "← Entwicklerwerkzeuge"
    }
  },

  es: {
    upload: {
      title: "Tu kit de herramientas privado para archivos y código.",
      subtitle: "36 herramientas para PDFs, imágenes y flujos de trabajo de desarrollo — todo en tu navegador. Sin subidas, sin cuentas, gratis para siempre."
    },
    landing: {
      pills: { tools_count: "36+ Herramientas", works_offline: "Funciona sin conexión" },
      toolkit: {
        label: "Tu taller",
        title: "Cada herramienta funciona en tu navegador",
        pdf_title: "Herramientas PDF",
        pdf_desc: "Unir, dividir, comprimir, marca de agua, firmar, editar y 12 más",
        pdf_count: "18 herramientas",
        image_title: "Herramientas de imagen",
        image_desc: "Recortar, redimensionar, filtros, desenfocar, marca de agua, meme y más",
        image_count: "10 herramientas",
        dev_title: "Herramientas de desarrollo",
        dev_desc: "JSON, hash, Base64, markdown, diff y más",
        dev_count: "8 herramientas",
        explore: "Explorar →"
      },
      formats: { title: "200+ conversiones de formato", label: "Conversor" },
      privacy: { point2: "Las 36 herramientas funcionan completamente en tu navegador — cero subidas al servidor" },
      faq: {
        q3: "¿Qué puede hacer LocalConvert?",
        a3: "Convertir más de 200 formatos de archivo (imágenes, audio, video, documentos), 18 herramientas PDF (unir, dividir, comprimir, marca de agua, firmar, editar y más), 10 herramientas de imagen (recortar, redimensionar, filtros, desenfocar, marca de agua) y 8 herramientas de desarrollo (JSON, hash, Base64, diff, markdown)."
      }
    },
    image_tools: {
      categories: { edit: "Editar", create: "Crear" },
      tools: { filters_name: "Filtros de imagen", filters_desc: "Ajustar brillo, contraste, saturación, sepia y tono", video_to_gif_name: "Video a GIF", video_to_gif_desc: "Convertir un video en un GIF animado" }
    },
    dev_tools: {
      title: "Herramientas de desarrollo", subtitle: "Formatear, codificar y generar hash — todo en tu navegador. Nada sale de tu dispositivo.",
      badge: "100% local — sin subidas, sin servidor",
      categories: { format: "Formatear y transformar", analyze: "Analizar" },
      tools: { json_name: "Formateador JSON", json_desc: "Formatear, minimizar y validar JSON", hash_name: "Generador de hash", hash_desc: "SHA-256, SHA-1, SHA-512", base64_name: "Codificar/Decodificar Base64", base64_desc: "Codificar o decodificar Base64", markdown_name: "Vista previa Markdown", markdown_desc: "Markdown a HTML en vivo", diff_name: "Comparar textos", diff_desc: "Comparar dos textos y mostrar diferencias", word_count_name: "Contador de palabras", word_count_desc: "Palabras, caracteres, tiempo de lectura", url_encode_name: "Codificar/Decodificar URL", url_encode_desc: "Codificar o decodificar URLs", css_minify_name: "Minimizar CSS", css_minify_desc: "Minimizar código CSS" }
    },
    tools_common: { back_dev: "← Herramientas de desarrollo" }
  },

  fr: {
    upload: { title: "Votre boîte à outils privée pour fichiers et code.", subtitle: "36 outils pour les PDFs, images et flux de développement — tout dans votre navigateur. Sans téléversement, sans compte, gratuit pour toujours." },
    landing: {
      pills: { tools_count: "36+ Outils", works_offline: "Fonctionne hors ligne" },
      toolkit: { label: "Votre atelier", title: "Chaque outil fonctionne dans votre navigateur", pdf_title: "Outils PDF", pdf_desc: "Fusionner, diviser, compresser, filigrane, signer, modifier et 12 de plus", pdf_count: "18 outils", image_title: "Outils image", image_desc: "Rogner, redimensionner, filtres, flouter, filigrane, mème et plus", image_count: "10 outils", dev_title: "Outils développeur", dev_desc: "JSON, hash, Base64, markdown, diff et plus", dev_count: "8 outils", explore: "Explorer →" },
      formats: { title: "200+ conversions de format", label: "Convertisseur" },
      privacy: { point2: "Les 36 outils fonctionnent entièrement dans votre navigateur — zéro téléversement" },
      faq: { q3: "Que peut faire LocalConvert ?", a3: "Convertir plus de 200 formats de fichiers (images, audio, vidéo, documents), 18 outils PDF (fusionner, diviser, compresser, filigrane, signer, modifier et plus), 10 outils image (rogner, redimensionner, filtres, flouter, filigrane) et 8 outils développeur (JSON, hash, Base64, diff, markdown)." }
    },
    image_tools: { categories: { edit: "Modifier", create: "Créer" }, tools: { filters_name: "Filtres d'image", filters_desc: "Ajuster luminosité, contraste, saturation, sépia et teinte", video_to_gif_name: "Vidéo en GIF", video_to_gif_desc: "Convertir une vidéo en GIF animé" } },
    dev_tools: { title: "Outils développeur", subtitle: "Formater, encoder et hacher — tout dans votre navigateur. Rien ne quitte votre appareil.", badge: "100 % local — aucun téléversement, aucun serveur", categories: { format: "Formater et transformer", analyze: "Analyser" }, tools: { json_name: "Formateur JSON", json_desc: "Formater, minifier et valider le JSON", hash_name: "Générateur de hash", hash_desc: "SHA-256, SHA-1, SHA-512", base64_name: "Encoder/Décoder Base64", base64_desc: "Encoder ou décoder en Base64", markdown_name: "Aperçu Markdown", markdown_desc: "Markdown vers HTML en direct", diff_name: "Comparaison de textes", diff_desc: "Comparer deux textes et afficher les différences", word_count_name: "Compteur de mots", word_count_desc: "Mots, caractères, temps de lecture", url_encode_name: "Encoder/Décoder URL", url_encode_desc: "Encoder ou décoder des URLs", css_minify_name: "Minifier CSS", css_minify_desc: "Minifier le code CSS" } },
    tools_common: { back_dev: "← Outils développeur" }
  },

  it: {
    upload: { title: "Il tuo toolkit privato per file e codice.", subtitle: "36 strumenti per PDF, immagini e flussi di sviluppo — tutto nel tuo browser. Senza caricamenti, senza account, gratis per sempre." },
    landing: {
      pills: { tools_count: "36+ Strumenti", works_offline: "Funziona offline" },
      toolkit: { label: "La tua officina", title: "Ogni strumento funziona nel tuo browser", pdf_title: "Strumenti PDF", pdf_desc: "Unire, dividere, comprimere, filigrana, firmare, modificare e altri 12", pdf_count: "18 strumenti", image_title: "Strumenti immagine", image_desc: "Ritagliare, ridimensionare, filtri, sfocatura, filigrana, meme e altro", image_count: "10 strumenti", dev_title: "Strumenti sviluppatore", dev_desc: "JSON, hash, Base64, markdown, diff e altro", dev_count: "8 strumenti", explore: "Esplora →" },
      formats: { title: "200+ conversioni di formato", label: "Convertitore" },
      privacy: { point2: "Tutti i 36 strumenti funzionano interamente nel tuo browser — zero caricamenti sul server" },
      faq: { q3: "Cosa può fare LocalConvert?", a3: "Convertire oltre 200 formati di file (immagini, audio, video, documenti), 18 strumenti PDF (unire, dividere, comprimere, filigrana, firmare, modificare e altro), 10 strumenti immagine (ritagliare, ridimensionare, filtri, sfocatura, filigrana) e 8 strumenti sviluppatore (JSON, hash, Base64, diff, markdown)." }
    },
    image_tools: { categories: { edit: "Modifica", create: "Crea" }, tools: { filters_name: "Filtri immagine", filters_desc: "Regola luminosità, contrasto, saturazione, seppia e tonalità", video_to_gif_name: "Video in GIF", video_to_gif_desc: "Converti un video in una GIF animata" } },
    dev_tools: { title: "Strumenti sviluppatore", subtitle: "Formatta, codifica e genera hash — tutto nel tuo browser. Nulla lascia il tuo dispositivo.", badge: "100% locale — nessun caricamento, nessun server", categories: { format: "Formattare e trasformare", analyze: "Analizzare" }, tools: { json_name: "Formattatore JSON", json_desc: "Formattare, minimizzare e validare JSON", hash_name: "Generatore di hash", hash_desc: "SHA-256, SHA-1, SHA-512", base64_name: "Codifica/Decodifica Base64", base64_desc: "Codificare o decodificare Base64", markdown_name: "Anteprima Markdown", markdown_desc: "Markdown in HTML dal vivo", diff_name: "Confronto testi", diff_desc: "Confrontare due testi e mostrare le differenze", word_count_name: "Contaparole", word_count_desc: "Parole, caratteri, tempo di lettura", url_encode_name: "Codifica/Decodifica URL", url_encode_desc: "Codificare o decodificare URL", css_minify_name: "Minimizza CSS", css_minify_desc: "Minimizzare il codice CSS" } },
    tools_common: { back_dev: "← Strumenti sviluppatore" }
  },

  ja: {
    upload: { title: "ファイルとコードのためのプライベートツールキット。", subtitle: "PDF、画像、開発者ワークフローのための36のツール — すべてブラウザで動作。アップロード不要、アカウント不要、永久無料。" },
    landing: {
      pills: { tools_count: "36以上のツール", works_offline: "オフライン対応" },
      toolkit: { label: "あなたのワークショップ", title: "すべてのツールがブラウザで動作", pdf_title: "PDFツール", pdf_desc: "結合、分割、圧縮、透かし、署名、編集、他12種", pdf_count: "18ツール", image_title: "画像ツール", image_desc: "切り抜き、リサイズ、フィルター、ぼかし、透かし、ミームなど", image_count: "10ツール", dev_title: "開発者ツール", dev_desc: "JSON、ハッシュ、Base64、マークダウン、差分など", dev_count: "8ツール", explore: "探索 →" },
      formats: { title: "200以上のフォーマット変換", label: "コンバーター" },
      privacy: { point2: "36のツールすべてがブラウザ内で完結 — サーバーへのアップロードゼロ" },
      faq: { q3: "LocalConvertで何ができますか？", a3: "200以上のファイル形式の変換（画像、音声、動画、文書）、18のPDFツール（結合、分割、圧縮、透かし、署名、編集など）、10の画像ツール（切り抜き、リサイズ、フィルター、ぼかし、透かし）、8の開発者ツール（JSON、ハッシュ、Base64、差分、マークダウン）。" }
    },
    image_tools: { categories: { edit: "編集", create: "作成" }, tools: { filters_name: "画像フィルター", filters_desc: "明るさ、コントラスト、彩度、セピア、色相を調整", video_to_gif_name: "動画からGIF", video_to_gif_desc: "動画をアニメーションGIFに変換" } },
    dev_tools: { title: "開発者ツール", subtitle: "フォーマット、エンコード、ハッシュ — すべてブラウザで。データはデバイスから出ません。", badge: "100%ローカル — アップロードなし、サーバーなし", categories: { format: "フォーマットと変換", analyze: "分析" }, tools: { json_name: "JSONフォーマッター", json_desc: "JSONの整形、圧縮、検証", hash_name: "ハッシュジェネレーター", hash_desc: "SHA-256、SHA-1、SHA-512", base64_name: "Base64エンコード/デコード", base64_desc: "Base64のエンコードまたはデコード", markdown_name: "マークダウンプレビュー", markdown_desc: "マークダウンからHTMLをライブ表示", diff_name: "テキスト差分", diff_desc: "2つのテキストを比較して差分を表示", word_count_name: "文字数カウンター", word_count_desc: "単語数、文字数、読了時間", url_encode_name: "URLエンコード/デコード", url_encode_desc: "URLのエンコードまたはデコード", css_minify_name: "CSS圧縮", css_minify_desc: "CSSコードを圧縮" } },
    tools_common: { back_dev: "← 開発者ツール" }
  },

  ko: {
    upload: { title: "파일과 코드를 위한 프라이빗 툴킷.", subtitle: "PDF, 이미지, 개발자 워크플로를 위한 36개 도구 — 모두 브라우저에서 작동. 업로드 없음, 계정 없음, 영원히 무료." },
    landing: {
      pills: { tools_count: "36개 이상 도구", works_offline: "오프라인 지원" },
      toolkit: { label: "당신의 작업실", title: "모든 도구가 브라우저에서 작동합니다", pdf_title: "PDF 도구", pdf_desc: "병합, 분할, 압축, 워터마크, 서명, 편집 외 12개", pdf_count: "18개 도구", image_title: "이미지 도구", image_desc: "자르기, 크기 조정, 필터, 블러, 워터마크, 밈 등", image_count: "10개 도구", dev_title: "개발자 도구", dev_desc: "JSON, 해시, Base64, 마크다운, 비교 등", dev_count: "8개 도구", explore: "탐색 →" },
      formats: { title: "200개 이상 포맷 변환", label: "변환기" },
      privacy: { point2: "36개 도구 모두 브라우저에서 완전히 실행 — 서버 업로드 제로" },
      faq: { q3: "LocalConvert로 무엇을 할 수 있나요?", a3: "200개 이상의 파일 형식 변환(이미지, 오디오, 비디오, 문서), 18개 PDF 도구(병합, 분할, 압축, 워터마크, 서명, 편집 등), 10개 이미지 도구(자르기, 크기 조정, 필터, 블러, 워터마크), 8개 개발자 도구(JSON, 해시, Base64, 비교, 마크다운)." }
    },
    image_tools: { categories: { edit: "편집", create: "만들기" }, tools: { filters_name: "이미지 필터", filters_desc: "밝기, 대비, 채도, 세피아, 색조 조정", video_to_gif_name: "비디오를 GIF로", video_to_gif_desc: "비디오를 애니메이션 GIF로 변환" } },
    dev_tools: { title: "개발자 도구", subtitle: "포맷, 인코딩, 해시 — 모두 브라우저에서. 데이터는 기기 밖으로 나가지 않습니다.", badge: "100% 로컬 — 업로드 없음, 서버 없음", categories: { format: "포맷 및 변환", analyze: "분석" }, tools: { json_name: "JSON 포맷터", json_desc: "JSON 포맷, 압축 및 검증", hash_name: "해시 생성기", hash_desc: "SHA-256, SHA-1, SHA-512", base64_name: "Base64 인코딩/디코딩", base64_desc: "Base64 인코딩 또는 디코딩", markdown_name: "마크다운 미리보기", markdown_desc: "마크다운을 HTML로 실시간 변환", diff_name: "텍스트 비교", diff_desc: "두 텍스트를 비교하여 차이점 표시", word_count_name: "글자 수 카운터", word_count_desc: "단어, 글자, 읽기 시간", url_encode_name: "URL 인코딩/디코딩", url_encode_desc: "URL 인코딩 또는 디코딩", css_minify_name: "CSS 압축", css_minify_desc: "CSS 코드 압축" } },
    tools_common: { back_dev: "← 개발자 도구" }
  },

  "zh-Hans": {
    upload: { title: "文件与代码的私密工具箱。", subtitle: "36款PDF、图片和开发者工具 — 全部在浏览器中运行。无需上传、无需账户、永久免费。" },
    landing: {
      pills: { tools_count: "36+ 工具", works_offline: "离线可用" },
      toolkit: { label: "您的工作坊", title: "每个工具都在浏览器中运行", pdf_title: "PDF 工具", pdf_desc: "合并、拆分、压缩、水印、签名、编辑等12种以上", pdf_count: "18个工具", image_title: "图片工具", image_desc: "裁剪、调整大小、滤镜、模糊、水印、表情包等", image_count: "10个工具", dev_title: "开发者工具", dev_desc: "JSON、哈希、Base64、Markdown、文本对比等", dev_count: "8个工具", explore: "探索 →" },
      formats: { title: "200+ 格式转换", label: "转换器" },
      privacy: { point2: "全部36个工具完全在浏览器中运行 — 零服务器上传" },
      faq: { q3: "LocalConvert 能做什么？", a3: "转换200多种文件格式（图片、音频、视频、文档），18个PDF工具（合并、拆分、压缩、水印、签名、编辑等），10个图片工具（裁剪、调整大小、滤镜、模糊、水印），以及8个开发者工具（JSON、哈希、Base64、对比、Markdown）。" }
    },
    image_tools: { categories: { edit: "编辑", create: "创建" }, tools: { filters_name: "图片滤镜", filters_desc: "调整亮度、对比度、饱和度、棕褐色和色调", video_to_gif_name: "视频转GIF", video_to_gif_desc: "将视频转换为动态GIF" } },
    dev_tools: { title: "开发者工具", subtitle: "格式化、编码和哈希 — 全部在浏览器中。数据不会离开您的设备。", badge: "100% 本地 — 无上传、无服务器", categories: { format: "格式化与转换", analyze: "分析" }, tools: { json_name: "JSON 格式化", json_desc: "格式化、压缩和验证JSON", hash_name: "哈希生成器", hash_desc: "SHA-256、SHA-1、SHA-512", base64_name: "Base64 编码/解码", base64_desc: "编码或解码Base64", markdown_name: "Markdown 预览", markdown_desc: "实时 Markdown 转 HTML", diff_name: "文本对比", diff_desc: "比较两段文本并显示差异", word_count_name: "字数统计", word_count_desc: "字数、字符数、阅读时间", url_encode_name: "URL 编码/解码", url_encode_desc: "编码或解码URL", css_minify_name: "CSS 压缩", css_minify_desc: "压缩CSS代码" } },
    tools_common: { back_dev: "← 开发者工具" }
  },

  "zh-Hant": {
    upload: { title: "檔案與程式碼的私密工具箱。", subtitle: "36款PDF、圖片和開發者工具 — 全部在瀏覽器中執行。無需上傳、無需帳戶、永久免費。" },
    landing: {
      pills: { tools_count: "36+ 工具", works_offline: "離線可用" },
      toolkit: { label: "您的工作坊", title: "每個工具都在瀏覽器中執行", pdf_title: "PDF 工具", pdf_desc: "合併、分割、壓縮、浮水印、簽名、編輯等12種以上", pdf_count: "18個工具", image_title: "圖片工具", image_desc: "裁剪、調整大小、濾鏡、模糊、浮水印、迷因等", image_count: "10個工具", dev_title: "開發者工具", dev_desc: "JSON、雜湊、Base64、Markdown、文字比較等", dev_count: "8個工具", explore: "探索 →" },
      formats: { title: "200+ 格式轉換", label: "轉換器" },
      privacy: { point2: "全部36個工具完全在瀏覽器中執行 — 零伺服器上傳" },
      faq: { q3: "LocalConvert 能做什麼？", a3: "轉換200多種檔案格式（圖片、音訊、影片、文件），18個PDF工具（合併、分割、壓縮、浮水印、簽名、編輯等），10個圖片工具（裁剪、調整大小、濾鏡、模糊、浮水印），以及8個開發者工具（JSON、雜湊、Base64、比較、Markdown）。" }
    },
    image_tools: { categories: { edit: "編輯", create: "建立" }, tools: { filters_name: "圖片濾鏡", filters_desc: "調整亮度、對比度、飽和度、復古和色調", video_to_gif_name: "影片轉GIF", video_to_gif_desc: "將影片轉換為動態GIF" } },
    dev_tools: { title: "開發者工具", subtitle: "格式化、編碼和雜湊 — 全部在瀏覽器中。資料不會離開您的裝置。", badge: "100% 本機 — 無上傳、無伺服器", categories: { format: "格式化與轉換", analyze: "分析" }, tools: { json_name: "JSON 格式化", json_desc: "格式化、壓縮和驗證JSON", hash_name: "雜湊產生器", hash_desc: "SHA-256、SHA-1、SHA-512", base64_name: "Base64 編碼/解碼", base64_desc: "編碼或解碼Base64", markdown_name: "Markdown 預覽", markdown_desc: "即時 Markdown 轉 HTML", diff_name: "文字比較", diff_desc: "比較兩段文字並顯示差異", word_count_name: "字數統計", word_count_desc: "字數、字元數、閱讀時間", url_encode_name: "URL 編碼/解碼", url_encode_desc: "編碼或解碼URL", css_minify_name: "CSS 壓縮", css_minify_desc: "壓縮CSS程式碼" } },
    tools_common: { back_dev: "← 開發者工具" }
  },

  "pt-BR": {
    upload: { title: "Seu kit de ferramentas privado para arquivos e código.", subtitle: "36 ferramentas para PDFs, imagens e fluxos de desenvolvimento — tudo no seu navegador. Sem uploads, sem contas, grátis para sempre." },
    landing: {
      pills: { tools_count: "36+ Ferramentas", works_offline: "Funciona offline" },
      toolkit: { label: "Sua oficina", title: "Cada ferramenta funciona no seu navegador", pdf_title: "Ferramentas PDF", pdf_desc: "Mesclar, dividir, comprimir, marca d'água, assinar, editar e mais 12", pdf_count: "18 ferramentas", image_title: "Ferramentas de imagem", image_desc: "Cortar, redimensionar, filtros, desfocar, marca d'água, meme e mais", image_count: "10 ferramentas", dev_title: "Ferramentas de desenvolvimento", dev_desc: "JSON, hash, Base64, markdown, diff e mais", dev_count: "8 ferramentas", explore: "Explorar →" },
      formats: { title: "200+ conversões de formato", label: "Conversor" },
      privacy: { point2: "Todas as 36 ferramentas funcionam inteiramente no seu navegador — zero uploads para servidor" },
      faq: { q3: "O que o LocalConvert pode fazer?", a3: "Converter mais de 200 formatos de arquivo (imagens, áudio, vídeo, documentos), 18 ferramentas PDF (mesclar, dividir, comprimir, marca d'água, assinar, editar e mais), 10 ferramentas de imagem (cortar, redimensionar, filtros, desfocar, marca d'água) e 8 ferramentas de desenvolvimento (JSON, hash, Base64, diff, markdown)." }
    },
    image_tools: { categories: { edit: "Editar", create: "Criar" }, tools: { filters_name: "Filtros de imagem", filters_desc: "Ajustar brilho, contraste, saturação, sépia e matiz", video_to_gif_name: "Vídeo para GIF", video_to_gif_desc: "Converter um vídeo em GIF animado" } },
    dev_tools: { title: "Ferramentas de desenvolvimento", subtitle: "Formatar, codificar e gerar hash — tudo no seu navegador. Nada sai do seu dispositivo.", badge: "100% local — sem uploads, sem servidor", categories: { format: "Formatar e transformar", analyze: "Analisar" }, tools: { json_name: "Formatador JSON", json_desc: "Formatar, minificar e validar JSON", hash_name: "Gerador de hash", hash_desc: "SHA-256, SHA-1, SHA-512", base64_name: "Codificar/Decodificar Base64", base64_desc: "Codificar ou decodificar Base64", markdown_name: "Pré-visualização Markdown", markdown_desc: "Markdown para HTML ao vivo", diff_name: "Comparação de textos", diff_desc: "Comparar dois textos e mostrar diferenças", word_count_name: "Contador de palavras", word_count_desc: "Palavras, caracteres, tempo de leitura", url_encode_name: "Codificar/Decodificar URL", url_encode_desc: "Codificar ou decodificar URLs", css_minify_name: "Minificar CSS", css_minify_desc: "Minificar código CSS" } },
    tools_common: { back_dev: "← Ferramentas de desenvolvimento" }
  },

  tr: {
    upload: { title: "Dosyalar ve kod için özel araç setiniz.", subtitle: "PDF'ler, görseller ve geliştirici iş akışları için 36 araç — hepsi tarayıcınızda çalışır. Yükleme yok, hesap yok, sonsuza kadar ücretsiz." },
    landing: {
      pills: { tools_count: "36+ Araç", works_offline: "Çevrimdışı çalışır" },
      toolkit: { label: "Atölyeniz", title: "Her araç tarayıcınızda çalışır", pdf_title: "PDF Araçları", pdf_desc: "Birleştir, böl, sıkıştır, filigran, imzala, düzenle ve 12 tane daha", pdf_count: "18 araç", image_title: "Görsel Araçları", image_desc: "Kırp, yeniden boyutlandır, filtreler, bulanıklaştır, filigran, meme ve daha fazlası", image_count: "10 araç", dev_title: "Geliştirici Araçları", dev_desc: "JSON, hash, Base64, markdown, fark ve daha fazlası", dev_count: "8 araç", explore: "Keşfet →" },
      formats: { title: "200+ format dönüşümü", label: "Dönüştürücü" },
      privacy: { point2: "36 aracın tamamı tarayıcınızda çalışır — sıfır sunucu yüklemesi" },
      faq: { q3: "LocalConvert ne yapabilir?", a3: "200'den fazla dosya formatı dönüştürme (görseller, ses, video, belgeler), 18 PDF aracı (birleştirme, bölme, sıkıştırma, filigran, imzalama, düzenleme ve daha fazlası), 10 görsel aracı (kırpma, yeniden boyutlandırma, filtreler, bulanıklaştırma, filigran) ve 8 geliştirici aracı (JSON, hash, Base64, fark, markdown)." }
    },
    image_tools: { categories: { edit: "Düzenle", create: "Oluştur" }, tools: { filters_name: "Görsel Filtreleri", filters_desc: "Parlaklık, kontrast, doygunluk, sepya ve ton ayarlama", video_to_gif_name: "Videodan GIF'e", video_to_gif_desc: "Bir videoyu animasyonlu GIF'e dönüştür" } },
    dev_tools: { title: "Geliştirici Araçları", subtitle: "Biçimlendir, kodla ve hash oluştur — hepsi tarayıcınızda. Hiçbir şey cihazınızdan çıkmaz.", badge: "100% yerel — yükleme yok, sunucu yok", categories: { format: "Biçimlendir ve Dönüştür", analyze: "Analiz Et" }, tools: { json_name: "JSON Biçimlendirici", json_desc: "JSON biçimlendir, küçült ve doğrula", hash_name: "Hash Oluşturucu", hash_desc: "SHA-256, SHA-1, SHA-512", base64_name: "Base64 Kodla/Çöz", base64_desc: "Base64 kodlama veya çözme", markdown_name: "Markdown Önizleme", markdown_desc: "Canlı Markdown'dan HTML'e", diff_name: "Metin Karşılaştırma", diff_desc: "İki metni karşılaştır ve farkları göster", word_count_name: "Kelime Sayacı", word_count_desc: "Kelimeler, karakterler, okuma süresi", url_encode_name: "URL Kodla/Çöz", url_encode_desc: "URL kodlama veya çözme", css_minify_name: "CSS Küçült", css_minify_desc: "CSS kodunu küçült" } },
    tools_common: { back_dev: "← Geliştirici Araçları" }
  },

  ba: {
    upload: { title: "Vaš privatni alat za fajlove i kod.", subtitle: "36 alata za PDF-ove, slike i razvojne tokove — sve radi u vašem pregledniku. Bez otpremanja, bez naloga, zauvijek besplatno." },
    landing: {
      pills: { tools_count: "36+ Alata", works_offline: "Radi offline" },
      toolkit: { label: "Vaša radionica", title: "Svaki alat radi u vašem pregledniku", pdf_title: "PDF Alati", pdf_desc: "Spoji, podijeli, kompresuj, vodeni žig, potpiši, uredi i još 12", pdf_count: "18 alata", image_title: "Alati za slike", image_desc: "Izreži, promijeni veličinu, filteri, zamuti, vodeni žig, mim i više", image_count: "10 alata", dev_title: "Razvojni alati", dev_desc: "JSON, hash, Base64, markdown, diff i više", dev_count: "8 alata", explore: "Istraži →" },
      formats: { title: "200+ konverzija formata", label: "Konverter" },
      privacy: { point2: "Svih 36 alata radi u potpunosti u vašem pregledniku — nula otpremanja na server" },
      faq: { q3: "Šta LocalConvert može?", a3: "Konvertovanje preko 200 formata fajlova (slike, audio, video, dokumenti), 18 PDF alata (spajanje, dijeljenje, kompresija, vodeni žig, potpis, uređivanje i više), 10 alata za slike (izrezivanje, promjena veličine, filteri, zamućivanje, vodeni žig) i 8 razvojnih alata (JSON, hash, Base64, diff, markdown)." }
    },
    image_tools: { categories: { edit: "Uredi", create: "Kreiraj" }, tools: { filters_name: "Filteri za slike", filters_desc: "Podesi svjetlinu, kontrast, zasićenost, sepiju i ton", video_to_gif_name: "Video u GIF", video_to_gif_desc: "Pretvori video u animirani GIF" } },
    dev_tools: { title: "Razvojni alati", subtitle: "Formatiraj, kodiraj i heširaj — sve u pregledniku. Ništa ne napušta vaš uređaj.", badge: "100% lokalno — bez otpremanja, bez servera", categories: { format: "Formatiraj i transformiši", analyze: "Analiziraj" }, tools: { json_name: "JSON Formater", json_desc: "Formatiraj, minimiziraj i validiraj JSON", hash_name: "Hash Generator", hash_desc: "SHA-256, SHA-1, SHA-512", base64_name: "Base64 Kodiraj/Dekodiraj", base64_desc: "Kodiraj ili dekodiraj Base64", markdown_name: "Markdown Pregled", markdown_desc: "Markdown u HTML uživo", diff_name: "Uporedi tekstove", diff_desc: "Uporedi dva teksta i prikaži razlike", word_count_name: "Brojač riječi", word_count_desc: "Riječi, znakovi, vrijeme čitanja", url_encode_name: "URL Kodiraj/Dekodiraj", url_encode_desc: "Kodiraj ili dekodiraj URL-ove", css_minify_name: "Minimiziraj CSS", css_minify_desc: "Minimiziraj CSS kod" } },
    tools_common: { back_dev: "← Razvojni alati" }
  },

  hr: {
    upload: { title: "Vaš privatni alat za datoteke i kod.", subtitle: "36 alata za PDF-ove, slike i razvojne tokove — sve radi u vašem pregledniku. Bez učitavanja, bez računa, zauvijek besplatno." },
    landing: {
      pills: { tools_count: "36+ Alata", works_offline: "Radi offline" },
      toolkit: { label: "Vaša radionica", title: "Svaki alat radi u vašem pregledniku", pdf_title: "PDF Alati", pdf_desc: "Spoji, podijeli, komprimiraj, vodeni žig, potpiši, uredi i još 12", pdf_count: "18 alata", image_title: "Alati za slike", image_desc: "Izreži, promijeni veličinu, filtri, zamuti, vodeni žig, meme i više", image_count: "10 alata", dev_title: "Razvojni alati", dev_desc: "JSON, hash, Base64, markdown, usporedba i više", dev_count: "8 alata", explore: "Istraži →" },
      formats: { title: "200+ konverzija formata", label: "Pretvarač" },
      privacy: { point2: "Svih 36 alata radi u potpunosti u vašem pregledniku — nula učitavanja na poslužitelj" },
      faq: { q3: "Što LocalConvert može?", a3: "Pretvorba preko 200 formata datoteka (slike, zvuk, video, dokumenti), 18 PDF alata (spajanje, dijeljenje, komprimiranje, vodeni žig, potpis, uređivanje i više), 10 alata za slike (izrezivanje, promjena veličine, filtri, zamućivanje, vodeni žig) i 8 razvojnih alata (JSON, hash, Base64, usporedba, markdown)." }
    },
    image_tools: { categories: { edit: "Uredi", create: "Stvori" }, tools: { filters_name: "Filtri za slike", filters_desc: "Prilagodi svjetlinu, kontrast, zasićenost, sepiju i ton", video_to_gif_name: "Video u GIF", video_to_gif_desc: "Pretvori video u animirani GIF" } },
    dev_tools: { title: "Razvojni alati", subtitle: "Formatiraj, kodiraj i heširaj — sve u pregledniku. Ništa ne napušta vaš uređaj.", badge: "100% lokalno — bez učitavanja, bez poslužitelja", categories: { format: "Formatiraj i transformiraj", analyze: "Analiziraj" }, tools: { json_name: "JSON Formater", json_desc: "Formatiraj, minimiziraj i validiraj JSON", hash_name: "Hash Generator", hash_desc: "SHA-256, SHA-1, SHA-512", base64_name: "Base64 Kodiraj/Dekodiraj", base64_desc: "Kodiraj ili dekodiraj Base64", markdown_name: "Markdown Pregled", markdown_desc: "Markdown u HTML uživo", diff_name: "Usporedba tekstova", diff_desc: "Usporedi dva teksta i prikaži razlike", word_count_name: "Brojač riječi", word_count_desc: "Riječi, znakovi, vrijeme čitanja", url_encode_name: "URL Kodiraj/Dekodiraj", url_encode_desc: "Kodiraj ili dekodiraj URL-ove", css_minify_name: "Minimiziraj CSS", css_minify_desc: "Minimiziraj CSS kod" } },
    tools_common: { back_dev: "← Razvojni alati" }
  },

  el: {
    upload: { title: "Η ιδιωτική σας εργαλειοθήκη για αρχεία και κώδικα.", subtitle: "36 εργαλεία για PDF, εικόνες και ροές εργασίας προγραμματιστών — όλα τρέχουν στον περιηγητή σας. Χωρίς μεταφορτώσεις, χωρίς λογαριασμούς, δωρεάν για πάντα." },
    landing: {
      pills: { tools_count: "36+ Εργαλεία", works_offline: "Λειτουργεί εκτός σύνδεσης" },
      toolkit: { label: "Το εργαστήριό σας", title: "Κάθε εργαλείο τρέχει στον περιηγητή σας", pdf_title: "Εργαλεία PDF", pdf_desc: "Συγχώνευση, διαχωρισμός, συμπίεση, υδατογράφημα, υπογραφή, επεξεργασία και 12 ακόμα", pdf_count: "18 εργαλεία", image_title: "Εργαλεία εικόνας", image_desc: "Περικοπή, αλλαγή μεγέθους, φίλτρα, θόλωμα, υδατογράφημα, meme και άλλα", image_count: "10 εργαλεία", dev_title: "Εργαλεία προγραμματιστή", dev_desc: "JSON, hash, Base64, markdown, σύγκριση και άλλα", dev_count: "8 εργαλεία", explore: "Εξερεύνηση →" },
      formats: { title: "200+ μετατροπές μορφής", label: "Μετατροπέας" },
      privacy: { point2: "Και τα 36 εργαλεία τρέχουν εξ ολοκλήρου στον περιηγητή σας — μηδέν μεταφορτώσεις σε διακομιστή" },
      faq: { q3: "Τι μπορεί να κάνει το LocalConvert;", a3: "Μετατροπή 200+ μορφών αρχείων (εικόνες, ήχος, βίντεο, έγγραφα), 18 εργαλεία PDF (συγχώνευση, διαχωρισμός, συμπίεση, υδατογράφημα, υπογραφή, επεξεργασία και άλλα), 10 εργαλεία εικόνας (περικοπή, αλλαγή μεγέθους, φίλτρα, θόλωμα, υδατογράφημα) και 8 εργαλεία προγραμματιστή (JSON, hash, Base64, σύγκριση, markdown)." }
    },
    image_tools: { categories: { edit: "Επεξεργασία", create: "Δημιουργία" }, tools: { filters_name: "Φίλτρα εικόνας", filters_desc: "Ρύθμιση φωτεινότητας, αντίθεσης, κορεσμού, σέπια και απόχρωσης", video_to_gif_name: "Βίντεο σε GIF", video_to_gif_desc: "Μετατροπή βίντεο σε κινούμενο GIF" } },
    dev_tools: { title: "Εργαλεία προγραμματιστή", subtitle: "Μορφοποίηση, κωδικοποίηση και hash — όλα στον περιηγητή σας. Τίποτα δεν φεύγει από τη συσκευή σας.", badge: "100% τοπικά — χωρίς μεταφορτώσεις, χωρίς διακομιστή", categories: { format: "Μορφοποίηση & Μετασχηματισμός", analyze: "Ανάλυση" }, tools: { json_name: "Μορφοποιητής JSON", json_desc: "Μορφοποίηση, ελαχιστοποίηση και επικύρωση JSON", hash_name: "Γεννήτρια hash", hash_desc: "SHA-256, SHA-1, SHA-512", base64_name: "Κωδικοποίηση/Αποκωδικοποίηση Base64", base64_desc: "Κωδικοποίηση ή αποκωδικοποίηση Base64", markdown_name: "Προεπισκόπηση Markdown", markdown_desc: "Ζωντανό Markdown σε HTML", diff_name: "Σύγκριση κειμένων", diff_desc: "Σύγκριση δύο κειμένων και εμφάνιση διαφορών", word_count_name: "Μετρητής λέξεων", word_count_desc: "Λέξεις, χαρακτήρες, χρόνος ανάγνωσης", url_encode_name: "Κωδικοποίηση/Αποκωδικοποίηση URL", url_encode_desc: "Κωδικοποίηση ή αποκωδικοποίηση URL", css_minify_name: "Ελαχιστοποίηση CSS", css_minify_desc: "Ελαχιστοποίηση κώδικα CSS" } },
    tools_common: { back_dev: "← Εργαλεία προγραμματιστή" }
  },

  id: {
    upload: { title: "Toolkit pribadi Anda untuk file dan kode.", subtitle: "36 alat untuk PDF, gambar, dan alur kerja pengembang — semua berjalan di browser Anda. Tanpa unggahan, tanpa akun, gratis selamanya." },
    landing: {
      pills: { tools_count: "36+ Alat", works_offline: "Berfungsi offline" },
      toolkit: { label: "Bengkel Anda", title: "Setiap alat berjalan di browser Anda", pdf_title: "Alat PDF", pdf_desc: "Gabung, pisah, kompres, tanda air, tanda tangan, edit, dan 12 lainnya", pdf_count: "18 alat", image_title: "Alat Gambar", image_desc: "Potong, ubah ukuran, filter, blur, tanda air, meme, dan lainnya", image_count: "10 alat", dev_title: "Alat Pengembang", dev_desc: "JSON, hash, Base64, markdown, diff, dan lainnya", dev_count: "8 alat", explore: "Jelajahi →" },
      formats: { title: "200+ konversi format", label: "Pengonversi" },
      privacy: { point2: "Semua 36 alat berjalan sepenuhnya di browser Anda — nol unggahan ke server" },
      faq: { q3: "Apa yang bisa dilakukan LocalConvert?", a3: "Mengonversi 200+ format file (gambar, audio, video, dokumen), 18 alat PDF (gabung, pisah, kompres, tanda air, tanda tangan, edit, dan lainnya), 10 alat gambar (potong, ubah ukuran, filter, blur, tanda air), dan 8 alat pengembang (JSON, hash, Base64, diff, markdown)." }
    },
    image_tools: { categories: { edit: "Edit", create: "Buat" }, tools: { filters_name: "Filter Gambar", filters_desc: "Atur kecerahan, kontras, saturasi, sepia, dan warna", video_to_gif_name: "Video ke GIF", video_to_gif_desc: "Konversi video menjadi GIF animasi" } },
    dev_tools: { title: "Alat Pengembang", subtitle: "Format, encode, dan hash — semua di browser Anda. Tidak ada yang keluar dari perangkat Anda.", badge: "100% lokal — tanpa unggahan, tanpa server", categories: { format: "Format & Transformasi", analyze: "Analisis" }, tools: { json_name: "Pemformat JSON", json_desc: "Format, minifikasi, dan validasi JSON", hash_name: "Generator Hash", hash_desc: "SHA-256, SHA-1, SHA-512", base64_name: "Encode/Decode Base64", base64_desc: "Encode atau decode Base64", markdown_name: "Pratinjau Markdown", markdown_desc: "Markdown ke HTML langsung", diff_name: "Perbandingan Teks", diff_desc: "Bandingkan dua teks dan tampilkan perbedaan", word_count_name: "Penghitung Kata", word_count_desc: "Kata, karakter, waktu baca", url_encode_name: "Encode/Decode URL", url_encode_desc: "Encode atau decode URL", css_minify_name: "Minifikasi CSS", css_minify_desc: "Minifikasi kode CSS" } },
    tools_common: { back_dev: "← Alat Pengembang" }
  }
};

// Deep merge helper
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

// Apply translations
for (const [locale, trans] of Object.entries(translations)) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ Skipping ${locale}.json (not found)`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  deepMerge(data, trans);
  fs.writeFileSync(filePath, JSON.stringify(data, null, '\t') + '\n', 'utf8');
  console.log(`✓ Updated ${locale}.json`);
}

console.log('\nDone! Run: npx @inlang/paraglide-js compile');
