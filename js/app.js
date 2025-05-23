// Datos iniciales
let users = JSON.parse(localStorage.getItem('vetAppUsers')) || [
    {
        id: 1,
        name: "Johan Cruz Perez",
        email: "johan@example.com",
        phone: "5551234567",
        password: "123456"
    }
];

let pets = JSON.parse(localStorage.getItem('vetAppPets')) || [
    {
        id: 1,
        ownerId: 1,
        name: "Max",
        species: "perro",
        breed: "Golden Retriever",
        age: 3,
        weight: 25.5,
        notes: "Alérgico a algunos antibióticos"
    }
];

let appointments = JSON.parse(localStorage.getItem('vetAppAppointments')) || [];
let currentUser = null;
let inactivityTimer;

// Elementos DOM
const DOM = {
    loginBtn: document.getElementById('login-btn'),
    registerBtn: document.getElementById('register-btn'),
    loginModal: document.getElementById('login-modal'),
    registerModal: document.getElementById('register-modal'),
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    dashboard: document.getElementById('dashboard'),
    username: document.getElementById('username'),
    petsList: document.getElementById('pets-list'),
    appointmentsList: document.getElementById('appointments-list'),
    addPetBtn: document.getElementById('add-pet-btn'),
    petSelect: document.getElementById('pet-select'),
    newAppointmentForm: document.getElementById('new-appointment-form'),
    appointmentDate: document.getElementById('appointment-date'),
    appointmentTime: document.getElementById('appointment-time'),
    loginError: document.getElementById('login-error'),
    registerError: document.getElementById('register-error'),
    appointmentError: document.getElementById('appointment-error'),
    userInfo: document.getElementById('user-info')
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    setMinDateForAppointments();
    loadFromLocalStorage();
});

// Función para sanitizar entradas
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Función para guardar datos en localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('vetAppUsers', JSON.stringify(users));
        localStorage.setItem('vetAppPets', JSON.stringify(pets));
        localStorage.setItem('vetAppAppointments', JSON.stringify(appointments));
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
    }
}

// Función para cargar datos desde localStorage
function loadFromLocalStorage() {
    try {
        const savedUsers = localStorage.getItem('vetAppUsers');
        const savedPets = localStorage.getItem('vetAppPets');
        const savedAppointments = localStorage.getItem('vetAppAppointments');

        if (savedUsers) users = JSON.parse(savedUsers);
        if (savedPets) pets = JSON.parse(savedPets);
        if (savedAppointments) appointments = JSON.parse(savedAppointments);
    } catch (error) {
        console.error('Error al cargar desde localStorage:', error);
    }
}

// Event Listeners
function initEventListeners() {
    DOM.loginBtn.addEventListener('click', () => showModal(DOM.loginModal));
    DOM.registerBtn.addEventListener('click', () => showModal(DOM.registerModal));

    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) closeAllModals();
    });

    DOM.loginForm.addEventListener('submit', handleLogin);
    DOM.registerForm.addEventListener('submit', handleRegister);
    DOM.addPetBtn.addEventListener('click', showAddPetForm);
    DOM.newAppointmentForm.addEventListener('submit', handleNewAppointment);

    // Pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const tabId = this.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) content.classList.add('active');
            });
        });
    });
}

async function handleLogin(e) {
    e.preventDefault();
    try {
        const email = DOM.loginForm['login-email'].value.trim();
        const password = DOM.loginForm['login-password'].value;

        if (!email || !password) {
            throw new Error('Todos los campos son requeridos');
        }

        const user = users.find(u => u.email === email && u.password === password);
        if (!user) throw new Error('Credenciales incorrectas');
        currentUser = user;
        DOM.loginModal.style.display = 'none';
        DOM.loginForm.reset();
        showDashboard();
    } catch (error) {
        showError(DOM.loginError, error.message);
        console.error('Error en login:', error);
    }
}

