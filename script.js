// 1. O JavaScript pega os elementos da tela usando as etiquetas (IDs) que criamos
    const campoMensagem = document.getElementById('campo-mensagem');
    const botaoEnviar = document.getElementById('botao-enviar');
    const areaMensagens = document.getElementById('area-mensagens');

    // 2. Colocamos um "vigia" no botão para escutar quando ele for clicado ('click')
    botaoEnviar.addEventListener('click', function() {
        
        // 3. Pegamos o texto que o usuário digitou e guardamos na variável 'texto'
        const texto = campoMensagem.value;

        // 4. Verificamos se o texto não está vazio (para não enviar balões em branco)
        if (texto !== "") {
            
            // 5. Criamos o exato mesmo HTML do balão azul da Clínica que você já conhece
            const novoBalao = `
                <div class="d-flex flex-column align-items-end mb-3">
                    <small class="text-muted mb-1">Clínica - Agora</small>
                    <div class="p-2 bg-primary text-white rounded shadow-sm" style="max-width: 75%;">
                        ${texto}
                    </div>
                </div>
            `;

            // 6. Injetamos (adicionamos) esse novo balão lá na área de mensagens
            areaMensagens.innerHTML = areaMensagens.innerHTML + novoBalao;

            // 7. Limpamos a caixa de texto para a próxima mensagem
            campoMensagem.value = "";
            
            // 8. Rolamos a tela automaticamente para baixo para ver a nova mensagem
            areaMensagens.scrollTop = areaMensagens.scrollHeight;
        }
    });