import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import fs, { promises as fsPromises } from 'fs';
import path, { dirname } from 'path';
import pdf from "pdf-parse";
import { DateTime } from 'luxon';
import { Facture } from '../models/facture';
import { TemplateParameters } from '../models/templateParameters';

const service = {
    methods : {
        replaceInTemplate : async (inputFilePath: string, outputFilename: string, templateParameters: TemplateParameters) => {
            const content = fs.readFileSync(
                    inputFilePath,
                    "binary"
                );
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
                delimiters: {
                    start: '<<',
                    end: '>>'
                }
            });
            try {
                doc.render({
                    numfacture: templateParameters.numfacture,
                    today: templateParameters.today,
                    days: templateParameters.days,
                    ht: templateParameters.ht,
                    tva: templateParameters.tva,
                    month: templateParameters.month,
                    ttc: templateParameters.ttc,
                    monthend: templateParameters.monthend,
                });
            } catch(error: any) {

                if (error.properties && error.properties.errors instanceof Array) {
                    const errorMessages = error.properties.errors.map((err: {}) => error.properties.explanation).join("\n")
                    console.log("errorMessages", errorMessages);
                }
                throw error;
            }
            
            const buf = doc.getZip().generate({
                type: "nodebuffer",
                compression: "DEFLATE",
            });
            fs.writeFileSync(path.resolve(dirname(inputFilePath), outputFilename), buf);
            const docx_completed = fs.createReadStream(path.resolve(dirname(inputFilePath), outputFilename));
            return docx_completed;
        },

        recursive_getVersion : async (filename: string):Promise<string> => {
            const stat = await fsPromises.stat(path.resolve(process.env.CLIENT_FOLDER as string, "factures", filename)).catch(() => filename);
            if ((stat as fs.Stats).size > 0) {
                const [filenameWithoutExtension, extension] = filename.split('.');
                const oldVersion = filenameWithoutExtension.slice(-4);
                const newVersionAsString = ("0000" + ((+oldVersion) + 1)).slice(-4);
                const newFilename = filenameWithoutExtension.substring(0, filenameWithoutExtension.length-4) + newVersionAsString + '.' + extension;
                return await service.methods.recursive_getVersion(newFilename);
            } else {
                return filename
            }
        },

        getPDFInfos: async (filename: string) => {
            const filePath = path.resolve(process.env.CLIENT_FOLDER as string, "factures", filename);
            let dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            const totalTTC = parseFloat(data.text.split("Total TTC :")[1].split("€")[0]);
            const dateMonth = filename.substring(0,4) + '-' + filename.substring(4,6);
            return new Facture({ name: filename, date: DateTime.fromISO(dateMonth), totalTTC: totalTTC, versions: [] })
        }
    }
}





export default service.methods;