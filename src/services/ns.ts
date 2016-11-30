import NsApi = require('ns-api');
import * as Promise from 'bluebird';
import { StoringGepland } from 'ns-api-types';
import { StoringOngepland } from 'ns-api-types';
import { Storingen } from 'ns-api-types';
import { log, debug } from '../common/log';

export default class NsService {
    private nsApi: NsApi;

    constructor(config: {username: string, password: string}) {
        this.nsApi = new NsApi(config);
    }

    getStoringen(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.nsApi.storingen({station: 'ut'}, (err:any, storingen: Storingen) => {
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
}


function geplandToString(storing: StoringGepland) {
    return `Geplande werkzaamheden ${storing.Periode} op traject ${storing.Traject}`;
}

function ongeplandToString(storing: StoringOngepland) {
    return storing.Bericht.split('\r').join('\n');
}
