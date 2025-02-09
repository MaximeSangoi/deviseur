interface IAppErrors {
    name?: string,
    message?: string,
}

export class AppErrors {
    name?: string | null;
    message?: string | null;

    constructor(error?: IAppErrors) {
        this.name = error?.name ?? null;
        this.message = error?.message ?? null;
    }
}