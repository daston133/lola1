/* ============================================
   ПЕРЕВОДЫ НА ДВА ЯЗЫКА: РУССКИЙ И УЗБЕКСКИЙ
   
   Как это работает:
   - Каждый текст имеет "ключ" (например "login")
   - Для каждого ключа есть перевод на русском (ru) и узбекском (uz)
   - Когда пользователь меняет язык, все тексты меняются автоматически
   ============================================ */

const TRANSLATIONS = {
  // --- Название и слоган салона ---
  salon_name:       { ru: "ЛОЛА",                          uz: "LOLA" },
  salon_slogan:     { ru: "Салон красоты",                 uz: "Go'zallik saloni" },

  // --- Авторизация ---
  phone:            { ru: "Телефон",                       uz: "Telefon" },
  password:         { ru: "Пароль",                        uz: "Parol" },
  login:            { ru: "Войти",                         uz: "Kirish" },
  no_account:       { ru: "Нет аккаунта? Регистрация",     uz: "Akkaunt yo'qmi? Ro'yxatdan o'tish" },
  forgot_password:  { ru: "Забыли пароль?",                uz: "Parolni unutdingizmi?" },
  registration:     { ru: "Регистрация",                   uz: "Ro'yxatdan o'tish" },
  create_account:   { ru: "Создайте аккаунт",              uz: "Akkaunt yarating" },
  your_name:        { ru: "Ваше имя",                      uz: "Ismingiz" },
  register_btn:     { ru: "Зарегистрироваться",            uz: "Ro'yxatdan o'tish" },
  have_account:     { ru: "Уже есть аккаунт? Войти",      uz: "Akkauntingiz bormi? Kirish" },
  reset_password:   { ru: "Сброс пароля",                  uz: "Parolni tiklash" },
  enter_phone_reset:{ ru: "Введите номер телефона",        uz: "Telefon raqamingizni kiriting" },
  new_password:     { ru: "Новый пароль",                  uz: "Yangi parol" },
  reset_btn:        { ru: "Сбросить пароль",               uz: "Parolni tiklash" },
  back_to_login:    { ru: "Вернуться ко входу",            uz: "Kirishga qaytish" },

  // --- Навигация (нижнее меню) ---
  nav_home:         { ru: "Главная",                       uz: "Bosh sahifa" },
  nav_blog:         { ru: "Влог",                          uz: "Blog" },
  nav_settings:     { ru: "Настройки",                     uz: "Sozlamalar" },
  my_bookings:      { ru: "Мои записи",                    uz: "Mening yozuvlarim" },
  no_bookings:      { ru: "У вас пока нет записей",        uz: "Sizda hozircha yozuvlar yo'q" },

  // --- Услуги ---
  services:         { ru: "Услуги",                        uz: "Xizmatlar" },
  available_slots:  { ru: "Свободные окошки",              uz: "Bo'sh vaqtlar" },
  book_now:         { ru: "Записаться",                    uz: "Yozilish" },
  book_service:     { ru: "Записаться на процедуру",       uz: "Protseduraga yozilish" },
  no_slots:         { ru: "Пока нет свободных окошек",     uz: "Hozircha bo'sh vaqt yo'q" },
  booking_success:  { ru: "Вы успешно записаны!",          uz: "Siz muvaffaqiyatli yozildingiz!" },
  select_time:      { ru: "Выберите время",                uz: "Vaqtni tanlang" },
  confirm_booking:  { ru: "Подтвердить запись",            uz: "Yozilishni tasdiqlash" },
  booked:           { ru: "Занято",                        uz: "Band" },

  // --- Блог ---
  blog:             { ru: "Влог",                          uz: "Blog" },
  no_posts:         { ru: "Пока нет постов",               uz: "Hozircha postlar yo'q" },
  add_post:         { ru: "Новый пост",                    uz: "Yangi post" },
  post_title:       { ru: "Заголовок",                     uz: "Sarlavha" },
  post_content:     { ru: "Текст поста",                   uz: "Post matni" },
  post_image:       { ru: "Фото (необязательно)",          uz: "Rasm (ixtiyoriy)" },
  publish:          { ru: "Опубликовать",                  uz: "Nashr qilish" },
  post_published:   { ru: "Пост опубликован!",             uz: "Post nashr qilindi!" },
  edit_post:        { ru: "Редактировать",                 uz: "Tahrirlash" },
  related_service:  { ru: "Связанная услуга",              uz: "Bog'langan xizmat" },
  none_selected:    { ru: "Не выбрано",                    uz: "Tanlanmagan" },

  // --- Настройки ---
  settings:         { ru: "Настройки",                     uz: "Sozlamalar" },
  edit_profile:     { ru: "Редактировать профиль",         uz: "Profilni tahrirlash" },
  dark_mode:        { ru: "Тёмный режим",                  uz: "Qorong'u rejim" },
  language:         { ru: "Язык",                          uz: "Til" },
  logout:           { ru: "Выйти",                         uz: "Chiqish" },
  save:             { ru: "Сохранить",                     uz: "Saqlash" },
  cancel:           { ru: "Отмена",                        uz: "Bekor qilish" },
  profile_saved:    { ru: "Профиль сохранён!",             uz: "Profil saqlandi!" },
  lang_russian:     { ru: "Русский",                       uz: "Ruscha" },
  lang_uzbek:       { ru: "Узбекский",                     uz: "O'zbekcha" },
  hello:            { ru: "Привет",                        uz: "Salom" },
  admin:            { ru: "Админ",                         uz: "Admin" },
  client:           { ru: "Клиент",                        uz: "Mijoz" },

  // --- Админ панель ---
  manage_slots:     { ru: "Управление временем",           uz: "Vaqtni boshqarish" },
  add_time_slot:    { ru: "Добавить время",                uz: "Vaqt qo'shish" },
  time:             { ru: "Время (например 10:00)",        uz: "Vaqt (masalan 10:00)" },
  day_off:          { ru: "Выходной",                      uz: "Dam olish kuni" },
  mark_day_off:     { ru: "Сделать выходным",              uz: "Dam olish kuni qilish" },
  remove_day_off:   { ru: "Убрать выходной",               uz: "Dam olish kunini olib tashlash" },
  slot_added:       { ru: "Время добавлено!",              uz: "Vaqt qo'shildi!" },
  slot_removed:     { ru: "Время удалено!",                uz: "Vaqt o'chirildi!" },
  select_date:      { ru: "Выберите дату в календаре",     uz: "Kalendarda sanani tanlang" },
  delete:           { ru: "Удалить",                       uz: "O'chirish" },
  my_bookings:      { ru: "Мои записи",                    uz: "Mening yozilishlarim" },
  all_bookings:     { ru: "Все записи клиентов",           uz: "Barcha mijozlar yozilishlari" },
  no_bookings:      { ru: "Нет записей",                   uz: "Yozilishlar yo'q" },

  // --- Управление услугами ---
  add_service:      { ru: "Добавить услугу",               uz: "Xizmat qo'shish" },
  edit_service:     { ru: "Редактировать услугу",          uz: "Xizmatni tahrirlash" },
  service_icon:     { ru: "Иконка (эмодзи)",               uz: "Belgi (emoji)" },
  service_name:     { ru: "Название",                      uz: "Nomi" },
  service_desc:     { ru: "Описание",                      uz: "Tavsifi" },
  service_price:    { ru: "Цена (например 100 000)",       uz: "Narxi (masalan 100 000)" },
  service_duration: { ru: "Длительность (например 60 мин)",uz: "Davomiyligi (masalan 60 min)" },
  service_saved:    { ru: "Услуга сохранена!",             uz: "Xizmat saqlandi!" },
  service_deleted:  { ru: "Услуга удалена!",               uz: "Xizmat o'chirildi!" },

  // --- Ошибки ---
  err_fill_all:     { ru: "Заполните все поля",            uz: "Barcha maydonlarni to'ldiring" },
  err_short_pass:   { ru: "Пароль минимум 4 символа",      uz: "Parol kamida 4 belgi" },
  err_phone_exists: { ru: "Этот номер уже зарегистрирован",uz: "Bu raqam allaqachon ro'yxatdan o'tgan" },
  err_wrong_creds:  { ru: "Неверный телефон или пароль",   uz: "Telefon yoki parol noto'g'ri" },
  err_phone_not_found:{ ru: "Номер не найден",             uz: "Raqam topilmadi" },
  err_phone_format:   { ru: "Введите 9 цифр номера",       uz: "9 ta raqam kiriting" },
  password_changed: { ru: "Пароль изменён!",               uz: "Parol o'zgartirildi!" },

  // --- Названия услуг ---
  svc_manicure:     { ru: "Маникюр",                       uz: "Manikur" },
  svc_pedicure:     { ru: "Педикюр",                       uz: "Pedikur" },
  svc_haircut:      { ru: "Стрижка",                       uz: "Soch turmagi" },
  svc_coloring:     { ru: "Окрашивание",                   uz: "Soch bo'yash" },
  svc_facial:       { ru: "Уход за лицом",                 uz: "Yuz parvarishi" },
  svc_massage:      { ru: "Массаж",                        uz: "Massaj" },
  svc_epilation:    { ru: "Эпиляция",                      uz: "Epilyatsiya" },
  svc_brows:        { ru: "Брови и ресницы",               uz: "Qosh va kipriklar" },

  // --- Описания услуг ---
  desc_manicure:    { ru: "Классический и аппаратный маникюр с покрытием гель-лаком. Мы используем только премиальные материалы для идеального результата.", uz: "Klassik va apparatli manikur gel-lak bilan qoplash. Biz mukammal natija uchun faqat yuqori sifatli materiallardan foydalanamiz." },
  desc_pedicure:    { ru: "Профессиональный педикюр с уходом за кожей стоп. Расслабление и красота в одной процедуре.", uz: "Professional pedikur oyoq terisi parvarishi bilan. Bitta protsedura ichida dam olish va go'zallik." },
  desc_haircut:     { ru: "Стильные стрижки для женщин и мужчин. Наши мастера создадут образ, который подчеркнёт вашу индивидуальность.", uz: "Ayollar va erkaklar uchun zamonaviy soch turmaklari. Bizning ustalarimiz sizning individualligingizni ta'kidlaydigan tasvir yaratadilar." },
  desc_coloring:    { ru: "Окрашивание волос любой сложности: от классического до модных техник балаяж и шатуш.", uz: "Har qanday murakkablikdagi soch bo'yash: klassikdan zamonaviy balayaj va shatush texnikalarigacha." },
  desc_facial:      { ru: "Комплексный уход за кожей лица: очищение, увлажнение, массаж. Ваша кожа будет сиять!", uz: "Yuz terisini kompleks parvarish qilish: tozalash, namlantirich, massaj. Teringiz porlaydi!" },
  desc_massage:     { ru: "Расслабляющий и лечебный массаж. Снимает стресс, улучшает кровообращение и дарит ощущение лёгкости.", uz: "Dam olish va davolash massaji. Stressni kamaytiradi, qon aylanishini yaxshilaydi va yengillik hissini beradi." },
  desc_epilation:   { ru: "Гладкая кожа надолго! Восковая и сахарная эпиляция с использованием гипоаллергенных материалов.", uz: "Uzoq muddatga silliq teri! Gipoallergenik materiallar yordamida mumli va shakarli epilyatsiya." },
  desc_brows:       { ru: "Оформление бровей и наращивание ресниц. Подчеркните свою естественную красоту.", uz: "Qoshlarni shakllantirish va kipriklarni kengaytirish. Tabiiy go'zalligingizni ta'kidlang." },
};

