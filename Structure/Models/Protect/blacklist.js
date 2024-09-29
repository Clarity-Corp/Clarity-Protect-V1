const { DataTypes, Model } = require('sequelize');

class Blacklist extends Model  {
    static initModel(sequelize) {
        super.init({
            botId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            userId: {
                type: DataTypes.STRING,
                allowNull: true
            },
            reason: {
                type: DataTypes.TEXT,
                allowNull: true,
                defaultValue: "Aucune raison fournie"
            },
            authorId: {
                type: DataTypes.STRING,
                allowNull: true
            },
            blAt: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW
            }
        },
            {
                sequelize,
                modelName: 'Blacklist',
                tableName: 'Blacklist'
            })
    }
}

module.exports = Blacklist;