// 1. Efeito Parallax
const parallaxBg = document.querySelector('.parallax-bg');
window.addEventListener('scroll', () => {
    let scrollPosition = window.pageYOffset;
    parallaxBg.style.transform = `translateY(${scrollPosition * 0.4}px)`;
});

// 2. Intersection Observer
const revealElements = document.querySelectorAll('.reveal');
const revealOptions = { threshold: 0.02, rootMargin: "0px 0px -50px 0px" };
const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
    });
}, revealOptions);
revealElements.forEach(el => revealOnScroll.observe(el));

// ==========================================================
// CONFIGURAÇÕES DO CASAL (PREENCHA AQUI)
// ==========================================================

// Data e hora do casamento: new Date(ano, MÊS - 1, dia, hora, minuto)
// Atenção: o mês começa em 0 (janeiro = 0, dezembro = 11)
const weddingDate = new Date(2027, 11, 31, 18, 0, 0).getTime(); // TODO: data do casamento

// --- PIX ---
// Regra do Banco Central: sem acentos, sem cedilha, máximo 25 caracteres para o nome e 15 para a cidade
const PIX_KEY = "SUA_CHAVE_PIX";               // TODO: chave PIX (CPF, e-mail, telefone ou chave aleatória)
const nomeRecebedor = "NOME DO RECEBEDOR";     // TODO: nome do titular da chave
const cidadeRecebedor = "CIDADE";              // TODO: cidade do titular

// URL do Google Apps Script que registra os PIX gerados numa planilha.
// Deixe vazio ("") para não registrar.
const GOOGLE_SCRIPT_URL = ''; // TODO: URL da planilha do casal (opcional)

// ==========================================================

// 3. Contagem Regressiva
const timerInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = weddingDate - now;
    if (distance < 0) {
        clearInterval(timerInterval);
        document.querySelector('.countdown-container').innerHTML = "<h3>O grande dia chegou!</h3>";
        return;
    }
    document.getElementById("days").innerText = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
    document.getElementById("hours").innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
    document.getElementById("minutes").innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    document.getElementById("seconds").innerText = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
}, 1000);

// 4. Carrossel
const carouselInner = document.querySelector('.carousel-inner');
const carouselItems = document.querySelectorAll('.carousel-item');
let currentIndex = 0;
function showSlide(index) {
    if (index < 0) currentIndex = carouselItems.length - 1;
    else if (index >= carouselItems.length) currentIndex = 0;
    else currentIndex = index;
    carouselInner.style.transform = `translateX(${-currentIndex * 100}%)`;
}
document.getElementById('prevBtn').addEventListener('click', () => showSlide(currentIndex - 1));
document.getElementById('nextBtn').addEventListener('click', () => showSlide(currentIndex + 1));
setInterval(() => showSlide(currentIndex + 1), 5000);

// --- 7. Lógica de Busca de Presentes em Tempo Real ---
const searchInput = document.getElementById('search-input');

searchInput.addEventListener('input', (event) => {
    // Pega o texto digitado e converte para minúsculas
    const searchTerm = event.target.value.toLowerCase();
    
    // Filtra a lista original (giftsData)
    const filteredGifts = giftsData.filter(gift => {
        // Verifica se o título do presente contém o termo digitado
        return gift.title.toLowerCase().includes(searchTerm);
    });

    // Se não encontrar nada, mostra uma mensagem amigável
    if (filteredGifts.length === 0) {
        giftsContainer.innerHTML = `<p style="grid-column: 1 / -1; font-size: 1.1rem; color: #666;">Nenhum presente encontrado com o nome "${event.target.value}".</p>`;
    } else {
        // Renderiza novamente apenas os presentes filtrados
        renderGifts(filteredGifts);
    }
});

