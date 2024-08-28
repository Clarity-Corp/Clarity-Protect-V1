const { DataTypes, Model } = require('sequelize');

class GuildLang extends Model {
    static initModel(sequelize) {
        super.init({
            guildId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            lang: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'fr',
            }
        }, {
            sequelize,
            modelName: 'GuildLang',
            tableName: "GuildLang"
        })
    }
}

module.exports = GuildLang;