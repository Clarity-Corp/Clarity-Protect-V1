const { DataTypes, Model } = require('sequelize');

class Maintenance extends Model {
    static initModel(sequelize) {
        super.init({
            guildId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
              },
              roles: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    is: /^\d+$/,
                }
              },
              savedPermissions: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: {}
              },
              maintenanceCategory: {
                type: DataTypes.STRING,
                allowNull: true
            },
            maintenanceText: {
                type: DataTypes.STRING,
                allowNull: true
            },
            maintenanceVoice: {
                type: DataTypes.STRING,
                allowNull: true
            },
            logs_status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        },{
            sequelize,
            modelName: 'Maintenance',
            tableName: 'Maintenance'
        })
    }
}

module.exports = Maintenance;