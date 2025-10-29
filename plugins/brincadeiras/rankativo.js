import { carregarGruposConfig } from '../../main.js'; // Precisamos ler onde a contagem está salva

export default {
    command: ["rankativo", "topativos", "maisativos"],
    description: "Mostra o ranking dos membros mais ativos no grupo.",

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: '❌ Este comando só funciona em grupos.' });
            }

            const gruposConfig = carregarGruposConfig();
            // Verifica se existe contagem salva para este grupo
            const contagemGrupo = gruposConfig[chatId]?.messageCount;

            if (!contagemGrupo || Object.keys(contagemGrupo).length === 0) {
                return await sock.sendMessage(chatId, { text: '📊 Ainda não há dados suficientes para gerar o ranking de atividade.' });
            }

            // Pega os metadados para ter os nomes atuais (embora não usemos neste exemplo simples)
            const metadata = await sock.groupMetadata(chatId);

            // Transforma o objeto de contagem em um array e ordena
            const rankingArray = Object.entries(contagemGrupo)
                // Formato: [ [userId, count], [userId, count], ... ]
                .sort(([, countA], [, countB]) => countB - countA) // Ordena do maior para o menor
                .slice(0, 10); // Pega apenas os Top 10

            if (rankingArray.length === 0) {
                 return await sock.sendMessage(chatId, { text: '📊 Ranking vazio.' });
            }

            // Monta o texto do ranking
            let textoRank = `🏆 *RANKING DE ATIVIDADE - TOP ${rankingArray.length}* 🏆\n\nQuem mais contribuiu com mensagens:\n\n`;
            let mentions = [];

            rankingArray.forEach(([userId, count], index) => {
                const medalhas = ["🥇", "🥈", "🥉"];
                const medalha = index < 3 ? medalhas[index] : ` ${index + 1}.`;
                textoRank += `${medalha} @${userId.split('@')[0]} - ${count} mensagens\n`;
                mentions.push(userId);
            });

            await sock.sendMessage(chatId, { text: textoRank, mentions: mentions });

        } catch (e) {
            console.error("Erro no comando !rankativo:", e);
            await sock.sendMessage(chatId, { text: "⚠️ Ocorreu um erro ao gerar o ranking de atividade." });
        }
    }
};