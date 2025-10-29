import fetch from "node-fetch";
import config from '../../config.js'; // Corrigido

const TMDB_API_KEY = config.tmdbApiKey; // Pega a chave do config.js

export default {
    command: ["ator", "atriz", "actor"],
    description: "Busca informações sobre um ator ou atriz.",

    async run(sock, msg, args) { // Assinatura corrigida
        const chatId = msg.key.remoteJid; // Forma correta de pegar o ID
        const nome = args.join(" ");

        if (!nome) {
            return await sock.sendMessage(chatId, { text: "🎭 Por favor, digite o nome de um ator ou atriz.\nExemplo: *!ator Wagner Moura*" });
        }

        try {
            const res = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(nome)}&language=pt-BR`);
            const data = await res.json();

            if (!data.results || data.results.length === 0) {
                return await sock.sendMessage(chatId, { text: `😕 Nenhum ator ou atriz encontrado(a) com o nome "${nome}".` });
            }

            const ator = data.results[0];
            const filmes = ator.known_for
                .map(f => `🎬 ${f.title || f.name || "Título não encontrado"}`)
                .join("\n");

            const texto = `*🎭 ${ator.name}*\n\n⭐ *Popularidade:* ${ator.popularity?.toFixed(1) || "N/A"}\n\n*🎞️ Conhecido(a) por:*\n${filmes || "Nenhuma obra encontrada."}`;
            
            // Lógica de envio corrigida
            if (ator.profile_path) {
                // Se tiver foto, envia imagem com legenda
                await sock.sendMessage(chatId, { 
                    image: { url: `https://image.tmdb.org/t/p/w500${ator.profile_path}` },
                    caption: texto 
                });
            } else {
                // Se não tiver foto, envia apenas o texto
                await sock.sendMessage(chatId, { text: texto });
            }

        } catch (err) {
            console.error("Erro no comando !ator:", err);
            await sock.sendMessage(chatId, { text: "❌ Ocorreu um erro ao buscar as informações. Tente novamente mais tarde." });
        }
    }
};