const { DataTypes, Model } = require('sequelize');

class GuildColor extends Model {
    static initModel(sequelize) {
        // Use `super.init` here to call the `init` method on the parent `Model` class
        super.init({
            guildId: {
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
            modelName: 'GuildColor',
            tableName: "GuildColor"
        });
    }
}

module.exports = GuildColor;
