const ITEMS_PER_PAGE = 10;
const COMMAND_NAME = "cs";

function getLocalCommands() {
  const registry = global.GoatBot && global.GoatBot.commands;
  if (!registry) return [];
  const entries = typeof registry.entries === "function" ? Array.from(registry.entries()) : Object.entries(registry);
  return entries.map(([name, command]) => {
    const config = command && command.config ? command.config : {};
    return {
      cmd: config.name || name,
      author: config.author || "Mr.king",
      version: config.version || "Local",
      category: config.category || "General"
    };
  }).sort((a, b) => a.cmd.localeCompare(b.cmd));
}

module.exports.config = {
  name: COMMAND_NAME,
  aliases: ["cmdstore", "commandstore", "commandlist"],
  author: "Mr.king",
  version: "4.0.1",
  role: 2,
  countDown: 3,
  category: "owner",
  shortDescription: "Aliya command list",
  longDescription: "Browse commands loaded from this Aliya bot installation.",
  guide: { en: "Usage: /cs [search | page]" }
};

module.exports.onStart = async function ({ api, event, args }) {
  const allCommands = getLocalCommands();
  const query = args.join(" ").trim().toLowerCase();
  let commands = allCommands;
  let page = 1;
  if (query) {
    if (/^\d+$/.test(query)) page = Number(query);
    else commands = allCommands.filter(item => item.cmd.toLowerCase().includes(query));
  }
  if (commands.length === 0)
    return api.sendMessage("No local Aliya commands found for this search.", event.threadID, event.messageID);
  const totalPages = Math.ceil(commands.length / ITEMS_PER_PAGE);
  if (page < 1 || page > totalPages)
    return api.sendMessage("Invalid page number. Choose 1-" + totalPages + ".", event.threadID, event.messageID);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const items = commands.slice(start, start + ITEMS_PER_PAGE);
  let text = "ALIYA COMMANDS — Maintained by Mr.king\nPage " + page + "/" + totalPages + "\n";
  text += "Loaded locally: " + commands.length + "\n------------------------------\n";
  items.forEach((item, index) => {
    text += (start + index + 1) + ". " + item.cmd + " | " + item.category + " | " + item.author + "\n";
  });
  if (page < totalPages) text += "\nNext page: /cs " + (page + 1);
  api.sendMessage(text, event.threadID, (err, info) => {
    if (err || !info || !global.GoatBot || !global.GoatBot.onReply) return;
    global.GoatBot.onReply.set(info.messageID, {
      commandName: COMMAND_NAME,
      type: "reply",
      messageID: info.messageID,
      author: event.senderID,
      commands,
      page
    });
  }, event.messageID);
};

module.exports.onReply = async function ({ api, event, Reply }) {
  if (!Reply || Reply.author !== event.senderID)
    return api.sendMessage("This command reply is not for your account.", event.threadID, event.messageID);
  const replyNum = Number.parseInt(event.body, 10);
  const start = (Reply.page - 1) * ITEMS_PER_PAGE;
  const end = Math.min(start + ITEMS_PER_PAGE, Reply.commands.length);
  if (!Number.isInteger(replyNum) || replyNum < start + 1 || replyNum > end)
    return api.sendMessage("Reply with a number from " + (start + 1) + " to " + end + ".", event.threadID, event.messageID);
  const item = Reply.commands[replyNum - 1];
  if (api.unsendMessage) api.unsendMessage(Reply.messageID);
  const text = "ALIYA COMMAND\nName: " + item.cmd + "\nCategory: " + item.category + "\nAuthor: " + item.author + "\nVersion: " + item.version + "\nSource: installed locally";
  return api.sendMessage(text, event.threadID, event.messageID);
};
