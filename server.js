// 1. Nós importamos o 'Express' que acabamos de instalar
const express = require('express');

// 2. Nós inicializamos o Express e guardamos na variável 'app'
const app = express();

// 3. Nós dizemos ao nosso servidor para entender mensagens no formato JSON
app.use(express.json());

// 4. Criamos uma "Rota" de teste. Se alguém bater na porta principal ('/'), o servidor responde.
app.get('/', function(requisicao, resposta) {
    resposta.send('Olá! O servidor da clínica está rodando e pronto para receber mensagens.');
});

// 5. Nós mandamos o servidor ligar e ficar escutando na porta 3000
app.listen(3000, function() {
    console.log('Servidor rodando na porta 3000! 🚀');
});