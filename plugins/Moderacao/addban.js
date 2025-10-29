import { loadBlacklist, saveBlacklist } from '../../main.js'; // Importa as funções de salvar/carregar

export default {
    command: ["addban", "banmanual", "preban"],
    description: "Adiciona manualmente um número de telefone (JID) à blacklist.",

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            // 1. Verifica se quem usou é admin
            if (!chatId.endsWith('@g.us')) {
                return await sock.sendMessage(chatId, { text: 'Este comando só pode ser usado em grupos.' }, { quoted: msg });
            }
            const metadata = await sock.groupMetadata(chatId);
            const senderId = msg.key.participant;
            const senderIsAdmin = metadata.participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));
            
            if (!senderIsAdmin) {
                return await sock.sendMessage(chatId, { text: '🚫 Apenas administradores podem adicionar banimentos manualmente.' }, { quoted: msg });
            }

            // 2. Pega e formata o número
            let targetNumber = args[0];
            if (!targetNumber) {
                return await sock.sendMessage(chatId, { text: "❓ Por favor, digite o número (JID) que deseja banir.\n*Exemplo:* `!addban 551199998888`" }, { quoted: msg });
            }

            // Limpa o número de caracteres extras (como @, +, -, espaços)
            targetNumber = targetNumber.replace(/@/g, '').replace(/-/g, '').replace(/ /g, '').replace(/\+/g, '').trim();

            // Adiciona o sufixo padrão do WhatsApp
            if (!targetNumber.endsWith('@s.whatsapp.net')) {
                targetNumber += '@s.whatsapp.net';
            }

            // Validação final (vê se tem números antes do @)
            if (!/^\d+@s\.whatsapp\.net$/.test(targetNumber)) {
                 return await sock.sendMessage(chatId, { text: `Formato de número inválido. Use apenas os números, como: \`551199998888\`` }, { quoted: msg });
            }

            // 3. Adiciona à Blacklist
            const blacklist = loadBlacklist();
            if (blacklist.includes(targetNumber)) {
                return await sock.sendMessage(chatId, { text: `⚠️ Este número (${targetNumber}) já está na blacklist.` }, { quoted: msg });
            }

            blacklist.push(targetNumber);
            saveBlacklist(blacklist); // Salva o arquivo

            // 4. Resposta de Sucesso
            await sock.sendMessage(chatId, { text: `✅ O número \`${targetNumber}\` foi adicionado à blacklist com sucesso.\nEsta pessoa não poderá entrar nos grupos onde eu estiver.` }, { quoted: msg });

        } catch (e) {
            console.error("Erro no comando !addban:", e);
            await sock.sendMessage(chatId, { text: "⚠️ Ocorreu um erro ao tentar adicionar o banimento manual." });
        }
    }
};