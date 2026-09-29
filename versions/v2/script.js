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
  editMode: null,
  editSnapshot: null
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
const restartDialog = document.getElementById('restartDialog');
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

function isOrderComplete() {
  return Boolean(getDrink() && getTemperature() && getSize() && getService());
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

function copyOrderState() {
  return {
    drinkId: state.drinkId,
    temperature: state.temperature,
    size: state.size,
    service: state.service,
    quantity: state.quantity
  };
}

function restoreOrderState(snapshot) {
  if (!snapshot) return;
  state.drinkId = snapshot.drinkId;
  state.temperature = snapshot.temperature;
  state.size = snapshot.size;
  state.service = snapshot.service;
  state.quantity = snapshot.quantity;
}

function clearEditMode() {
  state.editMode = null;
  state.editSnapshot = null;
}

function cancelEdit() {
  restoreOrderState(state.editSnapshot);
  clearEditMode();
  showScreen('review');
  showToast('수정하기 전 주문으로 돌아왔어요.');
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
    ? `선택한 음료: ${drink.name}`
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
    showToast(`${nextDrink.name}을 선택했어요.`);
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
      showToast(`${getSize().label}을 선택했어요.`);
      renderAll();
    });
  });

  document.getElementById('temperatureHelp').textContent = drink.temperatures.length === 1
    ? `${drink.name}은 차갑게만 주문할 수 있어요. 차갑게를 자동으로 선택했어요.`
    : state.temperature ? `선택한 온도: ${getTemperature().label}` : '따뜻하게 또는 차갑게를 골라 주세요.';

  document.getElementById('sizeHelp').textContent = state.size
    ? `선택한 컵: ${getSize().label}`
    : '보통 컵 또는 큰 컵을 골라 주세요.';

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
      showToast(`${getService().subtitle}을 선택했어요.`);
      renderAll();
    });
  });

  document.getElementById('serviceSelectionNote').textContent = state.service
    ? `선택한 방법: ${getService().subtitle}`
    : '매장 또는 포장을 골라 주세요.';

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
    ['받는 방법', service?.subtitle || '아직 선택 안 함'],
    ['수량', `${state.quantity}잔`]
  ];

  summaryContent.innerHTML = `<dl class="summary-list">${rows.map(([key, value]) => `
    <div class="summary-row"><dt>${key}</dt><dd>${value}</dd></div>
  `).join('')}</dl>`;

  summaryTotal.innerHTML = `<span>예상 금액</span><span>${money(totalPrice())}</span>`;
}

