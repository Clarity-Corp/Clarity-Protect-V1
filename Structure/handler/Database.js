const { Sequelize, DataTypes } = require('sequelize');
const config = require("../Config/index");
const fs = require('fs');
const path = require('path');
class Database extends Sequelize {
    constructor() {
        if (!config || !config.database) {
            throw new Error('Database configuration is not defined. Ensure that you are passing the correct configuration.');
        }

        const { dialect, host, username, password, name, Sqlite } = config.database;
        if (!dialect) {
            throw new Error('Database dialect is not defined in the configuration.');
        }

        const commonOptions = {
            logging: false,
            define: {
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
                timestamps: false,
                freezeTableName: true,
            },
            dialectOptions: {
                busyTimeout: 5000
            }
        };

        let sequelizeOptions;

        switch (dialect.toLowerCase()) {
            case 'sqlite':
                if (!Sqlite || !Sqlite.storage) {
                    throw new Error('SQLite storage path is not defined in the configuration.');
                }
                sequelizeOptions = Object.assign({}, commonOptions, {
                    dialect: 'sqlite',
                    storage: Sqlite.storage,
                });
                break;
            case 'mysql':
            case 'postgres':
            case 'mariadb':
            case 'mssql':
                if (!host || !username || !password || !name) {
                    throw new Error(`Missing database credentials for ${dialect} in the configuration.`);
                }
                sequelizeOptions = Object.assign({}, commonOptions, {
                    dialect: dialect.toLowerCase(),
                    host,
                    username,
                    password,
                    database: name,
                });
                break;
            default:
                throw new Error(`Unsupported dialect: ${dialect}`);
        }

        super(sequelizeOptions);

        this.initModel(path.join(__dirname, '../Db/Models'));

        this.DataTypes = DataTypes;
        console.log('[DB] Database models initialized successfully.');
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
            console.log(`[DB] Connected to ${this.getDialect()} database successfully.`);
            await this.sync({alter: true});
        } catch (err) {
            console.error(`[ERROR] Unable to connect to the ${this.getDialect()} database:`, err);
            throw err;
        }
    }

    getDialect() {
        return config.database.dialect;
    }
}

module.exports = Database;
