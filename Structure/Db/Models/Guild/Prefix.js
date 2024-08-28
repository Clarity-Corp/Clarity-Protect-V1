const { DataTypes, Model } = require('sequelize');

class Prefix extends Model {
    static initModel(sequelize) {
        // Use `super.init` here to call the `init` method on the parent `Model` class
        super.init({
            guildId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            prefix: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: '.',
            }
        }, {
            sequelize, // Pass the `sequelize` instance here
            modelName: 'Prefix',
            tableName: "Prefix"
        });
    }
}

module.exports = Prefix;
