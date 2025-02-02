import { DateTime } from "luxon";

interface IFacture {
    name?: string,
    version?: string,
    totalTTC? : number,
    tva?: number,
    date? : DateTime,
    versions?: Array<Facture>
}

export class Facture {
    name: string | null;
    version: string | null;
    totalTTC : number | null;
    tva: number | null;
    date : DateTime | null;
    versions: Array<Facture>;

    constructor(facture?: IFacture) {
        this.name = facture?.name ?? null;
        this.version = this.name?.split('.')[0].slice(-4) ?? null;
        this.totalTTC = facture?.totalTTC ?? null;
        this.tva = facture?.tva ?? null;
        this.date = facture?.date ?? null;
        this.versions = facture?.versions ?? [];
    }
}