const menuItems = [
  {
    id: 'americano',
    name: '아메리카노',
    description: '깔끔한 커피',
    price: 3500,
    temperatures: ['hot', 'iced'],
    drinkColor: '#6f4c36',
    foamColor: '#d8c3a9'
  },
  {
    id: 'latte',
    name: '카페라떼',
    description: '우유가 들어간 부드러운 커피',
    price: 4000,
    temperatures: ['hot', 'iced'],
    drinkColor: '#b88960',
    foamColor: '#f0e5d6'
  },
  {
    id: 'choco',
    name: '초코라떼',
    description: '달콤한 초코 음료',
    price: 4000,
    temperatures: ['hot', 'iced'],
    drinkColor: '#8a5a3c',
    foamColor: '#efe0ce'
  },
  {
    id: 'strawberry',
    name: '딸기주스',
    description: '상큼한 차가운 과일 음료',
    price: 4500,
    temperatures: ['iced'],
    drinkColor: '#d97c7c',
    foamColor: '#f7d6d6'
  }
];

const temperatureOptions = [
  { id: 'hot', label: '따뜻하게', subtitle: 'HOT' },
  { id: 'iced', label: '차갑게', subtitle: 'ICE' }
];

const sizeOptions = [
  { id: 'regular', label: '보통 컵', subtitle: '기본 크기', extra: 0 },
  { id: 'large', label: '큰 컵', subtitle: '+ 500원', extra: 500 }
];

const serviceOptions = [
  { id: 'here', label: '카페에서 마실게요', subtitle: '매장 이용' },
  { id: 'takeout', label: '가지고 갈게요', subtitle: '포장' }
];

const state = {
  screen: 'start',
  drinkId: null,
  temperature: null,
  size: null,
  service: null,
  quantity: 1,
  editMode: null
};

const screens = [...document.querySelectorAll('[data-screen]')];
const orderShell = document.getElementById('orderShell');
const siteHeader = document.getElementById('siteHeader');
const progressItems = [...document.querySelectorAll('#progressList li')];
const menuGrid = document.getElementById('menuGrid');
const temperatureChoices = document.getElementById('temperatureChoices');
const sizeChoices = document.getElementById('sizeChoices');
const serviceChoices = document.getElementById('serviceChoices');
const summaryContent = document.getElementById('summaryContent');
const summaryTotal = document.getElementById('summaryTotal');
const toast = document.getElementById('toast');
let toastTimer;

function money(value) {
  return `${value.toLocaleString('ko-KR')}원`;
}

function getDrink() {
  return menuItems.find(item => item.id === state.drinkId) || null;
}

function getSize() {
  return sizeOptions.find(item => item.id === state.size) || null;
}

function getService() {
  return serviceOptions.find(item => item.id === state.service) || null;
}

function getTemperature() {
  return temperatureOptions.find(item => item.id === state.temperature) || null;
}

function unitPrice() {
  const drink = getDrink();
  const size = getSize();
  if (!drink) return 0;
  return drink.price + (size?.extra || 0);
}

function totalPrice() {
  return unitPrice() * state.quantity;
}

