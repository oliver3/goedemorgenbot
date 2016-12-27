import NsApi = require('ns-api');
import * as Promise from 'bluebird';
import { StoringGepland } from 'ns-api-types';
import { StoringOngepland } from 'ns-api-types';
import { Storingen } from 'ns-api-types';
import { log, debug } from '../common/log';
import { Message } from 'telegram-api-types';
import { Engine } from '../engine';

export default class NsService {
    private nsApi: NsApi;

    constructor(private engine: Engine, config: {username: string, password: string}) {
        this.nsApi = new NsApi(config);

        engine.registerCommand('/storingen', this.getStoringen.bind(this));
        engine.registerCommand('/trein (\\w*) (\\w*)', this.getReisadvies.bind(this));
    }

    getStoringen(context: Message): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.nsApi.storingen({station: 'ut'}, (err: any, storingen: Storingen) => {
                if (err) {
                    return err.api && err.api.message ? resolve([err.api.message]) : reject(err);
                }

                debug(storingen);
                log(`@${context.from.username} <= ${storingen.Gepland.length} gepland, ${storingen.Ongepland.length} ongepland`);
                resolve(
                    storingen.Gepland.map(geplandToString).concat(
                        storingen.Ongepland.map(ongeplandToString))
                );
            });
        });

    }

    getReisadvies(context: Message, from: string, to: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.nsApi.reisadvies({fromStation: from, toStation: to}, (err, advies) => {
                if (err) {
                    return err.api && err.api.message ? resolve([err.api.message]) : reject(err);
                }

                log(`@${context.from.username} <= ${JSON.stringify(advies)}`);

                // TODO Advies type

                resolve(['done']);
            });
        });
    }
}

function geplandToString(storing: StoringGepland) {
    return `Geplande werkzaamheden ${storing.Periode} op traject ${storing.Traject}`;
}

function ongeplandToString(storing: StoringOngepland) {
    return storing.Bericht.split('\r').join('\n');
}
