import template from './services/template-service';
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import ILovePDFApi from '@ilovepdf/ilovepdf-nodejs'
import ILovePDFFile from '@ilovepdf/ilovepdf-nodejs/ILovePDFFile.js'
import { DateTime } from 'luxon';
import { Facture } from './models/facture';
import { AxiosError } from 'axios';
import { parseStringPromise } from 'xml2js';

const app = express()
app.use(cors())
app.use(bodyParser.json())
const port = 3000

app.post('/generate', async (req, res) => {
    const clientFolder = process.env.CLIENT_FOLDER as string;
    const pathToTemplateFile = path.resolve(clientFolder, "templates", "Facture-template.docx")
    await template.replaceInTemplate(pathToTemplateFile, "Facture-template-remplie.docx", req.body.templateParameters);
    const instance = new ILovePDFApi(process.env.ILOVEAPI_PUBLIC as string, process.env.ILOVEAPI_SECRET as string);

    const task = instance.newTask('officepdf');
    try{
        await task.start();
        const file = new ILovePDFFile(path.resolve(clientFolder, "templates", "Facture-template-remplie.docx"))
        await task.addFile(file);
        await task.process();
        //const data = await task.download();
        const filename = await template.recursive_getVersion(`2025${req.body.monthIndex}-FINZZLEDIGITAL-0001.pdf`);
        const filepath = path.resolve(clientFolder, "factures", filename);
        const data = await task.download();
    
        fs.writeFileSync(filepath, Buffer.from(data));
        const taskArchive = instance.newTask('pdfa');
        await taskArchive.start();
        const fileArchive = new ILovePDFFile(filepath);
        await taskArchive.addFile(fileArchive)
        await taskArchive.process();
        const dataArchive = await taskArchive.download();
        fs.unlinkSync(filepath);
        fs.writeFileSync(filepath, Buffer.from(dataArchive));

        res.download(filepath, filename, (error) => console.error(error ?? 'no error'));
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error(error.response?.data);
            throw new Error("Impossible de générer le PDF : \n\n" + error?.response?.data?.message);
        } else {
            console.error(error)
            throw new Error("Impossible de générer le PDF : \n\n" + error);
        }
    } 
});

app.post('/env', (req, res) => {
    process.env.CLIENT_FOLDER = req.body.clientFolder;
    res.send();
});

app.post('/templateXML', async (req, res) => {
    const templateFile = fs.readFileSync(process.env.CLIENT_FOLDER + '/templates/template.xml');
    const templateJSON = await parseStringPromise(templateFile);
    const company = templateJSON['rsm:CrossIndustryInvoice'][0]['ram:ApplicableHeaderTradeAgreement'][0]['ram:SellerTradeParty'][0];
    const client = templateJSON['rsm:CrossIndustryInvoice'][0]['ram:ApplicableHeaderTradeAgreement'][0]['ram:BuyerTradeParty'][0];

    company['ram:Name'][0] = req.body.company.name;
    company['ram:PostalTradeAddress'][0]['ram:LineOne'][0] = req.body.company.address.split('--')[0];
    company['ram:PostalTradeAddress'][0]['ram:CityName'][0] = req.body.company.address.split('--')[1];
    company['ram:SpecifiedTaxRegistration'][0]['ram:ID'][0] = req.body.company.tva;
    client['ram:PostalTradeAddress'][0]['ram:LineOne'][0] = req.body.client.address.split('--')[0];
    client['ram:PostalTradeAddress'][0]['ram:CityName'][0] = req.body.client.address.split('--')[1];
    client['ram:SpecifiedLegalOrganization'][0]['ram:ID'][0] = req.body.client.siret;
    client['ram:SpecifiedTaxRegistration'][1]['ram:ID'][0] = req.body.client.tva;
    client['ram:SpecifiedTaxRegistration'][2]['ram:ID'][0] = req.body.client.iban;
    res.send();
});