/* ============================================
   НАЧАЛЬНЫЕ ДАННЫЕ УСЛУГ
   (иконка, ключ названия, ключ описания, цена, длительность)
   ============================================ */
const DEFAULT_SERVICES = [
  { id: 1, icon: "💅", nameKey: "svc_manicure",  descKey: "desc_manicure",  price: "120 000", duration: "60 мин" },
  { id: 2, icon: "🦶", nameKey: "svc_pedicure",  descKey: "desc_pedicure",  price: "150 000", duration: "90 мин" },
  { id: 3, icon: "✂️", nameKey: "svc_haircut",   descKey: "desc_haircut",   price: "80 000",  duration: "45 мин" },
  { id: 4, icon: "🎨", nameKey: "svc_coloring",  descKey: "desc_coloring",  price: "250 000", duration: "120 мин" },
  { id: 5, icon: "🧖", nameKey: "svc_facial",    descKey: "desc_facial",    price: "180 000", duration: "60 мин" },
  { id: 6, icon: "💆", nameKey: "svc_massage",   descKey: "desc_massage",   price: "200 000", duration: "90 мин" },
  { id: 7, icon: "✨", nameKey: "svc_epilation", descKey: "desc_epilation", price: "100 000", duration: "45 мин" },
  { id: 8, icon: "👁️", nameKey: "svc_brows",     descKey: "desc_brows",     price: "90 000",  duration: "40 мин" },
];

