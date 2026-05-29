/* === ЯДРО ПРИЛОЖЕНИЯ: хранилище, перевод, навигация, авторизация === */

// --- Работа с localStorage (память браузера) ---
function store(key, val) { localStorage.setItem('lola_' + key, JSON.stringify(val)); }
function load(key, def) { try { const v = localStorage.getItem('lola_' + key); return v ? JSON.parse(v) : def; } catch (e) { return def; } }

// --- Текущие настройки ---
let currentLang = load('lang', 'ru');
let currentTheme = load('theme', 'light');
let currentUser = load('currentUser', null);
let selectedSlotId = null;
let selectedDate = null;
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();
let currentServiceId = null;
let currentPostId = null;

// --- Инициализация данных при первом запуске ---
function initData() {
  if (!load('users', null)) {
    store('users', [{ id: 1, name: 'Админ', phone: 'admin', password: 'admin', role: 'admin' }]);
  }

  const currentServices = load('services', null);
  if (!currentServices || (currentServices.length > 0 && currentServices[0].icon === '💅')) {
    store('services', DEFAULT_SERVICES);
  }

  if (!load('slots', null)) store('slots', []);
  if (!load('posts', null)) store('posts', DEFAULT_BLOG_POSTS);
  if (!load('bookings', null)) store('bookings', []);
}

// --- Перевод интерфейса ---
function t(key) {
  const tr = TRANSLATIONS[key];
  return tr ? (tr[currentLang] || tr.ru || key) : key;
}
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
}

// --- Тема (светлая/тёмная) ---
function applyTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.className = 'toggle-switch' + (currentTheme === 'dark' ? ' active' : '');
}

// --- Уведомления (toast) ---
function toast(msg, type) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const d = document.createElement('div');
  d.className = 'toast toast-' + (type || 'success');
  d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 3000);
}

/* === ФОРМАТИРОВАНИЕ ТЕЛЕФОНА ===
   Автоматически форматирует ввод в формат: XX XXX XX XX
   Разрешает вводить ТОЛЬКО цифры (максимум 9 штук) */
function formatPhone(input) {
  // Убираем всё кроме цифр
  let digits = input.value.replace(/\D/g, '');
  // Максимум 9 цифр (номер без кода страны)
  if (digits.length > 9) digits = digits.slice(0, 9);
  // Форматируем: XX XXX XX XX
  let formatted = '';
  if (digits.length > 0) formatted = digits.slice(0, 2);
  if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
  if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
  if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
  input.value = formatted;
}

/* Получить полный номер телефона с +998 из поля ввода */
function getFullPhone(inputId) {
  const raw = document.getElementById(inputId).value.replace(/\D/g, '');
  if (raw.length !== 9) return null; // Номер неполный
  return '+998' + raw;
}

/* Форматирование времени - только цифры, автоматическое двоеточие */
function formatTimeInput(input) {
  let value = input.value.replace(/\D/g, ''); // Удаляем всё кроме цифр
  if (value.length > 4) value = value.slice(0, 4); // Максимум 4 цифры (HH:MM)
  
  // Автоматически добавляем двоеточие
  if (value.length >= 2 && value.length <= 4) {
    value = value.slice(0, 2) + ':' + value.slice(2);
  }
  
  input.value = value;
}

function formatDigitsInput(input) {
  input.value = input.value.replace(/\D/g, '');
}

function normalizeDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatPrice(value) {
  const digits = normalizeDigits(value);
  return digits ? digits + ' ' + t('service_price_suffix') : '';
}

function formatDuration(value) {
  const digits = normalizeDigits(value);
  return digits ? digits + ' ' + t('service_duration_suffix') : '';
}

/* Показать номер без +998 (для редактирования профиля) */
function setPhoneInput(inputId, fullPhone) {
  const digits = fullPhone.replace(/\D/g, '').replace(/^998/, '');
  const input = document.getElementById(inputId);
  input.value = digits;
  formatPhone(input);
}

// --- Навигация между страницами ---
function showPage(pageId, hideNav) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  const nav = document.getElementById('bottom-nav');
  if (nav) nav.style.display = hideNav ? 'none' : 'flex';
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navBtn = document.getElementById('nav-' + pageId);
  if (navBtn) navBtn.classList.add('active');
}

// --- Модальное окно ---
function showModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
}
function hideModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// === АВТОРИЗАЦИЯ ===

/* Обычный вход клиента (по номеру +998 и паролю) */
function doLogin() {
  const phone = getFullPhone('login-phone');
  const pass = document.getElementById('login-password').value;
  if (!phone || !pass) return toast(t('err_fill_all'), 'error');
  const users = load('users', []);
  const user = users.find(u => u.phone === phone && u.password === pass);
  if (!user) return toast(t('err_wrong_creds'), 'error');
  currentUser = user;
  store('currentUser', user);
  enterApp();
}

/* Скрытый вход для админа — вызывается долгим нажатием на логотип */
function showAdminLoginModal() {
  showModal(`
    <div class="modal-title"><i class="ph-light ph-lock-key" style="font-size:28px; margin-right:8px;"></i> Вход для администратора</div>
    <div class="input-group">
      <label>Логин</label>
      <input type="text" id="admin-login-input" placeholder="admin">
    </div>
    <div class="input-group">
      <label>Пароль</label>
      <input type="password" id="admin-pass-input" placeholder="••••••">
    </div>
    <button class="btn btn-primary mt-16" onclick="doAdminLogin()">Войти</button>
    <button class="btn btn-secondary mt-8" onclick="hideModal()">${t('cancel')}</button>
  `);
}

