const allOnEvent = global.GoatBot.onEvent;

module.exports = {
	config: {
		name: "onEvent",
		version: "4.0",
		author: "Mr.king",
		description: "Loop to all events in global.GoatBot.onEvent and run when triggered",
		category: "events"
	},

	onStart: async ({ api, args, message, event, threadsData, usersData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, role, commandName }) => {
		for (const item of allOnEvent) {
			if (typeof item === "string") continue;
			
			try {
				if (typeof item.onStart === "function") {
					await item.onStart({ 
						api, 
						args, 
						message, 
						event, 
						threadsData, 
						usersData, 
						dashBoardData, 
						globalData, 
						threadModel, 
						userModel, 
						dashBoardModel, 
						globalModel, 
						role, 
						commandName 
					});
				}
			} catch (err) {
				console.error(`[ ALIYA v4 EVENT ERROR ] Event ${item.config?.name || "Unknown"} failed:`, err);
			}
		}
	}
};
          
