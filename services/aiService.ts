
/**
 * ============================================================================
 * TEACHER AI - SMART CORE V16.0
 * ============================================================================
 */

declare const puter: any;

const isAr = () => document.documentElement.lang === 'ar';

export const getActiveKey = (keyId: string): { value: string, source: 'local' | 'global' | 'none' } => {
  const local = localStorage.getItem(`teacher_local_${keyId}`);
  if (local && local.length > 5) return { value: local.trim(), source: 'local' };
  const global = localStorage.getItem(`teacher_global_${keyId}`);
  if (global && global.length > 5) return { value: global.trim(), source: 'global' };
  return { value: "", source: 'none' };
};

export const API_KEYS = {
  get SERPAPI() { return getActiveKey('serpapi'); },
  get DEEPAI() { return getActiveKey('deepai'); },
  get ELEVEN_LABS() { return getActiveKey('eleven'); },
  get OPENAI() { return getActiveKey('openai'); },
  get GROQ() { return getActiveKey('groq'); }
};

/**
 * THE SMART ENGINE (Logic, Analysis, Decision Making)
 */
export async function callNeuralBrain(prompt: string, systemInstruction: string): Promise<string> {
  try {
    const response = await puter.ai.chat(`${systemInstruction}\n\nUser Request: ${prompt}`);
    return response?.toString() || "";
  } catch (e) {
    console.error("Smart Engine Error:", e);
    return isAr() ? "عذراً، المحرك الذكي لا يستجيب." : "Advanced core unreachable.";
  }
}

/**
 * SPEECH SYNTHESIS (ElevenLabs TTS)
 */
export async function generateSpeech(text: string, voice: 'Adam' | 'Sara' = 'Adam') {
  const elevenKey = API_KEYS.ELEVEN_LABS.value;
  if (!elevenKey) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = isAr() ? 'ar-SA' : 'en-US';
    window.speechSynthesis.speak(msg);
    return "playing_browser";
  }

  try {
    const voiceId = voice === 'Adam' ? 'pNInz6obpg8n9YZpYMOG' : 'EXAVITQu4vr4xnSDxMaL';
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": elevenKey
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
    return "playing_premium";
  } catch (e) {
    console.error("ElevenLabs Error:", e);
    return null;
  }
}

/**
 * VOICE MODE ORCHESTRATOR
 */
export async function runVoiceOrchestrator(userInputText: string, onPhaseChange?: (phase: string) => void): Promise<string> {
  if (onPhaseChange) onPhaseChange('analyzing');
  
  const decisionPrompt = `
    Analyze user request: "${userInputText}"
    Decide if search is needed. Answer JSON: {"needsSearch": boolean}
  `;
  const decisionRaw = await callNeuralBrain(decisionPrompt, "Strategic Intelligence Protocol");
  
  let needsSearch = false;
  try {
    const decision = JSON.parse(decisionRaw.replace(/```json|```/g, '').trim());
    needsSearch = decision.needsSearch;
  } catch (e) {
    needsSearch = userInputText.toLowerCase().includes("search") || userInputText.includes("بحث");
  }

  let researchData = "";
  if (needsSearch) {
    if (onPhaseChange) onPhaseChange('researching');
    const research = await askWebIntelligence(userInputText);
    researchData = `\n\n[SEARCH DATA]:\n${research.text}`;
  }

  if (onPhaseChange) onPhaseChange('synthesizing');
  const synthesisPrompt = `
    User Request: "${userInputText}"
    ${researchData ? `Integrated Facts: ${researchData}` : "Knowledge Source: Internal Library."}
    Objective: Concise voice-ready answer.
  `;
  return await callNeuralBrain(synthesisPrompt, "Expert Voice Assistant - Teacher AI Core");
}

/**
 * WEB BUILDER
 */
export async function buildWebsite(prompt: string, onPhaseChange?: (phase: 'relaying' | 'building' | 'reviewing') => void): Promise<string> {
  if (onPhaseChange) onPhaseChange('relaying');
  const architecture = await callNeuralBrain(`Design website structure for: "${prompt}"`, "Senior Design Architect.");

  if (onPhaseChange) onPhaseChange('building');
  const buildKey = API_KEYS.GROQ.value;
  if (!buildKey) return isAr() ? "تنبيه: مفتاح المحرك مفقود." : "Alert: Build Engine Key Missing.";

  const buildResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${buildKey}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Build a single-file production HTML/Tailwind/JS website. ONLY clean code." },
        { role: "user", content: architecture }
      ],
      temperature: 0.1
    })
  });
  const buildData = await buildResponse.json();
  const rawCode = buildData.choices?.[0]?.message?.content || "";

  if (onPhaseChange) onPhaseChange('reviewing');
  return await callNeuralBrain(`Final review and polish this code. Return ONLY HTML.\n\nCODE:\n${rawCode}`, "Lead QA & Creative Director.");
}

/**
 * SHARED UTILITIES
 */
export async function askWebIntelligence(q: string) {
  const k = API_KEYS.SERPAPI.value;
  if (!k) return { text: "", links: [], images: [] };
  const res = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(q)}&api_key=${k}`);
  const data = await res.json();
  return { 
    text: JSON.stringify(data.organic_results?.slice(0, 3)), 
    links: data.organic_results?.slice(0, 3).map((r: any) => ({ title: r.title, url: r.link, snippet: r.snippet })),
    images: [] 
  };
}

export async function solveHomework(q: string, s: string, st: string, img?: string, op?: (p: any) => void) {
  let ctx = q;
  if (img) { if (op) op('ocr'); ctx = await puter.ai.chat([{ role: "user", content: "Perform high-accuracy OCR.", images: [img] }]); }
  if (op) op('thinking'); return callNeuralBrain(ctx, `Subject Specialist in ${s}. Style: ${st}. Answer precisely.`);
}

export async function runChatAgent(prompt: string, image?: string) {
  let ctx = prompt;
  if (image) {
    ctx = await puter.ai.chat([{ role: "user", content: "Extract and analyze all text from image.", images: [image] }]);
  }
  return callNeuralBrain(ctx, "You are Teacher AI, a brilliant and helpful educational assistant.");
}

export async function runWriterAgent(mode: string, text: string) {
  if (mode === 'arabic') {
    const k = API_KEYS.OPENAI.value;
    if (!k) return isAr() ? "مفتاح المعالجة العربي مفقود." : "Arabic Processing Key Missing.";
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${k}` },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{role:"system",content:"خبير لغوي متخصص في الإعراب والنحو العربي."}, {role:"user",content:text}] })
    });
    const d = await r.json(); return d.choices?.[0]?.message?.content || "";
  }
  return callNeuralBrain(text, `Writing Assistant Mode: ${mode}. Provide high-quality structural improvements.`);
}

export async function generateImage(prompt: string, style: string = 'realistic') {
  const k = API_KEYS.DEEPAI.value;
  if (!k) return null;
  const fd = new FormData(); fd.append('text', `${prompt} - style: ${style}`);
  const r = await fetch('https://api.deepai.org/api/text2img', { method: 'POST', headers: { 'api-key': k }, body: fd });
  const d = await r.json(); return d.output_url || null;
}
