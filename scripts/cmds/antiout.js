// GoatBot V3 — AntiOut.js
// Author: Mr.king

module.exports = {
  config: {
    name: "antiout",
    version: "3.0.0",
    author: "Mr.king",
    role: 1,
    category: "group",
    shortDescription: "Anti-out protection",
    longDescription: "Prevents group members from leaving the group.",
    guide: "{pn} on/off"
  },

  onStart: async function ({ api, event, args, threadsData }) {
    const threadID = event.threadID;
    const mode = (args[0] || "").toLowerCase();

    if (!["on", "off"].includes(mode)) {
      return api.sendMessage(
        "Usage: antiout on | antiout off",
        threadID
      );
    }

    await threadsData.set(threadID, {
      data: {
        antiout: mode === "on"
      }
    });

    return api.sendMessage(
      `AntiOut ${mode === "on" ? "enabled" : "disabled"} successfully.`,
      threadID
    );
  },

  onEvent: async function ({ api, event, threadsData }) {
    if (event.logMessageType !== "log:unsubscribe") return;

    const threadID = event.threadID;
    const userID = event.logMessageData?.leftParticipantFbId;

    if (!userID) return;

    const threadData = await threadsData.get(threadID);
    const antiout = threadData?.data?.antiout;

    if (!antiout) return;

    try {
      const info = await api.getUserInfo(userID);
      const name = info?.[userID]?.name || "Member";

      await api.addUserToGroup(userID, threadID);

      return api.sendMessage(
        `🚫 AntiOut: ${name} has been added back to the group.`,
        threadID
      );
    } catch (error) {
      return api.sendMessage(
        "⚠️ AntiOut: Unable to add the member back.",
        threadID
      );
    }
  }
};
