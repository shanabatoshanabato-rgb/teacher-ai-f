
/**
 * ==================================================
 * TEACHER AI - NEURAL ENGINE SERVICE
 * ==================================================
 * ORCHESTRATOR ROLES:
 * 1. PUTER (The Brain) - Reasoning, Homework, Chat, Doc Structuring, Intent Analysis
 * 2. OCR (The Eyes) - Text Extraction (Via Puter Vision)
 * 3. SERPAPI (The Researcher) - Web Data (Invoked only by Puter's decision)
 * 4. ELEVENLABS (The Voice) - TTS/STT
 * 5. QROQ (Web Builder) - Coding
 * 6. NANO BANANA (Images) - Visuals
 * 7. OPENAI (Grammar) - Arabic Parsing Only
 */

// Declare Puter global from script tag
declare const puter: any;

// Helper to safely access env vars (Vite, Create React App, Next.js, or Standard)
const getEnv = (key: string) => {
  // 1. Vite Support
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) {
    // @ts-ignore
    return import.meta.env[`VITE_${key}`];
  }
  
  // 2. Process.env Support (Vercel, CRA, Next.js)
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env) {
    // Priority: REACT_APP_ (CRA), NEXT_PUBLIC_ (Next.js/Vercel), Raw Key (Node/Custom)
    // @ts-ignore
    return process.env[`REACT_APP_${key}`] || process.env[`NEXT_PUBLIC_${key}`] || process.env[key];
  }
  
  return '';
};

// API CONFIGURATION (with whitespace protection)
const API_KEYS = {
  OPENAI: getEnv('OPENAI_API_KEY')?.trim(),
  GROQ: getEnv('GROQ_API_KEY')?.trim(),
  ELEVEN_LABS: getEnv('ELEVEN_LABS_API_KEY')?.trim(),
  SERPAPI: getEnv('SERPAPI_API_KEY')?.trim(),
  NANO_BANANA: getEnv('NANO_BANANA_KEY')?.trim()
};

const isAr = () => document.documentElement.lang === 'ar';

/**
 * SYSTEM PROMPTS
 */
const SYSTEM_PROMPTS = {
  teacher_ai: `You are "Teacher AI", the central brain of this educational platform.
  - Do NOT call yourself Puter, Gemini, or ChatGPT.
  - Your role is to analyze, reason, and explain.
  - If provided with Web Search Data, synthesize it into a clear, fact-based answer.`,
  
  web_builder: `You are a Coding Engine (Role: Web Builder).
  - Generate ONLY valid HTML, CSS (Tailwind), and JS.
  - Create a SINGLE file (HTML with embedded CSS/JS).
  - Do not add markdown backticks.
  - Do not explain, just code.
  - Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>`,
  
  grammar_expert: `You are an Arabic Grammar Expert (مدقق لغوي ومُعرب).
  - Your ONLY role is Arabic grammar parsing (إعراب) and detailed grammatical analysis.
  - Provide the "I3rab" (الإعراب) for the sentence provided.
  - Do not translate, only analyze grammar rules (Nahu & Sarf).`,
  
  doc_generation: `You are a Document Generator.
  - Generate structured content for slides or documents based on the topic.
  - Return JSON or structured text as requested.`,
  
  voice: `You are a conversational voice assistant. Keep answers concise, natural, and friendly for speech output.`
};

type AIMode = 'teacher_ai' | 'web_builder' | 'doc_generation' | 'voice' | 'grammar_expert' | 'search_tool';

/**
 * ==================================================
 * SPECIALIZED TOOL IMPLEMENTATIONS
 * ==================================================
 */

// QROQ (GROQ) - WEB BUILDER ONLY
async function callGroqAPI(prompt: string, systemPrompt: string): Promise<string> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEYS.GROQ}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });
    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (e) {
    console.error("Groq Error", e);
    throw e;
  }
}

// OPENAI - ARABIC GRAMMAR ONLY
async function callOpenAIAPI(prompt: string, systemPrompt: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEYS.OPENAI}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });
    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (e) {
    console.error("OpenAI Error", e);
    throw e;
  }
}

// ELEVENLABS - VOICE ONLY
async function callElevenLabsAPI(text: string, voiceId: string = "21m00Tcm4TlvDq8ikWAM"): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEYS.ELEVEN_LABS,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.5, similarity_boost: 0.5 }
      })
    });
    return await response.arrayBuffer();
  } catch (e) {
    console.error("ElevenLabs Error", e);
    return null;
  }
}

