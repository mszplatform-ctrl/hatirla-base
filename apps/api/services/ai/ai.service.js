/**
 * AI Service - Business Logic Layer
 * Handles AI suggestion logic and package composition
 */
const aiRepository = require('../../repositories/ai/ai.repository');

class AIService {
  async getSuggestions() {
    return await aiRepository.getAllSuggestions();
  }

  /**
   * Generate mock AI suggestions
   * TODO: Replace with real AI model in future
   */
  async generateSuggestions(context = {}) {
    const mockSuggestions = [
      {
        type: 'hotel',
        payload: { name: 'Hilton Istanbul', price: 120, rating: 4.5 },
        score: 0.95
      },
      {
        type: 'flight',
        payload: { origin: 'IST', destination: 'AMS', price: 250 },
        score: 0.88
      },
      {
        type: 'activity',
        payload: { title: 'Canal Tour', price: 45, duration: '2h' },
        score: 0.82
      }
    ];

    const inserted = await aiRepository.insertSuggestions(mockSuggestions);
    
    return {
      success: true,
      inserted,
      suggestions: mockSuggestions
    };
  }

  /**
   * Compose a travel package from selected items
   * REAL DATABASE - Saves to packages table
   * MSZ Lite Quality - Rich, warm, human-like comments
   * 5 tiers + variations + component-based insights
   */
  async composePackage(selections = [], language = 'tr') {
    if (!Array.isArray(selections) || selections.length === 0) {
      throw new Error('Selections array is required');
    }

    const totalPrice = selections.reduce((sum, item) => {
      const price =
        item.price ??
        item.minPrice ??
        item.payload?.price ??
        item.payload?.minPrice ??
        0;
      return sum + (typeof price === 'number' ? price : 0);
    }, 0);

    // MSZ Lite Analysis - Calculate selection quality score
    const hotels = selections.filter((i) => i.type === "hotel").length;
    const experiences = selections.filter((i) => i.type === "experience").length;
    const count = selections.length;

    // Quality score (MSZ Lite algorithm - UNCHANGED)
    const score =
      0.4 * Math.min(1, hotels / 2) +
      0.4 * Math.min(1, experiences / 3) +
      0.2 * Math.min(1, count / 5);

    // Normalize language (en-US → en)
    const baseLang = language.split('-')[0];

    console.log(
      `🧠 MSZ Analysis → Items: ${count}, Hotels: ${hotels}, Experiences: ${experiences}, Score: ${score.toFixed(2)}, Language: ${baseLang}`
    );

    // 5-TIER SYSTEM + VARIATIONS + COMPONENT-BASED INSIGHTS
    const aiComments = {
      tr: {
        excellent: [ // 0.85+
          `Mükemmel seçim! ${hotels} otel ve ${experiences} deneyimle AI gerçekten güçlü bir plan oluşturabilir.`,
          `Harika denge yakalamışsın. Bu seçimlerle seyahat planın çok tutarlı olacak.`,
          `Oldukça zengin bir paket! AI bu verilerle sana harika bir deneyim çıkarabilir.`
        ],
        veryGood: [ // 0.65-0.85
          `Çok iyi! Seçimler dengeli, AI bunlarla güçlü bir plan yapabilir.`,
          `Güzel seçimler! Birkaç ekleme daha yaparsan mükemmel olur ama şu hali de çok iyi.`,
          `Beğendim! ${count} öğeyle AI sağlam bir paket oluşturur.`
        ],
        good: [ // 0.45-0.65
          `Fena değil! AI bir plan oluşturabilir, birkaç seçim daha eklersen daha da güçlenir.`,
          `İyi başlangıç. Seçimlerin dengesini biraz artırırsan çok daha iyi olur.`,
          `Güzel ama ${hotels === 0 ? 'konaklama eklemen' : experiences === 0 ? 'deneyim eklemen' : 'biraz daha çeşitlendirmen'} işleri güzelleştirir.`
        ],
        fair: [ // 0.25-0.45
          `AI bir plan çıkarabilir ama seçim sayısı az. 2-3 ekleme daha yap, fark eder.`,
          `Başlangıç iyi ama ${hotels === 0 ? 'otel eklemen şart' : experiences <= 1 ? 'deneyim sayısını artırman lazım' : 'biraz daha zenginleştirmen gerek'}.`,
          `Az ama potansiyel var. Birkaç seçim daha eklersen AI çok daha güzel bir paket çıkarır.`
        ],
        minimal: [ // <0.25
          `Çok az seçim var. En az 2-3 öğe daha ekle, AI için bu biraz yetersiz.`,
          `Henüz yeterli değil. ${count === 1 ? 'Tek seçimle paket olmaz,' : 'Birkaç'} seçim daha ekle, AI çalışsın.`,
          `İyi başlangıç ama çok az. Birkaç ekleme yapman sonuçları çok değiştirir.`
        ]
      },
      en: {
        excellent: [
          `Excellent choice! With ${hotels} hotel(s) and ${experiences} experience(s), AI can create a really strong plan.`,
          `Great balance! Your selections will make a very solid travel itinerary.`,
          `Really rich package! AI can craft you an amazing experience with this data.`
        ],
        veryGood: [
          `Very good! Selections are balanced, AI can build a strong plan with these.`,
          `Nice picks! Add a couple more and it'll be perfect, but this is already great.`,
          `I like it! With ${count} items, AI will create a solid package.`
        ],
        good: [
          `Not bad! AI can build a plan, add a few more selections to strengthen it.`,
          `Good start. Balance your choices a bit more and it'll be much better.`,
          `Nice, but ${hotels === 0 ? 'adding accommodation' : experiences === 0 ? 'adding experiences' : 'adding more variety'} would improve things.`
        ],
        fair: [
          `AI can work with this but selection is light. Add 2-3 more, it makes a difference.`,
          `Good beginning but you ${hotels === 0 ? 'must add hotels' : experiences <= 1 ? 'need more experiences' : 'should diversify more'}.`,
          `Limited but has potential. Add a few more and AI will create a much nicer package.`
        ],
        minimal: [
          `Very few selections. Add at least 2-3 more items, this is a bit too light for AI.`,
          `Not enough yet. ${count === 1 ? 'One item won\'t make a package,' : 'A few'} more selections needed for AI to work.`,
          `Good start but too minimal. Adding more will significantly change the results.`
        ]
      },
      ar: {
        excellent: [
          `اختيار ممتاز! مع ${hotels} فندق و ${experiences} تجربة، يمكن للذكاء الاصطناعي إنشاء خطة قوية حقًا.`,
          `توازن رائع! اختياراتك ستصنع برنامج سفر قوي جدًا.`,
          `حزمة غنية حقًا! يمكن للذكاء الاصطناعي أن يصنع لك تجربة مذهلة بهذه البيانات.`
        ],
        veryGood: [
          `جيد جدًا! الاختيارات متوازنة، يمكن للذكاء الاصطناعي بناء خطة قوية.`,
          `اختيارات لطيفة! أضف القليل وستكون مثالية، لكن هذا رائع بالفعل.`,
          `أعجبني! مع ${count} عنصر، سينشئ الذكاء الاصطناعي حزمة قوية.`
        ],
        good: [
          `ليس سيئًا! يمكن للذكاء الاصطناعي بناء خطة، أضف بعض الاختيارات لتقويتها.`,
          `بداية جيدة. وازن اختياراتك أكثر قليلاً وستكون أفضل بكثير.`,
          `جميل، لكن ${hotels === 0 ? 'إضافة الإقامة' : experiences === 0 ? 'إضافة التجارب' : 'إضافة المزيد من التنوع'} سيحسن الأمور.`
        ],
        fair: [
          `يمكن للذكاء الاصطناعي العمل بهذا لكن الاختيار قليل. أضف 2-3 أكثر، يحدث فرقًا.`,
          `بداية جيدة لكن ${hotels === 0 ? 'يجب إضافة فنادق' : experiences <= 1 ? 'تحتاج المزيد من التجارب' : 'يجب التنويع أكثر'}.`,
          `محدود لكن لديه إمكانات. أضف القليل والذكاء الاصطناعي سينشئ حزمة أجمل بكثير.`
        ],
        minimal: [
          `اختيارات قليلة جدًا. أضف 2-3 عناصر على الأقل، هذا قليل جدًا للذكاء الاصطناعي.`,
          `ليس كافيًا بعد. ${count === 1 ? 'عنصر واحد لن يصنع حزمة،' : 'القليل'} من الاختيارات المطلوبة.`,
          `بداية جيدة لكن قليلة جدًا. الإضافة ستغير النتائج بشكل كبير.`
        ]
      },
      es: {
        excellent: [
          `¡Excelente elección! Con ${hotels} hotel(es) y ${experiences} experiencia(s), la IA puede crear un plan realmente fuerte.`,
          `¡Gran equilibrio! Tus selecciones harán un itinerario muy sólido.`,
          `¡Paquete muy rico! La IA puede crearte una experiencia increíble con estos datos.`
        ],
        veryGood: [
          `¡Muy bien! Las selecciones están equilibradas, la IA puede construir un plan fuerte.`,
          `¡Buenas elecciones! Agrega un par más y será perfecto, pero esto ya está genial.`,
          `¡Me gusta! Con ${count} elementos, la IA creará un paquete sólido.`
        ],
        good: [
          `¡No está mal! La IA puede construir un plan, agrega algunas selecciones más para fortalecerlo.`,
          `Buen comienzo. Equilibra tus opciones un poco más y será mucho mejor.`,
          `Bien, pero ${hotels === 0 ? 'agregar alojamiento' : experiences === 0 ? 'agregar experiencias' : 'agregar más variedad'} mejoraría las cosas.`
        ],
        fair: [
          `La IA puede trabajar con esto pero la selección es ligera. Agrega 2-3 más, hace la diferencia.`,
          `Buen comienzo pero ${hotels === 0 ? 'debes agregar hoteles' : experiences <= 1 ? 'necesitas más experiencias' : 'deberías diversificar más'}.`,
          `Limitado pero tiene potencial. Agrega algunos más y la IA creará un paquete mucho mejor.`
        ],
        minimal: [
          `Muy pocas selecciones. Agrega al menos 2-3 elementos más, esto es demasiado ligero para la IA.`,
          `Aún no es suficiente. ${count === 1 ? 'Un elemento no hace un paquete,' : 'Algunas'} selecciones más necesarias.`,
          `Buen comienzo pero demasiado mínimo. Agregar más cambiará significativamente los resultados.`
        ]
      },
      de: {
        excellent: [
          `Ausgezeichnete Wahl! Mit ${hotels} Hotel(s) und ${experiences} Erlebnis(sen) kann die KI einen wirklich starken Plan erstellen.`,
          `Tolle Balance! Ihre Auswahl wird eine sehr solide Reiseroute ergeben.`,
          `Wirklich reichhaltiges Paket! Die KI kann Ihnen mit diesen Daten ein erstaunliches Erlebnis schaffen.`
        ],
        veryGood: [
          `Sehr gut! Die Auswahl ist ausgewogen, die KI kann damit einen starken Plan erstellen.`,
          `Schöne Auswahl! Fügen Sie noch ein paar hinzu und es wird perfekt, aber das ist schon großartig.`,
          `Gefällt mir! Mit ${count} Elementen wird die KI ein solides Paket erstellen.`
        ],
        good: [
          `Nicht schlecht! Die KI kann einen Plan erstellen, fügen Sie ein paar mehr Auswahlen hinzu, um ihn zu stärken.`,
          `Guter Start. Balancieren Sie Ihre Auswahl etwas mehr und es wird viel besser.`,
          `Schön, aber ${hotels === 0 ? 'Unterkunft hinzufügen' : experiences === 0 ? 'Erlebnisse hinzufügen' : 'mehr Vielfalt hinzufügen'} würde die Dinge verbessern.`
        ],
        fair: [
          `Die KI kann damit arbeiten, aber die Auswahl ist gering. Fügen Sie 2-3 mehr hinzu, es macht einen Unterschied.`,
          `Guter Anfang, aber Sie ${hotels === 0 ? 'müssen Hotels hinzufügen' : experiences <= 1 ? 'brauchen mehr Erlebnisse' : 'sollten mehr diversifizieren'}.`,
          `Begrenzt, aber hat Potenzial. Fügen Sie ein paar mehr hinzu und die KI wird ein viel schöneres Paket erstellen.`
        ],
        minimal: [
          `Sehr wenige Auswahlen. Fügen Sie mindestens 2-3 weitere Elemente hinzu, das ist etwas zu wenig für die KI.`,
          `Noch nicht genug. ${count === 1 ? 'Ein Element macht kein Paket,' : 'Ein paar'} mehr Auswahlen benötigt.`,
          `Guter Start, aber zu minimal. Mehr hinzufügen wird die Ergebnisse erheblich ändern.`
        ]
      },
      ru: {
        excellent: [
          `Отличный выбор! С ${hotels} отел(ем/ями) и ${experiences} впечатлени(ем/ями), ИИ может создать действительно сильный план.`,
          `Отличный баланс! Ваш выбор создаст очень надежный маршрут.`,
          `Действительно богатый пакет! ИИ может создать вам потрясающий опыт с этими данными.`
        ],
        veryGood: [
          `Очень хорошо! Выбор сбалансирован, ИИ может построить сильный план.`,
          `Хороший выбор! Добавьте еще пару и будет идеально, но это уже отлично.`,
          `Мне нравится! С ${count} элементами ИИ создаст надежный пакет.`
        ],
        good: [
          `Неплохо! ИИ может построить план, добавьте еще несколько вариантов, чтобы укрепить его.`,
          `Хорошее начало. Сбалансируйте свой выбор немного больше, и будет намного лучше.`,
          `Хорошо, но ${hotels === 0 ? 'добавление жилья' : experiences === 0 ? 'добавление впечатлений' : 'добавление большего разнообразия'} улучшит ситуацию.`
        ],
        fair: [
          `ИИ может работать с этим, но выбор ограничен. Добавьте 2-3 больше, это имеет значение.`,
          `Хорошее начало, но вы ${hotels === 0 ? 'должны добавить отели' : experiences <= 1 ? 'нуждаетесь в большем количестве впечатлений' : 'должны больше диверсифицировать'}.`,
          `Ограничено, но есть потенциал. Добавьте еще несколько, и ИИ создаст гораздо лучший пакет.`
        ],
        minimal: [
          `Очень мало вариантов. Добавьте как минимум 2-3 элемента, это слишком мало для ИИ.`,
          `Еще недостаточно. ${count === 1 ? 'Один элемент не создаст пакет,' : 'Несколько'} больше вариантов необходимо.`,
          `Хорошее начало, но слишком минимально. Добавление большего значительно изменит результаты.`
        ]
      }
    };

    // 5-TIER SELECTION based on quality score
    let commentTier;
    if (score >= 0.85) {
      commentTier = 'excellent';
    } else if (score >= 0.65) {
      commentTier = 'veryGood';
    } else if (score >= 0.45) {
      commentTier = 'good';
    } else if (score >= 0.25) {
      commentTier = 'fair';
    } else {
      commentTier = 'minimal';
    }

    // Get language-specific comments (fallback to Turkish)
    const langComments = aiComments[baseLang] || aiComments.tr;
    const tierComments = langComments[commentTier];

    // Random variation selection
    const randomIndex = Math.floor(Math.random() * tierComments.length);
    const aiComment = tierComments[randomIndex];

    console.log('🌍 FINAL COMMENT (Tier:', commentTier, 'Variation:', randomIndex + 1, '):', aiComment);

    const createdPackage = await aiRepository.createPackage(
      selections,
      totalPrice,
      aiComment
    );

    return {
      package: createdPackage,
      meta: {
        itemsCount: selections.length,
        totalPrice,
        currency: createdPackage.currency,
        qualityScore: Number(score.toFixed(2)),
        tier: commentTier
      }
    };
  }

  /**
   * Get all packages
   */
  async getPackages() {
    return await aiRepository.getPackages();
  }
}

module.exports = new AIService();