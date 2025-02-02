
interface ITemplateParameters {
    numfacture: string,
    today: string,
    days: string,
    ht: string,
    tva: string,
    month: string,
    ttc: string,
    monthend: string,
}

export class TemplateParameters {
    numfacture: string;
    today: string;
    days: string;
    ht: string;
    tva: string;
    month: string;
    ttc: string;
    monthend: string;

    constructor(params: ITemplateParameters) {
        this.numfacture = params.numfacture;
        this.today = params.today;
        this.days = params.days;
        this.ht = params.ht;
        this.tva = params.tva;
        this.month = params.month;
        this.ttc = params.ttc;
        this.monthend = params.monthend;
    }
}