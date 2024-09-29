const { DataTypes, Model } = require('sequelize');

class Antispam extends Model {
    static initModel(sequelize) {
        super.init({
            guildId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            sanction: {
                type: DataTypes.TEXT,
                defaultValue: "mute"
            },
            sanction_admin: {
                type: DataTypes.TEXT,
                defaultValue: "derank"
            },
            logs: {
                type: DataTypes.STRING,
                defaultValue: "logs"
            },
            logs_status: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            interval: {
                type: DataTypes.INTEGER,
                defaultValue: 2000
            },
            message_limit: {
                type: DataTypes.INTEGER,
                defaultValue: 5
            },
            wl_channel: {
                type: DataTypes.STRING,
                allowNull: true
            },
            wl_role: {
                type: DataTypes.STRING,
                allowNull: true
            },
            wl_users: {
                type: DataTypes.STRING,
                allowNull: true
            },
            use_botWl: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            use_botOwner: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            permission_allowed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            bypass: {
            type: DataTypes.INTEGER,
            defaultValue: 0
            },
            bypass_status: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },{
            sequelize,
            modelName: 'AntiSpam',
            tableName: 'AntiSpam'
        })
    }
}

module.exports = Antispam;