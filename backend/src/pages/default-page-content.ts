import { Page } from './entities/page.entity';

type DefaultPage = Pick<Page, 'slug' | 'title' | 'content' | 'seoDescription' | 'template' | 'status'>;

export const DEFAULT_PAGES: DefaultPage[] = [
  {
    slug: 'help',
    title: { en: 'Help Center', ru: 'Центр помощи', ua: 'Центр допомоги' },
    seoDescription: {
      en: 'Answers to common questions about orders, payments and your account.',
      ru: 'Ответы на частые вопросы о заказах, оплате и аккаунте.',
      ua: 'Відповіді на поширені питання про замовлення, оплату та акаунт.',
    },
    content: {
      en: `
        <p class="lead">Everything you need to shop confidently in 3D Store.</p>
        <div class="info-grid">
          <div class="info-card"><h3>How do I place an order?</h3><p>Add items to cart, proceed to checkout, and complete payment. You will receive an email confirmation.</p></div>
          <div class="info-card"><h3>How can I track my order?</h3><p>Open <a href="/my-orders">My Orders</a> in your profile to see status updates and shipping progress.</p></div>
          <div class="info-card"><h3>Payment methods</h3><p>We support secure card payments. All transactions are encrypted and processed through trusted providers.</p></div>
          <div class="info-card"><h3>Need more help?</h3><p>Our team is ready to assist — <a href="/contacts">contact us</a> and we will reply within one business day.</p></div>
        </div>`,
      ru: `
        <p class="lead">Всё, что нужно для уверенных покупок в 3D Store.</p>
        <div class="info-grid">
          <div class="info-card"><h3>Как оформить заказ?</h3><p>Добавьте товары в корзину, перейдите к оформлению и завершите оплату. Вы получите подтверждение на email.</p></div>
          <div class="info-card"><h3>Как отследить заказ?</h3><p>Откройте раздел <a href="/my-orders">Мои заказы</a> в профиле — там статус и этапы доставки.</p></div>
          <div class="info-card"><h3>Способы оплаты</h3><p>Принимаем банковские карты. Все платежи защищены и проходят через проверенных провайдеров.</p></div>
          <div class="info-card"><h3>Нужна помощь?</h3><p>Напишите нам через <a href="/contacts">контакты</a> — ответим в течение рабочего дня.</p></div>
        </div>`,
      ua: `
        <p class="lead">Усе, що потрібно для впевнених покупок у 3D Store.</p>
        <div class="info-grid">
          <div class="info-card"><h3>Як оформити замовлення?</h3><p>Додайте товари до кошика, перейдіть до оформлення та завершіть оплату. Ви отримаєте підтвердження на email.</p></div>
          <div class="info-card"><h3>Як відстежити замовлення?</h3><p>Відкрийте розділ <a href="/my-orders">Мої замовлення</a> у профілі — там статус і етапи доставки.</p></div>
          <div class="info-card"><h3>Способи оплати</h3><p>Приймаємо банківські картки. Усі платежі захищені та проходять через перевірених провайдерів.</p></div>
          <div class="info-card"><h3>Потрібна допомога?</h3><p>Напишіть нам через <a href="/contacts">контакти</a> — відповімо протягом робочого дня.</p></div>
        </div>`,
    },
    template: 'simple',
    status: 'published',
  },
  {
    slug: 'shipping',
    title: { en: 'Shipping', ru: 'Доставка', ua: 'Доставка' },
    seoDescription: {
      en: 'Delivery options, processing times and shipping rates.',
      ru: 'Способы доставки, сроки обработки и тарифы.',
      ua: 'Варіанти доставки, терміни обробки та тарифи.',
    },
    content: {
      en: `
        <p class="lead">Fast and reliable delivery for every order.</p>
        <div class="info-steps">
          <div class="info-step"><span class="step-num">1</span><div><h3>Processing</h3><p>Orders are prepared within 1–2 business days after payment confirmation.</p></div></div>
          <div class="info-step"><span class="step-num">2</span><div><h3>Standard delivery</h3><p>Usually arrives in 3–7 business days depending on your region.</p></div></div>
          <div class="info-step"><span class="step-num">3</span><div><h3>Express option</h3><p>Available at checkout for selected cities — ideal for urgent purchases.</p></div></div>
        </div>
        <div class="info-note">Track your parcel anytime in <a href="/my-orders">My Orders</a>.</div>`,
      ru: `
        <p class="lead">Быстрая и надёжная доставка для каждого заказа.</p>
        <div class="info-steps">
          <div class="info-step"><span class="step-num">1</span><div><h3>Обработка</h3><p>Заказ готовится в течение 1–2 рабочих дней после подтверждения оплаты.</p></div></div>
          <div class="info-step"><span class="step-num">2</span><div><h3>Стандартная доставка</h3><p>Обычно приходит за 3–7 рабочих дней в зависимости от региона.</p></div></div>
          <div class="info-step"><span class="step-num">3</span><div><h3>Экспресс</h3><p>Доступен при оформлении для выбранных городов — для срочных покупок.</p></div></div>
        </div>
        <div class="info-note">Отслеживайте посылку в разделе <a href="/my-orders">Мои заказы</a>.</div>`,
      ua: `
        <p class="lead">Швидка та надійна доставка для кожного замовлення.</p>
        <div class="info-steps">
          <div class="info-step"><span class="step-num">1</span><div><h3>Обробка</h3><p>Замовлення готується протягом 1–2 робочих днів після підтвердження оплати.</p></div></div>
          <div class="info-step"><span class="step-num">2</span><div><h3>Стандартна доставка</h3><p>Зазвичай приходить за 3–7 робочих днів залежно від регіону.</p></div></div>
          <div class="info-step"><span class="step-num">3</span><div><h3>Експрес</h3><p>Доступний під час оформлення для обраних міст — для термінових покупок.</p></div></div>
        </div>
        <div class="info-note">Відстежуйте посилку в розділі <a href="/my-orders">Мої замовлення</a>.</div>`,
    },
    template: 'simple',
    status: 'published',
  },
  {
    slug: 'size-guide',
    title: { en: 'Size Guide', ru: 'Таблица размеров', ua: 'Таблиця розмірів' },
    seoDescription: {
      en: 'Sizing recommendations for shoes, bags and clothing.',
      ru: 'Рекомендации по размерам обуви, сумок и одежды.',
      ua: 'Рекомендації щодо розмірів взуття, сумок та одягу.',
    },
    content: {
      en: `
        <p class="lead">Pick the right size before you buy — fewer returns, better fit.</p>
        <div class="info-grid">
          <div class="info-card"><h3>Shoes</h3><p>Measure foot length in cm while standing. Compare with the size chart on each product page.</p></div>
          <div class="info-card"><h3>Clothing</h3><p>Check chest, waist and hip measurements in the product description. Sizes may vary by brand.</p></div>
          <div class="info-card"><h3>Bags</h3><p>Look at height, width and strap length in the specs — especially for crossbody and tote styles.</p></div>
        </div>
        <div class="info-note">Still unsure? <a href="/contacts">Ask our stylists</a> before ordering.</div>`,
      ru: `
        <p class="lead">Выберите правильный размер до покупки — меньше возвратов, лучше посадка.</p>
        <div class="info-grid">
          <div class="info-card"><h3>Обувь</h3><p>Измерьте длину стопы в см стоя. Сравните с таблицей размеров на странице товара.</p></div>
          <div class="info-card"><h3>Одежда</h3><p>Сверьте обхват груди, талии и бёдер в описании товара. Размеры могут отличаться у брендов.</p></div>
          <div class="info-card"><h3>Сумки</h3><p>Смотрите высоту, ширину и длину ремня в характеристиках — особенно для кросс-боди и тоутов.</p></div>
        </div>
        <div class="info-note">Сомневаетесь? <a href="/contacts">Спросите наших стилистов</a> перед заказом.</div>`,
      ua: `
        <p class="lead">Оберіть правильний розмір до покупки — менше повернень, краща посадка.</p>
        <div class="info-grid">
          <div class="info-card"><h3>Взуття</h3><p>Виміряйте довжину стопи в см стоячи. Порівняйте з таблицею розмірів на сторінці товару.</p></div>
          <div class="info-card"><h3>Одяг</h3><p>Перевірте обхват грудей, талії та стегон у описі товару. Розміри можуть відрізнятися у брендів.</p></div>
          <div class="info-card"><h3>Сумки</h3><p>Дивіться висоту, ширину та довжину ременя в характеристиках — особливо для крос-боді та тоутів.</p></div>
        </div>
        <div class="info-note">Сумніваєтесь? <a href="/contacts">Запитайте наших стилістів</a> перед замовленням.</div>`,
    },
    template: 'simple',
    status: 'published',
  },
];