app.get('/templateXML', async (req, res) => {
    const templateFile = fs.readFileSync(process.env.CLIENT_FOLDER + '/templates/template.xml');
    const templateJSON = await parseStringPromise(templateFile);

    const company = templateJSON['rsm:CrossIndustryInvoice']['rsm:SupplyChainTradeTransaction'][0]['ram:ApplicableHeaderTradeAgreement'][0]['ram:SellerTradeParty'][0];
    const client = templateJSON['rsm:CrossIndustryInvoice']['rsm:SupplyChainTradeTransaction'][0]['ram:ApplicableHeaderTradeAgreement'][0]['ram:BuyerTradeParty'][0];
    const facture = templateJSON['rsm:CrossIndustryInvoice']['rsm:SupplyChainTradeTransaction'][0]['ram:IncludedSupplyChainTradeLineItem'][0];
    const payment = templateJSON['rsm:CrossIndustryInvoice']['rsm:SupplyChainTradeTransaction'][0]['ram:ApplicableHeaderTradeSettlement'][0]['ram:SpecifiedTradeSettlementPaymentMeans'][0];

    res.send({
        company: { 
            address: company['ram:PostalTradeAddress'][0]['ram:LineOne'][0] + ', ' + company['ram:PostalTradeAddress'][0]['ram:PostcodeCode'][0] + ', ' + company['ram:PostalTradeAddress'][0]['ram:CityName'][0],
            email: company['ram:DefinedTradeContact'][0]['ram:EmailURIUniversalCommunication'][0]['ram:URIID'][0]._,
            siret: company['ram:SpecifiedLegalOrganization'][0]['ram:ID'][0]._,
            tva: company['ram:SpecifiedTaxRegistration'][0]['ram:ID'][0]._,
            iban: payment['ram:PayeePartyCreditorFinancialAccount'][0]['ram:IBANID'][0],
            bic: payment['ram:PayeeSpecifiedCreditorFinancialInstitution'][0]['ram:BICID'][0]
        },
        client: {
            name: client['ram:Name'][0],
            address: client['ram:PostalTradeAddress'][0]['ram:LineOne'][0] + ', ' + client['ram:PostalTradeAddress'][0]['ram:PostcodeCode'][0] + ', ' + client['ram:PostalTradeAddress'][0]['ram:CityName'][0],
            siret: client['ram:SpecifiedLegalOrganization'][0]['ram:ID'][0]._,
            tjm: facture['ram:SpecifiedLineTradeAgreement'][0]['ram:NetPriceProductTradePrice'][0]['ram:ChargeAmount'][0],
            contact: client['ram:DefinedTradeContact'][0]['ram:PersonName'][0],
            email: client['ram:DefinedTradeContact'][0]['ram:EmailURIUniversalCommunication'][0]['ram:URIID'][0]._,
        },
    });
});

app.get('/factures', async (req, res) => {
    // TODO : get more factures
    const clientFolder = process.env.CLIENT_FOLDER as string;
    const facturesFilenames = fs.readdirSync(path.resolve(clientFolder, "factures")).sort();
    const facturesList = await Promise.all(facturesFilenames.map(async(filename) => await template.getPDFInfos(filename)));
    let monthOffset = 1;
    if (facturesList[facturesList.length - 1].date?.month === DateTime.now().month) {
        monthOffset = 0;
    }
    const monthList = Array.from({length: 4}).map((val, index) => (new Facture ({
        date : DateTime.now().minus({months: index + monthOffset}).startOf('month').toLocal(), 
    })));
    facturesList.forEach(facture => {
        const month = monthList.find(month => month.date?.month === facture.date?.month);
        if (month) {
            if (month.name) {
                month.versions.push(new Facture({
                    date: month.date!,
                    name: month.name,
                    totalTTC: month.totalTTC!,
                    tva: month.tva!
                }))
            }
            month.name = facture.name;
            month.totalTTC = facture.totalTTC;
            month.tva = facture.tva;
            month.version = facture.version;
        }
    })
    
    res.send(monthList.map(m => ({ ...m, date: m.date?.toJSDate() })).sort((a,b) => a.date?.getTime()! - b.date?.getTime()!));
});

app.listen(port, () => {
    console.info(`DEVISEUR API on port ${port}`)
});


