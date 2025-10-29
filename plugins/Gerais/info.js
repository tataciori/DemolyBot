export default {
  command: ['info'],
  run: async (sock, msg) => {
    const from = msg.key.remoteJid
    await sock.sendMessage(from, { text: '💜 DemolyBot+ Wake Me Up v1.0\n⚡ Bot online e funcionando!' }, { quoted: msg })
  }
}
