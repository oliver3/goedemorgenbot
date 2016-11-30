import config from './config';
import TelegramChannel from './channels/telegram';
import NsService from './services/ns';
import * as Promise from 'bluebird';
import { log } from './common/log';
import { Message } from 'telegram-api-types';

if (process.argv[2] === 'debug') {
    process.env.DEBUG = '*';
}

const telegramChannel = new TelegramChannel(config.channels.telegram);

const nsService = new NsService(config.services.ns);

telegramChannel.onText((event, text): void => {
    log(`${event.from.first_name} (@${event.from.username}) said: ${text}`);

    const responses: Promise<string[]> = nsService.getResponses(event, text);

    Promise.each(responses, (response: string) => telegramChannel.sendText(event, response));
});

log('Engine started!');
