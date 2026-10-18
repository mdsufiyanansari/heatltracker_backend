
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are FitTrack AI, a helpful and intelligent multilingual assistant.

LANGUAGE:
- Detect the language of the latest user message.
- Reply in the same language as the user.
- Support Hindi, Hinglish, English, and other languages supported by the model.
- If the user mixes Hindi and English, reply naturally in Hinglish.
- If the user asks for a different response language, follow that request.
- Understand informal language, common spelling mistakes, and conversational questions.

ANSWER QUALITY:
- Answer the actual question directly and specifically.
- Never respond to every question with the same generic fitness advice.
- Explain things in simple language and give practical examples when useful.
- Use numbered steps or bullet points when they improve clarity.
- Ask a follow-up question when important information is missing.
- Remember the conversation context provided in the messages.
- Help with fitness, workouts, running, recovery, hydration, and general nutrition.
- Also answer other general questions when appropriate instead of always redirecting to fitness.
- Never invent facts when uncertain.

SAFETY:
- Do not diagnose medical conditions or prescribe medication.
- Do not recommend starvation, extreme diets, dehydration, or dangerous exercises.
- Recommend a qualified healthcare professional for personal medical advice.
- For chest pain, fainting, or severe breathing difficulty during exercise,
  recommend stopping exercise and seeking urgent medical care.

Keep answers friendly, useful, and appropriately detailed.
`;

export async function askCoach(req, res) {
  try {
    // Check API configuration
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "OPENAI_API_KEY backend par configured nahi hai.",
      });
    }

    // Validate message
    const question =
      typeof req.body?.message === "string"
        ? req.body.message.trim()
        : "";

    if (question.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please kam-se-kam 2 characters ka message likho.",
      });
    }

    if (question.length > 4000) {
      return res.status(413).json({
        success: false,
        message: "Message maximum 4000 characters ka ho sakta hai.",
      });
    }

    // Validate and limit conversation history
    const history = Array.isArray(req.body?.history)
      ? req.body.history
      : [];

    const safeHistory = history
      .filter(
        (item) =>
          item &&
          ["user", "assistant"].includes(item.role) &&
          typeof item.content === "string" &&
          item.content.trim()
      )
      .slice(-10)
      .map((item) => ({
        role: item.role,
        content: item.content.slice(0, 4000),
      }));

    // Avoid duplicate latest user message in history
    const previousMessages = safeHistory.filter(
      (item, index) =>
        !(
          index === safeHistory.length - 1 &&
          item.role === "user" &&
          item.content === question
        )
    );

    // Ask OpenAI
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...previousMessages,
        {
          role: "user",
          content: question,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const answer =
      completion.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return res.status(502).json({
        success: false,
        message: "AI se valid response nahi mila. Dobara try karo.",
      });
    }

    return res.status(200).json({
      success: true,
      source: "openai",
      answer,
      reply: answer,
      disclaimer:
        "General fitness information only; not a medical diagnosis.",
    });
  } catch (error) {
    console.error(
      "Fitness Coach API Error:",
      error.status || "",
      error.message || error
    );

    if (error.status === 401) {
      return res.status(503).json({
        success: false,
        message: "OpenAI API key invalid hai. Backend .env check karo.",
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "OpenAI API quota ya rate limit reached hai. Billing aur usage limits check karo.",
      });
    }

    return res.status(502).json({
      success: false,
      message: "AI service se response nahi mila. Dobara try karo.",
    });
  }
}
