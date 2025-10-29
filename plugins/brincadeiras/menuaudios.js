import fs from 'fs';
import path from 'path';
import config from '../../config.js';
// Importamos o plugin de áudios para LER a lista de comandos
// O caminho pode precisar de ajuste dependendo de onde você salvou os arquivos
import audioPlugin from '../Brincadeiras/audios.js'; 

export default {
    command: ["menuaudios", "audios", "listaaudios"],
    description: "Lista todos os comandos de áudio de meme disponíveis.",

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            const prefix = config.prefix || '!';
            
            // Pega a lista de comandos (as chaves) de dentro do plugin de áudios
            const listaDeComandos = audioPlugin.command || [];

            if (listaDeComandos.length === 0) {
                return await sock.sendMessage(chatId, { text: 'Nenhum áudio de meme configurado no momento.' });
            }

            // Monta o texto do menu de áudios
            const texto = `
🔊 *『 MENU DE ÁUDIOS 』* 🔊

Use o prefixo (\`${prefix}\`) + o nome do áudio para enviar:

${listaDeComandos.map(cmd => `• ${prefix}${cmd}`).join('\n')}
            `.trim();

            await sock.sendMessage(chatId, { text: texto });

        } catch (e) {
            console.error("Erro no menuaudios:", e);
            await sock.sendMessage(chatId, { text: '⚠️ Erro ao exibir o menu de áudios.' });
        }
    }
};