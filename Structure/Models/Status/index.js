const { DataTypes, Model } = require('sequelize');

class Status extends Model {
    static initModel(sequelize) {
        // Use `super.init` here to call the `init` method on the parent `Model` class
        super.init({
            botId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            type: {
                type: DataTypes.STRING,
                defaultValue: 'custom',
            },
            status: {
                type: DataTypes.STRING,
                defaultValue: `Clarity Protect ${super.version ? super.version.version : '1.0.0'}`, // Provide a fallback if version is undefined
            },
            presence: {
                type: DataTypes.STRING,
                defaultValue: 'dnd',
            },
            url: {
                type: DataTypes.STRING,
                defaultValue: 'tsubasa_poulpy',
            }
        }, {
            sequelize, // Pass the `sequelize` instance here
            modelName: 'Status',
            tableName: "Status"
        });
    }
}

module.exports = Status;
