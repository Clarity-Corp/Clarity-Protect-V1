const { DataTypes, Model } = require('sequelize');

class AntiKick extends Model {
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
            sensibility: {
                type: DataTypes.INTEGER,
                defaultValue: 0.8,
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
            modelName: 'AntiKick',
        })
    }
}

module.exports = AntiKick;