/* Выполняет вход администратора */
function doAdminLogin() {
  const login = document.getElementById('admin-login-input').value.trim();
  const pass = document.getElementById('admin-pass-input').value;
  if (!login || !pass) return toast(t('err_fill_all'), 'error');
  const users = load('users', []);
  const user = users.find(u => u.phone === login && u.password === pass && u.role === 'admin');
  if (!user) return toast(t('err_wrong_creds'), 'error');
  currentUser = user;
  store('currentUser', user);
  hideModal();
  enterApp();
}

function doRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const phone = getFullPhone('reg-phone');
  const pass = document.getElementById('reg-password').value;
  if (!name || !phone || !pass) return toast(t('err_fill_all'), 'error');
  if (pass.length < 4) return toast(t('err_short_pass'), 'error');
  const users = load('users', []);
  if (users.find(u => u.phone === phone)) return toast(t('err_phone_exists'), 'error');
  const user = { id: Date.now(), name, phone, password: pass, role: 'client' };
  users.push(user);
  store('users', users);
  currentUser = user;
  store('currentUser', user);
  enterApp();
}

function doResetPassword() {
  const phone = getFullPhone('forgot-phone');
  const newPass = document.getElementById('forgot-new-password').value;
  if (!phone || !newPass) return toast(t('err_fill_all'), 'error');
  if (newPass.length < 4) return toast(t('err_short_pass'), 'error');
  const users = load('users', []);
  const user = users.find(u => u.phone === phone);
  if (!user) return toast(t('err_phone_not_found'), 'error');
  user.password = newPass;
  store('users', users);
  toast(t('password_changed'));
  showPage('login');
}

function doLogout() {
  currentUser = null;
  store('currentUser', null);
  document.getElementById('app-main').classList.add('hidden');
  showPage('login');
}

// === ВХОД В ПРИЛОЖЕНИЕ ===
function enterApp() {
  document.getElementById('app-main').classList.remove('hidden');
  const isAdmin = currentUser.role === 'admin';
  renderHome();
  renderBlog();
  renderSettings();
  showPage('home');
  applyTranslations();
}

// === ГЛАВНАЯ: СПИСОК УСЛУГ ===
function renderHome() {
  const grid = document.getElementById('services-grid');
  const services = load('services', []);
  const greeting = document.getElementById('home-user-greeting');
  if (greeting && currentUser) greeting.textContent = t('hello') + ', ' + currentUser.name + '!';

  const isAdmin = currentUser && currentUser.role === 'admin';
  const adminBtn = document.getElementById('home-admin-add-btn');
  if (adminBtn) adminBtn.classList.toggle('hidden', !isAdmin);

  grid.innerHTML = services.map(s => {
    const name = s.nameKey ? t(s.nameKey) : (s['name_' + currentLang] || s.name_ru || '');
    return `
    <div class="service-card glass" onclick="openService(${s.id})">
      <span class="service-icon"><i class="ph-light ${s.icon}"></i></span>
      <div class="service-name">${name}</div>
      <div class="service-price">${formatPrice(s.price)}</div>
      <div class="service-duration">${formatDuration(s.duration)}</div>
    </div>
  `}).join('');
}

// === ДЕТАЛИ УСЛУГИ ===
function openService(id) {
  currentServiceId = id;
  selectedSlotId = null;
  const services = load('services', []);
  const svc = services.find(s => s.id === id);
  if (!svc) return;
  const name = svc.nameKey ? t(svc.nameKey) : (svc['name_' + currentLang] || svc.name_ru || '');
  const desc = svc.descKey ? t(svc.descKey) : (svc['desc_' + currentLang] || svc.desc_ru || '');

  document.getElementById('service-title').textContent = name;
  document.getElementById('service-hero').innerHTML = `
    <span class="service-icon" style="font-size:64px;"><i class="ph-light ${svc.icon}"></i></span>
    <h2>${name}</h2>
    <span class="price-tag">${formatPrice(svc.price)}</span>
    <div class="service-duration" style="margin-top:8px">${formatDuration(svc.duration)}</div>
  `;

  const isAdmin = currentUser && currentUser.role === 'admin';
  const adminBtnsHtml = isAdmin ? `
    <div style="display:flex; gap:8px; margin-top:20px; width:100%; overflow:hidden;">
      <button class="btn btn-secondary btn-small" style="flex:1;" onclick="showAddServiceModal(${id})"><i class="ph-light ph-pencil-simple"></i> ${t('edit_service')}</button>
      <button class="btn btn-danger btn-small" style="flex:1;" onclick="deleteService(${id})"><i class="ph-light ph-trash"></i> ${t('delete')}</button>
    </div>
  ` : '';

  document.getElementById('service-desc').innerHTML = desc.replace(/\n/g, '<br>') + adminBtnsHtml;

  document.getElementById('client-slots-section').classList.toggle('hidden', isAdmin);
  document.getElementById('btn-book').style.display = isAdmin ? 'none' : 'block';
  document.getElementById('admin-slots-section').classList.toggle('hidden', !isAdmin);
  if (isAdmin) {
    selectedDate = null;
    renderAdminCalendar();
  } else {
    renderClientSlots(id);
  }
  showPage('service', true);
}

// === УПРАВЛЕНИЕ УСЛУГАМИ (АДМИН) ===
let editingServiceId = null;