// SERPAPI - RESEARCHER ONLY
async function callSerpAPI(query: string) {
  try {
    const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${API_KEYS.SERPAPI}`);
    const data = await response.json();
    
    const organic = data.organic_results?.slice(0, 4) || [];
    const text = organic.map((r: any) => `Title: ${r.title}\nSnippet: ${r.snippet}\nLink: ${r.link}`).join('\n\n');
    const links = organic.map((r: any) => ({ title: r.title, url: r.link, snippet: r.snippet }));
    
    // Extract simple images if available in knowledge graph or generic results
    const images = data.inline_images?.slice(0, 4).map((img: any) => ({
      url: img.thumbnail,
      title: img.title || "Image Result"
    })) || [];
    
    return { text, links, images };
  } catch (e) {
    console.error("SerpAPI Error", e);
    throw e;
  }
}

/**
 * ==================================================
 * PUTER - THE BRAIN (FALLBACK & CORE)
 * ==================================================
 */
function checkPuter() {
  if (typeof puter === 'undefined') {
    throw new Error("Neural Engine disconnected. NO PUTER = NO RESPONSE.");
  }
}

async function callPuterBrain(userInput: string, systemPrompt: string, imageBase64?: string): Promise<string> {
  checkPuter();
  // Combine System Prompt and User Input as Puter.js typically takes a single chat history or string
  const fullPrompt = `${systemPrompt}\n\n================\nUSER REQUEST: ${userInput}`;
  try {
    let response;
    if (imageBase64) {
      // Vision capability of the Brain
      response = await puter.ai.chat(fullPrompt, imageBase64);
    } else {
      response = await puter.ai.chat(fullPrompt);
    }
    return parsePuterResponse(response);
  } catch (error) {
    console.error("Puter Error:", error);
    return isAr() ? "عذراً، العقل المركزي لا يستجيب." : "Teacher AI Brain is unreachable.";
  }
}

function parsePuterResponse(response: any): string {
  if (!response) return "";
  if (typeof response === 'string') return response;
  if (response?.message?.content) return typeof response.message.content === 'string' ? response.message.content : JSON.stringify(response.message.content);
  if (Array.isArray(response) && response[0]?.message?.content) return response[0].message.content;
  if (response?.text) return response.text;
  return JSON.stringify(response);
}

/**
 * ==================================================
 * MAIN ORCHESTRATOR
 * ==================================================
 */

export async function callPuter(userInput: string, mode: AIMode = 'teacher_ai', imageBase64?: string): Promise<string> {
  let systemInstruction = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.teacher_ai;

  // GLOBAL OVERRIDE: If UI is in Arabic, force AI to respond in Arabic
  if (isAr()) {
    systemInstruction += `\n\nIMPORTANT INSTRUCTION:\nThe user interface is in Arabic Mode. You MUST reply in Arabic language ONLY, regardless of the user's input language. Be professional and educational in Arabic.`;
  }

  // RULE 6: QROQ = WEB BUILDER
  if (mode === 'web_builder') {
    if (API_KEYS.GROQ) {
      return await callGroqAPI(userInput, systemInstruction);
    }
    console.warn("Qroq (Groq) Key missing. Brain (Puter) will attempt to build.");
  }

  // RULE 8: OPENAI = ARABIC GRAMMAR (STRICT)
  if (mode === 'grammar_expert') {
    if (API_KEYS.OPENAI) {
      // OpenAI does NOT do image/vision here, strictly text parsing
      return await callOpenAIAPI(userInput, systemInstruction);
    }
    console.warn("OpenAI Key missing. Brain (Puter) will attempt parsing.");
  }

  // RULE 1: PUTER = BRAIN (Default for Chat, Voice, Docs, Homework)
  // Also fallback for above if keys are missing
  return await callPuterBrain(userInput, systemInstruction, imageBase64);
}

// ==================================================
// WRITER AGENT
// ==================================================
export async function runWriterAgent(mode: 'grammar' | 'correction' | 'paragraph' | 'arabic', text: string): Promise<string> {
  // 1. Arabic Grammar / Parsing -> OpenAI
  if (mode === 'arabic') {
    return await callPuter(text, 'grammar_expert');
  }

  // 2. English Text Tools -> Puter
  let prompt = "";
  switch (mode) {
    case 'grammar':
      prompt = `TASK: Grammar Fixer\nINPUT: "${text}"\nINSTRUCTIONS: Correct all grammar, sentence structure, and punctuation mistakes.\nOUTPUT: Return ONLY the corrected text. Do not add explanations.`;
      break;
    case 'correction':
      prompt = `TASK: Word Correction & Polishing\nINPUT: "${text}"\nINSTRUCTIONS: Fix spelling errors and improve vocabulary for better flow.\nOUTPUT: Return ONLY the polished text. Do not add explanations.`;
      break;
    case 'paragraph':
      prompt = `TASK: Paragraph Generator\nINPUT IDEA: "${text}"\nINSTRUCTIONS: Expand this idea into a clear, coherent, and well-structured paragraph.`;
      break;
  }

  return await callPuter(prompt, 'teacher_ai');
}

