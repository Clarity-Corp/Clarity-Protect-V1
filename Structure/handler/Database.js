const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
let dialect;
class Database extends Sequelize {
    constructor(clarity) {

        super({
            dialect: clarity.config.database.dialect,
            storage: clarity.config.database.Sqlite.storage,
            logging: false,
            define: {
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
                timestamps: false,
                freezeTableName: true,
            }
        })

        this.initModel(path.join(__dirname, '../Models'));

        this.DataTypes = DataTypes;
        console.log('[DB] Database models initialized successfully.');
        dialect = clarity.config.database.dialect;
    }
    initModel(modelsPath) {
        const modelF = this.getModelF(modelsPath);
        modelF.forEach(file => {
            const model = require(file)
            model.initModel(this);
        })
    }
    getModelF(dir, fL = []) {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                this.getModelF(filePath, fL);
            } else {
                fL.push(filePath);
            }
        });
        return fL;
    }
    async authenticate(options) {
        try {
            await super.authenticate(options);
            console.log(`[DB] Connected to ${dialect} database successfully.`);
            await this.sync({alter: true});
        } catch (err) {
            console.error(`[ERROR] Unable to connect to the ${this.getDialect()} database:`, err);
            throw err;
        }
    }
}
module.exports = Database;
