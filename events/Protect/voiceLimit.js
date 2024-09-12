const voiceLimit = require("../../Structure/Models/Protect/voiceLimit");
const recentJoins = new Map();
const cleanupRecentJoins = (channelId) => {
    const now = Date.now();
    const recentUsers = recentJoins.get(channelId) || [];
    const updatedRecentUsers = recentUsers.filter(user => now - user.timestamp < 1000); 
    recentJoins.set(channelId, updatedRecentUsers);
};
module.exports = {
    name: "voiceStateUpdate",
    run: async (client, oldState, newState) => {
        if (!newState.channelId) return;
        const voiceLimitData = await voiceLimit.findOne({
            where: {
                guildId: newState.guild.id,
                channelId: newState.channelId
            }
        });
        if (!voiceLimitData) return;
        cleanupRecentJoins(newState.channelId);
        const recentUsers = recentJoins.get(newState.channelId) || [];
        recentUsers.push({ id: newState.id, timestamp: Date.now() });
        recentJoins.set(newState.channelId, recentUsers);
        const memberCount = newState.channel.members.size;
        if (memberCount > voiceLimitData.limit) {
            const excessUsers = memberCount - voiceLimitData.limit;
            const sortedRecentUsers = recentUsers.sort((a, b) => b.timestamp - a.timestamp);
            const usersToDisconnect = sortedRecentUsers.slice(0, excessUsers);
            for (const user of usersToDisconnect) {
                const member = newState.channel.members.get(user.id);
                if (member) {
                    try {
                        await member.voice.setChannel(null);
                        console.log(`User ${member.user.tag} disconnected from ${newState.channel} due to voice limit.`);
                    } catch (error) {
                        console.error(`Failed to disconnect user ${member.user.tag}: ${error}`);
                    }
                }
            }
            recentJoins.set(newState.channelId, sortedRecentUsers.slice(excessUsers));
        }
    }
}