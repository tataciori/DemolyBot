import fetch from 'node-fetch';
import config from '../../config.js';

// Função auxiliar para baixar do Google Drive
async function fdrivedl(url) {
    let id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1];
    if (!id) throw new Error('Não foi possível extrair o ID do arquivo do link.');

    let res = await fetch(`https://drive.google.com/uc?id=${id}&export=download&confirm=t`, {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Cookie': 'DRIVE_STREAM=1'
        }
    });

    let newUrl = res.headers.get('location');
    if (newUrl) {
        let _res = await fetch(newUrl);
        let cookies = _res.headers.get('set-cookie').split(',').map(c => c.split(';')[0]).join(';');
        let _data = await fetch(newUrl, { headers: { 'cookie': cookies } });
        let fileName = _data.headers.get('content-disposition').split('filename=')[1].split(';')[0].replace(/"/g, '');
        let mimetype = _data.headers.get('content-type');
        let sizeBytes = _data.headers.get('content-length');
        return { downloadUrl: newUrl, fileName, sizeBytes, mimetype };
    }

    let fileName = res.headers.get('content-disposition').split('filename=')[1].split(';')[0].replace(/"/g, '');
    let mimetype = res.headers.get('content-type');
    let sizeBytes = res.headers.get('content-length');
    return { downloadUrl: res.url, fileName, sizeBytes, mimetype };
}

// Função auxiliar para formatar o tamanho do arquivo
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export default {
    command: ["drive", "gdrive", "drivedl"],
    description: "Baixa um arquivo do Google Drive a partir de um link.",

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        const url = args[0];

        if (!url || !url.match(/drive\.google\.com\/file/i)) {
            return await sock.sendMessage(chatId, { text: `🔗 Por favor, envie um link válido de um arquivo do Google Drive.` }, { quoted: msg });
        }

        try {
            await sock.sendMessage(chatId, { text: "📥 Baixando arquivo do Google Drive, aguarde..." }, { quoted: msg });
            
            const res = await fdrivedl(url);
            const fileSize = parseFloat(res.sizeBytes);

            if (fileSize > 200 * 1024 * 1024) { // Limite de 200 MB
                return await sock.sendMessage(chatId, { text: `❌ Arquivo muito grande (${formatBytes(fileSize)}). O limite para este comando é de 200 MB.` }, { quoted: msg });
            }

            const caption = `
✅ *Download do Google Drive Concluído!*

📄 *Nome:* ${res.fileName}
📊 *Tamanho:* ${formatBytes(fileSize)}
`.trim();

            await sock.sendMessage(chatId, {
                document: { url: res.downloadUrl },
                fileName: res.fileName,
                mimetype: res.mimetype,
                caption: caption
            }, { quoted: msg });

        } catch (e) {
            console.error("Erro no comando !drive:", e);
            await sock.sendMessage(chatId, { text: `❌ Ocorreu um erro ao baixar o arquivo: ${e.message}. Verifique se o link é público.` }, { quoted: msg });
        }
    }
};