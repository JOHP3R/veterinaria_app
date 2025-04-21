// Datos iniciales
let users = [
    {
        id: 1,
        name: "Johan Cruz Perez",
        email: "johan@example.com",
        phone: "5551234567",
        password: "123456"
    }
];

let pets = [
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

let appointments = [];
let currentUser = null;

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
});

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

// Funciones principales
function handleLogin(e) {
    e.preventDefault();
    const email = DOM.loginForm['login-email'].value.trim();
    const password = DOM.loginForm['login-password'].value;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        DOM.loginModal.style.display = 'none';
        DOM.loginForm.reset();
        showDashboard();
    } else {
        showError(DOM.loginError, 'Credenciales incorrectas');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = DOM.registerForm['reg-name'].value.trim();
    const email = DOM.registerForm['reg-email'].value.trim();
    const phone = DOM.registerForm['reg-phone'].value.trim();
    const password = DOM.registerForm['reg-password'].value;

    if (users.some(u => u.email === email)) {
        showError(DOM.registerError, 'El correo ya está registrado');
        return;
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        password
    };

    users.push(newUser);
    currentUser = newUser;
    DOM.registerModal.style.display = 'none';
    DOM.registerForm.reset();
    showDashboard();
    alert(`¡Registro exitoso! Bienvenido ${name}`);
}

function showDashboard() {
    DOM.userInfo.innerHTML = `
        <span>${currentUser.name}</span>
        <button id="logout-btn">Cerrar Sesión</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', logout);
    DOM.username.textContent = currentUser.name;
    DOM.dashboard.classList.remove('hidden');
    loadUserData();
}

function logout() {
    currentUser = null;
    DOM.dashboard.classList.add('hidden');
    DOM.userInfo.innerHTML = `
        <button id="login-btn">Iniciar Sesión</button>
        <button id="register-btn">Registrarse</button>
    `;
    // Reasignar eventos
    document.getElementById('login-btn').addEventListener('click', () => showModal(DOM.loginModal));
    document.getElementById('register-btn').addEventListener('click', () => showModal(DOM.registerModal));
}

function loadUserData() {
    loadPets();
    loadAppointments();
    fillPetSelect();
    fillTimeSlots();
}

function loadPets() {
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
            <h4>${pet.name}</h4>
            <p><strong>Especie:</strong> ${pet.species}</p>
            <p><strong>Raza:</strong> ${pet.breed}</p>
            <p><strong>Edad:</strong> ${pet.age} años</p>
            <p><strong>Peso:</strong> ${pet.weight} kg</p>
            ${pet.notes ? `<p><strong>Notas:</strong> ${pet.notes}</p>` : ''}
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
}

function loadAppointments() {
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
            <h4>Cita para ${pet?.name || 'Mascota'}</h4>
            <p><strong>Fecha:</strong> ${formatDate(apt.date)}</p>
            <p><strong>Hora:</strong> ${apt.time}</p>
            <p><strong>Motivo:</strong> ${getReasonText(apt.reason)}</p>
            <p><strong>Estado:</strong> ${apt.status}</p>
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
}

function showAddPetForm() {
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
}

function handleAddPet(e) {
    e.preventDefault();
    const form = e.target;

    const newPet = {
        id: Date.now(),
        ownerId: currentUser.id,
        name: form['pet-name'].value.trim(),
        species: form['pet-species'].value,
        breed: form['pet-breed'].value.trim(),
        age: parseInt(form['pet-age'].value),
        weight: parseFloat(form['pet-weight'].value),
        notes: form['pet-notes'].value.trim()
    };

    // Validaciones
    if (isNaN(newPet.age) || isNaN(newPet.weight) || newPet.age < 0 || newPet.weight <= 0) {
        alert('Edad y peso deben ser valores válidos');
        return;
    }

    pets.push(newPet);
    loadUserData();
    alert('Mascota registrada exitosamente');
}

function fillPetSelect() {
    const userPets = pets.filter(pet => pet.ownerId === currentUser.id);
    DOM.petSelect.innerHTML = '<option value="">Selecciona una mascota</option>';

    userPets.forEach(pet => {
        const option = document.createElement('option');
        option.value = pet.id;
        option.textContent = pet.name;
        DOM.petSelect.appendChild(option);
    });
}

function fillTimeSlots() {
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
}

function generateAvailableHours(date) {
    const existingAppointments = appointments.filter(apt => 
        apt.date === date && apt.status !== 'cancelada'
    );
    const takenHours = existingAppointments.map(apt => apt.time);
    
    const allHours = [];
    for (let hour = 9; hour <= 17; hour++) {
        allHours.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    
    return allHours.filter(hour => !takenHours.includes(hour));
}

function handleNewAppointment(e) {
    e.preventDefault();
    const petId = parseInt(DOM.petSelect.value);
    const date = DOM.appointmentDate.value;
    const time = DOM.appointmentTime.value;
    const reason = DOM.newAppointmentForm['appointment-reason'].value;

    if (!petId || !date || !time || !reason) {
        showError(DOM.appointmentError, 'Todos los campos son requeridos');
        return;
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
    DOM.newAppointmentForm.reset();
    loadUserData();
    alert('Cita agendada exitosamente');
    document.querySelector('[data-tab="citas"]').click();
}

function deletePet(petId) {
    pets = pets.filter(p => p.id !== petId);
    // Eliminar citas asociadas
    appointments = appointments.filter(apt => apt.petId !== petId);
    loadUserData();
}

function cancelAppointment(aptId) {
    const appointment = appointments.find(apt => apt.id === aptId);
    if (appointment) {
        appointment.status = 'cancelada';
        loadUserData();
    }
}

// Helper functions
function showModal(modal) {
    closeAllModals();
    modal.style.display = 'block';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function setMinDateForAppointments() {
    const today = new Date().toISOString().split('T')[0];
    DOM.appointmentDate.min = today;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
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