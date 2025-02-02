import axios from 'axios';
//const publicKey = "project_public_cd408e0217f04ced824fb2a04131f600_WM-eX5de7b7825d2ff0331b888f9200901b5c";

const service = {
    defaultServer: 'api.ilovepdf.com',
    processServer: null,
    publicKey: process.env.ILOVEPDF_KEY,
    token: null,
    taskId : null,
    server_filename : null,

    methods : {
        authenticate : async () => {
            const { data } = await axios.post(`https://${service.defaultServer}/v1/auth`, { public_key: "project_public_cd408e0217f04ced824fb2a04131f600_WM-eX5de7b7825d2ff0331b888f9200901b5c" });
            service.token = data.token;
            return data.token;
        },
        getOfficePDFTask : async () => {
            const { data } = await axios.get(`https://${service.defaultServer}/v1/start/officepdf`, { headers: { "Authorization": `Bearer ${service.token}` } });
            service.processServer = data.server;
            service.taskId = data.task;
            return data;
        },
        nextTask : async (toolName, param) => {
            const { data } = await axios.post(`https://${service.processServer}/v1/task/next`, { task: service.taskId, tool: toolName, conformance: param }, { headers: { "Authorization": `Bearer ${service.token}` } });
            return data.token;
        },
        upload : async (file) => {
            const { data } = await axios.post(`https://${service.processServer}/v1/upload`, {
                    task: service.taskId,
                    file: file,
                }, {
                    headers: {
                        "Authorization": `Bearer ${service.token}`,
                        "Content-Type": "multipart/form-data"
                    }
                });
            service.server_filename = data.server_filename;
            return data.server_filename;
        },
        process : async (toolName, filename) => {
            const { data } = await axios.post(`https://${service.processServer}/v1/process`, {
                    task: service.taskId,
                    tool: toolName,
                    files: [
                        { 
                            server_filename: service.server_filename, 
                            filename: filename 
                        }
                    ],
                    metas: {
                        Title: filename,
                        Author: "Maxime Sangoï - 835 204 686 00017",
                        Subject: "Facture " + filename.slice(0,4) + "-" + filename.slice(4,6),
                        CreationDate: new Date().toLocaleDateString()
                    }
                }, 
                {
                    headers: {"Authorization": `Bearer ${service.token}` }
                });
            return data.status;
        },
        download : async () => {
            const { data } = await axios.request({
                method: 'GET',
                url: `https://${service.processServer}/v1/download/${service.taskId}`,
                responseType: 'stream',
                headers: { "Authorization": `Bearer ${service.token}` }
            });
            return data;
        },
    }
}





export default service.methods;