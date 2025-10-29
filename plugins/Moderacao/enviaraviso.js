import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // <<< FALTAVA IMPORTAR ISSO
import config from '../../config.js'; 
import { isBotAdmin } from '../utils/checkAdmin.js'; 

const __filename = fileURLToPath(import.meta.url); // <<< AGORA FUNCIONA
const __dirname = path.dirname(__filename);
const avisosFilePath = path.join(__dirname, '../../avisos.json'); 

function carregarAvisos() {
    try {
        if (fs.existsSync(avisosFilePath)) {
            return JSON.parse(fs.readFileSync(avisosFilePath, 'utf8'));
        }
    } catch (e) { console.error("Erro ao carregar avisos.json:", e); }
    return {}; 
}

export default {
    command: ["enviaraviso", "aviso"], 
    description: "Envia um aviso pré-definido para o grupo (somente admins).",

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: '❌ Comando apenas para grupos.' }, { quoted: msg });
            }

            const metadata = await sock.groupMetadata(chatId);
            const senderId = msg.key.participant;
            const senderIsAdmin = metadata.participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));
            
            if (!senderIsAdmin) {
                return await sock.sendMessage(chatId, { text: '🚫 Apenas administradores podem usar este comando.' }, { quoted: msg });
            }

            const avisoApelido = args[0]?.toLowerCase();
            const avisos = carregarAvisos(); 
            
            if (!avisoApelido) {
                const avisosDoGrupo = avisos[chatId];
                let responseText = `📢 *Avisos Disponíveis para este Grupo:*\n\n`;
                if (avisosDoGrupo && Object.keys(avisosDoGrupo).length > 0) {
                     responseText += Object.keys(avisosDoGrupo).map(apelido => `• \`${config.prefix || '!'}enviaraviso ${apelido}\``).join('\n');
                } else {
                     responseText += "Nenhum aviso pré-definido encontrado para este grupo.";
                }
                 responseText += `\n\nUse o comando seguido pelo nome do aviso.`;
                 return await sock.sendMessage(chatId, { text: responseText }, { quoted: msg });
            }

            const avisoText = avisos[chatId]?.[avisoApelido]; 

            if (avisoText) {
                 const formattedAviso = `📢 *AVISO DA ADMINISTRAÇÃO*\n-----------------------------------\n\n${avisoText}`;
                 await sock.sendMessage(chatId, { text: formattedAviso });
            } else {
                 await sock.sendMessage(chatId, { text: `❌ Aviso "${avisoApelido}" não encontrado para este grupo.` }, { quoted: msg });
            }

        } catch (e) {
            console.error("Erro no comando !enviaraviso:", e);
            await sock.sendMessage(chatId, { text: "⚠️ Ocorreu um erro ao tentar enviar o aviso." });
        }
    }
};