function handleRegister(e) {
    e.preventDefault();
    try {
        const name = DOM.registerForm['reg-name'].value.trim();
        const email = DOM.registerForm['reg-email'].value.trim();
        const phone = DOM.registerForm['reg-phone'].value.trim();
        const password = DOM.registerForm['reg-password'].value;

        // Validaciones mejoradas
        if (!name || !email || !phone || !password) {
            throw new Error('Todos los campos son requeridos');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Ingrese un correo electrónico válido');
        }

        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        if (users.some(u => u.email === email)) {
            throw new Error('El correo ya está registrado');
        }

        const newUser = {
            id: Date.now(),
            name: sanitizeInput(name),
            email: sanitizeInput(email),
            phone: sanitizeInput(phone),
            password: password // En una app real, esto debería estar hasheado
        };

        users.push(newUser);
        currentUser = newUser;
        DOM.registerModal.style.display = 'none';
        DOM.registerForm.reset();
        saveToLocalStorage();
        showDashboard();
        alert(`¡Registro exitoso! Bienvenido ${sanitizeInput(name)}`);
    } catch (error) {
        showError(DOM.registerError, error.message);
        console.error('Error en registro:', error);
    }
}

function showDashboard() {
    try {
        DOM.userInfo.innerHTML = `
            <span>${sanitizeInput(currentUser.name)}</span>
            <button id="logout-btn">Cerrar Sesión</button>
        `;
        document.getElementById('logout-btn').addEventListener('click', logout);
        DOM.username.textContent = sanitizeInput(currentUser.name);
        DOM.dashboard.classList.remove('hidden');
        loadUserData();
        
        // Configurar timeout de inactividad
        resetInactivityTimer();
        document.addEventListener('mousemove', resetInactivityTimer);
        document.addEventListener('keypress', resetInactivityTimer);
    } catch (error) {
        console.error('Error mostrando dashboard:', error);
        alert('Ocurrió un error al cargar el dashboard. Por favor intenta nuevamente.');
    }
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (currentUser) {
            alert('Tu sesión ha expirado por inactividad');
            logout();
        }
    }, 30 * 60 * 1000); // 30 minutos
}

function logout() {
    try {
        currentUser = null;
        DOM.dashboard.classList.add('hidden');
        DOM.userInfo.innerHTML = `
            <button id="login-btn">Iniciar Sesión</button>
            <button id="register-btn">Registrarse</button>
        `;
        // Reasignar eventos
        document.getElementById('login-btn').addEventListener('click', () => showModal(DOM.loginModal));
        document.getElementById('register-btn').addEventListener('click', () => showModal(DOM.registerModal));
        
        // Limpiar timer de inactividad
        clearTimeout(inactivityTimer);
    } catch (error) {
        console.error('Error en logout:', error);
    }
}

function loadUserData() {
    try {
        loadPets();
        loadAppointments();
        fillPetSelect();
        fillTimeSlots();
    } catch (error) {
        console.error('Error cargando datos:', error);
        alert('Ocurrió un error al cargar los datos. Por favor intenta nuevamente.');
        // Mostrar estado mínimo funcional
        DOM.petsList.innerHTML = '<p>No se pudieron cargar las mascotas</p>';
        DOM.appointmentsList.innerHTML = '<p>No se pudieron cargar las citas</p>';
    }
}

function loadPets() {
    try {
        const userPets = pets.filter(pet => pet.ownerId === currentUser.id);
        DOM.petsList.innerHTML = '';

        if (userPets.length === 0) {
            DOM.petsList.innerHTML = '<p>No tienes mascotas registradas</p>';
            return;
        }

        userPets.forEach(pet => {
            const petCard = document.createElement('div');
            petCard.className = 'pet-card';
            petCard.innerHTML = `
                <h4>${sanitizeInput(pet.name)}</h4>
                <p><strong>Especie:</strong> ${sanitizeInput(pet.species)}</p>
                <p><strong>Raza:</strong> ${sanitizeInput(pet.breed)}</p>
                <p><strong>Edad:</strong> ${pet.age} años</p>
                <p><strong>Peso:</strong> ${pet.weight} kg</p>
                ${pet.notes ? `<p><strong>Notas:</strong> ${sanitizeInput(pet.notes)}</p>` : ''}
                <button class="delete-pet-btn" data-id="${pet.id}">Eliminar</button>
            `;
            DOM.petsList.appendChild(petCard);
        });

        // Event listeners para botones de eliminar
        document.querySelectorAll('.delete-pet-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('¿Estás seguro de eliminar esta mascota?')) {
                    const petId = parseInt(e.target.getAttribute('data-id'));
                    deletePet(petId);
                }
            });
        });
    } catch (error) {
        throw error;
    }
}

