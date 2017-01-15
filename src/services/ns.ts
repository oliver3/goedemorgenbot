import NsApi = require('ns-api');
import * as Promise from 'bluebird';
import { StoringGepland } from 'ns-api-types';
import { StoringOngepland } from 'ns-api-types';
import { Storingen } from 'ns-api-types';
import { log, debug } from '../common/log';
import { Message } from 'telegram-api-types';
import { Advies } from 'ns-api-types';
import { ReisMogelijkheid } from 'ns-api-types';
import * as dateFns from 'date-fns';
import { ReisDeel } from 'ns-api-types';
import { ReisStop } from 'ns-api-types';

type CommandFunction = (msg: Message, ...args: string[]) => Promise<string[]>;

export function NsService(config: {username: string, password: string}) {
    const nsApi = new NsApi(config);

    const getStoringen = (context: Message): Promise<string[]> =>
        new Promise<string[]>((resolve, reject) => {
            nsApi.storingen({station: 'ut'}, (err: any, storingen: Storingen) => {
                if (err) {
                    return err.api && err.api.message ?
                        resolve([err.api.message]) :
                        reject(err)
                }

                debug(storingen);
                log(`@${context.from.username} <= ${storingen.Gepland.length} gepland, ${storingen.Ongepland.length} ongepland`);
                resolve(
                    storingen.Gepland.map(geplandToString).concat(
                        storingen.Ongepland.map(ongeplandToString))
                )
            })
        })


    function getReisadvies(context: Message, from: string, to: string): Promise<string[]> {
        const nrAdviezen = 3;

        return new Promise<string[]>((resolve, reject) => {
            nsApi.reisadvies({
                fromStation: from,
                toStation: to,
                previousAdvices: 0,
                nextAdvices: nrAdviezen
            }, (err, advies: Advies) => {
                if (err) {
                    return err.api && err.api.message ? resolve([err.api.message]) : reject(err);
                }

                resolve(advies
                    .splice(0, nrAdviezen)
                    .map(reisMogelijkheidToString));
            });
        });
    }

    function geplandToString(storing: StoringGepland) {
        return `Geplande werkzaamheden ${storing.Periode} op traject ${storing.Traject}`;
    }

    function ongeplandToString(storing: StoringOngepland) {
        return storing.Bericht.split('\r').join('\n');
    }

    function reisMogelijkheidToString(reis: ReisMogelijkheid): string {
        const vertrekTijd = tijdToString(reis.GeplandeVertrekTijd, reis.VertrekVertraging);
        const aankomstTijd = tijdToString(reis.GeplandeAankomstTijd, reis.AankomstVertraging);
        const reistijdActueel = reis.ActueleReisTijd;
        const overstappen = reis.AantalOverstappen;

        return [
            `<b>${vertrekTijd} - ${aankomstTijd} (${reistijdActueel}) ${overstappen}x</b>`,
        ]
            .concat(reis.Meldingen || [])
            .concat(reis.ReisDeel.map(reisDeelToString))
            .join('\n');
    }

    function reisDeelToString(reisDeel: ReisDeel): string {
        const vertrek = reisStopToString(reisDeel.ReisStop[0]);
        const aankomst = reisStopToString(reisDeel.ReisStop[reisDeel.ReisStop.length - 1]);

        return [
            `V ${vertrek}`,
            `    <i>${reisDeel.VervoerType}</i>`,
            `A ${aankomst}`
        ].join('\n');
    }

    function reisStopToString(reisStop: ReisStop): string {
        const tijd = tijdToString(reisStop.Tijd, reisStop.VertrekVertraging);
        const spoor = spoorToString(reisStop.Spoor, reisStop.SpoorWijziging);
        const station = stationToString(reisStop.Naam);

        return `<b>${tijd}</b>  sp ${spoor}  ${station}`
    }

    function tijdToString(tijd: string, vertraging?: string): string {
        if (tijd === undefined) {
            return '--:--';
        }

        // 'HH:mm'
        tijd = dateFns.format(dateFns.parse(tijd), 'HH:mm');

        // '+5'
        vertraging = vertraging === undefined ? '' : vertraging.replace(/ min$/, '');

        return `${tijd}${vertraging}`;
    }

    function spoorToString(spoor: string, gewijzigd: boolean) {
        return `${spoor} ${gewijzigd ? '(!)' : ''}`;
    }

    function stationToString(station: string) {
        return station
        // .replace('Lunetten', 'Lun.')
        // .replace('Centraal', 'C.');
    }

    function getCommands(): [string, CommandFunction][] {
        return [
            ['/storingen', getStoringen],
            ['/trein (\\w*) (\\w*)', getReisadvies]
        ]
    }

    return {
        getCommands
    };


}

