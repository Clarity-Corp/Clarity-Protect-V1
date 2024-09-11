const { DataTypes, Model } = require('sequelize');

class Owner extends Model {
    static initModel(sequelize) {
        super.init({
            botId: {
                type: DataTypes.STRING,
            },
            userId: {
                type: DataTypes.STRING,
                allowNull: true
            }
        },{
            sequelize,
            modelName: "Owner"
            }
            )
}
}

module.exports = Owner