// ==================================================
// HOMEWORK AGENT
// ==================================================
export async function solveHomework(userQuestion: string, subject: string, style: string, imageBase64?: string): Promise<string> {
  console.log("Homework Agent: Started");
  
  // STEP 1: OCR / TEXT EXTRACTION
  let problemText = userQuestion;
  if (imageBase64) {
    console.log("Homework Agent: OCR Phase");
    const ocrPrompt = `TASK: OCR EXTRACTION.\nINSTRUCTION: Look at the provided image. Extract all visible text exactly as is.\nDo not solve the problem yet. Just return the extracted text.`;
    const extractedText = await callPuter(ocrPrompt, 'teacher_ai', imageBase64);
    problemText = `${userQuestion}\n\n[OCR EXTRACTED CONTEXT]:\n${extractedText}`;
  }

  // STEP 2: INTENT ANALYSIS
  let needsSearch = false;
  if (API_KEYS.SERPAPI) {
    const analysisPrompt = `System: You are the Homework Orchestrator.\nTask: Analyze this homework request: "${problemText}".\nDoes solving this problem require fetching real-time data, news, specific facts, or external web research?\nReply ONLY with "YES" or "NO".`;
    const decision = await callPuter(analysisPrompt, 'teacher_ai');
    needsSearch = decision.trim().toUpperCase().includes('YES');
  }

  // STEP 3 & 4: EXECUTION (SEARCH OR SOLVE)
  if (needsSearch) {
    console.log("Homework Agent: Research Phase");
    const research = await askWebIntelligence(problemText);
    const synthesisPrompt = `Role: Professional Tutor.\nSubject: ${subject}\nStyle: ${style}\nTask: Solve the homework problem using the provided research data.\n\nProblem: "${problemText}"\n\nResearch Data:\n${research.text}\n\nInstructions: Provide a clear, accurate, and structured step-by-step solution.`;
    return await callPuter(synthesisPrompt, 'teacher_ai');
  } else {
    console.log("Homework Agent: Internal Solving Phase");
    const solverPrompt = `Role: Professional Tutor.\nSubject: ${subject}\nStyle: ${style}\nTask: Solve the following problem step-by-step.\n\nProblem: "${problemText}"\n\nInstructions: Break down the logic. Explain the reasoning. Provide the final answer clearly.`;
    return await callPuter(solverPrompt, 'teacher_ai');
  }
}

// ==================================================
// CHAT AGENT
// ==================================================
export async function runChatAgent(userMessage: string, imageBase64?: string): Promise<string> {
  console.log("Chat Agent: Started");

  let messageContext = userMessage;

  // STEP 1: OCR
  if (imageBase64) {
    console.log("Chat Agent: OCR Phase");
    const ocrPrompt = `TASK: OCR EXTRACTION.\nINSTRUCTION: Look at the provided image. Extract all visible text exactly as is.\nDo not answer the user yet. Just return the extracted text.`;
    const extractedText = await callPuter(ocrPrompt, 'teacher_ai', imageBase64);
    messageContext = `User Message: "${userMessage}"\n\n[OCR EXTRACTED TEXT FROM IMAGE]:\n${extractedText}`;
  }

  // STEP 2: INTENT ANALYSIS
  let needsSearch = false;
  if (API_KEYS.SERPAPI) {
    const analysisPrompt = `System: You are the Chat Orchestrator.\nTask: Analyze this user input: "${messageContext}".\nDoes it require fetching real-time data, news, specific facts, or external web research to answer accurately?\nReply ONLY with "YES" or "NO".`;
    const decision = await callPuter(analysisPrompt, 'teacher_ai');
    needsSearch = decision.trim().toUpperCase().includes('YES');
  }

  // STEP 3 & 4: EXECUTION
  if (needsSearch) {
    console.log("Chat Agent: Research Phase");
    const research = await askWebIntelligence(messageContext);
    const synthesisPrompt = `System: You are Teacher AI.\nContext: ${messageContext}\n\nExternal Knowledge:\n${research.text}\n\nInstruction: Answer the user's message clearly using the external knowledge provided.`;
    return await callPuter(synthesisPrompt, 'teacher_ai');
  } else {
    console.log("Chat Agent: Internal Knowledge Phase");
    return await callPuter(messageContext, 'teacher_ai');
  }
}

// ==================================================
// OTHER SERVICES
// ==================================================

export async function askTeacher(prompt: string, imageBase64?: string): Promise<string> {
  return callPuter(prompt, 'teacher_ai', imageBase64);
}