function showAddServiceModal(serviceId = null) {
  editingServiceId = serviceId;
  const services = load('services', []);
  let svc = { icon: 'ph-sparkle', name_ru: '', name_uz: '', desc_ru: '', desc_uz: '', price: '', duration: '' };

  if (serviceId) {
    const existing = services.find(s => s.id === serviceId);
    if (existing) {
      svc = { ...existing };
      if (svc.nameKey) { svc.name_ru = t(svc.nameKey); svc.name_uz = TRANSLATIONS[svc.nameKey].uz; }
      if (svc.descKey) { svc.desc_ru = t(svc.descKey); svc.desc_uz = TRANSLATIONS[svc.descKey].uz; }
    }
  }

  const iconsList = [
    // Красота и уход
    'ph-sparkle', 'ph-heart', 'ph-star', 'ph-crown', 'ph-diamond', 'ph-flower-lotus', 'ph-flower', 'ph-butterfly', 'ph-feather', 'ph-sun',
    // Тело и спа
    'ph-hands-praying', 'ph-hand-soap', 'ph-drop', 'ph-shower', 'ph-thermometer', 'ph-first-aid', 'ph-heartbeat', 'ph-smiley', 'ph-person', 'ph-gender-female',
    // Инструменты и визаж
    'ph-scissors', 'ph-paint-brush', 'ph-magic-wand', 'ph-palette', 'ph-pencil-simple', 'ph-pen-nib', 'ph-eye', 'ph-eyedropper', 'ph-flask', 'ph-test-tube',
    // Движение и отдых
    'ph-footprints', 'ph-wind', 'ph-leaf', 'ph-tree', 'ph-wave', 'ph-yin-yang', 'ph-infinity', 'ph-lightning', 'ph-flame', 'ph-moon',
    // Атрибуты салона
    'ph-clock', 'ph-calendar', 'ph-map-pin', 'ph-gift', 'ph-tag', 'ph-certificate', 'ph-trophy', 'ph-medal', 'ph-shield-check', 'ph-seal-check'
  ];
  
  const iconsHtml = iconsList.map(icon => `
    <div class="icon-picker-item ${svc.icon === icon ? 'active' : ''}" onclick="selectServiceIcon('${icon}', this)">
      <i class="ph-light ${icon}"></i>
    </div>
  `).join('');

  showModal(`
    <div class="modal-title">${serviceId ? '<i class="ph-light ph-pencil-simple"></i> ' + t('edit_service') : '<i class="ph-light ph-plus"></i> ' + t('add_service')}</div>
    <div class="input-group">
      <label>${t('service_icon')}</label>
      <input type="hidden" id="svc-icon-input" value="${svc.icon}">
      <div class="icon-picker-grid">
        ${iconsHtml}
      </div>
    </div>
    <div class="input-group">
      <label>${t('service_name')} (RU)</label>
      <input type="text" id="svc-name-ru" value="${svc.name_ru || ''}">
    </div>
    <div class="input-group">
      <label>${t('service_name')} (UZ)</label>
      <input type="text" id="svc-name-uz" value="${svc.name_uz || ''}">
    </div>
    <div class="input-group">
      <label>${t('service_price')}</label>
      <div class="input-with-suffix">
        <input type="text" id="svc-price" inputmode="numeric" pattern="[0-9]*" oninput="formatDigitsInput(this)" value="${normalizeDigits(svc.price)}">
        <span class="input-suffix">${t('service_price_suffix')}</span>
      </div>
    </div>
    <div class="input-group">
      <label>${t('service_duration')}</label>
      <div class="input-with-suffix">
        <input type="text" id="svc-dur" inputmode="numeric" pattern="[0-9]*" oninput="formatDigitsInput(this)" value="${normalizeDigits(svc.duration)}">
        <span class="input-suffix">${t('service_duration_suffix')}</span>
      </div>
    </div>
    <div class="input-group">
      <label>${t('service_desc')} (RU)</label>
      <textarea id="svc-desc-ru">${svc.desc_ru || ''}</textarea>
    </div>
    <div class="input-group">
      <label>${t('service_desc')} (UZ)</label>
      <textarea id="svc-desc-uz">${svc.desc_uz || ''}</textarea>
    </div>
    <button class="btn btn-primary mt-16" onclick="saveService()">${t('save')}</button>
    <button class="btn btn-secondary mt-8" onclick="hideModal()">${t('cancel')}</button>
  `);
}

function selectServiceIcon(iconName, element) {
  document.getElementById('svc-icon-input').value = iconName;
  document.querySelectorAll('.icon-picker-item').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
}

function saveService() {
  const nameRu = document.getElementById('svc-name-ru').value.trim();
  const price = normalizeDigits(document.getElementById('svc-price').value.trim());
  const duration = normalizeDigits(document.getElementById('svc-dur').value.trim());
  if (!nameRu || !price || !duration) return toast(t('err_fill_all'), 'error');

  let services = load('services', []);

  if (editingServiceId) {
    const idx = services.findIndex(s => s.id === editingServiceId);
    if (idx !== -1) {
      services[idx] = {
        id: editingServiceId,
        icon: document.getElementById('svc-icon-input').value.trim() || 'ph-sparkle',
        name_ru: nameRu,
        name_uz: document.getElementById('svc-name-uz').value.trim() || nameRu,
        desc_ru: document.getElementById('svc-desc-ru').value.trim(),
        desc_uz: document.getElementById('svc-desc-uz').value.trim(),
        price: price,
        duration: duration,
      };
      toast(t('service_saved'));
    }
  } else {
    services.push({
      id: Date.now(),
      icon: document.getElementById('svc-icon-input').value.trim() || 'ph-sparkle',
      name_ru: nameRu,
      name_uz: document.getElementById('svc-name-uz').value.trim() || nameRu,
      desc_ru: document.getElementById('svc-desc-ru').value.trim(),
      desc_uz: document.getElementById('svc-desc-uz').value.trim(),
      price: price,
      duration: duration,
    });
    toast(t('service_saved'));
  }

  store('services', services);
  editingServiceId = null;
  hideModal();

  if (currentServiceId && document.getElementById('page-service').classList.contains('active')) {
    openService(currentServiceId);
  } else {
    renderHome();
  }
}

