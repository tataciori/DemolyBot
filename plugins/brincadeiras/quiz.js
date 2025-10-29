import config from '../../config.js';
import quizData from '../../data/quiz.json' with { type: 'json' };

export default {
    command: ['quiz', 'pergunta'],
    description: 'Envia uma pergunta de conhecimentos gerais.',
    
    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            if (!Array.isArray(quizData) || quizData.length === 0) {
                return await sock.sendMessage(chatId, { text: '⚠️ Nenhuma pergunta disponível no arquivo de quiz. Peça para o dono do bot adicionar.' });
            }

            const item = quizData[Math.floor(Math.random() * quizData.length)];
            
            // O código atual envia a pergunta e a resposta juntas.
            // No futuro, podemos alterar para o bot esperar a resposta do usuário!
            const textoQuiz = `🧠 *QUIZ DO DEMOLYBOT+*\n\n*Pergunta:*\n${item.q}\n\n*Resposta:*\n||${item.a}||`;

            await sock.sendMessage(chatId, { text: textoQuiz });

        } catch (err) {
            // Este erro vai acontecer se o arquivo data/quiz.json não for encontrado
            if (err.code === 'ERR_MODULE_NOT_FOUND') {
                console.error('❌ Erro no Quiz: O arquivo data/quiz.json não foi encontrado!');
                await sock.sendMessage(chatId, { text: '⚠️ Arquivo de perguntas do quiz não encontrado.' });
            } else {
                console.error('Erro em quiz:', err);
                await sock.sendMessage(chatId, { text: '⚠️ Erro ao executar o quiz.' });
            }
        }
    }
};