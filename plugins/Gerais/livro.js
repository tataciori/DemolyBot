import fetch from 'node-fetch';
import config from '../../config.js'; 

// Pega a chave do nosso config.js
const GOOGLE_BOOKS_KEY = config.googleBooksKey;

export default {
    command: ["livro", "book"],
    description: "Busca informações sobre um livro usando a Google Books API.",

    async run(sock, msg, args) { 
        const chatId = msg.key.remoteJid; 
        const query = args.join(" "); 

        if (!GOOGLE_BOOKS_KEY || GOOGLE_BOOKS_KEY === 'SUA_NOVA_CHAVE_DO_GOOGLE_AQUI') {
            return await sock.sendMessage(chatId, { text: "A API Key do Google Books não foi configurada no `config.js`." }, { quoted: msg });
        }

        if (!query) {
            return await sock.sendMessage(chatId, { 
                text: `📖 Por favor, digite o nome do livro que deseja buscar.\nExemplo: *!livro O Nome do Vento*` 
            }, { quoted: msg });
        }

        try {
            await sock.sendMessage(chatId, { text: `🔎 Buscando por "${query}" no Google Livros...` }, { quoted: msg }); 

            // Faz a busca na API
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_BOOKS_KEY}&lang=pt`);
            const data = await res.json();

            if (!data.items || data.items.length === 0) {
                return await sock.sendMessage(chatId, { text: `😕 Nenhum livro encontrado com o nome "${query}".` }, { quoted: msg });
            }

            const livro = data.items[0].volumeInfo; // Pega o primeiro resultado

            // --- Formata as informações ---
            const titulo = livro.title || "Título não encontrado";
            // Autores vêm como uma lista (array)
            const autores = livro.authors ? livro.authors.join(', ') : "Autor desconhecido";
            const dataPub = livro.publishedDate ? new Date(livro.publishedDate).toLocaleDateString('pt-BR') : "N/A";
            const paginas = livro.pageCount || "N/A";
            // Pega a capa (thumbnail)
            const capaUrl = livro.imageLinks?.thumbnail || livro.imageLinks?.smallThumbnail;
            // Limita a sinopse para não ficar gigante
            const sinopse = livro.description ? livro.description.slice(0, 400) + '...' : "Sem sinopse.";
            const nota = livro.averageRating ? `${livro.averageRating} ⭐` : "N/A";

            const textoResposta = `
*📖 ${titulo}*
*✍️ Autor(es):* ${autores}

*📅 Publicado em:* ${dataPub}
*📄 Páginas:* ${paginas}
*⭐ Nota Média:* ${nota}

*📝 Sinopse:*
${sinopse}
            `.trim();
            
            if (capaUrl) {
                // Se achou a capa, envia imagem com legenda
                await sock.sendMessage(chatId, { 
                    image: { url: capaUrl },
                    caption: textoResposta 
                }, { quoted: msg });
            } else {
                // Se não achou capa, envia só o texto
                await sock.sendMessage(chatId, { text: textoResposta }, { quoted: msg });
            }

        } catch (err) {
            console.error("Erro no comando !livro:", err);
            await sock.sendMessage(chatId, { text: "❌ Ocorreu um erro ao buscar as informações do livro." }, { quoted: msg });
        }
    }
};