function deleteService(id) {
  const msg = currentLang === 'ru' ? 'Точно удалить эту услугу?' : 'Ushbu xizmatni aniq o`chirmoqchimisiz?';
  showModal(`
    <div class="modal-title" style="text-align:center;"><i class="ph-light ph-trash" style="font-size: 48px; color: var(--danger); margin-bottom: 16px;"></i><br>${msg}</div>
    <div style="display:flex; gap:10px; margin-top:24px;">
      <button class="btn btn-secondary" style="flex:1;" onclick="hideModal()">${t('cancel')}</button>
      <button class="btn btn-danger" style="flex:1;" onclick="confirmDeleteService(${id})">${t('delete')}</button>
    </div>
  `);
}

function confirmDeleteService(id) {
  hideModal();
  let services = load('services', []);
  services = services.filter(s => s.id !== id);
  store('services', services);

  // Also delete related slots
  let slots = load('slots', []);
  slots = slots.filter(s => s.serviceId !== id);
  store('slots', slots);

  toast(t('service_deleted'));
  showPage('home');
  renderHome();
}

// === КЛИЕНТ: СВОБОДНЫЕ ОКОШКИ ===
function renderClientSlots(serviceId) {
  const slots = load('slots', []).filter(s => s.serviceId === serviceId && !s.isBooked);
  const container = document.getElementById('client-slots-list');
  const bookBtn = document.getElementById('btn-book');
  if (slots.length === 0) {
    container.innerHTML = `<div class="empty-state"><span class="empty-icon"><i class="ph-light ph-calendar-x"></i></span><p>${t('no_slots')}</p></div>`;
    bookBtn.style.display = 'none';
    return;
  }
  // Группируем по дате
  const grouped = {};
  const today = new Date().toISOString().split('T')[0];
  slots.filter(s => s.date >= today).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).forEach(s => {
    if (!grouped[s.date]) grouped[s.date] = [];
    grouped[s.date].push(s);
  });
  if (Object.keys(grouped).length === 0) {
    container.innerHTML = `<div class="empty-state"><span class="empty-icon"><i class="ph-light ph-calendar-x"></i></span><p>${t('no_slots')}</p></div>`;
    bookBtn.style.display = 'none';
    return;
  }
  container.innerHTML = Object.entries(grouped).map(([date, dateSlots]) => {
    // Если на эту дату установлен выходной, показываем статус и убираем время
    const isDayOff = dateSlots.some(s => s.isDayOff);
    if (isDayOff) {
      return `
        <div class="slots-date-group glass" style="padding: 12px; border-radius: 14px;">
          <div class="slots-date-label">${formatDate(date)}</div>
          <div class="slots-list">
            <span style="color:var(--danger); font-size:14px; font-weight:600; padding: 10px 0;"><i class="ph-light ph-calendar-x" style="margin-right:8px;"></i> ${t('day_off')}</span>
          </div>
        </div>
      `;
    }
    // Иначе рендерим слоты времени
    return `
      <div class="slots-date-group glass" style="padding: 12px; border-radius: 14px;">
        <div class="slots-date-label">${formatDate(date)}</div>
        <div class="slots-list">
          ${dateSlots.map(s => `<button class="slot-chip${selectedSlotId === s.id ? ' selected' : ''}" onclick="selectSlot(${s.id}); showSystemTimePicker('${s.time}')">${s.time}</button>`).join('')}
        </div>
      </div>
    `;
  }).join('');
  // Кнопка записи доступна, только если выбран конкретный слот времени
  bookBtn.style.display = selectedSlotId ? 'block' : 'none';
}

function selectSlot(id) {
  selectedSlotId = id;
  renderClientSlots(currentServiceId);
}

/* Показать системный выбор времени для слота */
function showSystemTimePicker(slotTime) {
  // Создаем скрытый input type="time" с текущим временем и эмулируем клик
  const input = document.createElement('input');
  input.type = 'time';
  input.value = slotTime && slotTime.includes(':') ? slotTime : '10:00'; // Формат HH:MM
  input.style.display = 'none';
  document.body.appendChild(input);
  
  // Вызываем нативный системный picker
  input.click();
  
  input.onchange = () => {
    // Время выбрано - можно использовать input.value
    console.log('Выбранное время:', input.value);
    document.body.removeChild(input);
  };
  
  input.oncancel = () => {
    // Пользователь отменил выбор времени
    document.body.removeChild(input);
  };
}

function doBooking() {
  if (!selectedSlotId) return toast(t('select_time'), 'error');
  const slots = load('slots', []);
  const slot = slots.find(s => s.id === selectedSlotId);
  if (!slot) return;
  slot.isBooked = true;
  slot.bookedBy = currentUser.id;
  slot.bookedName = currentUser.name;
  slot.bookedPhone = currentUser.phone;
  store('slots', slots);
  const bookings = load('bookings', []);
  bookings.push({ id: Date.now(), userId: currentUser.id, userName: currentUser.name, userPhone: currentUser.phone, serviceId: currentServiceId, slotId: selectedSlotId, date: slot.date, time: slot.time, status: 'confirmed' });
  store('bookings', bookings);
  toast(t('booking_success'));
  selectedSlotId = null;
  showPage('home');
  renderHome();
}

