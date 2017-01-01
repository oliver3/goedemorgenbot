// Type definitions for ns-api
// Project: https://github.com/fvdm/nodejs-ns-api
// Definitions by: Oliver Verver <https://github.com/oliver3>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'ns-api-types' {

    interface Storingen {
        Gepland: StoringGepland[];
        Ongepland: StoringOngepland[];
    }

    interface StoringGepland {
        id: string;
        Traject: string;
        Periode: string;
        Reden: string;
        Advies: string;
        Bericht: string;
    }

    interface StoringOngepland {
        id: string;
        Traject: string;
        Reden: string;
        Bericht: string;
    }

    type Advies = ReisMogelijkheid[];

    interface ReisMogelijkheid {
        Meldingen?: any[]; //TODO
        AantalOverstappen: string // number
        GeplandeReisTijd: string; // "0:39"
        ActueleReisTijd?: string; // "0:39"
        VertrekVertraging?: string; // "+5 min"
        AankomstVertraging?: string; // "+5 min"
        Optimaal: string; // boolean
        GeplandeVertrekTijd: string; // ISO "2016-12-27T12:32:00+0100"
        ActueleVertrekTijd: string; // ISO "2016-12-27T12:32:00+0100"
        GeplandeAankomstTijd: string; // ISO "2016-12-27T13:11:00+0100"
        ActueleAankomstTijd: string; // ISO "2016-12-27T13:11:00+0100"
        Status?: "VOLGENS-PLAN"|"GEWIJZIGD"|"VERTRAAGD"|"NIEUW"|"NIET-OPTIMAAL"|"NIET-MOGELIJK"|"PLAN-GEWIJZIGD";
        ReisDeel: ReisDeel[];
    }

    interface ReisDeel {
        reisSoort: string; // attribute, "TRAIN"
        Vervoerder: string; //"NS"
        VervoerType: string; //"Sprinter"
        RitNummer: string; //"6938"
        Status?: "VOLGENS-PLAN"|"GEANNULEERD"|"GEWIJZIGD"|"OVERSTAP-NIET-MOGELIJK"|"VERTRAAGD"|"NIEUW";
        ReisStop: ReisStop[];
        ReisDetails: string[] // ?? TODO
    }

    interface ReisStop {
        Naam: string; // "Utrecht Centraal"
        Tijd: string; // "2016-12-27T12:53:00+0100"
        Spoor?: string; // "7",
        SpoorWijziging?: boolean; // attribute op Spoor
        VertrekVertraging?: string; // "+5 min"
    }

}

declare module 'ns-api' {
    import { Storingen, Advies } from "ns-api-types";

    type Callback<T> = (err: any, data: T) => void;

    class NsApi {
        constructor(conf: {username: string, password: string, timeout?: number})
        // vertrektijden: (station: string, callback<Vertrektijden>) => void,
        reisadvies: (params: {
            fromStation: string,
            toStation: string,
            viaStation?: string,
            previousAdvices?: number, // default & max 5
            nextAdvices?: number, // default & max 5
            dateTime?: string // ISO8601
            Departure?: boolean // true: vertrek, false: aankomst
            hslAllowed?: boolean // default true
            yearCard?: boolean // default false, true geeft meer (duurdere) opties
        }, callback: Callback<Advies>) => void;
        // prijzen: methodPrijzen,
        // stations: methodStations,
        storingen: (params: {
            station?: string,
            actual?: boolean,
            unplanned?: boolean
        }, callback: Callback<Storingen>) => void;
    }

    export = NsApi;
}

