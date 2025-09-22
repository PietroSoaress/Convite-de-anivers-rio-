document.addEventListener('DOMContentLoaded', () => {

    // --- VARIÁVEIS GLOBAIS ---
    const flowerContainer = document.querySelector('.flower-container');
    const rsvpForm = document.getElementById('rsvp-form');
    const messageElement = document.getElementById('form-message');
    
    // URL do seu backend. Mantê-la em uma constante facilita futuras manutenções.
    const backendUrl = 'https://confirmacao-aniversario-denize.onrender.com';

    // =================================================================
    // 1. NOVA FUNÇÃO: CARREGAR E EXIBIR A LISTA DE CONVIDADOS
    // =================================================================
    const carregarConvidados = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/guests`);
            if (!response.ok) {
                throw new Error('Falha ao buscar lista de convidados.');
            }
            const guests = await response.json();

            const guestListElement = document.getElementById('guest-list');
            guestListElement.innerHTML = ''; // Limpa a lista para evitar duplicatas

            // Filtra para pegar apenas os convidados que responderam "Sim"
            const goingGuests = guests.filter(guest => guest.attendance === true);

            if (goingGuests.length === 0) {
                guestListElement.innerHTML = '<li>Seja o primeiro a confirmar!</li>';
            } else {
                // Cria um item <li> para cada convidado e o adiciona na tela
                goingGuests.forEach(guest => {
                    const listItem = document.createElement('li');
                    listItem.textContent = guest.name;
                    guestListElement.appendChild(listItem);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar convidados:', error);
            const guestListElement = document.getElementById('guest-list');
            guestListElement.innerHTML = '<li>Não foi possível carregar a lista.</li>';
        }
    };


    // =================================================================
    // 2. SEU CÓDIGO ORIGINAL: ANIMAÇÃO DAS FLORES (INTACTO)
    // =================================================================
    const flowerTypes = ['assets/flower1.png', 'assets/flower2.png', 'assets/flower3.png', 'assets/flower4.png'];

    function createFlower() {
        const flower = document.createElement('div');
        flower.classList.add('flower');
        flower.style.backgroundImage = `url(${flowerTypes[Math.floor(Math.random() * flowerTypes.length)]})`;
        flower.style.left = `${Math.random() * 100}vw`;
        flower.style.animationDuration = `${Math.random() * 5 + 8}s`;
        flower.style.width = `${Math.random() * 40 + 40}px`;
        flower.style.height = flower.style.width;

        flowerContainer.appendChild(flower);

        gsap.to(flower, {
            y: "-120vh",
            rotation: Math.random() * 360,
            opacity: 0,
            duration: parseFloat(flower.style.animationDuration),
            ease: "power1.inOut",
            onComplete: () => {
                flower.remove();
            }
        });
    }

    setInterval(createFlower, 800);


    // =================================================================
    // 3. SEU CÓDIGO ORIGINAL: LÓGICA DO FORMULÁRIO (COM UMA MELHORIA)
    // =================================================================
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const attendance = document.querySelector('input[name="attendance"]:checked').value === 'true';

        try {
            // Usa a constante da URL do backend
            const response = await fetch(`${backendUrl}/api/rsvp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, attendance }),
            });

            const result = await response.json();

            if (response.ok) {
                messageElement.textContent = 'Obrigado por confirmar!';
                messageElement.style.color = '#8C3A5B';
                rsvpForm.reset();

                // *** A MELHORIA ESTÁ AQUI ***
                // Chama a função para atualizar a lista de convidados na tela
                // imediatamente após a confirmação ser enviada com sucesso.
                carregarConvidados();

            } else {
                throw new Error(result.message || 'Ocorreu um erro.');
            }
        } catch (error) {
            messageElement.textContent = `Erro: ${error.message}`;
            messageElement.style.color = 'red';
        }
    });


    // =================================================================
    // 4. INICIALIZAÇÃO
    // =================================================================
    // Carrega a lista de convidados assim que a página é aberta.
    carregarConvidados();
});