const { DataTypes, Model } = require('sequelize');

class Verif extends Model {
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
            logs: {
                type: DataTypes.STRING,
                defaultValue: "logs"
            },
            logs_status: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
           roleId: {
               type: DataTypes.STRING,
               allowNull: true
           },
            emoji: {
                type: DataTypes.STRING,
                defaultValue: '✅'
            },
            messageId: {
                type: DataTypes.STRING,
                allowNull: true
            },
            text: {
                type: DataTypes.STRING,
                allowNull: true
            },
            channelId: {
                type: DataTypes.STRING,
                allowNull: true
        }
        },{
            sequelize,
            modelName: 'Verif',
        })
    }
}

module.exports = Verif;