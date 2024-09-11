const { DataTypes, Model } = require('sequelize');

class User extends Model {
    static initModel(sequelize) {
        // Use `super.init` here to call the `init` method on the parent `Model` class
        super.init({
            userId: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            premium: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            premiumSince: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            premiumUntil: {
                type: DataTypes.DATE,
                allowNull: true,
            }

        }, {
            sequelize, // Pass the `sequelize` instance here
            modelName: 'User', // This should be the name of the model/table,
            tableName: "User"
        });
    }
}

module.exports = User;
