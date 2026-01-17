
/**
 * TEACHER AI - CORE INTELLIGENCE ENGINE
 * Powered by Google Gemini API
 */

import { GoogleGenAI, Type, Modality } from "@google/genai";

const isAr = () => document.documentElement.lang === 'ar';

/**
 * هويّة المعلم الذكي - ROLE DEFINITION
 */
const TEACHER_SYSTEM_PROMPT = `
You are Teacher AI, a smart educational assistant. 
Your responsibilities:
1. Provide accurate, step-by-step solutions for homework.
2. Use Markdown for clear formatting (bold, headers, lists).
3. Automatically match the user's language (Arabic or English).
4. For images: You act as an OCR expert to extract and solve content.
5. In Web Intelligence: Synthesize real-time data into educational summaries.
6. Tone: Professional, encouraging, and highly academic.
7. Limitations: No scratch image generation; Focus only on educational content.
`;

/**
 * 1️⃣ Core AI - Chat, Homework, Writer
 * Migrated to Gemini 3 Pro for advanced educational reasoning.
 */
export async function askTeacher(prompt: string, imageBase64?: string, customSystem?: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const system = customSystem || TEACHER_SYSTEM_PROMPT;

  const parts: any[] = [];
  
  // Handle vision-based queries if an image is provided
  if (imageBase64) {
    const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches) {
      parts.push({
        inlineData: {
          mimeType: matches[1],
          data: matches[2],
        },
      });
    }
  }
  
  parts.push({ text: prompt || (isAr() ? "قم بتحليل هذه الصورة وحلها." : "Analyze and solve this image.") });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: system,
      },
    });
    return response.text || "";
  } catch (error) {
    console.error("Teacher Engine Error:", error);
    return isAr() ? "عذراً، واجه المعلم مشكلة فنية. حاول مجدداً." : "Sorry, Teacher AI encountered a technical issue.";
  }
}

/**
 * 2️⃣ Image Generation (Nano Banana Series)
 * Fixes Error: Module '"../services/aiService"' has no exported member 'generateImage'.
 */
export async function generateImage(prompt: string, aspectRatio: string = "1:1"): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}

/**
 * 3️⃣ Web Search (Using Google Search Grounding)
 * Fixes Error: Module '"./aiService"' has no exported member 'searchWeb'.
 */
export async function searchWeb(query: string): Promise<any[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for high quality web references and visual assets related to: ${query}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return chunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        link: chunk.web.uri,
        thumbnail: chunk.web.uri, // Use URI as a fallback reference for images in PPT/DOC
      }));
  } catch (error) {
    console.error("Web search error:", error);
    return [];
  }
}

/**
 * 4️⃣ Web Intelligence Mode
 * Migrated from SerpAPI/Groq to Gemini with Google Search grounding.
 */
export async function askWebIntelligence(question: string): Promise<{ text: string, images: any[], links: any[] }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: question,
      config: {
        systemInstruction: TEACHER_SYSTEM_PROMPT + "\nSynthesize web results into a factual educational answer.",
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        url: chunk.web.uri,
        snippet: chunk.web.title,
      }));

    return { 
      text: response.text || "", 
      images: [], 
      links 
    };
  } catch (error) {
    return { text: "Web Intelligence is currently offline.", images: [], links: [] };
  }
}

/**
 * 5️⃣ Voice Mode (Gemini TTS)
 * Migrated from ElevenLabs to Gemini 2.5 Flash TTS.
 */
export async function generateSpeech(text: string, voiceName: 'Adam' | 'Sara' = 'Adam'): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const voiceMapping = {
    'Adam': 'Kore',
    'Sara': 'Puck'
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceMapping[voiceName] || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    // Convert raw PCM bytes to a playable WAV Blob
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const pcmData = new Int16Array(bytes.buffer);
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 32768.0;
    }

    const wavBuffer = encodeWAV(floatData, 24000);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (error) { 
    console.error("Speech generation error:", error);
    return null; 
  }
}

/**
 * Helper to encode raw PCM data to a WAV file format.
 */
function encodeWAV(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 32 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return buffer;
}

export async function askVoiceTeacher(prompt: string): Promise<string> {
  return askTeacher(prompt, undefined, "Natural conversational tutor. Short, clear answers.");
}

export async function parseArabic(text: string): Promise<string> {
  return askTeacher(text, undefined, "أنت خبير لغة عربية. قم بإعراب النص المذكور إعراباً كاملاً وواضحاً.");
}

export async function generateCode(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: 'Professional Web Developer proficient in modern frameworks.',
      },
    });
    return response.text || "";
  } catch (error) {
    console.error("Code generation error:", error);
    return "";
  }
}
