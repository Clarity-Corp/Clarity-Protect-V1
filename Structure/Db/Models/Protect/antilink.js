const { DataTypes, Model } = require('sequelize');

class Antilink extends Model {
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
            rep: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            rep_limit: {
                type: DataTypes.INTEGER,
                defaultValue: 5,
            },
            logs: {
                type: DataTypes.STRING,
                defaultValue: "logs"
            },
            logs_status: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            link_type: {
                type: DataTypes.TEXT,
                defaultValue: "all"
            },
            wl_link: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: "giphy.com/gifs"
            },
            wl_channel: {
                type: DataTypes.STRING,
                allowNull: true
            },
            wl_role: {
                type: DataTypes.STRING,
                allowNull: true
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
            modelName: 'AntiLink',
            tableName: 'AntiLink'
        })
    }
}

module.exports = Antilink;