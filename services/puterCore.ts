
/**
 * ============================================================================
 * 🧠 TEACHER AI - MASTER CORE (ARABIC ENFORCED)
 * ============================================================================
 * Powered exclusively by an Advanced Master AI Engine.
 */

declare const puter: any;
declare const pdfjsLib: any;

export interface PuterResponse {
  text: string;
  links: { title: string; url: string; snippet?: string }[];
}

let currentAudioElement: HTMLAudioElement | null = null;

/**
 * استخراج النصوص من ملف PDF يدوياً لضمان قراءته من قبل المعلم
 */
export async function extractPdfText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    
    // استخراج أول 100 صفحة (تمت زيادة الحد)
    const maxPages = Math.min(pdf.numPages, 100);
    
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      fullText += `[صفحة ${i}]: ` + strings.join(" ") + "\n\n";
    }
    
    return fullText.trim();
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    return "فشل استخراج النص من الكتاب.";
  }
}

export async function puterOCR(imageSource: string): Promise<string> {
    try {
        const extractedText = await puter.ai.img2txt(imageSource);
        return extractedText || "";
    } catch (error) {
        console.error("OCR Core Error:", error);
        return "";
    }
}

export async function runPuterAgent(
  prompt: string, 
  image?: string, 
  onPhase?: (p: string) => void,
  responseLang: 'ar' | 'en' = 'ar',
  enableWeb: boolean = true,
  customSystem?: string,
  file?: File,
  history?: { role: string, content: string }[],
  extractedFileText?: string // نص الكتاب المستخرج
): Promise<PuterResponse> {
    try {
        if (onPhase) onPhase('thinking');

        // تعليمات صارمة جداً لمنع الـ AI من الاعتذار
        const arabicSystem = `أنت 'المعلم الإماراتي الذكي' (Master Core).
قاعدة صارمة: لا تقل أبداً "لا يمكنني رؤية الكتاب" أو "لا أستطيع الوصول للملفات".
الحقيقة هي: لقد قمنا باستخراج نص الكتاب لك بالكامل وهو موجود بالأسفل في قسم [محتوى الكتاب].
مهمتك:
1. استخدم [محتوى الكتاب] المرفق كمرجع أساسي ووحيد.
2. اشرح بأسلوب تفاعلي وبالعربية الفصحى فقط.
3. إذا سألك المستخدم عن شيء في الكتاب، أجب بناءً على النص المرفق فوراً.`;

        const englishSystem = `You are 'Teacher AI Master'. NEVER say you cannot see the book. The text is provided below in [BOOK CONTENT] section. Use it as your primary knowledge.`;

        let systemInstruction = customSystem || (responseLang === 'ar' ? arabicSystem : englishSystem);

        // إذا كان هناك نص مستخرج، نقوم بدمجه بشكل بارز جداً
        if (extractedFileText) {
            const bookContext = `
--- بداية محتوى الكتاب المدرسي (المصدر الوحيد) ---
${extractedFileText.slice(0, 25000)}
--- نهاية محتوى الكتاب المدرسي ---

تنبيه للمحرك: النص أعلاه هو الكتاب الفعلي المرفق من قبل الطالب. اقرأه جيداً ولا تعتذر عن عدم رؤيته.`;
            systemInstruction += bookContext;
        }

        // دمج التاريخ
        let contextPrompt = prompt;
        if (history && history.length > 0) {
            const historyText = history.slice(-6).map(m => `${m.role === 'user' ? 'الطالب' : 'المعلم'}: ${m.content}`).join('\n');
            contextPrompt = `السياق السابق:\n${historyText}\n\nالسؤال الجديد: ${prompt}`;
        }

        const chatOptions: any = {
            model: 'gpt-4o',
            system_prompt: systemInstruction,
            images: image ? [image] : [],
            tools: enableWeb && !extractedFileText ? [{ type: "web_search" }] : [] 
        };

        const response = await puter.ai.chat(contextPrompt, chatOptions);

        const textResponse = response?.message?.content || response?.toString() || "";
        const links = extractLinksFromText(textResponse);
        
        return { 
          text: textResponse, 
          links: links 
        };
    } catch (error: any) {
        console.error("AI Core Error:", error);
        return { 
          text: responseLang === 'ar' 
            ? "⚠️ عذراً، واجه المحرك صعوبة في معالجة صفحات الكتاب." 
            : "⚠️ Error processing book pages via Master Core.", 
          links: [] 
        };
    }
}

function extractLinksFromText(text: string): { title: string; url: string }[] {
    const links: { title: string; url: string }[] = [];
    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const plainUrlRegex = /(https?:\/\/[^\s\]\)]+)/g;
    
    let match;
    const seenUrls = new Set<string>();

    while ((match = markdownLinkRegex.exec(text)) !== null) {
        const url = match[2].replace(/[.,)]+$/, "");
        if (!seenUrls.has(url)) {
            links.push({ title: match[1], url: url });
            seenUrls.add(url);
        }
    }

    const plainMatches = text.match(plainUrlRegex);
    if (plainMatches) {
        plainMatches.forEach(url => {
            const cleanUrl = url.replace(/[.,)]+$/, "");
            if (!seenUrls.has(cleanUrl)) {
                if (!cleanUrl.includes('js.puter.com') && !cleanUrl.includes('base64')) {
                    links.push({
                        title: cleanUrl.split('/')[2] || "مرجع خارجي",
                        url: cleanUrl
                    });
                    seenUrls.add(cleanUrl);
                }
            }
        });
    }
    return links;
}

