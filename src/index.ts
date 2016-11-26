import config from './config';
import TelegramChannel from './channels/telegram';
import NsService from './services/ns';
import * as Promise from 'bluebird';


const telegramChannel = new TelegramChannel(config.channels.telegram);

const nsService = new NsService(config.services.ns);

telegramChannel.onText((event, text) => {
    if (/^\/trein/.test(text)) {
        Promise.each(nsService.getStoringen(),
            (storing: string) => telegramChannel.sendText(event, storing)
        );
    }


});

console.log('Engine started!');
