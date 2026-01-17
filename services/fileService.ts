
import { askTeacher, searchWeb } from './aiService';

interface SlideData {
  title: string;
  bulletPoints: string[];
  imageSearchQuery?: string;
}

/**
 * Utility to fetch an image as a base64 string for docx.js
 */
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Failed to fetch image for DOCX:", e);
    return null;
  }
}

export async function generatePPT(topic: string, numSlides: number, includeImages: boolean) {
  // Ensure we don't overwhelm the AI by requesting too much in one block if slides > 15
  // For larger slide counts, we request a more concise structure
  const prompt = `Generate a comprehensive professional presentation structure for the topic: "${topic}". 
  Provide exactly ${numSlides} slides. Each slide MUST have a "title" and a list of 3-4 "bulletPoints" (keep points professional and educational).
  ${includeImages ? 'Include a specific "imageSearchQuery" for each slide to find a high-quality relevant illustrative image.' : ''}
  Format strictly as a JSON array: [{"title": "...", "bulletPoints": ["...", "..."] ${includeImages ? ', "imageSearchQuery": "..."' : ''}}, ...]`;
  
  const rawContent = await askTeacher(prompt, "You are a master presentation designer. Respond only with valid JSON.");
  
  try {
    const jsonStr = rawContent.replace(/```json|```/g, '').trim();
    const slidesData: SlideData[] = JSON.parse(jsonStr);
    
    // @ts-ignore
    const pptx = new PptxGenJS();
    const isArabic = /[\u0600-\u06FF]/.test(topic);
    pptx.rtl = isArabic;
    
    // Set presentation properties
    pptx.title = `Teacher AI: ${topic}`;
    pptx.subject = topic;

    for (const data of slidesData) {
      const slide = pptx.addSlide();
      
      // Background Accent (Optional: keep it clean)
      // slide.background = { color: 'F1F5F9' };

      // Title
      slide.addText(data.title, { 
        x: 0.5, y: 0.3, w: '90%', h: 0.8, 
        fontSize: 28, bold: true, color: '1E293B',
        align: isArabic ? pptx.AlignH.right : pptx.AlignH.left,
        fontFace: isArabic ? 'IBM Plex Sans Arabic' : 'Arial'
      });

      // Content Box
      const textWidth = includeImages ? '50%' : '90%';
      slide.addText(data.bulletPoints.join('\n\n'), { 
        x: isArabic && includeImages ? 4.5 : 0.5, 
        y: 1.2, w: textWidth, h: 4.2, 
        fontSize: 16, color: '475569',
        bullet: true,
        align: isArabic ? pptx.AlignH.right : pptx.AlignH.left,
        fontFace: isArabic ? 'IBM Plex Sans Arabic' : 'Arial'
      });

      // Image Handling
      if (includeImages && data.imageSearchQuery) {
        try {
          const searchResults = await searchWeb(data.imageSearchQuery);
          const imageUrl = searchResults[0]?.thumbnail || searchResults[0]?.link;
          if (imageUrl) {
            slide.addImage({ 
              path: imageUrl, 
              x: isArabic ? 0.5 : 5.0, 
              y: 1.2, w: 4.5, h: 3.8,
              sizing: { type: 'contain', w: 4.5, h: 3.8 }
            });
          }
        } catch (imgErr) {
          console.error("Image search failed for slide:", data.title);
        }
      }
    }
    
    pptx.writeFile({ fileName: `TeacherAI_${topic.replace(/\s+/g, '_')}.pptx` });
  } catch (e) {
    console.error("PPT Generation Error:", e);
    throw new Error("Failed to parse presentation structure from AI.");
  }
}

export async function generateDOC(topic: string, wordCount: number, includeImages: boolean) {
  const maxWords = Math.min(wordCount, 4000);
  const prompt = `Write a deep-dive educational research paper about: "${topic}". 
  Target length: approximately ${maxWords} words. 
  Structure it with clear headings, subheadings, and detailed academic paragraphs. 
  ${includeImages ? 'After major section headings, include a line strictly formatted as "IMAGE_QUERY: [query]" to insert a relevant image.' : ''}
  Language must be professional and authoritative. Respond in the user's language.`;
  
  const content = await askTeacher(prompt, "You are a professional academic writer.");
  
  // @ts-ignore
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType } = window.docx;
  const isArabic = /[\u0600-\u06FF]/.test(topic);

  const docChildren: any[] = [
    new Paragraph({
      text: topic,
      heading: HeadingLevel.HEADING_1,
      alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: { after: 400 }
    })
  ];

  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (includeImages && trimmed.startsWith("IMAGE_QUERY:")) {
      const query = trimmed.replace("IMAGE_QUERY:", "").trim();
      try {
        const results = await searchWeb(query);
        const imageUrl = results[0]?.thumbnail || results[0]?.link;
        
        if (imageUrl) {
          const base64 = await fetchImageAsBase64(imageUrl);
          if (base64) {
            docChildren.push(new Paragraph({
              children: [
                new ImageRun({
                  data: base64,
                  transformation: { width: 500, height: 350 }
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 300, after: 300 }
            }));
          }
        }
      } catch (err) {
        console.error("Image fetch failed for DOCX:", query);
      }
      continue;
    }

    // Detect if it's a heading
    const isHeading = trimmed.length < 100 && (trimmed.startsWith('#') || trimmed.toUpperCase() === trimmed);
    
    docChildren.push(new Paragraph({
      children: [new TextRun({
        text: trimmed.replace(/^#+\s*/, ''),
        bold: isHeading,
        size: isHeading ? 32 : 24
      })],
      heading: isHeading ? HeadingLevel.HEADING_2 : undefined,
      alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
      spacing: { after: 200 },
      bidirectional: isArabic
    }));
  }

  const doc = new Document({
    sections: [{
      properties: {
        type: 'nextPage',
      },
      children: docChildren,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `TeacherAI_${topic.replace(/\s+/g, '_')}.docx`;
  link.click();
}
