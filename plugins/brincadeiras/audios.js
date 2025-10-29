import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuração dos Áudios ---
// Mapeie o COMANDO (apelido) ao NOME DO ARQUIVO
// Eu já preenchi com os arquivos da sua foto!
const audioMap = {
    'apagoupq': 'apagoupq.mp3',
    'atestado': 'atestado.mp3',
    'batatinha2': 'batatinha2.mp3',
    'batatinhafrita': 'batatinhafrita.mp3',
    'feio': 'feio.mp3',
    'grupo1': 'grupo1.mp3',
    'oxegostei': 'oxegostei.mp3',
    'saiproblema': 'saiproblema.mp3',
    'saiudogp': 'saiudogp.mp3',
    'tecnologico': 'tecnologico.mp3',
    'tiringa': 'tiringa.mp3', // Cuidado com Maiúsculas/Minúsculas!
    'trabalhanego': 'trabalhanego.mp3',
    'xoudaxuxa': 'xoudaxuxa.mp3',
    'vidadoszoto': 'vidadoszoto.mp3', // Você tinha esse na foto também
    'xovendoai': 'xovendoai.mp3' // E esse
    // Verifique se o nome do arquivo 'Tiringa.mp3' está com 'T' maiúsculo mesmo
};
// ---------------------------------

// --- Lógica do Plugin (Não precisa mexer) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Define o caminho para a pasta /media/audios/
const audioDir = path.join(__dirname, '../../media/audios');

export default {
    // O comando será TODAS as chaves que você definiu no audioMap
    command: Object.keys(audioMap), 
    description: 'Envia um áudio de meme divertido.',

    async run(sock, msg, args) {
        // Descobre qual comando foi usado
        const commandUsed = (msg.message?.conversation || msg.message?.extendedTextMessage?.text)
            ?.split(' ')[0].slice(1).toLowerCase();

        const fileName = audioMap[commandUsed];
        if (!fileName) return; // Se o comando não estiver no mapa, ignora

        const filePath = path.join(audioDir, fileName);

        // Verifica se o arquivo de áudio realmente existe
        if (fs.existsSync(filePath)) {
            try {
                // Envia o áudio
                await sock.sendMessage(msg.key.remoteJid, {
                    audio: { url: filePath },
                    mimetype: 'audio/mp4', // M4A/MP3/Opus usam isso
                    ptt: true // ESSENCIAL: envia como mensagem de voz!
                }, { quoted: msg });
            } catch (e) {
                console.error(`[AudioMeme] Erro ao enviar áudio ${fileName}:`, e);
                await sock.sendMessage(msg.key.remoteJid, { text: '😥 Erro ao enviar esse áudio.' }, { quoted: msg });
            }
        } else {
            // Avisa no console e no chat se o arquivo não for encontrado
            console.error(`[AudioMeme] Arquivo de áudio não encontrado: ${filePath}`);
            await sock.sendMessage(msg.key.remoteJid, { text: `😥 Ih, esqueci onde guardei esse áudio... Avise um admin que o arquivo "${fileName}" está faltando!` }, { quoted: msg });
        }
    }
};