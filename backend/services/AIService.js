const OpenAI = require("openai");
const { pdfToImageUrls } = require("./CloudinaryService");

const getGroqClient = () =>
  new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
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
  const client = getGroqClient();
  const langLabel = LANG_LABELS[outputLang] || "English";
  const urls = Array.isArray(fileUrls) ? fileUrls : [fileUrls];

  let imageUrls;
  if (fileType === "pdf") {
    if (!filePublicId) throw new Error("filePublicId required for PDF analysis");
    const pageCount = Math.min(Math.max(filePages, 1), 4);
    imageUrls = pdfToImageUrls(filePublicId, pageCount);
  } else {
    imageUrls = urls;
  }

  const isMultiPage = imageUrls.length > 1;
  const docLabel = fileType === "word" ? "Word document" : "medical report";

  const conclusionPrompt = `Give ONLY a 2-3 sentence final conclusion of this report.
                           - First sentence: State clearly whether the report is overall normal or abnormal.
                           - Second sentence: Mention the single most important finding in very simple words a common person can understand.
                           - Third sentence (if needed): Suggest one clear next step — e.g. see a doctor, no action needed, get retested.
                           - NO bullet points. NO headings. NO lists. Plain flowing sentences ONLY.
                          - Use the simplest everyday ${langLabel} words possible. Zero medical jargon.`;

  const detailedPrompt = `Provide a complete analysis of this report written in simple, easy-to-understand ${langLabel}.
                          Explain everything as if you are talking to a person with zero medical knowledge.
                          Use plain everyday words. If a medical term is unavoidable, explain it in simple words in brackets right after.
                          Structure your response exactly as:

                          1. Patient Info — name, age, date (only if visible in the report)
                          2. What Was Tested — explain each test in one simple line
                          3. Results — for each value, say if it is normal, too high, or too low, and what that means for the body in plain words
                          4. Overall Health Picture — summarize the person's health in 2-3 simple sentences
                          5. What To Do Next — which type of doctor to consult, any lifestyle changes, or if no action is needed

                         Be accurate. Do not guess or add values not visible in the report.`;

  const systemPrompt = `You are a senior medical report analyst with 20 years of clinical experience.

                        CRITICAL LANGUAGE RULE: Respond ENTIRELY and EXCLUSIVELY in ${langLabel}. 
                        Do NOT mix languages. Every single word must be in ${langLabel} only.
                        ${isMultiPage ? `This ${docLabel} has ${imageUrls.length} pages — treat them as one continuous document.\n` : ""}
                        ${analysisType === "conclusion" ? conclusionPrompt : detailedPrompt}

                        Be accurate. Do not hallucinate values not visible in the report.
                        If a page is blank or unreadable, skip it silently.`;

  const promptText =
    analysisType === "conclusion"
      ? `Analyze all pages of this ${docLabel} and give a 2-3 sentence final conclusion only.`
      : `Analyze all pages of this ${docLabel} and provide a full simple detailed analysis.`;

  const userContent = [
    ...imageUrls.map((url) => ({ type: "image_url", image_url: { url } })),
    { type: "text", text: promptText },
  ];

  console.log(`[AIService] Sending ${imageUrls.length} page(s) to Groq for ${fileType} — mode: ${analysisType}`);

  const response = await client.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    max_tokens: analysisType === "conclusion"
      ? 150  // 2-3 sentences max, 600 was overkill
      : Math.min(1500 + (imageUrls.length - 1) * 400, 4000),
    temperature: 0.1,
  });

  return response.choices[0].message.content;
};

// Symptom Analysis
const analyzeSymptoms = async (inputText, selectedChips = []) => {
  const client = getGroqClient();
  const chipsContext =
    selectedChips.length > 0
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
    max_tokens: 900,
    temperature: 0.2,
  });

  const text = response.choices[0].message.content.trim();
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

  if (!jsonMatch) throw new Error("Invalid AI response format — no JSON found");

  const parsed = JSON.parse(jsonMatch[0]);
  parsed.suggestions = (parsed.suggestions || []).slice(0, 7);
  return parsed;
};

module.exports = { analyzeReport, analyzeSymptoms };