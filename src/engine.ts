import * as Promise from 'bluebird';
import { log } from './common/log';
import { Message } from 'telegram-api-types';

type CommandFunction = (msg: Message, ...args: string[]) => Promise<string[]>;

interface Channel {
    sendText(context: Message, text: string): Promise<any>,
    sendTexts(context: Message, texts: string[]): Promise<any>
}

export class Engine {
    private commands: {[command: string]: CommandFunction} = {};

    registerCommand(command: string, fn: CommandFunction) {
        this.commands[command] = fn;
    }

    handleMessage(channel: Channel, msg: Message): Promise<any> {
        log(`@${msg.from.username} => ${msg.text}`);

        const command = Object.keys(this.commands).find((cmd) => !!msg.text.match(cmd));

        if (!command) {
            log(`@${msg.from.username} <= ????`);
            return channel.sendText(msg, 'Ik begrijp niet wat je zegt.. ');
        }

        const fn = this.commands[command];
        const [, ...args] = msg.text.match(command);

        return fn(msg, ...args)
            .then((replies) => channel.sendTexts(msg, replies))
            .catch((err) => {
                log(`!! Error while handling "@${msg.from.username} => ${msg.text}"`);
                log(err);
                return channel.sendTexts(msg, [
                    err && err.message || 'Something went really wrong..',
                    err && err.error && err.error.message
                ]);
            })

    }

}