function loadAppointments() {
    try {
        const userAppointments = appointments.filter(apt => apt.ownerId === currentUser.id);
        DOM.appointmentsList.innerHTML = '';

        if (userAppointments.length === 0) {
            DOM.appointmentsList.innerHTML = '<p>No tienes citas agendadas</p>';
            return;
        }

        userAppointments.forEach(apt => {
            const pet = pets.find(p => p.id === apt.petId);
            const aptCard = document.createElement('div');
            aptCard.className = 'appointment-card';
            aptCard.innerHTML = `
                <h4>Cita para ${pet?.name ? sanitizeInput(pet.name) : 'Mascota'}</h4>
                <p><strong>Fecha:</strong> ${formatDate(apt.date)}</p>
                <p><strong>Hora:</strong> ${sanitizeInput(apt.time)}</p>
                <p><strong>Motivo:</strong> ${getReasonText(apt.reason)}</p>
                <p><strong>Estado:</strong> ${sanitizeInput(apt.status)}</p>
                <button class="cancel-apt-btn" data-id="${apt.id}">Cancelar Cita</button>
            `;
            DOM.appointmentsList.appendChild(aptCard);
        });

        // Event listeners para botones de cancelar
        document.querySelectorAll('.cancel-apt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('¿Estás seguro de cancelar esta cita?')) {
                    const aptId = parseInt(e.target.getAttribute('data-id'));
                    cancelAppointment(aptId);
                }
            });
        });
    } catch (error) {
        throw error;
    }
}

function showAddPetForm() {
    try {
        DOM.petsList.innerHTML = `
            <form id="add-pet-form">
                <input type="text" id="pet-name" placeholder="Nombre" required>
                <select id="pet-species" required>
                    <option value="">Especie</option>
                    <option value="perro">Perro</option>
                    <option value="gato">Gato</option>
                    <option value="otro">Otro</option>
                </select>
                <input type="text" id="pet-breed" placeholder="Raza" required>
                <input type="number" id="pet-age" placeholder="Edad (años)" min="0" required>
                <input type="number" id="pet-weight" placeholder="Peso (kg)" step="0.1" min="0" required>
                <textarea id="pet-notes" placeholder="Notas médicas"></textarea>
                <button type="submit">Guardar Mascota</button>
                <button type="button" id="cancel-add-pet">Cancelar</button>
            </form>
        `;

        document.getElementById('add-pet-form').addEventListener('submit', handleAddPet);
        document.getElementById('cancel-add-pet').addEventListener('click', loadPets);
    } catch (error) {
        console.error('Error mostrando formulario de mascota:', error);
        loadPets();
    }
}

function handleAddPet(e) {
    e.preventDefault();
    try {
        const form = e.target;

        const newPet = {
            id: Date.now(),
            ownerId: currentUser.id,
            name: sanitizeInput(form['pet-name'].value.trim()),
            species: sanitizeInput(form['pet-species'].value),
            breed: sanitizeInput(form['pet-breed'].value.trim()),
            age: parseInt(form['pet-age'].value),
            weight: parseFloat(form['pet-weight'].value),
            notes: sanitizeInput(form['pet-notes'].value.trim())
        };

        // Validaciones
        if (isNaN(newPet.age) || isNaN(newPet.weight) || newPet.age < 0 || newPet.weight <= 0) {
            throw new Error('Edad y peso deben ser valores válidos');
        }

        pets.push(newPet);
        saveToLocalStorage();
        loadUserData();
        alert('Mascota registrada exitosamente');
    } catch (error) {
        alert(error.message);
        console.error('Error agregando mascota:', error);
    }
}

