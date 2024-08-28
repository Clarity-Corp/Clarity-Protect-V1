const { DataTypes, Model } = require('sequelize');

class Help extends Model {
    static initModel(sequelize) {
        super.init({
            botId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            style: {
                type: DataTypes.TEXT,
                allowNull: false,
                defaultValue: 'onepage'
            },
            image: {
                type: DataTypes.STRING,
                allowNull: true,
            }
        }, {
            sequelize,
            modelName: 'Help',
            tableName: "Help"
        })
    }
}

module.exports = Help;