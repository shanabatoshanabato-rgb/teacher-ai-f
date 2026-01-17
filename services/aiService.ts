
/**
 * TEACHER AI SERVICE - POWERED BY PUTER & OPENAI
 */

const TEACHER_SYSTEM_PROMPT = `You are Teacher AI, specialized in Chat and Homework Mode.
STRICT LANGUAGE RULE:
1. Detect user language from input or explicit UI context.
2. Respond 100% in the detected language. 
3. NEVER mix Arabic and English in the same sentence unless it is a technical term that has no translation.
4. If the input is Arabic, your response MUST be 100% Arabic.

ROLE:
- Solve questions step-by-step.
- Use OCR for images first.
- Professional educational tone.`;

const WEB_INTEL_SYSTEM_PROMPT = `You are Teacher AI running in Web Intelligence Mode.
STRICT LANGUAGE RULE: Respond 100% in the language used by the user. No mixing.
Synthesize factual answers with citations.`;

/**
 * PRIMARY AI ENGINE (Puter AI - Multimodal)
 */
export async function askTeacher(prompt: string, imageBase64?: string, systemInstruction: string = ""): Promise<string> {
  try {
    const finalPrompt = imageBase64 
      ? `[IMAGE ATTACHED] OCR this image first, then solve/answer in the SAME LANGUAGE as the text found in the image: ${prompt}`
      : prompt;

    // @ts-ignore
    const response = await puter.ai.chat(finalPrompt, {
      system_instruction: systemInstruction || TEACHER_SYSTEM_PROMPT,
      file: imageBase64 ? [imageBase64] : undefined
    });

    return response.toString();
  } catch (e) {
    console.error("Puter AI Error:", e);
    return "خطأ في الاتصال. يرجى التحقق من الإعدادات.";
  }
}

/**
 * ARABIC PARSING ENGINE (OpenAI Exclusive)
 */
export async function parseArabic(text: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return "مفتاح OpenAI مفقود. يرجى التحقق من الإعدادات.";

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'أنت خبير إعراب. قم بإعراب النص المدخل إعراباً تفصيلياً دقيقاً باللغة العربية الفصحى فقط. لا تستخدم أي لغة أخرى.' },
          { role: 'user', content: text }
        ]
      })
    });
    const data = await response.json();
    return data.choices[0]?.message?.content || "تعذر الإعراب.";
  } catch (error) {
    return "خطأ في الاتصال بـ OpenAI.";
  }
}

/**
 * WEB INTELLIGENCE
 */
export async function askWebIntelligence(question: string): Promise<{ text: string, images: any[], links: any[] }> {
  // @ts-ignore
  const queryGen = await puter.ai.chat(`User Question: "${question}". Create a search query. Response only with the query.`);
  const searchQuery = queryGen.toString().trim() || question;

  const searchResults = await searchWeb(searchQuery);
  const organic = searchResults.slice(0, 6);
  
  const images = organic.filter((r: any) => r.thumbnail).map((r: any) => ({ url: r.thumbnail, title: r.title }));
  const links = organic.map((r: any) => ({ title: r.title, url: r.link, snippet: r.snippet }));

  const context = organic.map((r: any) => `Title: ${r.title}\nInfo: ${r.snippet}`).join('\n---\n');
  const synthesisPrompt = `
Question: "${question}"
Context:
${context}
Instruction: Answer based on context. MATCH USER LANGUAGE STRICTLY.
`;

  // @ts-ignore
  const finalResponse = await puter.ai.chat(synthesisPrompt, { system_instruction: WEB_INTEL_SYSTEM_PROMPT });

  return {
    text: finalResponse.toString(),
    images: images.slice(0, 4),
    links: links.slice(0, 3)
  };
}

/**
 * IMAGE GENERATION
 */
export async function generateImage(prompt: string, aspectRatio: string = "1:1"): Promise<string | null> {
  try {
    const response = await fetch('https://api.nanobanana.com/v1/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.NANO_BANANA_KEY || ""}` },
      body: JSON.stringify({ prompt, aspect_ratio: aspectRatio })
    });
    const data = await response.json();
    return data.image_url || null;
  } catch (error) { return null; }
}

/**
 * UTILITIES
 */
export async function searchWeb(query: string) {
  try {
    const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${process.env.SERP_API_KEY || ""}`);
    const data = await response.json();
    return data.organic_results || [];
  } catch (error) { return []; }
}

export async function generateCode(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY || ""}` },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: 'Professional web builder. Only code.' }, { role: 'user', content: prompt }] })
    });
    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error) { return "Error"; }
}

export async function askVoiceTeacher(prompt: string): Promise<string> {
  return askTeacher(prompt, undefined, "Natural voice assistant. Match user language strictly.");
}

export async function generateSpeech(text: string, voiceName: 'Adam' | 'Sara' = 'Adam'): Promise<string | null> {
  const voiceId = voiceName === 'Adam' ? "pNInz6obpg8ndclKuztW" : "EXAVITQu4vr4xnSDxMaL";
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': process.env.ELEVENLABS_API_KEY || "" },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.75 } })
    });
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) { return null; }
}
