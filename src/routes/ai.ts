import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

// Initialize Gemini API lazily to ensure env vars are loaded
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('FATAL: GEMINI_API_KEY is not set in environment variables.');
      throw new Error('GEMINI_API_KEY is missing');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

// Helper for retrying AI calls
const callWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
  const ai = getAI(); // Ensure initialized
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isUnavailable = error.message?.includes('503') || error.message?.includes('UNAVAILABLE');
      if (isUnavailable && i < retries - 1) {
        console.log(`AI service busy, retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      throw error;
    }
  }
};

// Resume Generation Endpoint
router.post('/generate-resume', async (req, res) => {
  const { name, email, phone, skills, education, experience, projects } = req.body;

  const prompt = `
    Create a professional resume content for the following details:
    Name: ${name}
    Email: ${email}
    Phone: ${phone}
    Skills: ${skills}
    Education: ${education}
    Experience: ${experience}
    Projects: ${projects}

    Format the output as a JSON object with the following structure:
    {
      "summary": "A professional summary...",
      "skills": ["Skill 1", "Skill 2", ...],
      "experience": [
        { "title": "...", "company": "...", "duration": "...", "description": "..." }
      ],
      "education": [
        { "degree": "...", "institution": "...", "year": "..." }
      ],
      "projects": [
        { "title": "...", "description": "..." }
      ]
    }
    Ensure the tone is professional and suitable for an internship or entry-level job application.
  `;

  try {
    const response = await callWithRetry(() => getAI().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    }));

    const generatedContent = response.text;
    res.json(JSON.parse(generatedContent || '{}'));
  } catch (error: any) {
    console.error('Error generating resume:', error);
    res.status(500).json({ message: 'Error generating resume', error: error.message });
  }
});

// Chatbot Endpoint
router.post('/chat', async (req, res) => {
  const { message } = req.body;

  const systemInstruction = `
    You are a helpful assistant for the "Intern Finder" platform.
    Your goal is to help students find internships, give resume tips, and guide them through the website.
    The website has pages: Home, Jobs, AI Resume, Community Chat.
    Be concise, professional, and encouraging.
  `;

  try {
    const response = await callWithRetry(() => getAI().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      }
    }));

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error in chatbot:', error);
    res.status(500).json({ message: 'Error processing chat', error: error.message });
  }
});

export default router;
