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


