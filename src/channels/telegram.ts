import TelegramBot = require('node-telegram-bot-api')
import * as Promise from 'bluebird';
import { Message } from 'telegram-api-types';
import { log } from '../common/log';

interface TelegramChannelConfig {
    token: string,
    polling: boolean,
    webHookUrl?: string,
    webHookHost?: string,
    webHookPort?: number,
    certificate?: string
}

export default class TelegramChannel {
    private bot: TelegramBot;

    constructor(config: TelegramChannelConfig) {
        this.bot = new TelegramBot(config.token, {
            polling: config.polling,
            webHook: { host: config.webHookHost, port: config.webHookPort }
        });

        if (config.polling) {
            log('Telegram channel opened with polling');
        } else {
            log('Telegram channel opened, setting up WebHook ...');
            this.bot.setWebHook(config.webHookUrl, config.certificate)
                .then(() => log('Telegram WebHook successful!'))
                .catch((e) => log('Telegram WebHook failed!!', e));
        }
    }

    onText(fn: (event: Message, text: string) => any) {
        this.bot.on('text', (msg) => {
            fn(msg, msg.text);
        })
    }

    sendText(context: Message, text: string): Promise<any> {
        if (text === undefined || text.length === 0) {
            return Promise.resolve();
        }

        return this.bot.sendMessage(context.chat.id, text);
    }

}