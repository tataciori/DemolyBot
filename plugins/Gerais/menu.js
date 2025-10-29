import config from '../../config.js'; 

export default {
    command: ["menu", "help", "comandos", "ajuda"],
    description: "Exibe o menu principal completo do bot.",

    async run(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        try {
            // Informações dinâmicas
            const senderName = msg.pushName || msg.key.participant?.split('@')[0] || 'Usuário';
            const prefix = config.prefix || '!';
            const now = new Date();
            const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const data = now.toLocaleDateString('pt-BR');

            // Monta o texto do menu no estilo Cyber Mode
            const menuText = `
╭━━━━━━━◇◆◇━━━━━━━╮
│ 👾   ＤＥＭＯＬＹＢＯＴ＋   👾
│────────────────────────────
│ 💀 Olá, ${senderName}.
│ 🕒 ${hora} | 📅 ${data}
│ ⚡ Prefixo atual: ${prefix}
│────────────────────────────
│    🎮 ＤＩＶＥＲＳÃＯ ＆ ＪＯＧＯＳ
│────────────────────────────
│ 💘 ${prefix}casaldodia
│ 🎭 ${prefix}desafio
│ ⚔️ ${prefix}duelo
│ 🧠 ${prefix}quiz
│ 🎰 ${prefix}roleta
│ 🤔 ${prefix}simounao
│ 🗣️ ${prefix}verdade
│ ⚔️ ${prefix}ppt (pedra/papel/tesoura)
│ 📊 ${prefix}menuranks → _Lista de Ranks_
│ 🔊 ${prefix}menuaudios → _Lista de Áudios Meme_
│────────────────────────────
│    🎬 ＦＩＬＭＥＳ ＆ ＣＩＮＥＭＡ
│────────────────────────────
│ 🎥 ${prefix}filme [nome+ano]
│ 🎭 ${prefix}ator [nome]
│ ⭐ ${prefix}imdb [nome+ano]
│ 🗨️ ${prefix}frasefilme [nome]
│ 🎞️ ${prefix}trailer [nome] → _Buscar trailer no YT_
│────────────────────────────
│    🛠️ ＵＴＩＬＩＤＡＤＥＳ
│────────────────────────────
│ 🧩 ${prefix}s (img/vid) → _Figurinha_
│ 🖼️ ${prefix}s c/r → _Fig. Quadrada/Redonda_
│ 🎵 ${prefix}tomp3 (video) → _Vídeo p/ Áudio_
│ 🔗 ${prefix}drive [link] → _Baixar do GDrive_
│ 🎶 ${prefix}play [nome/link] → _Baixar Música YT_
│ 🎞️ ${prefix}video [nome/link] → _Baixar Vídeo YT_
│ ⚡ ${prefix}ping → _Testar velocidade_
│ ℹ️ ${prefix}info → _Dados do bot_
│ 🆔 ${prefix}id → _ID do grupo/chat_
│ 📖 ${prefix}livro [nome] → _Busca dados de um livro_
│────────────────────────────
│    👮‍♂️ ＭＯＤＥＲＡÇÃＯ (Admins)
│────────────────────────────
│ 🚫 ${prefix}ban @user
│ 👋 ${prefix}kick @user
│ ✅ ${prefix}unban @user
│ 📋 ${prefix}listanegra → _Ver lista de banidos_
│ ✍️ ${prefix}addban [número] → _Banir número manualmente_
│ ⚠️ ${prefix}advertir @user
│ 🔍 ${prefix}veradv (@user)
│ ♻️ ${prefix}resetadv (@user)
│ 💬 ${prefix}setwelcome [msg] → _Definir boas-vindas_
│ ❌ ${prefix}delwelcome → _Remover boas-vindas_
│ 👋 ${prefix}setbye [msg /// msg2] → _Definir despedida(s)_  <-- ADICIONADO AQUI
│ 🗑️ ${prefix}delbye → _Remover despedida_            <-- ADICIONADO AQUI
│ 🔒 ${prefix}fechargp
│ 🔓 ${prefix}abrirgp
│ ⏰ ${prefix}grupoauto on/off → _Abrir/Fechar Auto._
│ 👑 ${prefix}promover @user
│ 🚶‍♂️ ${prefix}rebaixar @user
│ 🤖 ${prefix}antibot on/off
│ 🔗 ${prefix}antilink on/off
│ 🌍 ${prefix}antifake on/off
│ 📜 ${prefix}regras set [txt]
│ 🔄 ${prefix}regrasauto on/off
│ 📢 ${prefix}itotag [msg] → _Marcar todos_
│ ✏️ ${prefix}nomegp [nome] → _Mudar nome_
│ 📝 ${prefix}setdesc [desc] → _Mudar descrição_
│ 📣 ${prefix}enviaraviso [nome] → _Enviar aviso pronto_
│────────────────────────────
│    👥 ＧＲＵＰＯ ＆ ＬＩＮＫＳ
│────────────────────────────
│ 🔗 ${prefix}linkgp → _Link de convite_
│ ✨ ${prefix}revogar → _Novo link (Admin)_
│ 📜 ${prefix}regras → _Ver regras_
│ 👀 ${prefix}verdesc → _Ver descrição_
│ 🎉 ${prefix}sorteio [prêmio] → _Criar sorteio (Admin)_
╰━━━━━━━◇◆◇━━━━━━━╯
`;

            await sock.sendMessage(chatId, { text: menuText });

        } catch (e) {
            console.error("Erro ao gerar o menu principal:", e);
            await sock.sendMessage(chatId, { text: "⚠️ Ocorreu um erro ao exibir o menu." });
        }
    }
};