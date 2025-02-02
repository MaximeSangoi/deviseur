interface IFacture {
    name?: string,
    version?: string,
    totalTTC? : number,
    tva?: number,
    date? : Date,
    versions?: Array<Facture>,
    month?: string
}

export class Facture {
    name: string | null;
    version: string | null;
    totalTTC : number | null;
    tva: number | null;
    date : Date | null;
    versions: Facture[];
    month: string | null;

    constructor(facture?: IFacture) {
        this.name = facture?.name ?? null;
        this.version = this.name?.split('.')[0].slice(-4) ?? null;
        this.totalTTC = facture?.totalTTC ?? null;
        this.tva = facture?.tva ?? null;
        this.date = facture?.date ?? null;
        this.versions = facture?.versions ?? [];
        this.month = facture?.month ?? null;
    }
}