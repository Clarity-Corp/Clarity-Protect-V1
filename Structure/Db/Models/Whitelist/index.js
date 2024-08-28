const { DataTypes, Model } = require('sequelize');

class Whitelist extends Model  {
    static initModel(sequelize) {
        super.init({
            guildId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            userId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            reason: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: "Aucune raison fournie"
            },
            authorId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            wlAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        },
            {
                sequelize,
                modelName: 'Whitelist',
                tableName: 'whitelist'
            })
    }
}

module.exports = Whitelist;