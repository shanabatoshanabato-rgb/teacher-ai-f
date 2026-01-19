
import { callNeuralBrain, askWebIntelligence } from './aiService';

interface SlideData {
  title: string;
  bulletPoints: string[];
  imageQuery?: string;
}

/**
 * GENERATE POWERPOINT (PPTX) - DOCUMENT & PPT MODE
 */
export async function generatePPT(topic: string, numSlides: number, includeWebData: boolean) {
  let slideImages: string[] = [];

  // Step 1: Brain (Puter) decides structure
  const structurePrompt = `
    Mode: Presentation Architect.
    Topic: "${topic}"
    Target: ${numSlides} slides.
    Task: Create a logical flow for a presentation.
    Return a JSON array of slide objects: [{"title": "...", "bulletPoints": ["...", "..."], "imageQuery": "short search term for an image for this slide"}]
    Rules: Bullet points should be concise. Max 5 per slide.
  `;

  try {
    const rawStructure = await callNeuralBrain(structurePrompt, 'system_architect');
    const jsonStr = rawStructure.replace(/```json|```/g, '').trim();
    let slidesData: SlideData[] = [];
    
    // Find JSON array in the response
    const match = jsonStr.match(/\[.*\]/s);
    if (match) {
      slidesData = JSON.parse(match[0]);
    } else {
      throw new Error("Structure logic failed to return valid JSON");
    }

    // Step 2: Auxiliary for images and data if requested
    if (includeWebData) {
      for (const slide of slidesData) {
        try {
          const search = await askWebIntelligence(slide.imageQuery || slide.title);
          if (search.images && search.images.length > 0) {
            slideImages.push(search.images[0].url);
          } else {
            slideImages.push(""); // Placeholder if no image found
          }
        } catch (e) {
          slideImages.push("");
        }
      }
    }

    // Step 3: Finalize (PptxGenJS)
    // @ts-ignore
    const pptx = new PptxGenJS();
    const isArabic = /[\u0600-\u06FF]/.test(topic);
    pptx.rtl = isAr();

    function isAr() {
      return document.documentElement.lang === 'ar' || isArabic;
    }

    slidesData.forEach((data, index) => {
      const slide = pptx.addSlide();
      
      // Background / Layout
      slide.background = { fill: 'F8FAFC' };

      // Title
      slide.addText(data.title, { 
        x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: '0F172A',
        align: isAr() ? 'right' : 'left',
        fontFace: isAr() ? 'IBM Plex Sans Arabic' : 'Inter'
      });

      const imageUrl = slideImages[index];
      const hasImage = !!imageUrl;

      // Content
      slide.addText(data.bulletPoints.join('\n\n'), { 
        x: 0.5, y: 1.5, w: hasImage ? '50%' : '90%', fontSize: 18, color: '334155',
        bullet: true, align: isAr() ? 'right' : 'left',
        fontFace: isAr() ? 'IBM Plex Sans Arabic' : 'Inter'
      });

      // Integrated Image
      if (hasImage) {
        slide.addImage({ 
          path: imageUrl, 
          x: '58%', y: 1.5, w: '38%', h: 3.5,
          rounding: true
        });
      }
    });

    pptx.writeFile({ fileName: `TeacherAI_Presentation_${topic.replace(/\s+/g, '_')}.pptx` });
  } catch (e) {
    console.error("PPT Generation Error:", e);
    throw new Error("PowerPoint Neural Generation Failed.");
  }
}

/**
 * GENERATE WORD DOC (DOCX) - DOCUMENT & PPT MODE
 */
export async function generateDOC(topic: string, wordCount: number, includeWebData: boolean) {
  let webData: any = null;
  
  // Step 1: Auxiliary (Search Discovery) if needed
  if (includeWebData) {
    webData = await askWebIntelligence(topic);
  }

  // Step 2: Brain (Puter) Content Generation
  const prompt = `
    Role: Professional Academic Writer.
    Topic: "${topic}"
    Length: Approximately ${wordCount} words.
    Instruction: Write a structured document with clear headings (H1, H2), detailed paragraphs, and lists.
    ${webData ? `Integrated Research Facts: ${webData.text}` : ''}
    Output formatting: Use markdown headers like # and ##.
  `;

  const content = await callNeuralBrain(prompt, 'academic_writer');

  // Step 3: Finalize (Docx)
  // @ts-ignore
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = window.docx;
  const isArabic = /[\u0600-\u06FF]/.test(topic);

  const docChildren: any[] = [];

  // Title
  docChildren.push(new Paragraph({
    text: topic,
    heading: HeadingLevel.HEADING_1,
    alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
    bidirectional: isArabic,
    spacing: { after: 400 }
  }));

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('# ')) {
      docChildren.push(new Paragraph({
        text: trimmed.replace('# ', ''),
        heading: HeadingLevel.HEADING_1,
        alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
        bidirectional: isArabic,
        spacing: { before: 400, after: 200 }
      }));
    } else if (trimmed.startsWith('## ')) {
      docChildren.push(new Paragraph({
        text: trimmed.replace('## ', ''),
        heading: HeadingLevel.HEADING_2,
        alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
        bidirectional: isArabic,
        spacing: { before: 300, after: 150 }
      }));
    } else {
      docChildren.push(new Paragraph({
        children: [new TextRun({ 
          text: trimmed, 
          size: 24,
          font: isArabic ? 'IBM Plex Sans Arabic' : 'Inter'
        })],
        alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
        bidirectional: isArabic,
        spacing: { after: 200 }
      }));
    }
  }

  // Add sources if available
  if (webData && webData.links && webData.links.length > 0) {
    docChildren.push(new Paragraph({
      text: isArabic ? "المصادر والمراجع" : "References & Sources",
      heading: HeadingLevel.HEADING_2,
      alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
      bidirectional: isArabic,
      spacing: { before: 600, after: 200 }
    }));

    webData.links.forEach((link: any) => {
      docChildren.push(new Paragraph({
        children: [
          new TextRun({ text: `${link.title}: `, bold: true, size: 20 }),
          new TextRun({ text: link.url, color: '0000FF', size: 20 })
        ],
        alignment: isArabic ? AlignmentType.RIGHT : AlignmentType.LEFT,
        bidirectional: isArabic
      }));
    });
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: docChildren,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `TeacherAI_Document_${topic.replace(/\s+/g, '_')}.docx`;
  link.click();
}
