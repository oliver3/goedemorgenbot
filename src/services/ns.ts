import NsApi = require('ns-api');
import * as Promise from 'bluebird';
import { StoringGepland } from 'ns-api-types';
import { StoringOngepland } from 'ns-api-types';
import { Storingen } from 'ns-api-types';
import { log, debug } from '../common/log';
import { Message } from 'telegram-api-types';

export default class NsService {
    private nsApi: NsApi;

    constructor(config: {username: string, password: string}) {
        this.nsApi = new NsApi(config);
    }

    getStoringen(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.nsApi.storingen({station: 'ut'}, (err: any, storingen: Storingen) => {
                debug(storingen);
                if (err) {
                    log(err);
                    return reject(err);
                }

                resolve(
                    storingen.Gepland.map(geplandToString).concat(
                        storingen.Ongepland.map(ongeplandToString))
                );
            });
        });

    }

    // getReisadvies(from: string, to: string): Promise<string[]> {
    //     return new Promise<string[]>((resolve, reject) => {
    //         this.nsApi.reisadvies({fromStation: from, toStation: to}, (advies)
    //         {
    //
    //         }
    //         )
    //     });
    // }

    getResponses(event: Message, text: string): Promise<string[]> {
        return chooseResponse({
            '/storingen': () => this.getStoringen(),
            // '/trein (\\w+)\\W(\\w+))': (from, to) => this.getReisadvies(from, to)
        }, text);
    }
}

function geplandToString(storing: StoringGepland) {
    return `Geplande werkzaamheden ${storing.Periode} op traject ${storing.Traject}`;
}

function ongeplandToString(storing: StoringOngepland) {
    return storing.Bericht.split('\r').join('\n');
}

type Answers = {[r: string]: (...args: string[]) => Promise<string[]>};

function chooseResponse(answers: Answers, text: string): Promise<string[]> {
    for (const regexp of Object.keys(answers)) {
        const match = text.match(regexp);

        if (match) {
            return answers[regexp](...match.slice(1));
        }
    }

    return Promise.resolve([]);

}