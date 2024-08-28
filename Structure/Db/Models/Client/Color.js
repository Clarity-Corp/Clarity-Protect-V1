const { DataTypes, Model } = require('sequelize');

class ClientColor extends Model {
    static initModel(sequelize) {
        // Use `super.init` here to call the `init` method on the parent `Model` class
        super.init({
            botId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            color: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: '#3535f8',
            }
        }, {
            sequelize, // Pass the `sequelize` instance here
            modelName: 'ClientColor',
            tableName: "ClientColor"
        });
    }
}

module.exports = ClientColor;
