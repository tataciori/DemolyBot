import fetch from 'node-fetch';
import yts from 'yt-search';
import config from '../../config.js'; // Importa nosso config.js

// Função auxiliar para obter buffer da thumbnail (se existir)
async function getThumbnailBuffer(url) {
    if (!url) return null;
    try {
        const resp = await fetch(url);
        if (!resp.ok) return null;
        // Usamos arrayBuffer e depois Buffer.from para compatibilidade
        const arrayBuffer = await resp.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (err) {
        console.log('Não foi possível obter a miniatura:', err.message);
        return null;
    }
}

export default {
    command: ["play", "musica", "tocar"], // Nossos comandos
    description: "Busca e envia uma música do YouTube usando APIs externas.",

    async run(sock, msg, args) { // Nossa assinatura de função
        const chatId = msg.key.remoteJid;
        const query = args.join(' ');
        const prefix = config.prefix || '!';

        if (!query) {
            // Mensagem de ajuda traduzida e adaptada
            const helpText = `
🎵 *${config.botName || 'DemolyBot+'} - Baixar Música* 🎵

*Como usar:*
• ${prefix}play [nome da música]

*Exemplos:*
• ${prefix}play unravel tokyo ghoul
• ${prefix}play crossing field

Encontre e baixe sua música favorita! ✨
            `.trim();
            return await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
        }

        try {
            await sock.sendMessage(chatId, { text: '⚡️ Procurando o áudio, aguarde...' }, { quoted: msg });

            const search = await yts(query);
            if (!search.videos.length) {
                return await sock.sendMessage(chatId, { text: '😕 Não encontrei resultados para sua busca.' }, { quoted: msg });
            }

            const video = search.videos[0];
            const { title, url, thumbnail } = video;

            // Tenta obter a thumbnail
            const thumbBuffer = await getThumbnailBuffer(thumbnail);

            // ===== APIs para obter o link de áudio MP3 (Lista do código original) =====
            const fontes = [
                { api: 'ZenzzXD', endpoint: `https://api.zenzapis.xyz/downloader/ytmp3?url=${encodeURIComponent(url)}&apikey=aed923b7a541`, extractor: res => res?.result?.url }, // API atualizada
                { api: 'ZenzzXD v2', endpoint: `https://api.zenzapis.xyz/downloader/ytmp3/2?url=${encodeURIComponent(url)}&apikey=aed923b7a541`, extractor: res => res?.result?.url }, // API atualizada
                { api: 'Vevioz', endpoint: `https://api.vevioz.com/api/button/mp3/${video.videoId}`, isHtml: true, extractor: (html) => html.match(/https:\/\/[^\s"]+\.mp3/)?.[0]}, // Vevioz que já usamos
                { api: 'Cobalt', endpoint: `https://co.wuk.sh/api/json`, isHtml: false, method: 'POST', body: JSON.stringify({ url: video.url, isAudioOnly: true }), headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}, extractor: (data) => data?.url }, // Cobalt que já usamos
                // Adicionei Vevioz e Cobalt aqui como backups extras caso as Zenzz falhem
            ];

            let audioUrl = null;
            let apiUsada = '';
            let exito = false;

            for (let fonte of fontes) {
                try {
                    console.log(`[Play API] Tentando com: ${fonte.api}`);
                    const options = { method: fonte.method || 'GET', headers: fonte.headers, body: fonte.body };
                    const response = await fetch(fonte.endpoint, options);
                    
                    if (!response.ok) {
                         console.warn(`[Play API] ${fonte.api} respondeu com status ${response.status}`);
                         continue; // Tenta a próxima API se esta falhar
                    }

                    const data = fonte.isHtml ? await response.text() : await response.json();
                    const link = fonte.extractor(data);

                    if (link && link.startsWith('http')) {
                        audioUrl = link;
                        apiUsada = fonte.api;
                        exito = true;
                        console.log(`[Play API] Sucesso com: ${fonte.api}`);
                        break; // Para o loop assim que encontrar um link válido
                    } else {
                         console.warn(`[Play API] ${fonte.api} não retornou um link válido.`);
                    }
                } catch (err) {
                    console.error(`[Play API] ⚠️ Erro ao tentar ${fonte.api}:`, err.message);
                }
            }

            if (!exito) {
                return await sock.sendMessage(chatId, { text: '🥲 Desculpe, não consegui obter o link de download de nenhuma fonte no momento. Tente novamente mais tarde.' }, { quoted: msg });
            }

            // Envia o áudio para o WhatsApp
            await sock.sendMessage(
                chatId,
                {
                    audio: { url: audioUrl },
                    mimetype: 'audio/mpeg', // Mimetype para MP3
                    ptt: false,
                    // Adiciona a thumbnail e informações extras usando contextInfo
                    contextInfo: {
                        externalAdReply: {
                            title: title,
                            body: `API: ${apiUsada} | ${config.botName || 'DemolyBot+'}`,
                            thumbnail: thumbBuffer, // Buffer da imagem
                            mediaType: 1, // 1 para imagem, 2 para vídeo
                            sourceUrl: url // Link do vídeo original
                        }
                    }
                },
                { quoted: msg }
            );

        } catch (e) {
            console.error('❌ Erro geral no comando !play:', e);
            await sock.sendMessage(chatId, { text: `❌ Ocorreu um erro: ${e.message}` }, { quoted: msg });
        }
    }
};