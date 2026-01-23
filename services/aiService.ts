
/**
 * 🧠 TEACHER AI - UNIFIED PUTER INTELLIGENCE SERVICE
 * Orchestrates exclusively via Puter Sovereign Core.
 */
import * as Puter from './puterCore';

const ISLAMIC_SYSTEM = "أجب كعالم إسلامي بمراجع دقيقة. استخدم نبرة محترمة.";
const HOMEWORK_SYSTEM = "أنت معلم محترف. حل المسألة واشرح الخطوات بوضوح.";

export const runChatAgent = (prompt: string, image?: string, onPhase?: any) => {
  return Puter.runPuterAgent(prompt, image, onPhase);
};

export const solveHomework = (question: string, subject: string, image?: string, onPhase?: any, lang: 'ar' | 'en' = 'ar') => {
  return Puter.puterSolve(question, subject, image, onPhase, lang);
};

export const runIslamicHub = async (query: string, onPhase?: any, lang: 'ar' | 'en' = 'ar') => {
  const res = await Puter.puterIslamicBrain(query, lang);
  return { ...res, sourceStatus: 'internal' as any, warning: null };
};

export const askWebIntelligence = Puter.puterWebDiscovery;
export const buildWebsite = Puter.puterBuildWeb;
export const generateImage = Puter.puterVisualGen;
export const runWriterAgent = Puter.puterTextLogic;
export const callSmartEngine = (prompt: string, system?: string) => Puter.runPuterAgent(`${system}\n${prompt}`);
export const generateSpeech = Puter.puterVoice;