export const DEFAULT_FOOTER_COLUMNS = [
  {
    title: { en: 'Quick Links', ru: 'Быстрые ссылки', ua: 'Швидкі посилання' },
    linkSource: 'manual',
    links: [
      { label: { en: 'Home', ru: 'Главная', ua: 'Головна' }, url: '/home' },
      { label: { en: 'Shop', ru: 'Магазин', ua: 'Магазин' }, url: '/shop' },
      { label: { en: 'About', ru: 'О нас', ua: 'Про нас' }, url: '/about' },
      { label: { en: 'Contacts', ru: 'Контакты', ua: 'Контакти' }, url: '/contacts' },
    ],
  },
  {
    title: { en: 'Categories', ru: 'Категории', ua: 'Категорії' },
    linkSource: 'shop-categories',
    links: [],
  },
  {
    title: { en: 'Support', ru: 'Поддержка', ua: 'Підтримка' },
    linkSource: 'manual',
    links: [
      { label: { en: 'Help Center', ru: 'Центр помощи', ua: 'Центр допомоги' }, url: '/help' },
      { label: { en: 'Shipping', ru: 'Доставка', ua: 'Доставка' }, url: '/shipping' },
      { label: { en: 'Size Guide', ru: 'Таблица размеров', ua: 'Таблиця розмірів' }, url: '/size-guide' },
      { label: { en: 'My Orders', ru: 'Мои заказы', ua: 'Мої замовлення' }, url: '/my-orders' },
    ],
  },
];
