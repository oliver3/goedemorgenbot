import config from './config';
import { TelegramChannel } from './channels/telegram';
import { NsService } from './services/ns';
import * as Promise from 'bluebird';
import { log } from './common/log';
import { CommandFunction, handleMessage } from './engine';

if (process.argv[2] === 'debug') {
    process.env.DEBUG = '*';
}

const commands: [string, CommandFunction][] =
    NsService(config.services.ns).getCommands()

TelegramChannel(config.channels.telegram)
    .onText(handleMessage(commands))


log('Engine started!');
