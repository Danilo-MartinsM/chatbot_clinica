// Criamos um script isolado só para investigar a API do Google
const chaveAPI = "AIzaSyA4mQA2vF8JSnNspsQD-GlXt7a21L7f2dc";

console.log("🔍 Perguntando ao Google quais modelos existem...");

// Fazemos uma requisição GET direta para a rota de listagem de modelos deles
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${chaveAPI}`)
    .then(resposta => resposta.json())
    .then(dados => {
        // Filtramos a resposta gigante para mostrar só os nomes dos modelos que geram texto
        const nomesDosModelos = dados.models
            .filter(modelo => modelo.supportedGenerationMethods.includes("generateContent"))
            .map(modelo => modelo.name);
            
        console.log("✅ Modelos liberados para você usar:");
        console.log(nomesDosModelos);
    })
    .catch(erro => console.log("Erro ao buscar:", erro));