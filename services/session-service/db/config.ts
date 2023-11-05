import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config();

/**
 * @description
 * The database name, owner, and password are stored in the .env file.
 * If they are not present, we use the default values.
 */
const DB_NAME:  string = process.env.DB_NAME ?? 'appointdent_session';
const DB_OWNER: string = process.env.DB_OWNER ?? 'postgres';
const DB_PASS:  string = process.env.DB_PASS ?? '';

/**
 * @description
 * A new instance of Sequelize based on the database name, owner, and password.
 * We use postgres as the dialect and localhost as the host.
 */
const sequelize: Sequelize = new Sequelize(DB_NAME, DB_OWNER, DB_PASS, {
    host: 'localhost', // change in production
    dialect: 'postgres',
    // TODO: add more configuration options
});

export default sequelize;