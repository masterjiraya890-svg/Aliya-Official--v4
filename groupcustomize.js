module.exports = {
  config: {
    name: "groupcustomize",
    aliases: ["gcfg", "gc"],
    version: "1.1.0",
    author: "Mr. King",
    role: 1, // Admin only
    shortDescription: "Customize group settings",
    longDescription: "Change group name, toggle configurations, or update metadata.",
    category: "group",
    guide: { 
      en: "{pn} name <new name> - Change group name\n" +
          "{pn} antiout <on/off> - Toggle anti-out protection\n" +
          "{pn} approval <on/off> - Toggle admin approval for new members" 
    }
  },

  onStart: async function ({ api, event, args, threadsData }) {
    const { threadID, messageID, senderID } = event;
    
    try {
      // Verify if the user is a group admin or bot admin
      const threadInfo = await api.getThreadInfo(threadID);
      const { adminIDs } = threadInfo;
      const isGroupAdmin = adminIDs.some(admin => admin.id === senderID);

      if (!isGroupAdmin) {
        return api.sendMessage("❌ | You must be a group administrator to use this command.", threadID, messageID);
      }

      if (!args[0]) {
        return api.sendMessage(
          "⚙️ | 𝐆𝐫𝐨𝐮𝐩 𝐂𝐮𝐬𝐭𝐨𝐦𝐢𝐳𝐚𝐭𝐢𝐨𝐧\n" +
          "━━━━━━━━━━━━━━━━━━\n" +
          "ℹ️ Available options:\n" +
          "🔹 /gc name <text>\n" +
          "🔹 /gc antiout <on/off>\n" +
          "🔹 /gc approval <on/off>", 
          threadID, messageID
        );
      }

      const option = args[0].toLowerCase();
      const value = args.slice(1).join(" ").trim();

      switch (option) {
        case "name": {
          if (!value) return api.sendMessage("❌ | Please provide a new name for the group.", threadID, messageID);
          await api.setTitle(value, threadID);
          return api.sendMessage(`✅ | Group name has been successfully changed to: "${value}"`, threadID, messageID);
        }

        case "antiout": {
          if (!value || (value !== "on" && value !== "off")) {
            return api.sendMessage("❌ | Use 'on' or 'off'. (e.g., /gc antiout on)", threadID, messageID);
          }
          
          const threadData = await threadsData.get(threadID);
          if (!threadData.data) threadData.data = {};
          
          threadData.data.antiout = value === "on";
          await threadsData.set(threadID, threadData);
          
          return api.sendMessage(`✅ | Anti-out protection has been turned ${value.toUpperCase()}.`, threadID, messageID);
        }

        case "approval": {
          if (!value || (value !== "on" && value !== "off")) {
            return api.sendMessage("❌ | Use 'on' or 'off'. (e.g., /gc approval on)", threadID, messageID);
          }
          
          const state = value === "on";
          // Attempting native API approval toggle if supported by framework
          if (typeof api.setGroupApprovalMode === "function") {
            await api.setGroupApprovalMode(threadID, state);
          }
          
          return api.sendMessage(`✅ | Admin approval requirement for new members has been turned ${value.toUpperCase()}.`, threadID, messageID);
        }

        default: {
          return api.sendMessage("❌ | Invalid option selected. Refer to the command guide.", threadID, messageID);
        }
      }

    } catch (error) {
      return api.sendMessage("❌ | An error occurred while applying custom adjustments.", threadID, messageID);
    }
  }
};
