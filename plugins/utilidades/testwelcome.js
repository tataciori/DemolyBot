import { carregarGruposConfig, carregarWelcomeConfig } from '../../main.js';

export default {
    command: ["testwelcome", "previewwelcome"],
    description: "Mostra uma prévia da mensagem de boas-vindas configurada para este grupo.",

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            // Verifica se está em um grupo
            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: '❌ Este comando só funciona em grupos.' }, { quoted: msg });
            }

            // Pega o ID de quem usou o comando para simular o @usuario
            const senderId = msg.key.participant || msg.key.remoteJid; 
            const senderName = msg.pushName || senderId.split('@')[0]; // Nome para simulação

            await sock.sendMessage(chatId, { text: `🔍 Verificando configurações de boas-vindas para este grupo...` }, { quoted: msg });

            // Carrega as duas configurações
            const gruposConfig = carregarGruposConfig();
            const welcomeConfig = carregarWelcomeConfig();
            const configGrupo = gruposConfig[chatId] || {};
            const configPersonalizada = welcomeConfig[chatId];

            let welcomeMessage = null;
            let messageType = "Nenhuma configurada";

            // 1. Verifica a configuração personalizada (com imagem)
            if (configPersonalizada?.personalizado === true) {
                messageType = "Personalizada (welcome-config.json)";
                welcomeMessage = configPersonalizada.mensagem || "Mensagem personalizada vazia.";
                // Adiciona info sobre a imagem
                if (configPersonalizada.imagem) {
                    welcomeMessage += `\n(Com imagem: ${configPersonalizada.imagem})`;
                }
            } 
            // 2. Se não houver personalizada, verifica a simples (do !setwelcome)
            else if (configGrupo.mensagem) {
                 messageType = "Simples (!setwelcome)";
                 welcomeMessage = configGrupo.mensagem;
            }

            // Monta a resposta final
            let responseText = `🔧 *Preview da Mensagem de Boas-Vindas*\n\n*Tipo Ativo:* ${messageType}\n\n`;

            if (welcomeMessage) {
                // Substitui @usuario pelo nome de quem pediu o teste
                const preview = welcomeMessage.replace(/@usuario/gi, `@${senderId.split('@')[0]} (${senderName})`);
                responseText += `*Mensagem:* \n${preview}`;
            } else {
                responseText += `*Mensagem:* Nenhuma mensagem de boas-vindas está ativa para este grupo.\n\nUse \`!setwelcome [mensagem]\` ou configure o \`welcome-config.json\`.`;
            }

            await sock.sendMessage(chatId, { text: responseText, mentions: [senderId] }, { quoted: msg });


        } catch (e) {
            console.error("Erro no comando !testwelcome:", e);
            await sock.sendMessage(chatId, { text: "⚠️ Ocorreu um erro ao verificar as boas-vindas." });
        }
    }
};