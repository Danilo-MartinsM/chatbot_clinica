// 1. A primeira linha do código DEVE ser o dotenv abrindo o cofre
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 2. Nós buscamos a chave lá do arquivo .env usando o 'process.env'
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.post('/webhook', async function(requisicao, resposta) {
    const textoMensagem = requisicao.body.mensagem;

    try {
        // 3. Buscamos o nome do modelo lá do .env também
        const modelo = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

        const systemPrompt = `Você é a assistente virtual de uma clínica médica.
        Seu tom é profissional, gentil e direto.
        Regra 1: Você NUNCA dá diagnósticos ou conselhos médicos.
        Regra 2: Você responde apenas sobre agendamentos, preparo de exames e convênios.
        Regra 3: Os convênios aceitos são Unimed, Bradesco e SulAmérica.
        Mensagem do paciente: ${textoMensagem}`;

        const resultadoIA = await modelo.generateContent(systemPrompt);
        const respostaDoBot = resultadoIA.response.text();

        resposta.status(200).json({ texto: respostaDoBot });
    
    } catch (erro) {
        console.log("❌ Erro na IA:", erro);
        resposta.status(500).send('Erro interno do servidor');
    }
});

// 4. Buscamos a porta do .env. Se o .env falhar por algum motivo, ele usa a 3000 como backup (o || significa OU)
const porta = process.env.PORTA_SERVIDOR || 3000;

app.listen(porta, function() {
    console.log(`Servidor profissional rodando seguro na porta ${porta}! 🚀`);
});