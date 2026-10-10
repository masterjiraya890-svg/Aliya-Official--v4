// go to https://console.cloudinary.com
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const CLOUD_NAME = "Your_Cloud_name";
const PRESET = "Your_Preset";
const FOLDER = "Your_folder_name";
const API_KEY = process.env.CLOUDINARY_API_KEY || "Your_CLOUDINARY_API_KEY";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "";
const INDEX_FILE = path.join(process.cwd(), "mbox_index.json");

function clean(n) {
  return (n || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
}

function readIndex() {
  try {
    return JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));
  } catch (e) {
    return [];
  }
}

function addToIndex(name, type) {
  const list = readIndex();
  if (list.find(x => x.name === name)) return;
  list.push({ name: name, type: type });
  try {
    fs.writeFileSync(INDEX_FILE, JSON.stringify(list));
  } catch (e) {
    console.error("mbox index write error:", e.message);
  }
}

const AUDIO_EXT = ["mp3", "m4a", "wav", "aac", "ogg", "flac", "opus", "amr", "wma"];
let cache = { time: 0, data: null };

async function fetchRemoteList() {
  if (!API_SECRET) return null;
  if (cache.data && Date.now() - cache.time < 20000) return cache.data;
  const out = [];
  for (const type of ["video", "image"]) {
    try {
      const res = await axios.get(
        "https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/resources/" + type,
        {
          params: { type: "upload", prefix: FOLDER + "/", max_results: 500 },
          auth: { username: API_KEY, password: API_SECRET },
          timeout: 15000
        }
      );
      for (const r of res.data.resources || []) {
        out.push({ name: r.public_id.slice(FOLDER.length + 1), type: AUDIO_EXT.indexOf(r.format) >= 0 ? "audio" : type, t: r.created_at || "" });
      }
    } catch (e) {
      console.error("mbox remote list error:", e.response ? e.response.status : "", e.message);
      return null;
    }
  }
  out.sort((a, b) => (a.t > b.t ? 1 : -1));
  cache = { time: Date.now(), data: out };
  return out;
}

async function getList() {
  const remote = await fetchRemoteList();
  return remote || readIndex();
}

function urlFor(name, type) {
  const base = "https://res.cloudinary.com/" + CLOUD_NAME;
  if (type === "audio") return base + "/video/upload/" + FOLDER + "/" + name + ".mp3";
  if (type === "video") return base + "/video/upload/" + FOLDER + "/" + name + ".mp4";
  return base + "/image/upload/" + FOLDER + "/" + name + ".jpg";
}

async function exists(url) {
  try {
    const r = await axios.head(url, { timeout: 10000, validateStatus: () => true });
    return r.status === 200;
  } catch (e) {
    return false;
  }
}

async function findType(name) {
  const item = (await getList()).find(x => x.name === name);
  if (item) return item.type;
  if (await exists(urlFor(name, "video"))) return "video";
  if (await exists(urlFor(name, "image"))) return "image";
  return null;
}

async function sendMedia(message, name, type) {
  try {
    return await message.reply({ attachment: await global.utils.getStreamFromURL(urlFor(name, type)) });
  } catch (e) {
    console.error("mbox send error:", e.message);
    return message.reply("Failed to send media, please try again.");
  }
}

module.exports = {
  config: {
    name: "mbox",
    aliases: ["media", "mdrive"],
    version: "2.2.1",
    author: "Mr.king",
    countDown: 3,
    role: 0,
    description: { en: "Save photo/video/audio and retrieve it later" },
    category: "media",
    guide: {
      en: "Reply to media: {pn} save <name>\n{pn} list\n{pn} <name or number>\n{pn} random\n{pn} add <name>"
    }
  },

  onStart: async function ({ message, args, event }) {
    const sub = (args[0] || "").toLowerCase();

    if (sub === "save") {
      const name = clean(args[1]);
      if (!name) return message.reply("Please provide a name. Example: mbox save item1");
      if (/^\d+$/.test(name)) return message.reply("Name cannot be purely numbers, include some letters.");
      const att = event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0];
      if (!att) return message.reply("Please reply to a photo, video, or audio file.");

      try {
        const form = new URLSearchParams();
        form.append("file", att.url);
        form.append("upload_preset", PRESET);
        form.append("public_id", FOLDER + "/" + name);
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/" + CLOUD_NAME + "/auto/upload",
          form,
          { timeout: 120000, maxBodyLength: Infinity, maxContentLength: Infinity }
        );
        const type = res.data.is_audio ? "audio" : (res.data.resource_type === "video" ? "video" : "image");
        addToIndex(name, type);
        cache = { time: 0, data: null };
        return message.reply("Successfully saved: " + name + " (" + type + ")");
      } catch (e) {
        const msg = (e.response && e.response.data && e.response.data.error && e.response.data.error.message) || e.message;
        console.error("mbox save error:", msg);
        return message.reply("Failed to save: " + msg);
      }
    }

    if (sub === "list") {
      const list = await getList();
      if (!list.length) return message.reply("No saved media found.");
      const lines = list.map((x, i) => (i + 1) + ". " + x.name + (x.type === "video" ? " [Video]" : x.type === "audio" ? " [Audio]" : " [Image]"));
      return message.reply("Saved Media List:\n\n" + lines.join("\n"));
    }

    if (sub === "add") {
      const name = clean(args[1]);
      if (!name) return message.reply("Please provide a name to add.");
      const type = await findType(name);
      if (!type) return message.reply("Item '" + name + "' not found on Cloudinary.");
      addToIndex(name, type);
      return message.reply("Successfully added to index: " + name);
    }

    if (sub === "random") {
      const list = await getList();
      if (!list.length) return message.reply("No saved media found.");
      const pick = list[Math.floor(Math.random() * list.length)];
      return sendMedia(message, pick.name, pick.type);
    }

    if (!sub) return message.reply("Please provide a media name or use 'mbox list'.");

    let name = clean(args[0]);
    if (/^\d+$/.test(sub)) {
      const item = (await getList())[parseInt(sub, 10) - 1];
      if (!item) return message.reply("Invalid index number. Check 'mbox list'.");
      name = item.name;
    }

    const type = await findType(name);
    if (!type) return message.reply("Media '" + name + "' not found.");
    return sendMedia(message, name, type);
  }
};
                  
