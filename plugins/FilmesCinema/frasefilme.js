import fetch from "node-fetch";
import config from '../../config.js';

// Pega a chave de API do seu arquivo config.js
const TMDB_API_KEY = config.tmdbApiKey;

export default {
    command: ["frasefilme", "quote"],
    description: "Busca a tagline (frase de efeito) de um filme.",

    async run(sock, msg, args) { // Assinatura corrigida
        const chatId = msg.key.remoteJid; // Forma correta de pegar o ID
        const nome = args.join(" ");

        if (!nome) {
            return await sock.sendMessage(chatId, { text: "🗨️ Por favor, digite o nome de um filme.\nExemplo: *!frasefilme Batman O Cavaleiro das Trevas*" });
        }

        try {
            // Passo 1: Buscar o filme para encontrar o ID
            const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(nome)}&language=pt-BR`);
            const searchData = await searchRes.json();

            if (!searchData.results || searchData.results.length === 0) {
                return await sock.sendMessage(chatId, { text: `😕 Nenhum filme encontrado com o nome "${nome}".` });
            }

            const filmeInfo = searchData.results[0];
            const filmeId = filmeInfo.id;

            // Passo 2: Buscar os detalhes do filme usando o ID para pegar a "tagline"
            const detailsRes = await fetch(`https://api.themoviedb.org/3/movie/${filmeId}?api_key=${TMDB_API_KEY}&language=pt-BR`);
            const detailsData = await detailsRes.json();

            // A 'tagline' é a frase de efeito do filme. Se não existir, o comando avisará.
            const frase = detailsData.tagline;

            if (!frase) {
                 return await sock.sendMessage(chatId, { text: `🎬 *${filmeInfo.title}*\n\n🗨️ Nenhuma frase de efeito (tagline) encontrada para este filme.` });
            }
            
            const texto = `🎬 *${filmeInfo.title}*\n\n*Frase de Efeito:*\n_"${frase}"_`;
            
            await sock.sendMessage(chatId, { text: texto });

        } catch (err) {
            console.error("Erro no comando !frasefilme:", err);
            await sock.sendMessage(chatId, { text: "❌ Ocorreu um erro ao buscar a frase do filme." });
        }
    }
};