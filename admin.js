document.addEventListener('DOMContentLoaded', () => {
    const passwordForm = document.getElementById('password-form');
    const messageEl = document.getElementById('admin-message');
    const guestListSection = document.getElementById('guest-list-section');
    const guestListBody = document.getElementById('guest-list-body');
    const passwordInput = document.getElementById('password');

    // URL do seu backend no Render
    const backendUrl = 'https://confirmacao-aniversario-denize.onrender.com';

    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = passwordInput.value;
        messageEl.textContent = 'Verificando...';

        try {
            // Tenta buscar a lista na rota segura, passando a senha na URL
            const response = await fetch(`${backendUrl}/api/admin/guests?senha=${password}`);
            
            if (!response.ok) {
                throw new Error('Senha incorreta ou erro no servidor.');
            }

            const guests = await response.json();
            
            // Se deu certo, esconde o formulário e mostra a lista
            passwordForm.style.display = 'none';
            messageEl.textContent = '';
            guestListSection.style.display = 'block';

            guestListBody.innerHTML = ''; // Limpa a tabela
            guests.forEach(guest => {
                const row = document.createElement('tr');
                const nameCell = document.createElement('td');
                const attendanceCell = document.createElement('td');

                nameCell.textContent = guest.name;
                attendanceCell.textContent = guest.attendance ? '✅ Sim' : '❌ Não';
                
                row.appendChild(nameCell);
                row.appendChild(attendanceCell);
                guestListBody.appendChild(row);
            });

        } catch (error) {
            messageEl.textContent = error.message;
            messageEl.style.color = 'red';
        }
    });
});