// 5. Dados dos Presentes Atualizados (Com descrições e links)
//
// PARÂMETRO "permitePix":
//   true  -> o convidado pode contribuir com uma parte do valor via PIX
//            (aparecem o botão "Contribuir com PIX" e a barra de arrecadação)
//   false -> o presente NÃO aceita contribuição parcial. Na tela do produto
//            aparece somente o botão "Comprar o item na loja".
//   Se o parâmetro for omitido, o presente aceita PIX (padrão).
const giftsData = [
    // Modelo de presente que aceita contribuição via PIX (mostra meta e barra de arrecadação)
    {
        id: 1,
        title: "Geladeira (modelo)",
        description: "Descrição modelo: conte por que esse presente é especial para o novo lar do casal.",
        price: 3000.00,
        raised: 0.00,                 // Quanto já foi arrecadado (atualize manualmente)
        image: "modelo-geladeira.jpg", // Arquivo nesta pasta ou link de uma imagem da internet
        storeLink: "#",                // Link do produto na loja ("#" = sem link)
        permitePix: true,
    },
    {
        id: 2,
        title: "Micro-ondas (modelo)",
        description: "",
        price: 800.00,
        raised: 400.00,
        image: "modelo-micro-ondas.webp",
        storeLink: "#",
        permitePix: true,
    },
    // Modelo de presente SEM contribuição via PIX (mostra só o botão da loja)
    {
        id: 3,
        title: "Jogo de Panelas (modelo)",
        description: "",
        price: 600.00,
        raised: 0.00,
        image: "modelo-panelas.webp",
        storeLink: "#", // TODO: colocar o link da loja para aparecer o botão "Comprar o item na loja"
        permitePix: false,
    },
];

const giftsContainer = document.getElementById('gifts-container');
const mainView = document.getElementById('main-view');
const detailsView = document.getElementById('details-view');
const detailsContent = document.getElementById('details-content');

// Renderiza a lista na tela principal
function renderGifts(gifts) {
    giftsContainer.innerHTML = gifts.map(gift => {
        let percentage = (gift.raised / gift.price) * 100;
        if (percentage > 100) percentage = 100;

        // Presentes sem contribuição parcial não exibem meta nem barra de arrecadação
        const permitePix = gift.permitePix !== false;
        const isCompleted = permitePix && percentage === 100;
        const btnText = !permitePix ? "Ver detalhes" : (isCompleted ? "Agradecer" : "Contribuir");
        const btnClass = isCompleted ? "btn-gift completed" : "btn-gift";

        // Em vez de alert, agora chama a função openDetails
        return `
            <div class="gift-card" onclick="openDetails(${gift.id})">
                <img src="${gift.image}" alt="${gift.title}" class="gift-img">
                <div class="gift-info">
                    <h3>${gift.title}</h3>
                    <span class="price">${permitePix ? 'Meta' : 'Valor'}: R$ ${gift.price.toFixed(2).replace('.', ',')}</span>
                    <button class="${btnClass}" onclick="event.stopPropagation(); openDetails(${gift.id})">${btnText}</button>
                    
                    ${permitePix ? `
                    <div class="progress-container">
                        <div class="progress-info">
                            <span>Arrecadado: R$ ${gift.raised.toFixed(2).replace('.', ',')}</span>
                            <span>${Math.round(percentage)}%</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: 0%;" data-width="${percentage}%"></div>
                        </div>
                    </div>` : ''}
                </div>
            </div>
        `;
    }).join('');

    setTimeout(() => {
        document.querySelectorAll('.progress-bar-fill').forEach(bar => {
            bar.style.width = bar.getAttribute('data-width');
        });
    }, 100);
}

function openDetails(id) {
    const gift = giftsData.find(g => g.id === id);
    if (!gift) return;

    // Se permitePix for false, o presente não aceita contribuição parcial
    const permitePix = gift.permitePix !== false;
    const temLoja = gift.storeLink && gift.storeLink !== "#";

    // Atualiza o HTML da tela de detalhes
detailsContent.innerHTML = `
        <div class="details-image">
            <img src="${gift.image}" alt="${gift.title}">
        </div>
        <div class="details-info">
            <h2>${gift.title}</h2>
            <span class="price-tag">Valor Total: R$ ${gift.price.toFixed(2).replace('.', ',')}</span>
            <p>${gift.description}</p>
            
            <div class="action-buttons">
                ${permitePix ? `<button class="btn-large btn-pix" onclick="togglePix()">Contribuir com PIX</button>` : ''}
                ${temLoja ? `<a href="${gift.storeLink}" target="_blank" class="btn-large btn-store">Comprar o item na loja</a>` : ''}
                ${!permitePix && !temLoja ? `<p class="aviso-sem-opcao">Em breve disponibilizaremos o link da loja para este presente.</p>` : ''}
            </div>

            ${permitePix ? `
            <div class="pix-container" id="pix-area">
                <h4>Quanto deseja presentear?</h4>
                
                <div class="pix-input-wrapper">
                    <input type="text" id="pix-value" inputmode="numeric" value="R$ 0,00" oninput="maskCurrency(this)">
                </div>

                <div class="pix-presets">
                    <button class="btn-preset" onclick="setPresetValue(100)">R$ 100</button>
                    <button class="btn-preset" onclick="setPresetValue(200)">R$ 200</button>
                    <button class="btn-preset" onclick="setPresetValue(400)">R$ 400</button>
                </div>

                <button class="btn-generate-pix" onclick="generateDynamicPix(${gift.id})">Gerar QR Code e Chave</button>

                <div id="dynamic-pix-result" class="hidden pix-result">
                    <img src="" alt="QR Code PIX" id="dynamic-qr-code" class="qr-code">
                    <p style="margin-bottom: 10px; font-size: 0.9rem;">Pix Copia e Cola:</p>
                    <div class="pix-key-box">
                        <span id="pix-key-text" style="font-size: 0.8rem;"></span>
                        <button class="btn-copy" onclick="copyPix()"><b>COPIAR</b></button>
                    </div>
                </div>
            </div>
            ` : ''}
        </div>
    `;
    mainView.classList.add('hidden');
    detailsView.classList.remove('hidden');
    document.body.classList.add('viewing-details');
    window.scrollTo(0, 0);
}

