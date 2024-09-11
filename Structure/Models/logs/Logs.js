const { DataTypes, Model } = require('sequelize');

class Logs extends Model {
    static initModel(sequelize) {
        super.init({
            guildId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            logs_status: {
              type: DataTypes.BOOLEAN,
            },
            logs_channel: {
                type: DataTypes.STRING,
                allowNull: true,
            }
        }, {
            sequelize,
            modelName: 'logs',
            tableName: "logs"
        })
    }
}

module.exports = Logs;