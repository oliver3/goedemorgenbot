import * as Promise from 'bluebird';
import { log } from './common/log';
import { Message } from 'telegram-api-types';

export type CommandFunction = (msg: Message, ...args: string[]) => Promise<string[]>;

export type RespondFunction = (msg: Message, responses: string[]) => Promise<any>;

export const handleMessage = (commands: [string, CommandFunction][]) => (respond: RespondFunction, msg: Message) => {
    log(`@${msg.from.username} => ${msg.text}`);

    const command = commands.find(([cmd, fn]) => !!msg.text.match(cmd));

    if (!command) {
        log(`@${msg.from.username} <= ????`);
        return respond(msg, ['Ik begrijp niet wat je zegt.. ']);
    }

    const [, ...args] = msg.text.match(command[0]);
    const fn = command[1];

    return fn(msg, ...args)
        .then((replies) => respond(msg, replies))
        .catch((err) => {
            log(`!! Error while handling "@${msg.from.username} => ${msg.text}"`);
            log(err);
            return respond(msg, [
                err && err.message || 'Something went really wrong..',
                err && err.error && err.error.message
            ]);
        })

}
