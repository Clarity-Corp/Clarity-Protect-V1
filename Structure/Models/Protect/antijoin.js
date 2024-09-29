const { DataTypes, Model } = require('sequelize');

class AntiJoin extends Model {
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
            use_botWl: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            use_botOwner: {
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
            },
            counter: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            }
        },{
            sequelize,
            modelName: 'AntiJoin',
            tableName: "AntiJoin"
        })
    }
}

module.exports = AntiJoin;