// === КЛИЕНТ: МОИ ЗАПИСИ ===
function showMyBookingsPage() {
  const titleEl = document.querySelector('#page-my-bookings .top-bar-title');
  const labelEl = document.querySelector('#btn-my-bookings .settings-item-label');
  const isAdmin = currentUser && currentUser.role === 'admin';
  if (titleEl) titleEl.textContent = isAdmin ? t('all_bookings') : t('my_bookings');
  if (labelEl) labelEl.textContent = isAdmin ? t('all_bookings') : t('my_bookings');
  showPage('my-bookings');
  renderMyBookings();
}

function renderMyBookings() {
  const container = document.getElementById('my-bookings-content');
  const isAdmin = currentUser && currentUser.role === 'admin';
  const bookings = load('bookings', []).filter(b => isAdmin ? true : b.userId === currentUser.id);
  const services = load('services', []);

  if (bookings.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 40px 20px; color: var(--text-2); font-size:16px;">${t('no_bookings')}</div>`;
    return;
  }

  bookings.sort((a, b) => new Date(a.date) - new Date(b.date));

  let html = '<div class="service-list">';
  bookings.forEach(b => {
    const svc = services.find(s => s.id === b.serviceId) || {};
    const serviceName = svc.nameKey ? t(svc.nameKey) : (svc.name_ru || 'Услуга');
    const dateFormatted = formatDate(b.date);
    const phoneLink = b.userPhone ? `<a href="tel:${b.userPhone}" style="color:var(--accent-1); text-decoration: none;">${b.userPhone}</a>` : b.userPhone;
    const userLabel = isAdmin ? `<div style="margin-top:8px; font-size:13px; color:var(--text-2);">${t('client')}: ${b.userName} · ${phoneLink}</div>` : '';

    html += `
      <div class="service-card glass">
        <div class="service-icon" style="font-size:32px;"><i class="ph-light ${svc.icon || 'ph-calendar'}"></i></div>
        <div class="service-info">
          <div class="service-name">${serviceName}</div>
          ${userLabel}
          <div class="service-desc" style="color:var(--text-1); font-weight:600; margin-top:8px;">${dateFormatted} — ${b.time}</div>
          <div class="service-price" style="margin-top:8px;">
            <span style="font-size:12px; color:var(--text-2);">${currentLang === 'ru' ? 'Статус:' : 'Holat:'} </span>
            <span style="color:var(--success); font-weight:600;">${currentLang === 'ru' ? 'Подтверждено' : 'Tasdiqlangan'}</span>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

// === АДМИН: КАЛЕНДАРЬ ===
function renderAdminCalendar() {
  const cal = document.getElementById('admin-calendar');
  const monthNames_ru = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const monthNames_uz = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  const dayNames_ru = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const dayNames_uz = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
  const mNames = currentLang === 'uz' ? monthNames_uz : monthNames_ru;
  const dNames = currentLang === 'uz' ? dayNames_uz : dayNames_ru;
  const firstDay = new Date(calendarYear, calendarMonth, 1);
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];
  const slots = load('slots', []).filter(s => s.serviceId === currentServiceId);
  let cells = dNames.map(d => `<div class="calendar-day-name">${d}</div>`).join('');
  for (let i = 0; i < startDay; i++) cells += '<div class="calendar-day empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const hasSlots = slots.some(s => s.date === dateStr);
    const isDayOff = slots.some(s => s.date === dateStr && s.isDayOff);
    const isToday = dateStr === today;
    const isSel = dateStr === selectedDate;
    let cls = 'calendar-day';
    if (isToday) cls += ' today';
    if (isSel) cls += ' selected';
    if (hasSlots && !isDayOff) cls += ' has-slots';
    if (isDayOff) cls += ' day-off';
    cells += `<button class="${cls}" onclick="selectCalendarDate('${dateStr}')">${d}</button>`;
  }
  cal.innerHTML = `
    <div class="calendar-header">
      <button class="calendar-nav" onclick="changeMonth(-1)">‹</button>
      <div class="calendar-title">${mNames[calendarMonth]} ${calendarYear}</div>
      <button class="calendar-nav" onclick="changeMonth(1)">›</button>
    </div>
    <div class="calendar-grid">${cells}</div>
  `;
  renderAdminDaySlots();
}

function changeMonth(dir) {
  calendarMonth += dir;
  if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
  if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
  renderAdminCalendar();
}

function selectCalendarDate(date) {
  selectedDate = date;
  renderAdminCalendar();
}

function renderAdminDaySlots() {
  const container = document.getElementById('admin-day-slots');
  if (!selectedDate) {
    container.innerHTML = `<div class="empty-state"><span class="empty-icon"><i class="ph-light ph-calendar-blank"></i></span><p>${t('select_date')}</p></div>`;
    return;
  }
  const slots = load('slots', []).filter(s => s.serviceId === currentServiceId && s.date === selectedDate);
  const dayOff = slots.find(s => s.isDayOff);
  let html = `<div class="glass" style="padding:20px">
    <h3 style="margin-bottom:12px">${formatDate(selectedDate)}</h3>`;
  if (dayOff) {
    html += `<p style="color:var(--danger);margin-bottom:12px"><i class="ph-light ph-calendar-x" style="margin-right:8px;"></i> ${t('day_off')}</p>
      <button class="btn btn-secondary btn-small" onclick="toggleDayOff()">${t('remove_day_off')}</button>`;
  } else {
    html += `<div class="slots-list" style="margin-bottom:16px">`;
    const timeSlots = slots.filter(s => !s.isDayOff);
    if (timeSlots.length > 0) {
      timeSlots.forEach(s => {
        const booked = s.isBooked ? ` (${s.bookedName || t('booked')})` : '';
        html += `<div class="slot-chip${s.isBooked ? ' booked' : ''}">${s.time}${booked} ${!s.isBooked ? `<span onclick="removeSlot(${s.id})" style="cursor:pointer;margin-left:6px">✕</span>` : ''}</div>`;
      });
    } else {
      html += `<p style="color:var(--text-2);font-size:13px">${t('no_slots')}</p>`;
    }
    html += `</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary btn-small" onclick="showAddSlotModal()">${t('add_time_slot')}</button>
        <button class="btn btn-danger btn-small" onclick="toggleDayOff()">${t('mark_day_off')}</button>
      </div>`;
  }
  html += `</div>`;
  container.innerHTML = html;
}

function showAddSlotModal() {
  showModal(`
    <div class="modal-title">${t('add_time_slot')}</div>
    <div class="input-group">
      <label>${t('time')}</label>
      <input type="time" id="new-slot-time" required>
    </div>
    <button class="btn btn-primary mt-16" onclick="addSlot()">${t('save')}</button>
    <button class="btn btn-secondary mt-8" onclick="hideModal()">${t('cancel')}</button>
  `);
  // Автоматически вызываем системный time picker
  setTimeout(() => {
    const timeInput = document.getElementById('new-slot-time');
    if (timeInput) timeInput.click();
  }, 100);
}

function addSlot() {
  const timeInput = document.getElementById('new-slot-time');
  if (!timeInput || !timeInput.value) return toast(t('err_fill_all'), 'error');

  // type="time" уже обеспечивает правильный формат HH:MM
  const timeValue = timeInput.value; // Это будет в формате HH:MM

  const slots = load('slots', []);
  slots.push({ id: Date.now(), serviceId: currentServiceId, date: selectedDate, time: timeValue, isBooked: false, isDayOff: false });
  store('slots', slots);
  hideModal();
  toast(t('slot_added'));
  renderAdminCalendar();
}

function removeSlot(id) {
  let slots = load('slots', []);
  slots = slots.filter(s => s.id !== id);
  store('slots', slots);
  toast(t('slot_removed'));
  renderAdminCalendar();
}

function toggleDayOff() {
  let slots = load('slots', []);
  const existing = slots.find(s => s.serviceId === currentServiceId && s.date === selectedDate && s.isDayOff);
  if (existing) {
    slots = slots.filter(s => s.id !== existing.id);
  } else {
    slots = slots.filter(s => !(s.serviceId === currentServiceId && s.date === selectedDate));
    slots.push({ id: Date.now(), serviceId: currentServiceId, date: selectedDate, isDayOff: true });
  }
  store('slots', slots);
  renderAdminCalendar();
}

// === ВЛОГ ===
function renderBlog() {
  const posts = load('posts', []);
  const feed = document.getElementById('blog-feed');
  const adminBtnSlot = document.getElementById('blog-admin-btn');

  if (adminBtnSlot) {
    adminBtnSlot.classList.toggle('hidden', !(currentUser && currentUser.role === 'admin'));
  }

  if (posts.length === 0) {
    feed.innerHTML = `<div class="empty-state"><span class="empty-icon"><i class="ph-light ph-note-pencil"></i></span><p>${t('no_posts')}</p></div>`;
    return;
  }

  feed.innerHTML = posts.sort((a, b) => b.date.localeCompare(a.date)).map(p => {
    const title = p.titleKey ? t(p.titleKey) : (p['title_' + currentLang] || p.title_ru || '');
    const content = p['content_' + currentLang] || p.content_ru || '';
    return `<div class="blog-card glass" onclick="openPost(${p.id})">
      ${p.image ? `<img class="blog-card-img" src="${p.image}" alt="">` : `<div class="blog-card-img-placeholder"><i class="ph-light ph-camera"></i></div>`}
      <div class="blog-card-body">
        <div class="blog-card-title">${title}</div>
        <div class="blog-card-date">${formatDate(p.date)}</div>
        <div class="blog-card-excerpt">${content}</div>
      </div>
    </div>`;
  }).join('');
}

function openPost(id) {
  currentPostId = id;
  const posts = load('posts', []);
  const post = posts.find(p => p.id === id);
  if (!post) return;
  const title = post.titleKey ? t(post.titleKey) : (post['title_' + currentLang] || post.title_ru || '');
  const content = post['content_' + currentLang] || post.content_ru || '';

  // Кнопка удаления и редактирования (только для админа)
  const adminBtnsHtml = (currentUser && currentUser.role === 'admin') ? `
    <div style="display:flex; gap:8px; margin-top:20px; width:100%; overflow:hidden;">
      <button class="btn btn-secondary btn-small" style="flex:1;" onclick="showAddPostModal(${id})"><i class="ph-light ph-pencil-simple"></i> ${t('edit_post')}</button>
      <button class="btn btn-danger btn-small" style="flex:1;" onclick="deletePost(${id})"><i class="ph-light ph-trash"></i> ${t('delete')}</button>
    </div>
  ` : '';

  document.getElementById('blog-detail-content').innerHTML = `
    ${post.image ? `<img class="blog-detail-img" src="${post.image}" alt="">` : ''}
    <div class="blog-detail-title">${title}</div>
    <div class="blog-detail-date">${formatDate(post.date)}</div>
    <div class="blog-detail-content">${content.replace(/\n/g, '<br>')}</div>
    ${adminBtnsHtml}
  `;
  const blogBookBtn = document.getElementById('btn-blog-book');
  if (post.serviceId) {
    blogBookBtn.style.display = 'block';
    blogBookBtn.onclick = () => openService(post.serviceId);
  } else {
    blogBookBtn.style.display = 'none';
  }
  showPage('blog-detail', true);
}

/* Удаление поста (для админа) - Используем кастомную модалку вместо confirm */
function deletePost(id) {
  const msg = currentLang === 'ru' ? 'Точно удалить этот пост?' : 'Ushbu postni aniq o`chirmoqchimisiz?';
  const yes = t('delete');
  const no = t('cancel');

  showModal(`
    <div class="modal-title" style="text-align:center;"><i class="ph-light ph-trash" style="font-size: 48px; color: var(--danger); margin-bottom: 16px;"></i><br>${msg}</div>
    <div style="display:flex; gap:10px; margin-top:24px;">
      <button class="btn btn-secondary" style="flex:1;" onclick="hideModal()">${no}</button>
      <button class="btn btn-danger" style="flex:1;" onclick="confirmDeletePost(${id})">${yes}</button>
    </div>
  `);
}

function confirmDeletePost(id) {
  hideModal();
  let posts = load('posts', []);
  posts = posts.filter(p => p.id !== id);
  store('posts', posts);
  toast(t('delete') + ' ✓');
  showPage('blog');
  renderBlog();
}

let editingPostId = null;

function showAddPostModal(postId = null) {
  editingPostId = postId;
  const services = load('services', []);
  const posts = load('posts', []);
  let post = { title_ru: '', title_uz: '', content_ru: '', content_uz: '', serviceId: '', image: '' };

  if (postId) {
    const existing = posts.find(p => p.id === postId);
    if (existing) post = existing;
    pendingPostImage = post.image; // Если есть картинка
  } else {
    pendingPostImage = null;
  }

  const opts = services.map(s => `<option value="${s.id}" ${post.serviceId === s.id ? 'selected' : ''}>${t(s.nameKey)}</option>`).join('');

  showModal(`
    <div class="modal-title">${postId ? '<i class="ph-light ph-pencil-simple"></i> ' + t('edit_post') : '<i class="ph-light ph-note-pencil"></i> ' + t('add_post')}</div>
    <div class="input-group">
      <label>${t('post_title')} (RU)</label>
      <input type="text" id="post-title-ru" value="${post.title_ru}">
    </div>
    <div class="input-group">
      <label>${t('post_title')} (UZ)</label>
      <input type="text" id="post-title-uz" value="${post.title_uz || ''}">
    </div>
    <div class="input-group">
      <label>${t('post_content')} (RU)</label>
      <textarea id="post-content-ru">${post.content_ru}</textarea>
    </div>
    <div class="input-group">
      <label>${t('post_content')} (UZ)</label>
      <textarea id="post-content-uz">${post.content_uz || ''}</textarea>
    </div>
    <div class="input-group">
      <label>${t('related_service')}</label>
      <select id="post-service"><option value="">${t('none_selected')}</option>${opts}</select>
    </div>
    <div class="input-group">
      <label>${t('post_image')}</label>
      <input type="file" id="post-image-file" accept="image/*" onchange="handlePostImage(this)">
      ${post.image ? `<small style="display:block; margin-top:4px; color:var(--success);">✓ Картинка загружена</small>` : ''}
    </div>
    <button class="btn btn-primary mt-16" onclick="publishPost()">${postId ? t('save') : t('publish')}</button>
    <button class="btn btn-secondary mt-8" onclick="hideModal()">${t('cancel')}</button>
  `);
}
let pendingPostImage = null;
function handlePostImage(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => { pendingPostImage = e.target.result; };
  reader.readAsDataURL(file);
}

function publishPost() {
  const titleRu = document.getElementById('post-title-ru').value.trim();
  const contentRu = document.getElementById('post-content-ru').value.trim();
  if (!titleRu || !contentRu) return toast(t('err_fill_all'), 'error');

  let posts = load('posts', []);

  if (editingPostId) {
    const postIndex = posts.findIndex(p => p.id === editingPostId);
    if (postIndex !== -1) {
      posts[postIndex] = {
        ...posts[postIndex],
        title_ru: titleRu,
        title_uz: document.getElementById('post-title-uz').value.trim() || titleRu,
        content_ru: contentRu,
        content_uz: document.getElementById('post-content-uz').value.trim() || contentRu,
        serviceId: parseInt(document.getElementById('post-service').value) || null,
        image: pendingPostImage || posts[postIndex].image
      };
      toast(t('save') + ' ✓');
    }
  } else {
    posts.push({
      id: Date.now(),
      title_ru: titleRu,
      title_uz: document.getElementById('post-title-uz').value.trim() || titleRu,
      content_ru: contentRu,
      content_uz: document.getElementById('post-content-uz').value.trim() || contentRu,
      date: new Date().toISOString().split('T')[0],
      serviceId: parseInt(document.getElementById('post-service').value) || null,
      image: pendingPostImage || null
    });
    toast(t('post_published'));
  }

  store('posts', posts);
  pendingPostImage = null;
  editingPostId = null;
  hideModal();

  // Если мы редактировали пост и находились на странице этого поста, нужно обновить её тоже
  if (currentPostId === editingPostId) {
    openPost(currentPostId);
  } else {
    renderBlog();
  }
}

// === НАСТРОЙКИ ===
function renderSettings() {
  const prof = document.getElementById('settings-profile');
  if (!currentUser) return;
  const initial = currentUser.name.charAt(0).toUpperCase();
  const roleBadge = currentUser.role === 'admin' ? t('admin') : t('client');
  prof.innerHTML = `
    <div class="profile-avatar">${initial}</div>
    <div class="profile-name">${currentUser.name}</div>
    <div class="profile-phone">${currentUser.phone}</div>
    <div class="profile-badge">${roleBadge}</div>
  `;
  const bookingsLabel = document.querySelector('#btn-my-bookings .settings-item-label');
  if (bookingsLabel) bookingsLabel.textContent = currentUser.role === 'admin' ? t('all_bookings') : t('my_bookings');
  document.getElementById('current-lang-label').textContent = currentLang === 'ru' ? t('lang_russian') : t('lang_uzbek');
}

function openEditProfile() {
  document.getElementById('edit-name').value = currentUser.name;
  // Показываем номер без +998 в поле ввода
  if (currentUser.phone && currentUser.phone.startsWith('+998')) {
    setPhoneInput('edit-phone', currentUser.phone);
  } else {
    document.getElementById('edit-phone').value = currentUser.phone;
  }
  showPage('edit-profile', true);
}

function saveProfile() {
  const name = document.getElementById('edit-name').value.trim();
  const phone = getFullPhone('edit-phone');
  if (!name || !phone) return toast(t('err_fill_all'), 'error');
  const users = load('users', []);
  const user = users.find(u => u.id === currentUser.id);
  if (user) { user.name = name; user.phone = phone; store('users', users); }
  currentUser.name = name;
  currentUser.phone = phone;
  store('currentUser', currentUser);
  toast(t('profile_saved'));
  renderSettings();
  showPage('settings');
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  store('theme', currentTheme);
  applyTheme();
}

/* Открывает модальное окно с выбором языка */
function toggleLanguage() {
  showModal(`
    <div class="modal-title">${t('language')}</div>
    <div class="lang-options">
      <button class="lang-option glass ${currentLang === 'ru' ? 'lang-active' : ''}" onclick="setLanguage('ru')">
        <span class="lang-flag">🇷🇺</span>
        <span class="lang-label">Русский</span>
        <span class="lang-check">${currentLang === 'ru' ? '✓' : ''}</span>
      </button>
      <button class="lang-option glass ${currentLang === 'uz' ? 'lang-active' : ''}" onclick="setLanguage('uz')">
        <span class="lang-flag">🇺🇿</span>
        <span class="lang-label">O'zbekcha</span>
        <span class="lang-check">${currentLang === 'uz' ? '✓' : ''}</span>
      </button>
    </div>
    <button class="btn btn-secondary mt-16" onclick="hideModal()">${t('cancel')}</button>
  `);
}

/* Устанавливает выбранный язык и обновляет интерфейс */
function setLanguage(lang) {
  currentLang = lang;
  store('lang', currentLang);
  hideModal();
  applyTranslations();
  renderSettings();
  renderHome();
}

// === УТИЛИТЫ ===
function formatDate(dateStr) {
  const months_ru = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const months_uz = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
  const months = currentLang === 'uz' ? months_uz : months_ru;
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

// === ПРИВЯЗКА СОБЫТИЙ ===
function bindEvents() {
  document.getElementById('btn-login').onclick = doLogin;
  document.getElementById('btn-register').onclick = doRegister;
  document.getElementById('btn-reset-password').onclick = doResetPassword;
  document.getElementById('btn-goto-register').onclick = () => showPage('register');
  document.getElementById('btn-goto-login').onclick = () => showPage('login');
  document.getElementById('btn-goto-forgot').onclick = () => showPage('forgot');
  document.getElementById('btn-forgot-back').onclick = () => showPage('login');
  document.getElementById('service-back').onclick = () => { showPage('home'); renderHome(); };
  document.getElementById('blog-detail-back').onclick = () => { showPage('blog'); renderBlog(); };
  document.getElementById('btn-book').onclick = doBooking;
  document.getElementById('btn-edit-profile').onclick = openEditProfile;
  document.getElementById('edit-profile-back').onclick = () => showPage('settings');
  document.getElementById('btn-save-profile').onclick = saveProfile;
  document.getElementById('btn-toggle-theme').onclick = toggleTheme;
  document.getElementById('btn-toggle-lang').onclick = toggleLanguage;
  document.getElementById('btn-logout').onclick = doLogout;
  document.getElementById('modal-overlay').onclick = e => { if (e.target.id === 'modal-overlay') hideModal(); };
  // Нижнее меню
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.onclick = () => {
      const page = btn.getAttribute('data-page');
      if (page === 'home') renderHome();
      if (page === 'blog') renderBlog();
      if (page === 'settings') renderSettings();
      showPage(page);
    };
  });
  // Enter на полях ввода
  ['login-phone', 'login-password'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  });

  // === СКРЫТЫЙ ВХОД АДМИНА ===
  // Тройной клик (3 быстрых нажатия) на логотип 💅 открывает вход для админа
  const logo = document.getElementById('admin-secret-logo');
  let clickCount = 0;
  let clickTimer = null;
  logo.addEventListener('click', () => {
    clickCount++;
    // Если за 1 секунду нажали 3 раза — открываем вход админа
    if (clickCount >= 3) {
      clickCount = 0;
      clearTimeout(clickTimer);
      showAdminLoginModal();
      return;
    }
    // Сбрасываем счётчик через 1 секунду
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 1000);
  });
}

// === ЗАПУСК ПРИЛОЖЕНИЯ ===
function init() {
  initData();
  applyTheme();
  applyTranslations();
  bindEvents();
  if (currentUser) {
    enterApp();
  } else {
    showPage('login');
  }
}

document.addEventListener('DOMContentLoaded', init);
