const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "developer",
    aliases: ["dev"],
    version: "2.0",
    author: "Mr.king",
    role: 0,
    description: {
      en: "Add, remove, list developer role users"
    },
    category: "owner",
    guide: {
      en: '   {pn} [add | -a] [<reply> | <@tag> | <uid>]: Add developer\n'
        + '   {pn} [remove | -r] [<reply> | <@tag> | <uid>]: Remove developer\n'
        + '   {pn} [list | -l]: List all developers'
    }
  },

  langs: {
    en: {
      added: "✅ | Added developer role for %1 users:\n%2",
      alreadyDev: "⚠️ | %1 users are already developers:\n%2",
      missingIdAdd: "⚠️ | Please reply to a message, tag user or enter UID to add developer",
      removed: "✅ | Removed developer role of %1 users:\n%2",
      notDev: "⚠️ | %1 users are not developers:\n%2",
      missingIdRemove: "⚠️ | Please reply to a message, tag user or enter UID to remove developer",
      listDev: "👨‍💻 | List of developers:\n%1"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang, role }) {
    if (!config.developer) config.developer = [];

    switch (args[0]?.toLowerCase()) {
      case "add":
      case "-a": {
        if (role < 2) return message.reply("⚠️ | Only bot owner/main developers can add new developers.");

        let uids = [];
        if (event.messageReply) {
          uids.push(event.messageReply.senderID);
        } else if (Object.keys(event.mentions).length > 0) {
          uids = Object.keys(event.mentions);
        } else if (args.length > 1) {
          uids = args.slice(1).filter(arg => !isNaN(arg));
        }

        if (uids.length === 0)
          return message.reply(getLang("missingIdAdd"));

        const notDevIds = [];
        const devIds = [];

        for (const uid of uids) {
          if (config.developer.includes(uid))
            devIds.push(uid);
          else
            notDevIds.push(uid);
        }

        config.developer.push(...notDevIds);
        const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
        
        try {
          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        } catch (e) {
          console.error(e);
        }

        return message.reply(
          (notDevIds.length > 0 ? getLang("added", notDevIds.length, getNames.filter(u => notDevIds.includes(u.uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
          + (devIds.length > 0 ? getLang("alreadyDev", devIds.length, devIds.map(uid => `• ${uid}`).join("\n")) : "")
        );
      }

      case "remove":
      case "delete":
      case "del":
      case "-r": {
        if (role < 2) return message.reply("⚠️ | Only bot owner/main developers can remove developers.");

        let uids = [];
        if (event.messageReply) {
          uids.push(event.messageReply.senderID);
        } else if (Object.keys(event.mentions).length > 0) {
          uids = Object.keys(event.mentions);
        } else if (args.length > 1) {
          uids = args.slice(1).filter(arg => !isNaN(arg));
        }

        if (uids.length === 0)
          return message.reply(getLang("missingIdRemove"));

        const notDevIds = [];
        const devIds = [];

        for (const uid of uids) {
          if (config.developer.includes(uid))
            devIds.push(uid);
          else
            notDevIds.push(uid);
        }

        for (const uid of devIds) {
          const index = config.developer.indexOf(uid);
          if (index > -1) config.developer.splice(index, 1);
        }

        const getNames = await Promise.all(devIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
        
        try {
          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        } catch (e) {
          console.error(e);
        }

        return message.reply(
          (devIds.length > 0 ? getLang("removed", devIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
          + (notDevIds.length > 0 ? getLang("notDev", notDevIds.length, notDevIds.map(uid => `• ${uid}`).join("\n")) : "")
        );
      }

      case "list":
      case "-l": {
        if (!config.developer || config.developer.length === 0)
          return message.reply("⚠️ | No developers found in bot configuration.");

        const getNames = await Promise.all(config.developer.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
        return message.reply(getLang("listDev", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
      }

      default:
        return message.SyntaxError();
    }
  }
};
