const roleLimit = require("../../Structure/Models/Protect/RoleLimit")
module.exports = {
    name: "guildMemberUpdate",
    run: async (client, oldMember, newMember) => {
        if (oldMember.roles.cache.size < newMember.roles.cache.size) {
            const addedRole = newMember.roles.cache.find(role => !oldMember.roles.cache.has(role.id));
            let db = await roleLimit.findOne({where: {roleId: addedRole.id}});
            if (!db) return;
            if (db.limit > 0) {
                const memberCount = newMember.guild.members.cache.filter(member => member.roles.cache.has(addedRole.id)).size;
                console.log(memberCount);
                if (memberCount < db.limit) {
                    const role = newMember.guild.roles.cache.get(addedRole.id);
                    const newName = `${db.originalName} [${memberCount}/${db.limit}]`;
                    await role.edit({ name: newName });
                }
                if (memberCount > db.limit) {
                    await newMember.roles.remove(addedRole);
                } else {
                    const newName = `${db.originalName} [${memberCount}/${db.limit}]`;
                    await addedRole.edit({ name: newName });

                }
            }
        }
    } 
}