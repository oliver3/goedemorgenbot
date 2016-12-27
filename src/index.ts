import config from './config';
import TelegramChannel from './channels/telegram';
import NsService from './services/ns';
import * as Promise from 'bluebird';
import { log } from './common/log';
import { Engine } from './engine';

if (process.argv[2] === 'debug') {
    process.env.DEBUG = '*';
}

const engine = new Engine();

const nsService = new NsService(engine, config.services.ns);

const telegramChannel = new TelegramChannel(engine, config.channels.telegram);

log('Engine started!');
