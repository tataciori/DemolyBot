import fetch from "node-fetch";
import config from '../../config.js'; // Importa o config

// Usa a chave de API do seu arquivo config.js
const TMDB_API_KEY = config.tmdbApiKey;

export default {
    command: ["filme", "movie"],
    description: "Busca informações sobre um filme.",

    async run(sock, msg, args) { // Assinatura da função corrigida
        const chatId = msg.key.remoteJid; // Pega o ID da forma correta
        const nome = args.join(" ");

        if (!nome) {
            return await sock.sendMessage(chatId, { text: "🎬 Por favor, digite o nome de um filme.\nExemplo: *!filme Interestelar*" });
        }

        try {
            const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(nome)}&language=pt-BR`);
            const data = await res.json();

            if (!data.results || data.results.length === 0) {
                return await sock.sendMessage(chatId, { text: `😕 Nenhum filme encontrado com o nome "${nome}".` });
            }

            const filme = data.results[0];
            
            // Formata a data para o padrão brasileiro
            const dataFormatada = filme.release_date ? new Date(filme.release_date).toLocaleDateString('pt-BR') : "N/A";

            const texto = `*🎬 ${filme.title}*\n\n*📅 Lançamento:* ${dataFormatada}\n*⭐ Nota Média:* ${filme.vote_average?.toFixed(1) || "N/A"}\n\n*📝 Sinopse:*\n${filme.overview || "Sem sinopse."}`;
            
            // Lógica de envio corrigida para não dar erro
            if (filme.poster_path) {
                // Se tiver pôster, envia imagem com legenda
                await sock.sendMessage(chatId, { 
                    image: { url: `https://image.tmdb.org/t/p/w500${filme.poster_path}` },
                    caption: texto 
                });
            } else {
                // Se não tiver pôster, envia apenas o texto
                await sock.sendMessage(chatId, { text: texto });
            }

        } catch (err) {
            console.error("Erro no comando !filme:", err);
            await sock.sendMessage(chatId, { text: "❌ Ocorreu um erro ao buscar as informações. Tente novamente mais tarde." });
        }
    }
};