// Botão "Voltar para a lista" da tela de detalhes
function closeDetails() {
    navigateTo('gifts');
}

// --- FUNÇÕES GERADORAS DE PIX ---

// 3. Função atualizada para buscar o nome do presente
function generateDynamicPix(giftId) {
    // Encontra o presente na lista usando o ID
    const gift = giftsData.find(g => g.id === giftId);
    if (!gift) return;

    const valueStr = document.getElementById('pix-value').value;
    const cleanValue = valueStr.replace("R$ ", "").replace(/\./g, "").replace(",", ".");
    const amount = parseFloat(cleanValue);

    if (!amount || amount <= 0) {
        alert("Por favor, insira um valor para contribuir.");
        return;
    }

    // Agora passamos também o nome do presente (gift.title)
    const payloadPix = createPixPayload(gift.pixKey || PIX_KEY, nomeRecebedor, cidadeRecebedor, amount, gift.title);
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(payloadPix)}`;

    document.getElementById('dynamic-qr-code').src = qrCodeUrl;
    document.getElementById('pix-key-text').innerText = payloadPix;
    document.getElementById('dynamic-pix-result').classList.remove('hidden');

    logPixGerado(gift.title, amount);
}

function togglePix() {
    const pixArea = document.getElementById('pix-area');
    pixArea.classList.toggle('active');
}

function copyPix() {
    const pixKey = document.getElementById('pix-key-text').innerText;
    navigator.clipboard.writeText(pixKey).then(() => {
        alert("Chave PIX copiada com sucesso!");
    }).catch(err => {
        console.error('Erro ao copiar: ', err);
    });
}

// Inicia a aplicação
renderGifts(giftsData);

// --- 9. Lógica do Menu de Navegação (Navbar) ---
const navbar = document.getElementById('navbar');

// Efeito de fundo do menu ao rolar a página
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Função de navegação inteligente (Lida com o SPA)
function navigateTo(sectionId) {
    const mainView = document.getElementById('main-view');
    const detailsView = document.getElementById('details-view');
    
    // Se a pessoa estiver na tela de detalhes do presente, fecha e volta pro menu principal
    if (!detailsView.classList.contains('hidden')) {
        detailsView.classList.add('hidden');
        mainView.classList.remove('hidden');
        document.body.classList.remove('viewing-details');
    }

    // Dá um tempinho minúsculo para a tela principal voltar a existir no DOM antes de rolar
    setTimeout(() => {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            // Rola até a seção com um desconto da altura do menu fixo (para o título não ficar escondido atrás dele)
            const navbarHeight = navbar.offsetHeight;
            const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }, 50);
}

// 1. Máscara de Moeda (Formatação instantânea)
function maskCurrency(input) {
    let value = input.value.replace(/\D/g, ""); // Remove tudo que não é número
    value = (value / 100).toFixed(2).replace(".", ","); // Transforma em centavos e troca ponto por vírgula
    value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."); // Adiciona pontos de milhar
    input.value = "R$ " + value;
}

// 2. Atalhos de valores prontos
function setPresetValue(amount) {
    const input = document.getElementById('pix-value');
    // Simula a digitação para a máscara formatar corretamente
    input.value = (amount * 100).toString();
    maskCurrency(input);
}

// Algoritmo matemático com suporte a Descrição (Comentário) do PIX
function createPixPayload(pixKey, merchantName, merchantCity, amount, description) {
    amount = Number(amount).toFixed(2); // Garante formato 0.00

    function format(id, value) {
        const length = value.length.toString().padStart(2, '0');
        return `${id}${length}${value}`;
    }

    // Limpa o título do presente (remove acentos e corta para 35 letras para não quebrar o limite do Banco Central)
    let cleanDesc = description.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 35);

    const gui = format('00', 'br.gov.bcb.pix');
    const key = format('01', pixKey);
    const desc = format('02', cleanDesc); // Subcampo 02 é a "Informação Adicional" (Comentário)

    // O bloco 26 agora contém a interface, a chave E a descrição
    const merchantAccountInfo = format('26', gui + key + desc);

    let payload =
        '000201' + 
        '010211' + 
        merchantAccountInfo + 
        '52040000' + 
        '5303986' + 
        format('54', amount) + 
        '5802BR' + 
        format('59', merchantName.substring(0, 25)) + 
        format('60', merchantCity.substring(0, 15)) + 
        format('62', format('05', '***')); 

    payload += '6304'; 

    // CRC16
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
        crc ^= (payload.charCodeAt(i) << 8) & 0xFFFF;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
            } else {
                crc = (crc << 1) & 0xFFFF;
            }
        }
    }
    const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');

    return payload + crcHex;
}

// Envia silenciosamente o registro do PIX gerado para o Google Sheets
function logPixGerado(presenteNome, valorGerado) {
    if (!GOOGLE_SCRIPT_URL) return;

    const params = new URLSearchParams();
    params.append('tipo', 'pix'); // Isso avisa ao Google para jogar na aba certa
    params.append('presente', presenteNome);
    params.append('valor', `R$ ${valorGerado.toFixed(2).replace('.', ',')}`);

    // Disparo "Fire and Forget" (Atira e esquece, não afeta a navegação do usuário)
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: params,
        mode: 'no-cors'
    }).catch(err => console.error("Erro ao salvar log do PIX", err));
}
// --- 10. Contribuição Geral (valor livre via PIX) ---
const contributionDescricao = "Contribuicao Geral";
let contributionTimer = null;
let lastLoggedContribution = null;

// Máscara de moeda sem o prefixo "R$" (o "R$" já aparece fixo ao lado do campo)
function maskContribution(input) {
    const digits = input.value.replace(/\D/g, "").replace(/^0+/, "");
    if (!digits) {
        input.value = "";
        return 0;
    }
    const amount = Number(digits) / 100;
    input.value = amount.toFixed(2).replace(".", ",").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    return amount;
}

function onContributionInput(input) {
    const amount = maskContribution(input);
    const loading = document.getElementById('contribution-loading');
    const result = document.getElementById('contribution-result');

    clearTimeout(contributionTimer);
    result.classList.add('hidden');

    if (!amount) {
        loading.classList.add('hidden');
        return;
    }

    // Mostra "Gerando Pix" enquanto a pessoa digita e gera quando ela para de digitar
    loading.classList.remove('hidden');
    contributionTimer = setTimeout(() => generateContributionPix(amount), 900);
}

function generateContributionPix(amount) {
    const payloadPix = createPixPayload(PIX_KEY, nomeRecebedor, cidadeRecebedor, amount, contributionDescricao);
    const qrImg = document.getElementById('contribution-qr-code');

    const showResult = () => {
        // Ignora se o valor mudou enquanto o QR Code carregava
        if (qrImg.dataset.payload !== payloadPix) return;
        document.getElementById('contribution-loading').classList.add('hidden');
        document.getElementById('contribution-result').classList.remove('hidden');
    };

    qrImg.dataset.payload = payloadPix;
    qrImg.onload = showResult;
    qrImg.onerror = showResult;
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(payloadPix)}`;
    document.getElementById('contribution-pix-text').innerText = payloadPix;

    if (lastLoggedContribution !== amount) {
        lastLoggedContribution = amount;
        logPixGerado("Contribuição Geral", amount);
    }
}

function copyContributionPix() {
    const pixKey = document.getElementById('contribution-pix-text').innerText;
    navigator.clipboard.writeText(pixKey).then(() => {
        alert("Chave PIX copiada com sucesso!");
    }).catch(err => {
        console.error('Erro ao copiar: ', err);
    });
}

// --- 11. Endereço para entrega dos presentes ---
function copyAddress() {
    // Copia o endereço escrito no index.html, numa linha só
    const address = document.getElementById('address-text').innerText.split('\n').map(l => l.trim()).filter(Boolean).join(', ');
    navigator.clipboard.writeText(address).then(() => {
        alert("Endereço copiado com sucesso!");
    }).catch(err => {
        console.error('Erro ao copiar: ', err);
    });
}
