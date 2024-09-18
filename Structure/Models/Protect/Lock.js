const { DataTypes, Model } = require('sequelize');

class Lock extends Model {
    static initModel(sequelize) {
        super.init({
            guildId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            isLocked: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            channelId: {
                type: DataTypes.STRING,
                allowNull: true
            }
        },
    {
        sequelize,
        modelName: "lock"
    }
    )
    }
}

module.exports = Lock