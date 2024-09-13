const { DataTypes, Model } = require('sequelize');

class roleLimit extends Model {
    static initModel(sequelize) {
        super.init({
            guildId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            roleId: {
                type: DataTypes.STRING,
                allowNull: true
            },
            limit: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
           originalName: {
            type: DataTypes.STRING,
            allowNull: true
           }

        }, {
            sequelize,
            modelName: "roleLimit"
        })
    }
}

module.exports = roleLimit;