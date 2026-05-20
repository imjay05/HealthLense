const OpenAI = require("openai");
const { pdfToImageUrls } = require("./CloudinaryService");

const getGroqClient = () =>
  new OpenAI({
    apiKey:  process.env.GROQ_API_KEY,
    baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
  });

const LANG_LABELS = { en: "English", hi: "Hindi", mr: "Marathi" };
const VISION_MODEL = process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
const TEXT_MODEL = process.env.GROQ_TEXT_MODEL || "llama-3.3-70b-versatile";

// Report Analysis 
const analyzeReport = async (
  fileUrls,
  fileType,
  analysisType,
  outputLang = "en",
  filePublicId = null,
  filePages = 1          
) => {
  const client    = getGroqClient();
  const langLabel = LANG_LABELS[outputLang] || "English";
  const urls      = Array.isArray(fileUrls) ? fileUrls : [fileUrls];

  let imageUrls;
  if (fileType === "pdf") {
    
    if (!filePublicId){
      throw new Error("filePublicId required for PDF analysis");
    }

    const pageCount = Math.min(Math.max(filePages, 1), 4);
    imageUrls = pdfToImageUrls(filePublicId, pageCount);
  } else if (fileType === "word") {
    imageUrls = urls;
  } else {
    imageUrls = urls;
  }

  const isMultiPage = imageUrls.length > 1;
  const docLabel    = fileType === "word" ? "Word document" : "medical report";

  const systemPrompt = `You are a senior medical report analyst with 20 years of clinical experience.
                        CRITICAL LANGUAGE RULE: You MUST respond ENTIRELY and EXCLUSIVELY in ${langLabel}.
                        Do NOT mix languages. Do NOT include text in any language except ${langLabel}.
                        Every single word of your response must be in ${langLabel} only.
                        ${isMultiPage ? `The ${docLabel} spans ${imageUrls.length} pages. Treat them as one continuous document.\n` : ""}${
                        analysisType === "conclusion"
                        ? "Provide a concise conclusion: key findings, abnormal values, and recommended next steps."
                        : `Provide a full structured analysis:
                        1. Patient Info (if visible)
                        2. Test Results with normal ranges
                        3. Abnormal values highlighted
                        4. Clinical interpretation
                        5. Recommended follow-up actions`
                      }
                      Be accurate. Do not hallucinate values not visible in the report.
                      If a page is blank or unreadable, skip it silently.`;


  const promptText = analysisType === "conclusion" ? `Analyze all pages of this ${docLabel} and provide a concise conclusion.`
                                                   : `Analyze all pages of this ${docLabel} and provide a full detailed analysis.`;

  const userContent = [
    ...imageUrls.map((url) => ({ type: "image_url", image_url: { url } })),
    { 
      type: "text", 
      text: promptText 
    },
  ];

  console.log(`[AIService] Sending ${imageUrls.length} page(s) to Groq for ${fileType}`);

  const response = await client.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      { 
        role: "system", 
        content: systemPrompt 
      },
      { 
        role: "user",   
        content: userContent 
      },
    ],
    
    max_tokens:  analysisType === "conclusion"
      ? 600
      : Math.min(1500 + (imageUrls.length - 1) * 400, 4000),
    temperature: 0.1,
  });

  return response.choices[0].message.content;
};


// Symptom Analysis 
const analyzeSymptoms = async (inputText, selectedChips = []) => {
  const client = getGroqClient();
  const chipsContext = selectedChips.length > 0
    ? `Additional selected symptom tags: ${selectedChips.join(", ")}.`
    : "";

  const response = await client.chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      {
        role: "system",
        content: `You are a clinical diagnostician. A patient describes their symptoms in English, Hindi, Marathi, or Hinglish.
        Your task: recommend the most relevant diagnostic tests for the described symptoms.
        STRICT RULES:
        - Return 5 to 7 tests MAXIMUM
        - Only include tests with direct clinical relevance to the stated symptoms
        - Do NOT add speculative or "just in case" tests
        - Auto-detect the language of the input
        Return ONLY raw JSON — no markdown, no code blocks, no extra text:
        {
        "detectedLang": "en|hi|mr|hinglish",
        "summary": "One sentence describing what the patient is experiencing, in the detected language",
        "suggestions": [
        { 
        "testName": "exact standard test name", 
        "reason": "specific reason tied directly to the symptoms" 
        }
        ]
      }`,
      },
      {
        role: "user",
        content: `Symptoms: ${inputText}\n${chipsContext}`,
      },
    ],
    max_tokens:  900,
    temperature: 0.2,
  });

  const text = response.choices[0].message.content.trim();
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

  if (!jsonMatch){
    throw new Error("Invalid AI response format — no JSON found");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  parsed.suggestions = (parsed.suggestions || []).slice(0, 7);
  return parsed;
};


module.exports = { analyzeReport, analyzeSymptoms};