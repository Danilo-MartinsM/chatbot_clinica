// 1. Nós importamos o 'Express' que acabamos de instalar
const express = require('express');
const cors = require('cors'); // 1. Importamos o pacote CORS

// 2. Nós inicializamos o Express e guardamos na variável 'app'
const app = express();

app.use(cors()); // 2. Avisamos o servidor: "Aceite requisições de qualquer navegador"

// 3. Nós dizemos ao nosso servidor para entender mensagens no formato JSON
app.use(express.json());

// 4. Criamos uma "Rota" de teste. Se alguém bater na porta principal ('/'), o servidor responde.
app.get('/', function(requisicao, resposta) {
    resposta.send('Olá! O servidor da clínica está rodando e pronto para receber mensagens.');
});

// A nossa campainha (Webhook). Esperamos um POST no endereço '/webhook'
app.post('/webhook', function(requisicao, resposta) {
    
    // 1. Abrimos o "pacote" JSON que chegou e pegamos os dados
    const dadosRecebidos = requisicao.body;
    const numeroPaciente = dadosRecebidos.numero;
    const textoMensagem = dadosRecebidos.mensagem;

    // 2. Mostramos no terminal do VS Code quem mandou e o quê
    console.log(`\n🔔 Nova mensagem recebida!`);
    console.log(`Paciente: ${numeroPaciente}`);
    console.log(`Mensagem: ${textoMensagem}`);

    // 3. Avisamos ao sistema do WhatsApp que recebemos o pacote (Status 200 = OK)
    resposta.status(200).send('Mensagem recebida com sucesso!');
});

// 5. Nós mandamos o servidor ligar e ficar escutando na porta 3000
app.listen(3000, function() {
    console.log('Servidor rodando na porta 3000! 🚀');
});