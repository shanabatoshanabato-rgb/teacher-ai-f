
import { callPuter, askWebIntelligence } from './aiService';

interface SlideData {
  title: string;
  bulletPoints: string[];
}

/**
 * GENERATE POWERPOINT (PPTX)
 * Flow: 
 * 1. Puter analyzes topic.
 * 2. If includeWebData: Calls SerpAPI for facts & images.
 * 3. Puter structures content into JSON.
 * 4. PptxGenJS builds file with images embedded.
 */
export async function generatePPT(topic: string, numSlides: number, includeWebData: boolean) {
  // 1. RESEARCH PHASE (SERPAPI)
  let webContext = "";
  let relevantImages: string[] = [];

  if (includeWebData) {
    try {
      // Ask for visuals and facts
      const search = await askWebIntelligence(`Visuals and key facts for presentation: ${topic}`);
      webContext = `\n\n[Verified Research Data]:\n${search.text}\n`;
      
      // Collect images if available to enhance slides
      if (search.images && Array.isArray(search.images)) {
        relevantImages = search.images.map(img => img.url).filter(url => url);
      }
    } catch (e) {
      console.warn("PPT Generation: Web research failed, proceeding with internal knowledge.");
    }
  }

  // 2. STRUCTURING PHASE (PUTER)
  const prompt = `
    Role: Professional Presentation Architect.
    Task: Create a structured outline for a PowerPoint presentation.
    Topic: "${topic}"
    Target Slide Count: ${numSlides}
    
    ${webContext}
    
    Instructions:
    - Return a valid JSON array of objects.
    - Schema: [{"title": "Slide Title", "bulletPoints": ["Point 1", "Point 2", "Point 3"]}]
    - Ensure logical flow and educational depth.
    - Do NOT output markdown code blocks. Just raw JSON string.
  `;
  
  const rawContent = await callPuter(prompt, 'doc_generation');
  
  // 3. CONSTRUCTION PHASE
  try {
    const jsonStr = rawContent.replace(/```json|```/g, '').trim();
    let slidesData: SlideData[] = [];
    try {
        slidesData = JSON.parse(jsonStr);
    } catch (parseError) {
        // Fallback: try to find array in text
        const match = jsonStr.match(/\[.*\]/s);
        if (match) slidesData = JSON.parse(match[0]);
        else throw new Error("Invalid JSON structure");
    }
    
    // @ts-ignore
    const pptx = new PptxGenJS();
    const isArabic = /[\u0600-\u06FF]/.test(topic);
    pptx.rtl = isArabic;
    
    slidesData.forEach((data, index) => {
      const slide = pptx.addSlide();
      
      // 1. Title
      slide.addText(data.title, { 
        x: 0.5, y: 0.3, w: '90%', h: 0.8, 
        fontSize: 28, bold: true, color: '1E293B',
        align: isArabic ? pptx.AlignH.right : pptx.AlignH.left,
        fontFace: isArabic ? 'IBM Plex Sans Arabic' : 'Arial'
      });

      // 2. Bullet Points (Layout adapts if image exists)
      const hasImage = relevantImages.length > 0;
      slide.addText(data.bulletPoints.join('\n\n'), { 
        x: 0.5, y: 1.2, 
        w: hasImage ? '55%' : '90%', 
        h: 4.2, 
        fontSize: 16, color: '475569',
        bullet: true,
        align: isArabic ? pptx.AlignH.right : pptx.AlignH.left,
        fontFace: isArabic ? 'IBM Plex Sans Arabic' : 'Arial'
      });

      // 3. Image Integration (Rotates through found images)
      if (hasImage) {
          const imgUrl = relevantImages[index % relevantImages.length];
          // Simple layout: Image on the right
          slide.addImage({ 
              path: imgUrl, 
              x: '62%', y: 1.2, w: '33%', h: 3 
          });
      }
    });

    pptx.writeFile({ fileName: `TeacherAI_${topic.replace(/\s+/g, '_')}.pptx` });
  } catch (e) {
    console.error("PPT Generation Error:", e);
    throw new Error("Teacher AI Brain could not parse presentation structure.");
  }
}

/**
 * GENERATE WORD DOC (DOCX)
 * Flow:
 * 1. Puter analyzes topic.
 * 2. If includeWebData: Calls SerpAPI for in-depth research.
 * 3. Puter writes academic content.
 * 4. Docx Packer builds the file.
 */
export async function generateDOC(topic: string, wordCount: number, includeWebData: boolean) {
  // 1. RESEARCH PHASE (SERPAPI)
  let webContext = "";
  if (includeWebData) {
    try {
        const search = await askWebIntelligence(`In-depth research and citations for: ${topic}`);
        webContext = `\n\n[Research Data (SerpAPI)]:\n${search.text}\n\n[Reference Links]:\n${search.links.map(l => l.url).join(', ')}`;
    } catch (e) {
        console.warn("DOC Generation: Web research failed.");
    }
  }

  // 2. WRITING PHASE (PUTER)
  const prompt = `
    Role: Academic Researcher & Writer.
    Task: Write a comprehensive document.
    Topic: "${topic}"
    Target Length: Approx ${wordCount} words.
    
    ${webContext}
    
    Instructions:
    - Use clear headings (# Heading) and subheadings (## Subheading).
    - Write structured, academic paragraphs.
    - If links are provided in research, cite them at the end.
    - Do not use markdown code blocks for the whole text, just plain text with markdown-style headers.
  `;
  
  const content = await callPuter(prompt, 'doc_generation');
  
  // 3. CONSTRUCTION PHASE
  // @ts-ignore
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = window.docx;
  const isArabic = /[\u0600-\u06FF]/.test(topic);

  const docChildren: any[] = [
    new Paragraph({
      text: topic,
      heading: HeadingLevel.HEADING_1,
      alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: { after: 400 },
      bidirectional: isArabic
    })
  ];

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Detect Headers
    let headingLevel = undefined;
    let text = trimmed;
    
    if (trimmed.startsWith('# ')) {
        headingLevel = HeadingLevel.HEADING_1;
        text = trimmed.replace('# ', '');
    } else if (trimmed.startsWith('## ')) {
        headingLevel = HeadingLevel.HEADING_2;
        text = trimmed.replace('## ', '');
    } else if (trimmed.startsWith('### ')) {
        headingLevel = HeadingLevel.HEADING_3;
        text = trimmed.replace('### ', '');
    }

    docChildren.push(new Paragraph({
      children: [new TextRun({
        text: text,
        bold: !!headingLevel,
        size: headingLevel ? 32 : 24,
        font: isArabic ? 'IBM Plex Sans Arabic' : 'Arial'
      })],
      heading: headingLevel,
      alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: { after: 200 },
      bidirectional: isArabic
    }));
  }

  const doc = new Document({
    sections: [{ properties: { type: 'nextPage' }, children: docChildren }],
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `TeacherAI_${topic.replace(/\s+/g, '_')}.docx`;
  link.click();
}
