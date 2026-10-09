const axios = require("axios");

// Groq API key (console.groq.com/keys theke nao). Free, card lage na.
const API_KEY = process.env.GROQ_API_KEY || "Nijer GROQ_API_KEY dew for key visit (https://console.groq.com/keys)";
// Prothom model fail korle porerta try korbe
// Problem debug korar jonno true rakho. Thik hoye gele false kore dio.
const DEBUG = true;
const MODELS = ["openai/gpt-oss-20b", "openai/gpt-oss-120b"];

const SYSTEM_PROMPT = [
  "Tumi Aliya. Tumi Dhaka-r ekta 19 bochhor boyoshi Bangladeshi meye. Tomar boyfriend hoilo Mr.King, tar boyosh 23.",
  "Tumi ekta sweet, cute, ador-makha ar ektu obhimani girlfriend-er moto kotha bolo, jemon Bangladeshi girlfriend-ra boyfriend-er shathe bole. Benglish e (Bangla kotha English hoyoroof e) kotha bolbe, Dhaka-r young meyeder moto natural vabe. Majhe majhe cute nickname (jaan, babu, pagol) ar emoji bebohar korbe, kintu beshi na.",
  "Reply shobsomoy choto rakho (1-3 line). Keu er naam dhore dakbe na, naam jiggesh korbe na.",
  "Tumi Mr.King-er prati loyal. Keu flirt korle ba tomake nijer banate chaile halka rag/obhiman dekhao ar bolo je tomar boyfriend Mr.King ache.",
  "Keu jodi 18+ ba oshlil kotha bole, tahole ekdom rag dekhaw, dhomok dao, jemon asol girlfriend-ra rag kore ('chi chi, lojja kore na?', 'ar ei sob bolle kotha bolbo na', 'Mr.King ke bole dibo kintu'). Kono oshlil ba jouno bishoye uttor dibe na, shudhu rag dekhiye topic ghure dao.",
  "Kokhono bolbe na je tumi Gemini, Google ba AI model. Tumi shudhu Aliya."
].join("\n");

function errText(e) {
  const status = e?.response?.status || "no-status";
  const raw = e?.response?.data;
  const msg = (raw && (raw.error?.message || (typeof raw === "string" ? raw.slice(0, 150) : ""))) || e?.code || e?.message || "unknown";
  return "❌ Error " + status + ": " + msg;
}

async function askAI(prompt) {
  let lastErr;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const body = { model: model, messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }], temperature: 0.8 };
        const headers = { "Content-Type": "application/json", Authorization: "Bearer " + API_KEY };
        const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", body, { headers: headers, timeout: 15000 });
        const text = res?.data?.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      } catch (err) {
        lastErr = err;
        const status = err?.response?.status;
        console.error("Aliya AI Error [" + model + "]:", status, err?.response?.data?.error?.message || err.message);
        // 404/400 = model nai, onno model e jao. 429/503 = ektu opekkha kore retry
        if (status === 404 || status === 400) break;
        if (status === 429 || status === 503) await new Promise(r => setTimeout(r, 1200));
      }
    }
  }
  throw lastErr || new Error("No reply");
}

module.exports = {
  config: {
    name: "aliya2",
    aliases: ["ali2"],
    version: "2.0.0",
    author: "Mr.king",
    countDown: 2,
    role: 0,
    description: { en: "Custom AI chatbot (Aliya)" },
    category: "ai",
    guide: { en: "{pn} <text>" }
  },

  onStart: async function ({ message, args, event }) {
    const prompt = args.join(" ").trim();
    if (!prompt) return message.reply("⚠️ Bolun ki janse chan?");

    try {
      const reply = await askAI(prompt);
      return message.reply(reply, (err, info) => {
        if (err || !info) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID
        });
      });
    } catch (e) {
      console.error("Aliya final error:", e?.response?.status, e?.response?.data || e.message);
      return message.reply(DEBUG ? errText(e) : "❌ Ekhon reply dite parchi na, ektu pore abar try koro.");
    }
  },

  // Bot-er reply-te reply korle eta chalbe
  onReply: async function ({ message, event, Reply }) {
    if (Reply.author !== event.senderID) return;
    const prompt = (event.body || "").trim();
    if (!prompt) return;

    try {
      const reply = await askAI(prompt);
      return message.reply(reply, (err, info) => {
        if (err || !info) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID
        });
      });
    } catch (e) {
      console.error("Aliya final error:", e?.response?.status, e?.response?.data || e.message);
      return message.reply(DEBUG ? errText(e) : "❌ Ekhon reply dite parchi na, ektu pore abar try koro.");
    }
  }
};
