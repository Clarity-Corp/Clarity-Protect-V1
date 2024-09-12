const { DataTypes, Model } = require('sequelize');

class voiceLimit extends Model {
    static initModel(sequelize) {
        super.init({
            guildId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            channelId: {
                type: DataTypes.STRING,
                allowNull: true
            },
            limit: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            }
        }, {
            sequelize,
            modelName: "voiceLimit"
        })
    }
}

module.exports = voiceLimit;