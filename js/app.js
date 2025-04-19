// Datos simulados (en una app real esto vendría de una base de datos)
let users = [];
let pets = [];
let appointments = [];
let currentUser = null;

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const closeButtons = document.querySelectorAll('.close');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const dashboard = document.getElementById('dashboard');
const usernameSpan = document.getElementById('username');
const petsList = document.getElementById('pets-list');
const appointmentsList = document.getElementById('appointments-list');
const addPetBtn = document.getElementById('add-pet-btn');
const petSelect = document.getElementById('pet-select');
const newAppointmentForm = document.getElementById('new-appointment-form');
const tabContents = document.querySelectorAll('.tab-content');
const tabBtns = document.querySelectorAll('.tab-btn');

// Event Listeners
loginBtn.addEventListener('click', () => loginModal.style.display = 'block');
registerBtn.addEventListener('click', () => registerModal.style.display = 'block');

closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.style.display = 'none';
    if (e.target === registerModal) registerModal.style.display = 'none';
});

loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
addPetBtn.addEventListener('click', showAddPetForm);
newAppointmentForm.addEventListener('submit', handleNewAppointment);

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const tabId = btn.getAttribute('data-tab');
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
    });
});

// Functions
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simular autenticación
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        loginModal.style.display = 'none';
        loginForm.reset();
        showDashboard();
    } else {
        alert('Credenciales incorrectas');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    
    // Verificar si el usuario ya existe
    if (users.some(u => u.email === email)) {
        alert('Este correo ya está registrado');
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
    registerModal.style.display = 'none';
    registerForm.reset();
    showDashboard();
}

function showDashboard() {
    document.getElementById('user-info').innerHTML = `
        <span>Bienvenido, ${currentUser.name}</span>
        <button id="logout-btn">Cerrar Sesión</button>
    `;
    
    document.getElementById('logout-btn').addEventListener('click', () => {
        currentUser = null;
        dashboard.classList.add('hidden');
        document.getElementById('user-info').innerHTML = `
            <button id="login-btn">Iniciar Sesión</button>
            <button id="register-btn">Registrarse</button>
        `;
    });
    
    usernameSpan.textContent = currentUser.name;
    dashboard.classList.remove('hidden');
    loadUserData();
}

function loadUserData() {
    // Cargar mascotas del usuario
    const userPets = pets.filter(pet => pet.ownerId === currentUser.id);
    petsList.innerHTML = '';
    
    if (userPets.length === 0) {
        petsList.innerHTML = '<p>No tienes mascotas registradas.</p>';
    } else {
        userPets.forEach(pet => {
            const petCard = document.createElement('div');
            petCard.className = 'pet-card';
            petCard.innerHTML = `
                <h4>${pet.name}</h4>
                <p>Especie: ${pet.species}</p>
                <p>Raza: ${pet.breed}</p>
                <p>Edad: ${pet.age} años</p>
                <button class="edit-pet-btn" data-id="${pet.id}">Editar</button>
                <button class="delete-pet-btn" data-id="${pet.id}">Eliminar</button>
            `;
            petsList.appendChild(petCard);
        });
    }
    
    // Cargar citas del usuario
    const userAppointments = appointments.filter(apt => apt.ownerId === currentUser.id);
    appointmentsList.innerHTML = '';
    
    if (userAppointments.length === 0) {
        appointmentsList.innerHTML = '<p>No tienes citas agendadas.</p>';
    } else {
        userAppointments.forEach(apt => {
            const pet = pets.find(p => p.id === apt.petId);
            const aptCard = document.createElement('div');
            aptCard.className = 'appointment-card';
            aptCard.innerHTML = `
                <h4>Cita para ${pet ? pet.name : 'Mascota'}</h4>
                <p>Fecha: ${apt.date}</p>
                <p>Hora: ${apt.time}</p>
                <p>Motivo: ${apt.reason}</p>
                <button class="cancel-appointment-btn" data-id="${apt.id}">Cancelar Cita</button>
            `;
            appointmentsList.appendChild(aptCard);
        });
    }
    
    // Llenar selector de mascotas para nueva cita
    petSelect.innerHTML = '<option value="">Selecciona una mascota</option>';
    userPets.forEach(pet => {
        const option = document.createElement('option');
        option.value = pet.id;
        option.textContent = pet.name;
        petSelect.appendChild(option);
    });
    
    // Generar horas disponibles (simulado)
    const timeSelect = document.getElementById('appointment-time');
    timeSelect.innerHTML = '<option value="">Selecciona una hora</option>';
    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
    hours.forEach(hour => {
        const option = document.createElement('option');
        option.value = hour;
        option.textContent = hour;
        timeSelect.appendChild(option);
    });
}

function showAddPetForm() {
    petsList.innerHTML = `
        <form id="add-pet-form">
            <input type="text" id="pet-name" placeholder="Nombre" required>
            <select id="pet-species" required>
                <option value="">Especie</option>
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
            </select>
            <input type="text" id="pet-breed" placeholder="Raza" required>
            <input type="number" id="pet-age" placeholder="Edad" min="0" required>
            <input type="number" id="pet-weight" placeholder="Peso (kg)" step="0.1" min="0" required>
            <textarea id="pet-medical-history" placeholder="Historial médico"></textarea>
            <button type="submit">Guardar Mascota</button>
            <button type="button" id="cancel-add-pet">Cancelar</button>
        </form>
    `;
    
    document.getElementById('add-pet-form').addEventListener('submit', handleAddPet);
    document.getElementById('cancel-add-pet').addEventListener('click', loadUserData);
}

function handleAddPet(e) {
    e.preventDefault();
    const newPet = {
        id: Date.now(),
        ownerId: currentUser.id,
        name: document.getElementById('pet-name').value,
        species: document.getElementById('pet-species').value,
        breed: document.getElementById('pet-breed').value,
        age: document.getElementById('pet-age').value,
        weight: document.getElementById('pet-weight').value,
        medicalHistory: document.getElementById('pet-medical-history').value
    };
    
    pets.push(newPet);
    loadUserData();
}

function handleNewAppointment(e) {
    e.preventDefault();
    const petId = parseInt(petSelect.value);
    const date = document.getElementById('appointment-date').value;
    const time = document.getElementById('appointment-time').value;
    const reason = document.getElementById('appointment-reason').value;
    
    if (!petId || !date || !time || !reason) {
        alert('Por favor completa todos los campos');
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
    newAppointmentForm.reset();
    alert('Cita agendada exitosamente');
    loadUserData();
    document.querySelector('[data-tab="citas"]').click();
}

// Datos iniciales para prueba
users.push({
    id: 1,
    name: "Usuario de Prueba",
    email: "test@example.com",
    phone: "5551234567",
    password: "123456"
});

pets.push({
    id: 1,
    ownerId: 1,
    name: "Firulais",
    species: "perro",
    breed: "Labrador",
    age: 3,
    weight: 25,
    medicalHistory: "Vacunas al día"
});

appointments.push({
    id: 1,
    ownerId: 1,
    petId: 1,
    date: "2023-12-15",
    time: "10:00",
    reason: "consulta",
    status: "pendiente"
});