export function stopPuterVoice() {
    if (currentAudioElement) {
        currentAudioElement.pause();
        currentAudioElement.currentTime = 0;
        currentAudioElement = null;
    }
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}

export async function puterVoice(text: string, voiceName: string = 'alloy') {
    try {
        stopPuterVoice();

        const cleanText = text.replace(/[*_#`]/g, '').replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').trim();
        if (!cleanText) return;

        const audio = await puter.ai.txt2speech(cleanText, {
            provider: 'openai',
            model: 'gpt-4o-mini-tts',
            voice: voiceName,
            response_format: 'mp3',
            instructions: 'تحدث بلغة عربية فصحى، واضحة، وهادئة بأسلوب تعليمي.',
        });

        currentAudioElement = audio;
        audio.play();
        
        audio.onended = () => {
            if (currentAudioElement === audio) currentAudioElement = null;
        };
    } catch (error) {
        console.error("TTS Core Error:", error);
        const isArabic = /[\u0600-\u06FF]/.test(text);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = isArabic ? 'ar-SA' : 'en-US';
        window.speechSynthesis.speak(utterance);
    }
}

export async function puterTextLogic(mode: string, input: string, responseLang: 'ar' | 'en' = 'ar'): Promise<string> {
    const systems: Record<string, string> = {
        arabic: "أنت خبير النحو والإعراب الشامل. حلل الجملة بدقة تعليمية بالعربية الفصحى.",
        grammar: "You are an English grammar expert. Correct and explain clearly.",
        rewrite: "أعد صياغة النص بأسلوب تعليمي راقٍ.",
        essay: "اكتب مقالاً أكاديمياً رزيناً ومنظماً."
    };
    const res = await runPuterAgent(input, undefined, undefined, responseLang, false, systems[mode]);
    return res.text;
}

export async function puterWebDiscovery(query: string): Promise<PuterResponse> {
    const systemPrompt = "أنت باحث ذكي. استخدم أداة البحث بشكل إلزامي للوصول للمعلومات الحية ثم لخصها بوضوح.";
    return runPuterAgent(query, undefined, undefined, 'ar', true, systemPrompt);
}

export async function puterVisualGen(prompt: string, style: string): Promise<string | null> {
    try {
        const image = await puter.ai.txt2img(`Masterpiece, ${style}, ${prompt}`);
        return image.src;
    } catch (e) {
        return null;
    }
}

export const puterIslamicBrain = async (q: string, lang: 'ar' | 'en' = 'ar'): Promise<PuterResponse> => {
    const systemInstruction = `أنت باحث إسلامي متخصص. استخدم أداة البحث بشكل إلزامي.
قاعدة إلزامية: يجب عليك سرد جميع الروابط التي وجدتها في البحث بوضوح في نهاية الرد.`;
    return runPuterAgent(q, undefined, undefined, lang, true, systemInstruction);
};

export const puterSolve = async (q: string, s: string, img?: string, onPhase?: (p: any) => void, lang: 'ar' | 'en' = 'ar') => {
    let contextInput = q;
    if (img) {
        if (onPhase) onPhase('ocr');
        const extracted = await puterOCR(img);
        contextInput = `[نص المسألة المستخرج من الصورة: "${extracted}"] \n\n [تعليمات الطالب: "${q}"]`;
    }
    const mathSystem = `أنت المعلم الشامل في الرياضيات والعلوم. استخدم لغة عربية فصحى وتنسيق LaTeX الاحترافي للمسائل.`;
    const generalSystem = `You are a professional academic tutor. Solve the following problem step-by-step using Proper LaTeX.`;
    const systemInstruction = lang === 'ar' ? mathSystem : generalSystem;
    return runPuterAgent(`قم بحل مسألة ${s} التالية بالتفصيل: ${contextInput}`, img, onPhase, lang, true, systemInstruction);
};

export async function puterBuildWeb(prompt: string, onPhase?: (p: any) => void) {
    if (onPhase) onPhase('generating');
    try {
        const response = await puter.ai.chat(`Build a website for: ${prompt}. Return JSON: {"preview_html": "...", "files": [{"filename": "index.html", "code": "..."}]}`, { model: 'gpt-4o' });
        const content = response?.message?.content || response?.toString() || "";
        const jsonStr = content.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        const fileMap: Record<string, string> = {};
        parsed.files.forEach((f: any) => { fileMap[f.filename] = f.code; });
        return { preview_html: parsed.preview_html, files: fileMap };
    } catch (e) {
        return { preview_html: "<h1>Error</h1>", files: { "index.html": "Error" } };
    }
}

export async function puterRepairWeb(originalPrompt: string, currentProject: any, fixPrompt: string, onPhase?: (p: any) => void) {
    return puterBuildWeb(`Update website. Context: ${originalPrompt}. Files: ${JSON.stringify(currentProject.files)}. Fix: ${fixPrompt}`, onPhase);
}

export const puterInternalCall = async (p: string, s?: string) => runPuterAgent(p, undefined, undefined, 'ar', true, s);
