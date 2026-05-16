// 1. Abrimos o arquivo .env para carregar as variáveis de ambiente na memória
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 2. Importamos o motor do Postgres (pg) e o adaptador exigido pelo Prisma 7
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

// 3. Criamos a piscina de conexões apontando para a URL oculta no seu .env
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 4. Instanciamos o adaptador do Prisma passando essa piscina do Postgres
const adapter = new PrismaPg(pool);

// 5. CORREÇÃO AQUI: Passamos o adaptador para dentro das opções do PrismaClient
const prisma = new PrismaClient({ adapter: adapter });

// 6. Inicializamos a IA do Google com a sua chave secreta
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// --- ROTA GET: Recupera o histórico de conversas do banco ---
app.get('/historico/:numero', async function(requisicao, resposta) {
    // Pegamos o identificador do paciente que veio na URL (ex: PainelWeb)
    const numeroDoPaciente = requisicao.params.numero;

    try {
        // O Prisma busca todas as linhas onde o numeroPaciente seja igual ao solicitado
        const historico = await prisma.historicoConversas.findMany({
            where: {
                numeroPaciente: numeroDoPaciente
            },
            orderBy: {
                criadoEm: 'asc' // Organiza as mensagens da mais antiga para a mais recente
            }
        });

        // Devolvemos a lista encontrada em formato JSON para o front-end
        resposta.status(200).json(historico);

    } catch (erro) {
        console.log("❌ Erro ao buscar histórico:", erro);
        resposta.status(500).send('Erro ao buscar histórico no banco');
    }
});

// --- ROTA POST: O Webhook que recebe novas mensagens e chama a IA ---
app.post('/webhook', async function(requisicao, response) {
    const dadosRecebidos = requisicao.body;
    const numeroPaciente = dadosRecebidos.numero;
    const textoMensagem = dadosRecebidos.mensagem;

    console.log(`\n🔔 Paciente disse: "${textoMensagem}"`);

    try {
        // 1. Salva a mensagem atual do paciente no banco
        await prisma.historicoConversas.create({
            data: { numeroPaciente, remetente: 'paciente', mensagem: textoMensagem }
        });

        // 2. BUSCA AS ÚLTIMAS CONVERSAS: Pegamos os últimos 6 registros para dar contexto à IA
        const conversasAnteriores = await prisma.historicoConversas.findMany({
            where: { numeroPaciente: numeroPaciente },
            orderBy: { criadoEm: 'desc' }, // Pegamos as mais recentes primeiro
            take: 6 // Limita a busca para não sobrecarregar a IA com textos gigantes
        });

        // Como pegamos as mais recentes (desc), precisamos inverter para mandar na ordem cronológica certa (1, 2, 3...)
        conversasAnteriores.reverse();

        // 3. MONTA O HISTÓRICO EM TEXTO: Transforma o array do banco em um texto legível para a IA
        let textoDoHistorico = "";
        conversasAnteriores.forEach(conv => {
            textoDoHistorico += `${conv.remetente === 'paciente' ? 'Paciente' : 'Assistente'}: ${conv.mensagem}\n`;
        });

        // 4. O SYSTEM PROMPT EVOLUÍDO: Agora a IA lê o passado e o presente
        const modelo = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
                const systemPrompt = `Você é a assistente virtual de uma clínica médica.
                Seu tom é profissional, gentil e direto.
                Regra 1: Você NUNCA dá diagnósticos médicos.
                Regra 2: Você responde apenas sobre agendamentos, exames e convênios.
                Regra 3: Os convênios aceitos são Unimed, Bradesco e SulAmérica.

                Abaixo está o histórico recente desta conversa para você se situar. Use-o para entender o contexto (como nomes ou exames já citados), mas responda APENAS à última mensagem do paciente.

                HISTÓRICO DA CONVERSA:
                ${textoDoHistorico}
                Última mensagem do paciente para você responder agora: ${textoMensagem}`;

                // 5. Chama o Gemini
                const resultadoIA = await modelo.generateContent(systemPrompt);
                const respostaDoBot = resultadoIA.response.text();

                // 6. Salva a resposta da IA no banco
                await prisma.historicoConversas.create({
                    data: { numeroPaciente, remetente: 'ia', mensagem: respostaDoBot }
                });

                console.log(`🤖 IA respondeu com contexto: "${respostaDoBot}"`);
                response.status(200).json({ texto: respostaDoBot });
            
            } catch (erro) {
                console.log("❌ Erro no processamento:", erro);
                response.status(500).send('Erro interno do servidor');
            }
        });

// Iniciamos o servidor na porta definida no .env ou na porta 3000 como plano B
const porta = process.env.PORTA_SERVIDOR || 3000;
app.listen(porta, function() {
    console.log(`Servidor de nível corporativo rodando na porta ${porta}! 🚀`);
});