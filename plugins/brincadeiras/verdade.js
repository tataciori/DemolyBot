import config from '../../config.js';

export default {
    command: ['verdade', 'truth'],
    description: 'Pergunta aleatória do jogo da verdade.',
    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            const perguntas = [
                'Qual foi a maior vergonha que você já passou na frente de outras pessoas?',
                'Qual é o seu maior segredo, um que você nunca contou para ninguém?',
                'Se você pudesse ser invisível por um dia, qual a primeira coisa que você faria?',
                'Você já teve um crush secreto em alguém deste grupo?',
                'Qual hábito ruim você gostaria de mudar em si mesmo(a)?',
                'Qual foi a mentira mais cabeluda que você já contou e deu certo?',
                'Se você ganhasse na loteria amanhã, qual seria sua primeira compra extravagante?',
                'Qual a coisa mais estranha que você já comeu?',
                'Qual o seu maior medo irracional?',
                'Se você pudesse trocar de vida com alguém por um dia, quem seria e por quê?'
            ];
            
            const pick = perguntas[Math.floor(Math.random() * perguntas.length)];
            
            await sock.sendMessage(chatId, { text: `🗣️ *Hora da Verdade!*\n\nResponda com sinceridade:\n*${pick}*` });

        } catch (err) {
            console.error('Erro em verdade:', err);
            await sock.sendMessage(chatId, { text: '⚠️ Erro ao enviar a pergunta.' });
        }
    }
};