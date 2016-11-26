import TelegramBot = require('node-telegram-bot-api')
import * as Promise from 'bluebird';
import { Message } from 'telegram-api-types';


export default class TelegramChannel {
    private bot: TelegramBot;

    constructor(config: {token: string, polling: boolean, webHookUrl?: string, certificate?: string}) {
        this.bot = new TelegramBot(config.token, {polling: config.polling});

        if (config.polling) {
            console.log('Telegram channel opened with polling');
        } else {
            console.log('Telegram channel opened, setting up WebHook ...');
            this.bot.setWebHook(config.webHookUrl, config.certificate)
                .then(() => console.log('Telegram WebHook successful!'))
                .catch((e) => console.log('Telegram WebHook failed!!', e));
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