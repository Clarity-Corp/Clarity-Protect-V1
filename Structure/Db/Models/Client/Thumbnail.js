const { DataTypes, Model } = require('sequelize');

class ClientColor extends Model {
    static initModel(sequelize) {
        // Use `super.init` here to call the `init` method on the parent `Model` class
        super.init({
            botId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            iconURL: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'https://cdn.discordapp.com/attachments/1270775157077835787/1276937362965790731/file-hahUxyGWnMgyKwJLEjmUZuXh.png?ex=66cb5817&is=66ca0697&hm=e74d4df674d70bec3d34cc6ab2903616881f22b0fcdc701427bd8a66ca1c668e&',
            }

        }, {
            sequelize, // Pass the `sequelize` instance here
            modelName: 'ClientThumbnail',
            tableName: "ClientThumbnail",
        });
    }
}

module.exports = ClientColor;
