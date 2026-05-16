// 1. O JavaScript pega os elementos da tela usando as etiquetas (IDs) que criamos
    const campoMensagem = document.getElementById('campo-mensagem');
    const botaoEnviar = document.getElementById('botao-enviar');
    const areaMensagens = document.getElementById('area-mensagens');

    // 2. Colocamos um "vigia" no botão para escutar quando ele for clicado ('click')
    // 1. Colocamos o "async" aqui porque o front-end vai ter que esperar o backend pensar
botaoEnviar.addEventListener('click', async function() {
    
    const texto = campoMensagem.value;

    if (texto !== "") {
        
        // 2. Desenhamos IMEDIATAMENTE o balão cinza do Paciente na tela
        const balaoPaciente = `
            <div class="d-flex flex-column align-items-start mb-3">
                <small class="text-muted mb-1">Você - Agora</small>
                <div class="p-2 bg-white border rounded shadow-sm" style="max-width: 75%;">
                    ${texto}
                </div>
            </div>
        `;
        areaMensagens.innerHTML = areaMensagens.innerHTML + balaoPaciente;
        campoMensagem.value = "";
        areaMensagens.scrollTop = areaMensagens.scrollHeight;

        // --- A MÁGICA DA INTEGRAÇÃO COMEÇA AQUI ---
        try {
            const respostaServidor = await fetch('http://localhost:3000/webhook', {
                // ... seu fetch continua igual ...
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ numero: "PainelWeb", mensagem: texto })
            });

            const dados = await respostaServidor.json();
            const falaDaIA = dados.texto; 

            // -- A MUDANÇA ACONTECE AQUI --
            // 1. O 'marked.parse()' pega o texto cru da IA e transforma em código HTML puro (com listas, negritos, etc)
            const falaTraduzidaHTML = marked.parse(falaDaIA);

            // 2. Usamos a variável traduzida dentro do balão
            const balaoIA = `
                <div class="d-flex flex-column align-items-end mb-3">
                    <small class="text-muted mb-1">IA Aurora - Agora</small>
                    <div class="p-2 bg-primary text-white rounded shadow-sm" style="max-width: 75%;">
                        ${falaTraduzidaHTML}
                    </div>
                </div>
            `;
            
            areaMensagens.innerHTML = areaMensagens.innerHTML + balaoIA;
            areaMensagens.scrollTop = areaMensagens.scrollHeight;

        } catch (erro) {
            console.error("Erro ao falar com o servidor:", erro);
            alert("O servidor está desligado ou deu erro!");
        }
    }
});