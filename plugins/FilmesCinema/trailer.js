import yts from 'yt-search';
import config from '../../config.js'; 

export default {
    command: ["trailer", "ytfilme"],
    description: "Busca o trailer oficial de um filme no YouTube e envia o link.",

    async run(sock, msg, args) { 
        const chatId = msg.key.remoteJid; 
        const query = args.join(" "); 

        if (!query) {
            return await sock.sendMessage(chatId, { 
                text: `🎬 Por favor, digite o nome do filme que deseja buscar o trailer.\nExemplo: *!trailer Interestelar*` 
            }, { quoted: msg });
        }

        try {
            await sock.sendMessage(chatId, { text: `🔎 Buscando trailer para "${query}"...` }, { quoted: msg }); 

            // Faz a busca no YouTube pelo nome + "trailer oficial"
            const search = await yts(`${query} trailer oficial legendado`); 
            
            // Pega o primeiro resultado
            const video = search.videos[0]; 

            if (!video) {
                return await sock.sendMessage(chatId, { text: `😕 Nenhum trailer encontrado para "${query}".` }, { quoted: msg });
            }

            // Monta a resposta
            const responseText = `
*🎬 Trailer Encontrado!*

*Título:* ${video.title}
*Duração:* ${video.timestamp}
*Canal:* ${video.author.name}

*Link:*
${video.url}
            `.trim();

            // Envia a thumbnail (foto) do vídeo com a legenda
            await sock.sendMessage(chatId, { 
                image: { url: video.thumbnail },
                caption: responseText 
            }, { quoted: msg });

        } catch (err) {
            console.error("Erro no comando !trailer:", err);
            await sock.sendMessage(chatId, { text: "❌ Ocorreu um erro ao buscar o trailer." }, { quoted: msg });
        }
    }
};