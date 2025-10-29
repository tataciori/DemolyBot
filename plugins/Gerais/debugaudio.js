import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// O caminho exato que o bot está procurando
const audioDir = path.join(__dirname, '../../media/audios');

export default {
    command: ["debugaudio", "testeaudio"],
    description: "Verifica a pasta de áudios e lista os arquivos encontrados.",

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            let responseText = `🕵️ *Detetive de Áudios Ativado* 🕵️\n\n`;
            responseText += `Estou procurando pela pasta de áudios no seguinte caminho:\n\`${audioDir}\`\n\n`;

            // 1. Verifica se a pasta /media existe
            const mediaDir = path.join(__dirname, '../../media');
            if (!fs.existsSync(mediaDir)) {
                responseText += `❌ *ERRO GRAVE:* A pasta \`/media/\` não foi encontrada na raiz do bot!\n\n`;
                responseText += `*Solução:* Crie uma pasta chamada \`media\` na pasta principal do bot.`;
                return await sock.sendMessage(chatId, { text: responseText });
            }

            // 2. Verifica se a pasta /media/audios existe
            if (!fs.existsSync(audioDir)) {
                responseText += `❌ *ERRO GRAVE:* A pasta \`/media/audios/\` não foi encontrada!\n\n`;
                responseText += `*Solução:* Entre na pasta \`media\` e crie uma pasta chamada \`audios\` (com 's').`;
                return await sock.sendMessage(chatId, { text: responseText });
            }

            // 3. Se a pasta existe, lista o que tem dentro
            responseText += `✅ Pasta \`/media/audios/\` encontrada!\n\n`;
            const files = fs.readdirSync(audioDir);

            if (files.length === 0) {
                responseText += `📂 A pasta está **vazia**.\n\n`;
                responseText += `*Solução:* Copie seus arquivos .mp3 (como atestado.mp3) para dentro dela.`;
            } else {
                responseText += `📂 *Arquivos encontrados na pasta:* \n`;
                responseText += files.map(file => `• ${file}`).join('\n');
                responseText += `\n\n*Próximo Passo:* Verifique se esses nomes de arquivo são **IDÊNTICOS** aos nomes que você colocou no 'audioMap' do \`audios.js\`.`;
            }

            await sock.sendMessage(chatId, { text: responseText });

        } catch (e) {
            console.error("Erro no !debugaudio:", e);
            await sock.sendMessage(chatId, { text: "⚠️ Ocorreu um erro ao rodar o detetive." });
        }
    }
};