function drinkArt(item) {
  return `<span class="drink-art" aria-hidden="true" style="--drink:${item.drinkColor};--foam:${item.foamColor}"></span>`;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

function renderMenu() {
  menuGrid.innerHTML = menuItems.map(item => {
    const selected = state.drinkId === item.id;
    return `
      <button class="select-card ${selected ? 'is-selected' : ''}" type="button" data-drink="${item.id}" aria-pressed="${selected}">
        <span class="menu-card-inner">
          ${drinkArt(item)}
          <span>
            <span class="menu-name">${item.name}</span>
            <span class="menu-description">${item.description}</span>
            <span class="menu-price">${money(item.price)}</span>
          </span>
        </span>
      </button>`;
  }).join('');

  menuGrid.querySelectorAll('[data-drink]').forEach(button => {
    button.addEventListener('click', () => selectDrink(button.dataset.drink));
  });

  const drink = getDrink();
  document.getElementById('menuSelectionNote').textContent = drink
    ? `${drink.name}을(를) 골랐어요.`
    : '아직 음료를 고르지 않았어요.';
  document.getElementById('menuNextButton').disabled = !drink;
}

function selectDrink(id) {
  const previous = getDrink();
  state.drinkId = id;
  const nextDrink = getDrink();

  if (!nextDrink.temperatures.includes(state.temperature)) {
    state.temperature = nextDrink.temperatures.length === 1 ? nextDrink.temperatures[0] : null;
  }

  if (!previous || previous.id !== id) {
    showToast(`${nextDrink.name}을(를) 선택했어요.`);
  }

  renderAll();
}

function renderOptions() {
  const drink = getDrink();
  if (!drink) return;

  temperatureChoices.innerHTML = temperatureOptions.map(option => {
    const available = drink.temperatures.includes(option.id);
    const selected = state.temperature === option.id;
    return `
      <button class="choice-button ${selected ? 'is-selected' : ''}" type="button" data-temperature="${option.id}"
        aria-pressed="${selected}" ${available ? '' : 'disabled'}>
        <span class="choice-title">${option.label}</span>
        <span class="choice-subtitle">${available ? option.subtitle : '이 음료는 선택할 수 없어요'}</span>
      </button>`;
  }).join('');

  temperatureChoices.querySelectorAll('[data-temperature]:not(:disabled)').forEach(button => {
    button.addEventListener('click', () => {
      state.temperature = button.dataset.temperature;
      showToast(`${getTemperature().label}를 선택했어요.`);
      renderAll();
    });
  });

  sizeChoices.innerHTML = sizeOptions.map(option => {
    const selected = state.size === option.id;
    return `
      <button class="choice-button ${selected ? 'is-selected' : ''}" type="button" data-size="${option.id}" aria-pressed="${selected}">
        <span class="choice-title">${option.label}</span>
        <span class="choice-subtitle">${option.subtitle}</span>
      </button>`;
  }).join('');

  sizeChoices.querySelectorAll('[data-size]').forEach(button => {
    button.addEventListener('click', () => {
      state.size = button.dataset.size;
      showToast(`${getSize().label}을(를) 선택했어요.`);
      renderAll();
    });
  });

  document.getElementById('temperatureHelp').textContent = drink.temperatures.length === 1
    ? `${drink.name}은(는) 차갑게만 주문할 수 있어요. 자동으로 선택했어요.`
    : state.temperature ? `${getTemperature().label}를 골랐어요.` : '따뜻하게 또는 차갑게를 골라 주세요.';

  document.getElementById('optionsNextButton').disabled = !(state.temperature && state.size);
}

function renderService() {
  serviceChoices.innerHTML = serviceOptions.map(option => {
    const selected = state.service === option.id;
    return `
      <button class="choice-button ${selected ? 'is-selected' : ''}" type="button" data-service="${option.id}" aria-pressed="${selected}">
        <span class="choice-title">${option.label}</span>
        <span class="choice-subtitle">${option.subtitle}</span>
      </button>`;
  }).join('');

  serviceChoices.querySelectorAll('[data-service]').forEach(button => {
    button.addEventListener('click', () => {
      state.service = button.dataset.service;
      showToast(`${getService().label}`);
      renderAll();
    });
  });

  const quantityValue = document.getElementById('quantityValue');
  quantityValue.textContent = `${state.quantity}잔`;
  document.getElementById('quantityMinus').disabled = state.quantity <= 1;
  document.getElementById('quantityPlus').disabled = state.quantity >= 3;
  document.getElementById('serviceNextButton').disabled = !state.service;
}

function renderSummary() {
  const drink = getDrink();
  const temperature = getTemperature();
  const size = getSize();
  const service = getService();

  if (!drink) {
    summaryContent.innerHTML = '<p class="summary-empty">음료를 고르면 여기에 주문 내용이 보여요.</p>';
    summaryTotal.textContent = '';
    return;
  }

  const rows = [
    ['음료', drink.name],
    ['온도', temperature?.label || '아직 선택 안 함'],
    ['컵', size?.label || '아직 선택 안 함'],
    ['받는 방법', service?.label || '아직 선택 안 함'],
    ['수량', `${state.quantity}잔`]
  ];

  summaryContent.innerHTML = `<dl class="summary-list">${rows.map(([key, value]) => `
    <div class="summary-row"><dt>${key}</dt><dd>${value}</dd></div>
  `).join('')}</dl>`;

  summaryTotal.innerHTML = `<span>예상 금액</span><span>${money(totalPrice())}</span>`;
}

function renderReview() {
  const drink = getDrink();
  const temperature = getTemperature();
  const size = getSize();
  const service = getService();
  if (!(drink && temperature && size && service)) return;

  const details = [
    ['온도', temperature.label],
    ['컵 크기', size.label],
    ['받는 방법', service.label],
    ['수량', `${state.quantity}잔`]
  ];

  document.getElementById('reviewCard').innerHTML = `
    <div class="review-hero">
      ${drinkArt(drink)}
      <div><strong>${drink.name}</strong><span>한 잔 ${money(unitPrice())}</span></div>
    </div>
    <dl class="review-details">
      ${details.map(([key, value]) => `<div class="summary-row"><dt>${key}</dt><dd>${value}</dd></div>`).join('')}
    </dl>
    <div class="review-total-row"><span>총 금액</span><span>${money(totalPrice())}</span></div>`;

  const amountText = state.quantity === 1 ? '한 잔' : state.quantity === 2 ? '두 잔' : '세 잔';
  const temperatureWord = state.temperature === 'iced' ? '아이스' : '따뜻한';
  const servicePhrase = state.service === 'takeout' ? '가지고 갈게요.' : '여기서 마실게요.';
  document.getElementById('practicePhrase').textContent = `${temperatureWord} ${drink.name} ${amountText} 주세요. ${servicePhrase}`;
}

function renderReceipt() {
  const drink = getDrink();
  const temperature = getTemperature();
  const size = getSize();
  const service = getService();
  if (!(drink && temperature && size && service)) return;

  document.getElementById('completeMessage').textContent = `${drink.name} 주문 연습을 끝까지 완료했어요.`;
  document.getElementById('receipt').innerHTML = `
    <p class="receipt-title">연습 주문표</p>
    <div class="receipt-row"><span>음료</span><strong>${drink.name}</strong></div>
    <div class="receipt-row"><span>옵션</span><strong>${temperature.label} · ${size.label}</strong></div>
    <div class="receipt-row"><span>받는 방법</span><strong>${service.label}</strong></div>
    <div class="receipt-row"><span>수량</span><strong>${state.quantity}잔</strong></div>
    <div class="receipt-row receipt-total"><span>총 금액</span><strong>${money(totalPrice())}</strong></div>`;
}

function updateProgress() {
  const order = ['menu', 'options', 'service', 'review'];
  const currentIndex = order.indexOf(state.screen);

  progressItems.forEach((item, index) => {
    item.classList.toggle('is-current', index === currentIndex);
    item.classList.toggle('is-complete', index < currentIndex);
    if (index === currentIndex) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
}

function showScreen(name, options = {}) {
  window.clearTimeout(toastTimer);
  toast.classList.remove('is-visible');
  state.screen = name;
  screens.forEach(screen => screen.classList.toggle('is-active', screen.dataset.screen === name));

  const inOrderFlow = ['menu', 'options', 'service', 'review'].includes(name);
  orderShell.hidden = !inOrderFlow;
  siteHeader.hidden = !inOrderFlow;

  if (name === 'complete') {
    renderReceipt();
  }

  updateProgress();
  renderAll();

  if (!options.skipFocus) {
    requestAnimationFrame(() => {
      const active = document.querySelector(`[data-screen="${name}"]`);
      const heading = active?.querySelector('h1');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function renderAll() {
  renderMenu();
  if (getDrink()) renderOptions();
  renderService();
  renderSummary();
  renderReview();
  updateProgress();
  syncEditButtonLabels();
}

function resetOrder() {
  state.screen = 'start';
  state.drinkId = null;
  state.temperature = null;
  state.size = null;
  state.service = null;
  state.quantity = 1;
  state.editMode = null;
  showScreen('start');
}

function goFromMenu() {
  if (!state.drinkId) return;
  showScreen('options');
}

function goFromOptions() {
  if (!(state.temperature && state.size)) return;
  if (state.editMode === 'options') {
    state.editMode = null;
    showScreen('review');
    return;
  }
  if (state.editMode === 'drink') {
    state.editMode = null;
    showScreen('review');
    return;
  }
  showScreen('service');
}

function goFromService() {
  if (!state.service) return;
  if (state.editMode === 'service') {
    state.editMode = null;
    showScreen('review');
    return;
  }
  showScreen('review');
}

function startEdit(type) {
  state.editMode = type;
  if (type === 'drink') showScreen('menu');
  if (type === 'options') showScreen('options');
  if (type === 'service') showScreen('service');
}

function syncEditButtonLabels() {
  const menuNext = document.getElementById('menuNextButton');
  const optionsNext = document.getElementById('optionsNextButton');
  const serviceNext = document.getElementById('serviceNextButton');

  menuNext.textContent = state.editMode === 'drink' ? '다음: 옵션 확인하기' : '다음: 옵션 고르기';
  optionsNext.textContent = ['drink', 'options'].includes(state.editMode) ? '주문 확인으로 돌아가기' : '다음: 받는 방법';
  serviceNext.textContent = state.editMode === 'service' ? '주문 확인으로 돌아가기' : '다음: 주문 확인';
}


document.getElementById('startButton').addEventListener('click', () => showScreen('menu'));
document.getElementById('restartHeaderButton').addEventListener('click', resetOrder);
document.getElementById('menuBackButton').addEventListener('click', () => {
  if (state.editMode) {
    state.editMode = null;
    showScreen('review');
  } else {
    showScreen('start');
  }
});
document.getElementById('menuNextButton').addEventListener('click', goFromMenu);
document.getElementById('optionsBackButton').addEventListener('click', () => {
  if (state.editMode === 'options') {
    state.editMode = null;
    showScreen('review');
  } else {
    showScreen('menu');
  }
});
document.getElementById('optionsNextButton').addEventListener('click', goFromOptions);
document.getElementById('serviceBackButton').addEventListener('click', () => {
  if (state.editMode === 'service') {
    state.editMode = null;
    showScreen('review');
  } else {
    showScreen('options');
  }
});
document.getElementById('serviceNextButton').addEventListener('click', goFromService);
document.getElementById('reviewBackButton').addEventListener('click', () => showScreen('service'));
document.getElementById('editDrinkButton').addEventListener('click', () => startEdit('drink'));
document.getElementById('editOptionsButton').addEventListener('click', () => startEdit('options'));
document.getElementById('editServiceButton').addEventListener('click', () => startEdit('service'));
document.getElementById('placeOrderButton').addEventListener('click', () => showScreen('complete'));
document.getElementById('practiceAgainButton').addEventListener('click', resetOrder);

document.getElementById('quantityMinus').addEventListener('click', () => {
  if (state.quantity > 1) {
    state.quantity -= 1;
    renderAll();
  }
});

document.getElementById('quantityPlus').addEventListener('click', () => {
  if (state.quantity < 3) {
    state.quantity += 1;
    renderAll();
  }
});

renderAll();