function fillPetSelect() {
    try {
        const userPets = pets.filter(pet => pet.ownerId === currentUser.id);
        DOM.petSelect.innerHTML = '<option value="">Selecciona una mascota</option>';

        userPets.forEach(pet => {
            const option = document.createElement('option');
            option.value = pet.id;
            option.textContent = sanitizeInput(pet.name);
            DOM.petSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error llenando selector de mascotas:', error);
    }
}

function fillTimeSlots() {
    try {
        const date = DOM.appointmentDate.value || new Date().toISOString().split('T')[0];
        const availableHours = generateAvailableHours(date);
        
        DOM.appointmentTime.innerHTML = '<option value="">Selecciona una hora</option>';
        
        availableHours.forEach(hour => {
            const option = document.createElement('option');
            option.value = hour;
            option.textContent = hour;
            DOM.appointmentTime.appendChild(option);
        });

        // Actualizar horas cuando cambia la fecha
        DOM.appointmentDate.addEventListener('change', () => {
            const selectedDate = DOM.appointmentDate.value;
            const hours = generateAvailableHours(selectedDate);
            
            DOM.appointmentTime.innerHTML = '<option value="">Selecciona una hora</option>';
            hours.forEach(hour => {
                const option = document.createElement('option');
                option.value = hour;
                option.textContent = hour;
                DOM.appointmentTime.appendChild(option);
            });
        });
    } catch (error) {
        console.error('Error llenando horas disponibles:', error);
    }
}

function generateAvailableHours(date) {
    try {
        const existingAppointments = appointments.filter(apt => 
            apt.date === date && apt.status !== 'cancelada'
        );
        const takenHours = existingAppointments.map(apt => apt.time);
        
        const allHours = [];
        for (let hour = 9; hour <= 17; hour++) {
            allHours.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        
        return allHours.filter(hour => !takenHours.includes(hour));
    } catch (error) {
        console.error('Error generando horas disponibles:', error);
        return [];
    }
}

function handleNewAppointment(e) {
    e.preventDefault();
    try {
        const petId = parseInt(DOM.petSelect.value);
        const date = DOM.appointmentDate.value;
        const time = DOM.appointmentTime.value;
        const reason = DOM.newAppointmentForm['appointment-reason'].value;

        if (!petId || !date || !time || !reason) {
            throw new Error('Todos los campos son requeridos');
        }

        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            throw new Error('No puedes agendar citas en fechas pasadas');
        }

        const newAppointment = {
            id: Date.now(),
            ownerId: currentUser.id,
            petId,
            date,
            time,
            reason,
            status: 'pendiente'
        };

        appointments.push(newAppointment);
        saveToLocalStorage();
        DOM.newAppointmentForm.reset();
        loadUserData();
        alert('Cita agendada exitosamente');
        document.querySelector('[data-tab="citas"]').click();
    } catch (error) {
        showError(DOM.appointmentError, error.message);
        console.error('Error agendando cita:', error);
    }
}

function deletePet(petId) {
    try {
        pets = pets.filter(p => p.id !== petId);
        // Eliminar citas asociadas
        appointments = appointments.filter(apt => apt.petId !== petId);
        saveToLocalStorage();
        loadUserData();
    } catch (error) {
        console.error('Error eliminando mascota:', error);
        alert('Ocurrió un error al eliminar la mascota');
    }
}

function cancelAppointment(aptId) {
    try {
        const appointment = appointments.find(apt => apt.id === aptId);
        if (appointment) {
            appointment.status = 'cancelada';
            saveToLocalStorage();
            loadUserData();
        }
    } catch (error) {
        console.error('Error cancelando cita:', error);
        alert('Ocurrió un error al cancelar la cita');
    }
}

// Helper functions
function showModal(modal) {
    try {
        closeAllModals();
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error mostrando modal:', error);
    }
}

function closeAllModals() {
    try {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });
    } catch (error) {
        console.error('Error cerrando modales:', error);
    }
}

function showError(element, message) {
    try {
        element.textContent = message;
        element.style.display = 'block';
    } catch (error) {
        console.error('Error mostrando mensaje de error:', error);
    }
}

function setMinDateForAppointments() {
    try {
        const today = new Date().toISOString().split('T')[0];
        DOM.appointmentDate.min = today;
    } catch (error) {
        console.error('Error estableciendo fecha mínima:', error);
    }
}

function formatDate(dateString) {
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return dateString;
    }
}

function getReasonText(reason) {
    const reasons = {
        'consulta': 'Consulta general',
        'vacuna': 'Vacunación',
        'emergencia': 'Emergencia',
        'cirugia': 'Cirugía'
    };
    return reasons[reason] || reason;
}