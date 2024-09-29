const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

class Database extends Sequelize {
    constructor(clarity) {
        const dbConfig = clarity.config.database;
        const options = {
            dialect: dbConfig.dialect,
            logging: false,
            define: {
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
                timestamps: false,
                freezeTableName: true,
            }
        };

        switch (dbConfig.dialect) {
            case 'sqlite':
                options.storage = dbConfig.sqlite.storage;
                break;
            case 'mysql':
            case 'mariadb':
            case 'postgres':
            case 'mssql':
                options.host = dbConfig[dbConfig.dialect].host;
                options.port = dbConfig[dbConfig.dialect].port;
                options.username = dbConfig[dbConfig.dialect].username;
                options.password = dbConfig[dbConfig.dialect].password;
                options.database = dbConfig[dbConfig.dialect].database;
                break;
            default:
                throw new Error(`Unsupported database dialect: ${dbConfig.dialect}`);
        }

        super(options);

        this.initModel(path.join(__dirname, '../Models'));

        this.DataTypes = DataTypes;
        console.log('[DB] Database models initialized successfully.');
    }

    initModel(modelsPath) {
        const modelFiles = this.getModelFiles(modelsPath);
        modelFiles.forEach(file => {
            const model = require(file);
            model.initModel(this);
        });
    }

    getModelFiles(dir, fileList = []) {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                this.getModelFiles(filePath, fileList);
            } else {
                fileList.push(filePath);
            }
        });
        return fileList;
    }

    async authenticate(options) {
        try {
            await super.authenticate(options);
            console.log(`[DB] Connected to ${this.getDialect()} database successfully.`);
            
            console.log('[DB] Starting database synchronization...');
            await this.sync({force: false});
            console.log('[DB] Database synchronization completed.');
          
            console.log('[DB] Defined models:', Object.keys(this.models));
            
        } catch (err) {
            console.error(`[ERROR] Unable to connect to or sync the ${this.getDialect()} database:`, err);
            throw err;
        }
    }
}

module.exports = Database;