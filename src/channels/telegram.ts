import TelegramBot = require('node-telegram-bot-api')
import * as Promise from 'bluebird';
import { Message } from 'telegram-api-types';
import { log } from '../common/log';
import { RespondFunction } from '../engine';

interface TelegramChannelConfig {
    token: string,
    polling: boolean,
    webHookUrl?: string,
    webHookHost?: string,
    webHookPort?: number,
    certificate?: string
}

export function TelegramChannel(config: TelegramChannelConfig) {
    const bot = new TelegramBot(config.token, {
        polling: config.polling,
        webHook: {host: config.webHookHost, port: config.webHookPort}
    })

    if (config.polling) {
        log('Telegram channel opened with polling');
    } else {
        log('Telegram channel opened, setting up WebHook ...')
        bot.setWebHook(config.webHookUrl, config.certificate)
            .then(() => log('Telegram WebHook successful!'))
            .catch((e) => log('Telegram WebHook failed!!', e))
    }

    const sendText = (context: Message) => (text: string) =>
        (text === undefined || text.length === 0)
            ? Promise.resolve()
            : bot.sendMessage(context.chat.id, text, {parse_mode: 'HTML'})


    const sendTexts = (context: Message, texts: string[]) =>
        Promise.each(texts, sendText(context))

    const onText = (fn: (respond: RespondFunction, msg: Message) => Promise<any>) => {
        bot.on('text', (msg: Message) => fn(sendTexts, msg));
    }

    return {
        onText
    }
}