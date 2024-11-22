function timeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
        return seconds === 1 ? '1s' : `${seconds} s`;
    } else if (minutes < 60) {
        return minutes === 1 ? '1m' : `${minutes} m`;
    } else if (hours < 24) {
        return hours === 1 ? '1h' : `${hours} h`;
    } else if (days < 7) {
        return days === 1 ? '1 dia atrás' : `${days} dias atrás`;
    } else if (days < 30) {
        return days < 7 ? `${days} dias atrás` : `${Math.floor(days / 7)} semanas atrás`;
    } else if (months < 12) {
        return months === 1 ? '1 mês atrás' : `${months} meses atrás`;
    } else {
        return years === 1 ? '1 ano atrás' : `${years} anos atrás`;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const usuarioId = window.location.pathname.split('/perfil/')[1];

    // Elementos do DOM
    const userModal = document.getElementById('user-modal');
    const logoutButton = document.getElementById('logout-button');
    const userNav = document.getElementById('user-nav');
    const displayUserDiv = document.getElementById('nav-display');
    const userUserDiv = document.getElementById('nav-user');


    const userDisplayElement = document.getElementById('usuario-expandido-user-specs-display');
    const userNameElement = document.getElementById('usuario-expandido-user-specs-user');
    const userJoinDateElement = document.getElementById('usuario-expandido-user-specs-dataDeEntrada');


    const timelineDiv = document.getElementById('timeline-container');

    // Exibir informações do usuário logado
    if (token) {
        fetch('/usuario-logado', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao obter usuário logado.');
                }
                return response.json();
            })
            .then(data => {
                if (data.displayUser && data.usuario) {
                    displayUserDiv.textContent = `${data.displayUser}`;
                    userUserDiv.textContent = `@${data.usuario}`;
                    document.getElementById('user-icon').style.display = 'block';
                } else {
                    displayUserDiv.textContent = 'Usuário não encontrado';
                    userUserDiv.textContent = '';
                    document.getElementById('user-icon').style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Erro ao obter usuário logado:', error);
            });
    } else {
        displayUserDiv.textContent = 'Você não está logado';
    }

    // Função para carregar informações do perfil
    const loadPerfil = async () => {
        try {
            const response = await fetch(`/perfil/${usuarioId}/api`);
            if (!response.ok) throw new Error('Erro ao carregar perfil.');

            const data = await response.json();

            userDisplayElement.textContent = data.displayUser || 'Usuário desconhecido';
            userNameElement.textContent = `@${data.usuario || 'anonimo'}`;
            userJoinDateElement.textContent = `Conta criada em: ${new Date(data.dataCriacao).toLocaleDateString('pt-BR')}`;
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            userDisplayElement.textContent = 'Erro ao carregar perfil';
            userNameElement.textContent = '';
            userJoinDateElement.textContent = '';
        }
    };

    // Função para carregar as fofocas do perfil
    const loadFofocas = async () => {
        try {
            const response = await fetch(`/fofocas/api/${usuarioId}`);
            if (!response.ok) throw new Error('Erro ao carregar fofocas.');

            const fofocas = await response.json();
            timelineDiv.innerHTML = '';

            if (Array.isArray(fofocas) && fofocas.length > 0) {
                fofocas.forEach(fofoca => {
                    const fofocaElement = document.createElement('div');
                    fofocaElement.className = 'fofoca';

                    const data = new Date(fofoca.date);
                    const formattedDate = timeAgo(data);

                    fofocaElement.innerHTML = `
                    <a href="/fofocas/${fofoca._id}">
                        <div class='user-specs'>
                            <div class='display'>${fofoca.usuario.displayUser || 'Usuário anônimo'}</div>
                            <div class='user'>@${fofoca.usuario.user || 'anonimo'}</div>
                        </div>
                        <div class='description'>${fofoca.description || 'Sem descrição'}</div>
                        <div class='date'>Há ${formattedDate}</div>
                    </a>`;
                    timelineDiv.appendChild(fofocaElement);
                });
            } else {
                timelineDiv.innerHTML = '<p>Nenhuma fofoca disponível no momento.</p>';
            }
        } catch (error) {
            console.error('Erro ao carregar fofocas:', error);
            timelineDiv.innerHTML = '<p>Nenhuma fofoca disponível no momento.</p>';
        }
    };

    // Logout do usuário
    logoutButton.addEventListener('click', () => {
        fetch('/logout', {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(response => {
                if (response.ok) {
                    localStorage.clear();
                    window.location.href = '/login';
                }
            })
            .catch(error => console.error('Erro ao deslogar:', error));
    });

    // Centralizar modal do usuário
    userNav.addEventListener('click', () => {
        userModal.style.display = 'block';
    });

    document.addEventListener('click', (event) => {
        if (!userNav.contains(event.target) && !userModal.contains(event.target)) {
            userModal.style.display = 'none';
        }
    });


    loadPerfil();
    loadFofocas();
});
