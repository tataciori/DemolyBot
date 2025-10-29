import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

export default {
    command: ['s', 'sticker', 'figu'], 
    
    run: async (sock, msg, args) => {
        try {
            const stickerMetadata = {
                pack: 'DemolyBot+',
                author: 'Criado por KA',
                type: StickerTypes.FULL, 
                quality: 50,
            };

            // ===== ESTA PARTE É A CORRETA =====
            if (args.includes('c') || args.includes('crop')) {
                stickerMetadata.type = StickerTypes.CROP;
            } else if (args.includes('r') || args.includes('circulo')) {
                stickerMetadata.type = StickerTypes.CIRCLE; // <<< AQUI ESTÁ O CÍRCULO
            }
            // ===================================

            let mediaBuffer;
            if (msg.message?.imageMessage || msg.message?.videoMessage) {
                mediaBuffer = await downloadMediaMessage(msg, 'buffer');
            } 
            else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage) {
                const fakeMsg = { 
                    key: {
                        remoteJid: msg.key.remoteJid,
                        id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                        participant: msg.message.extendedTextMessage.contextInfo.participant
                    },
                    message: msg.message.extendedTextMessage.contextInfo.quotedMessage
                };
                mediaBuffer = await downloadMediaMessage(fakeMsg, 'buffer');
            } else {
                return await sock.sendMessage(msg.key.remoteJid, { text: 'Por favor, envie ou responda a uma imagem ou vídeo com o comando !s' }, { quoted: msg });
            }
            
            const sticker = new Sticker(mediaBuffer, stickerMetadata);
            await sock.sendMessage(msg.key.remoteJid, await sticker.toMessage());

        } catch (error) {
            console.error('❌ Erro ao criar a figurinha:', error);
            await sock.sendMessage(msg.key.remoteJid, { text: '❌ Ocorreu um erro ao criar a figurinha.' }, { quoted: msg });
        }
    },
};