/* ============================================
   ДЕМО-ПОСТЫ ДЛЯ ВЛОГА
   ============================================ */
const DEFAULT_BLOG_POSTS = [
  {
    id: 1,
    titleKey: "svc_manicure",
    content_ru: "Новая коллекция гель-лаков уже в нашем салоне! 🎉 Более 50 оттенков на любой вкус — от нежных пастельных до ярких неоновых. Приходите и выбирайте свой идеальный цвет!",
    content_uz: "Yangi gel-lak kolleksiyasi allaqachon salonimizda! 🎉 Har qanday didga mos 50 dan ortiq ranglar — nozik pasteldan yorqin neongacha. Keling va o'zingizning ideal rangingizni tanlang!",
    date: "2026-05-01",
    serviceId: 1
  },
  {
    id: 2,
    titleKey: "svc_facial",
    content_ru: "Как правильно ухаживать за кожей лица весной? 🌸 В этом посте мы расскажем о главных правилах ухода и поделимся секретами наших косметологов. Увлажнение — ключ к сияющей коже!",
    content_uz: "Bahorda yuz terisini qanday to'g'ri parvarish qilish kerak? 🌸 Ushbu postda biz parvarishning asosiy qoidalari haqida gapiramiz va kosmetologlarimizning sirlarini baham ko'ramiz. Namlantirish — porlagan teri kaliti!",
    date: "2026-04-28",
    serviceId: 5
  }
];
