// Type definitions for ns-api
// Project: https://github.com/fvdm/nodejs-ns-api
// Definitions by: Oliver Verver <https://github.com/oliver3>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'ns-api-types' {

    interface Storingen {
        Gepland: StoringGepland[],
        Ongepland: StoringOngepland[]
    }

    interface StoringGepland {
        id: string,
        Traject: string,
        Periode: string,
        Reden: string,
        Advies: string,
        Bericht: string
    }

    interface StoringOngepland {
        id: string,
        Traject: string,
        Reden: string,
        Bericht: string
    }


}

declare module 'ns-api' {
    import { Storingen } from "ns-api-types";

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
        }, callback: Callback<any>) => void;
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

