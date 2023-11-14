import { config } from 'dotenv';
import database from './db/config';
import { mqttClient } from './mqtt/mqtt';
import path from 'path';
const SERVICES_PATH = path.basename(path.dirname(__dirname));
void mqttClient.setup(SERVICES_PATH);

config();

console.log('AppointDent - Sessions Service');
console.log(`Using database: ${database?.name}`);
console.log(`Database connection: ${((database?.open) ?? false) ? 'OK' : 'ERROR'}`);
