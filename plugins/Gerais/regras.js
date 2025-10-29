// Importa as funções de carregar e salvar do seu arquivo principal
// O caminho '../..' sobe duas pastas (de /Gerais para /plugins, e de /plugins para a raiz)
import { carregarGruposConfig, salvarGruposConfig } from '../../main.js';

export default {
    command: ["regras", "rules"],
    description: "Define ou exibe as regras do grupo.",
    
    async run(sock, msg, args) {
        const remoteJid = msg.key.remoteJid;

        // Se o comando não for usado em um grupo, avise o usuário.
        if (!remoteJid.endsWith('@g.us')) {
            await sock.sendMessage(remoteJid, { text: "Este comando só pode ser usado em grupos." }, { quoted: msg });
            return;
        }

        const subCommand = args[0]?.toLowerCase();
        
        // --- LÓGICA PARA DEFINIR AS REGRAS (SÓ ADMINS) ---
        if (subCommand === 'set' || subCommand === 'definir') {
            const senderId = msg.key.participant || msg.key.remoteJid;
            const groupMetadata = await sock.groupMetadata(remoteJid);
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
            
            // Verifica se o autor da mensagem é admin
            if (!admins.includes(senderId)) {
                await sock.sendMessage(remoteJid, { text: "❌ Apenas administradores podem definir as regras." }, { quoted: msg });
                return;
            }

            const novasRegras = args.slice(1).join(' ');
            if (!novasRegras) {
                await sock.sendMessage(remoteJid, { text: "✍️ Por favor, digite as regras após o comando.\nExemplo: *!regras set Regra 1: ...*" }, { quoted: msg });
                return;
            }

            const gruposConfig = carregarGruposConfig();
            if (!gruposConfig[remoteJid]) {
                gruposConfig[remoteJid] = {};
            }
            gruposConfig[remoteJid].regras = novasRegras;
            salvarGruposConfig(gruposConfig);

            await sock.sendMessage(remoteJid, { text: "✅ Regras do grupo atualizadas com sucesso!" }, { quoted: msg });

        // --- LÓGICA PARA EXIBIR AS REGRAS (TODOS OS MEMBROS) ---
        } else {
            const gruposConfig = carregarGruposConfig();
            const configGrupo = gruposConfig[remoteJid] || {};

            if (configGrupo.regras) {
                const textoRegras = `📜 *REGRAS DO GRUPO*\n\n${configGrupo.regras}`;
                await sock.sendMessage(remoteJid, { text: textoRegras });
            } else {
                await sock.sendMessage(remoteJid, { text: "ℹ️ As regras para este grupo ainda não foram definidas. Peça para um administrador usar o comando *!regras set [texto das regras]*." }, { quoted: msg });
            }
        }
    }
};