const { DataTypes, Model } = require('sequelize');

class Raidmode extends Model {
    static initModel(sequelize) {
        super.init({
            guildId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },{
            sequelize,
            modelName: 'Raidmode',
            tableName: 'Raidmode'
        })
    }
}

module.exports = Raidmode;