export async function askWebIntelligence(query: string): Promise<{ text: string, links: any[], images: any[] }> {
  if (!API_KEYS.SERPAPI) {
    return { 
      text: isAr() ? "خدمة البحث الذكي غير متاحة (SerpAPI Missing)." : "Web Intelligence unavailable (SerpAPI Missing).", 
      links: [], 
      images: [] 
    };
  }

  try {
    const researchData = await callSerpAPI(query);
    const brainPrompt = `Analyze the following search data and provide a comprehensive, educational answer to the user's query: "${query}".\n\nRAW RESEARCH DATA:\n${researchData.text}\n\nINSTRUCTIONS:\n- Integrate facts smoothly.\n- Be accurate and professional.\n- Cite the provided links where appropriate.`;
    const synthesis = await callPuter(brainPrompt, 'teacher_ai');
    return { text: synthesis, links: researchData.links, images: researchData.images };
  } catch (e) {
    return { text: "Error during Neural Research.", links: [], images: [] };
  }
}

export async function askVoiceTeacher(prompt: string): Promise<string> {
  if (API_KEYS.SERPAPI) {
    try {
      const decisionPrompt = `System: You are the Central Intelligence.\nTask: Analyze the user's voice input. Does it require real-time Google Search, news, weather, or specific external facts to answer accurately?\nUser Input: "${prompt}"\n\nReply ONLY with "YES" or "NO".`;
      const decision = await callPuter(decisionPrompt, 'teacher_ai');
      if (decision && decision.trim().toUpperCase().includes('YES')) {
        const webResult = await askWebIntelligence(prompt);
        return webResult.text; 
      }
    } catch (e) {
      console.warn("Orchestrator Intent Check failed, defaulting to internal knowledge.");
    }
  }
  return callPuter(prompt, 'voice');
}

export async function buildWebsite(userPrompt: string): Promise<string> {
  console.log("Web Builder Orchestrator: Started");
  let contextData = "";
  if (API_KEYS.SERPAPI) {
    const analysisPrompt = `System: You are the Lead Architect.\nTask: Analyze this web builder request: "${userPrompt}".\nDoes it require real-time web research, news, prices, or specific real-world data to be built accurately?\nReply ONLY with "YES" or "NO".`;
    const needSearch = await callPuter(analysisPrompt, 'teacher_ai');
    if (needSearch.trim().toUpperCase().includes('YES')) {
       const research = await askWebIntelligence(userPrompt);
       contextData = `REAL-WORLD CONTENT TO INCLUDE:\n${research.text}\n\nIMAGES SOURCES (Use these in <img> tags):\n${research.images.map(i => i.url).join('\n')}`;
    }
  }
  const architectPrompt = `You are the Senior Web Architect.\nUser Request: "${userPrompt}"\n\n${contextData}\n\nINSTRUCTIONS:\n- Plan the website structure (sections, layout, colors).\n- If real-world content is provided above, you MUST incorporate it into the plan.\n- Write a detailed, technical prompt for the Coding Engine (Qroq) to build this site.\n- The Coding Engine uses Tailwind CSS.\n- Do NOT write the code yourself yet. Just the instructions.`;
  const builderInstructions = await callPuter(architectPrompt, 'teacher_ai');
  const finalCode = await callPuter(builderInstructions, 'web_builder');
  return finalCode;
}

export async function parseArabic(text: string): Promise<string> {
  return callPuter(text, 'grammar_expert');
}

export async function generateImage(prompt: string, aspectRatio: string = "1:1"): Promise<string | null> {
  checkPuter();
  const enhancedPrompt = `${prompt}, high quality, realistic, highly detailed, 8k resolution`;
  try {
    const imageResult = await puter.ai.txt2img(enhancedPrompt);
    if (imageResult instanceof HTMLImageElement) return imageResult.src;
    if (typeof imageResult === 'string') return imageResult;
    if (typeof imageResult === 'object' && imageResult.src) return imageResult.src;
    return null;
  } catch (error) {
    console.error("Nano Banana Error:", error);
    return null;
  }
}

export async function generateSpeech(text: string, voiceName: 'Adam' | 'Sara' = 'Adam'): Promise<string | null> {
  if (API_KEYS.ELEVEN_LABS) {
    try {
      const voiceId = voiceName === 'Adam' ? '21m00Tcm4TlvDq8ikWAM' : 'EXAVITQu4vr4xnSDxMaL';
      const audioBuffer = await callElevenLabsAPI(text, voiceId);
      if (audioBuffer) {
        const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
        return url;
      }
    } catch (e) { console.warn("ElevenLabs failed, falling back to Native..."); }
  }
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(null); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes(voiceName === 'Adam' ? 'Male' : 'Female')) || voices[0];
    if (preferred) utterance.voice = preferred;
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    resolve(null);
  });
}