function renderReview() {
  if (!isOrderComplete()) return;

  const drink = getDrink();
  const temperature = getTemperature();
  const size = getSize();
  const service = getService();
  const details = [
    ['온도', temperature.label],
    ['컵 크기', size.label],
    ['받는 방법', service.subtitle],
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
  const sizePhrase = state.size === 'large' ? '큰 컵으로' : '보통 컵으로';
  const servicePhrase = state.service === 'takeout' ? '가지고 갈게요.' : '여기서 마실게요.';
  document.getElementById('practicePhrase').textContent = `${temperatureWord} ${drink.name} ${sizePhrase} ${amountText} 주세요. ${servicePhrase}`;
}

function renderReceipt() {
  if (!isOrderComplete()) return;

  const drink = getDrink();
  const temperature = getTemperature();
  const size = getSize();
  const service = getService();

  document.getElementById('completeMessage').textContent = `${drink.name} 주문을 끝까지 확인하고 완료했어요.`;
  document.getElementById('receipt').innerHTML = `
    <p class="receipt-title">연습 주문표</p>
    <div class="receipt-row"><span>음료</span><strong>${drink.name}</strong></div>
    <div class="receipt-row"><span>옵션</span><strong>${temperature.label} · ${size.label}</strong></div>
    <div class="receipt-row"><span>받는 방법</span><strong>${service.subtitle}</strong></div>
    <div class="receipt-row"><span>수량</span><strong>${state.quantity}잔</strong></div>
    <div class="receipt-row receipt-total"><span>총 금액</span><strong>${money(totalPrice())}</strong></div>`;
}

function renderEditModeCopy() {
  const defaults = {
    menu: '1단계 · 음료',
    options: '2단계 · 옵션',
    service: '3단계 · 매장·포장'
  };

  Object.entries(defaults).forEach(([screen, label]) => {
    const kicker = document.querySelector(`#${screen}Screen .step-kicker`);
    if (!kicker) return;
    kicker.textContent = state.editMode === screen || (state.editMode === 'drink' && screen === 'options')
      ? `주문 수정 · ${screen === 'menu' ? '음료' : screen === 'options' ? '옵션' : '매장·포장'}`
      : label;
  });
}

function updateProgress() {
  const order = ['menu', 'options', 'service', 'review'];
  const currentIndex = order.indexOf(state.screen);

  progressItems.forEach((item, index) => {
    const number = item.dataset.number;
    const stepNumber = item.querySelector('.step-number');
    const isCurrent = index === currentIndex;
    const isComplete = index < currentIndex;

    item.classList.toggle('is-current', isCurrent);
    item.classList.toggle('is-complete', isComplete);
    stepNumber.textContent = isComplete ? '✓' : number;

    if (isCurrent) {
      item.setAttribute('aria-current', 'step');
      item.setAttribute('aria-label', `${number}단계 현재: ${item.querySelector('.step-label').textContent}`);
    } else {
      item.removeAttribute('aria-current');
      item.removeAttribute('aria-label');
    }
  });
}

function showScreen(name, options = {}) {
  if (name === 'review' && !isOrderComplete()) {
    name = state.service ? 'options' : 'service';
  }
  if (name === 'complete' && !isOrderComplete()) {
    name = 'review';
  }

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
  renderEditModeCopy();
  updateProgress();
  syncButtonLabels();
}

function resetOrder() {
  state.screen = 'start';
  state.drinkId = null;
  state.temperature = null;
  state.size = null;
  state.service = null;
  state.quantity = 1;
  clearEditMode();
  showScreen('start');
}

function goFromMenu() {
  if (!state.drinkId) return;
  showScreen('options');
}

function goFromOptions() {
  if (!(state.temperature && state.size)) return;
  if (['drink', 'options'].includes(state.editMode)) {
    clearEditMode();
    showScreen('review');
    showToast('수정한 내용을 주문에 반영했어요.');
    return;
  }
  showScreen('service');
}

function goFromService() {
  if (!state.service) return;
  if (state.editMode === 'service') {
    clearEditMode();
    showScreen('review');
    showToast('수정한 내용을 주문에 반영했어요.');
    return;
  }
  showScreen('review');
}

function startEdit(type) {
  state.editSnapshot = copyOrderState();
  state.editMode = type;
  const labels = { drink: '음료', options: '옵션', service: '매장·포장·수량' };
  if (type === 'drink') showScreen('menu');
  if (type === 'options') showScreen('options');
  if (type === 'service') showScreen('service');
  showToast(`${labels[type]}을 수정하고 있어요. 수정 취소를 누르면 원래 주문으로 돌아가요.`);
}

function syncButtonLabels() {
  const menuBack = document.getElementById('menuBackButton');
  const menuNext = document.getElementById('menuNextButton');
  const optionsBack = document.getElementById('optionsBackButton');
  const optionsNext = document.getElementById('optionsNextButton');
  const serviceBack = document.getElementById('serviceBackButton');
  const serviceNext = document.getElementById('serviceNextButton');

  menuBack.textContent = state.editMode === 'drink' ? '수정 취소' : '연습 안내로';
  menuNext.textContent = state.editMode === 'drink' ? '다음: 옵션 확인하기' : '다음: 옵션 고르기';

  optionsBack.textContent = state.editMode === 'options' ? '수정 취소' : '이전: 음료';
  optionsNext.textContent = ['drink', 'options'].includes(state.editMode)
    ? '수정 반영하고 주문 확인으로'
    : '다음: 매장·포장';

  serviceBack.textContent = state.editMode === 'service' ? '수정 취소' : '이전: 옵션';
  serviceNext.textContent = state.editMode === 'service'
    ? '수정 반영하고 주문 확인으로'
    : '다음: 주문 확인';
}

function openRestartDialog() {
  if (typeof restartDialog.showModal === 'function') {
    restartDialog.showModal();
  } else if (window.confirm('지금 고른 내용을 모두 지우고 처음부터 다시 시작할까요?')) {
    resetOrder();
  }
}

document.getElementById('startButton').addEventListener('click', () => showScreen('menu'));
document.getElementById('restartHeaderButton').addEventListener('click', openRestartDialog);
document.getElementById('keepOrderButton').addEventListener('click', () => restartDialog.close());
document.getElementById('confirmRestartButton').addEventListener('click', () => {
  restartDialog.close();
  resetOrder();
});

document.getElementById('menuBackButton').addEventListener('click', () => {
  if (state.editMode === 'drink') {
    cancelEdit();
  } else {
    showScreen('start');
  }
});
document.getElementById('menuNextButton').addEventListener('click', goFromMenu);

document.getElementById('optionsBackButton').addEventListener('click', () => {
  if (state.editMode === 'options') {
    cancelEdit();
  } else {
    showScreen('menu');
  }
});
document.getElementById('optionsNextButton').addEventListener('click', goFromOptions);

document.getElementById('serviceBackButton').addEventListener('click', () => {
  if (state.editMode === 'service') {
    cancelEdit();
  } else {
    showScreen('options');
  }
});
document.getElementById('serviceNextButton').addEventListener('click', goFromService);

document.getElementById('reviewBackButton').addEventListener('click', () => showScreen('service'));
document.getElementById('editDrinkButton').addEventListener('click', () => startEdit('drink'));
document.getElementById('editOptionsButton').addEventListener('click', () => startEdit('options'));
document.getElementById('editServiceButton').addEventListener('click', () => startEdit('service'));
document.getElementById('placeOrderButton').addEventListener('click', () => {
  if (isOrderComplete()) showScreen('complete');
});
document.getElementById('practiceAgainButton').addEventListener('click', resetOrder);

document.getElementById('quantityMinus').addEventListener('click', () => {
  if (state.quantity > 1) {
    state.quantity -= 1;
    showToast(`${state.quantity}잔으로 바꿨어요.`);
    renderAll();
  }
});

document.getElementById('quantityPlus').addEventListener('click', () => {
  if (state.quantity < 3) {
    state.quantity += 1;
    showToast(`${state.quantity}잔으로 바꿨어요.`);
    renderAll();
  }
});

restartDialog.addEventListener('click', event => {
  if (event.target === restartDialog) restartDialog.close();
});

renderAll();
