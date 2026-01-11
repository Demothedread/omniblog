import { GoogleGenAI } from "@google/genai";
import { AIConfig } from "../types";

export const generatePostTemplate = async (topic: string, author: string, config: AIConfig): Promise<{ title: string; summary: string; content: string }> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const directiveContext = `
    Directives:
    ${config.tone ? `- Tone: ${config.tone}` : ''}
    ${config.style ? `- Style Guide: ${config.style}` : ''}
    ${config.sourceMaterial ? `- Source/Inspiration: ${config.sourceMaterial}` : ''}
  `;

  const prompt = `
    You are a professional blog editor helper adhering to specific architectural and stylistic guidelines.
    ${directiveContext}
    
    Create a blog post template for the topic: "${topic}".
    Author: ${author}.
    
    Return a JSON object with the following structure:
    {
      "title": "A Catchy Title",
      "summary": "• Bullet point 1\\n• Bullet point 2\\n• Bullet point 3",
      "content": "<p>An introductory paragraph about ${topic}...</p><h2>Key Concepts</h2><p>Details...</p><h2>Conclusion</h2><p>Wrap up...</p>"
    }
    
    Ensure the content is HTML formatted suitable for a rich text editor.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      title: `${topic} (Draft)`,
      summary: "• Key point 1\n• Key point 2",
      content: `<p>Start writing about <strong>${topic}</strong> here...</p>`
    };
  }
};