(() => {
  const setText = (selector, text) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = text;
  };

  setText('.start-copy .lead', '음료를 고르고, 온도와 컵 크기, 받는 방법을 정한 뒤 주문까지 연습할 수 있어요.');

  const startSteps = document.querySelectorAll('.start-steps li');
  if (startSteps[1]) startSteps[1].innerHTML = '<span>2</span> 온도와 컵 크기 고르기';
  if (startSteps[2]) startSteps[2].innerHTML = '<span>3</span> 받는 방법 고르기';

  const optionsProgress = document.querySelector('#progressList [data-step="options"] .step-label');
  const serviceProgress = document.querySelector('#progressList [data-step="service"] .step-label');
  if (optionsProgress) optionsProgress.textContent = '온도·컵';
  if (serviceProgress) serviceProgress.textContent = '받는 방법';

  setText('#optionsTitle', '온도와 컵 크기를 골라요');
  setText('#optionsScreen .screen-heading > p:last-child', '먼저 온도, 다음으로 컵 크기를 하나씩 골라 주세요.');
  setText('#serviceTitle', '어떻게 받을까요?');
  setText('#serviceScreen .screen-heading > p:last-child', '카페에서 마실지, 가지고 갈지 하나를 골라 주세요.');
  setText('#editOptionsButton', '온도·컵 크기 바꾸기');
  setText('#editServiceButton', '받는 방법·수량 바꾸기');
  setText('#reviewBackButton', '이전: 받는 방법');

  if (serviceChoices) {
    serviceChoices.setAttribute('aria-label', '받는 방법 선택');
  }

  ['menu', 'options', 'service'].forEach(screenName => {
    const screen = document.getElementById(`${screenName}Screen`);
    const heading = screen?.querySelector('.screen-heading');
    if (!screen || !heading || screen.querySelector('.edit-context')) return;

    const banner = document.createElement('div');
    banner.className = 'edit-context';
    banner.hidden = true;
    banner.setAttribute('role', 'status');
    banner.innerHTML = '<strong>주문 수정 중</strong><span>수정 전 주문은 그대로 보관되어 있어요.</span>';
    screen.insertBefore(banner, heading);
  });

  renderEditModeCopy = function () {
    const defaults = {
      menu: '1단계 · 음료',
      options: '2단계 · 온도·컵 크기',
      service: '3단계 · 받는 방법'
    };

    const editLabels = {
      menu: '음료',
      options: '온도·컵 크기',
      service: '받는 방법'
    };

    Object.entries(defaults).forEach(([screenName, label]) => {
      const kicker = document.querySelector(`#${screenName}Screen .step-kicker`);
      if (!kicker) return;

      const isEditingHere =
        (state.editMode === 'drink' && ['menu', 'options'].includes(screenName)) ||
        (state.editMode === 'options' && screenName === 'options') ||
        (state.editMode === 'service' && screenName === 'service');
      kicker.textContent = isEditingHere ? `주문 수정 · ${editLabels[screenName]}` : label;

      const banner = document.querySelector(`#${screenName}Screen .edit-context`);
      if (banner) banner.hidden = !isEditingHere;
    });
  };

  syncButtonLabels = function () {
    const menuBack = document.getElementById('menuBackButton');
    const menuNext = document.getElementById('menuNextButton');
    const optionsBack = document.getElementById('optionsBackButton');
    const optionsNext = document.getElementById('optionsNextButton');
    const serviceBack = document.getElementById('serviceBackButton');
    const serviceNext = document.getElementById('serviceNextButton');

    menuBack.textContent = state.editMode === 'drink' ? '수정 취소' : '이전: 시작 안내';
    menuNext.textContent = state.editMode === 'drink'
      ? '다음: 온도·컵 크기 확인하기'
      : '다음: 온도·컵 크기';

    optionsBack.textContent = state.editMode === 'options' ? '수정 취소' : '이전: 음료';
    optionsNext.textContent = ['drink', 'options'].includes(state.editMode)
      ? '수정 반영하고 주문 확인으로'
      : '다음: 받는 방법';

    serviceBack.textContent = state.editMode === 'service' ? '수정 취소' : '이전: 온도·컵 크기';
    serviceNext.textContent = state.editMode === 'service'
      ? '수정 반영하고 주문 확인으로'
      : '다음: 주문 확인';
  };

  renderReceipt = function () {
    if (!isOrderComplete()) return;

    const drink = getDrink();
    const temperature = getTemperature();
    const size = getSize();
    const service = getService();

    document.getElementById('completeMessage').textContent = `${drink.name} 주문을 끝까지 확인하고 완료했어요.`;
    document.getElementById('receipt').innerHTML = `
      <p class="receipt-title">연습 주문표</p>
      <div class="receipt-row"><span>음료</span><strong>${drink.name}</strong></div>
      <div class="receipt-row"><span>온도·컵 크기</span><strong>${temperature.label} · ${size.label}</strong></div>
      <div class="receipt-row"><span>받는 방법</span><strong>${service.subtitle}</strong></div>
      <div class="receipt-row"><span>수량</span><strong>${state.quantity}잔</strong></div>
      <div class="receipt-row receipt-total"><span>총 금액</span><strong>${money(totalPrice())}</strong></div>`;
  };

  startEdit = function (type) {
    state.editSnapshot = copyOrderState();
    state.editMode = type;

    const labels = {
      drink: '음료',
      options: '온도와 컵 크기',
      service: '받는 방법과 수량'
    };

    if (type === 'drink') showScreen('menu');
    if (type === 'options') showScreen('options');
    if (type === 'service') showScreen('service');

    showToast(`${labels[type]}을 수정하고 있어요. 수정 전 주문은 그대로 보관되어 있어요.`);
  };

  const getChoiceSelector = button => {
    if (button.dataset.drink) return `[data-drink="${button.dataset.drink}"]`;
    if (button.dataset.temperature) return `[data-temperature="${button.dataset.temperature}"]`;
    if (button.dataset.size) return `[data-size="${button.dataset.size}"]`;
    if (button.dataset.service) return `[data-service="${button.dataset.service}"]`;
    return null;
  };

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-drink], [data-temperature], [data-size], [data-service]');
    if (!button || button.disabled) return;

    const selector = getChoiceSelector(button);
    if (!selector) return;

    requestAnimationFrame(() => {
      const refreshedButton = document.querySelector(selector);
      refreshedButton?.focus({ preventScroll: true });
    });
  }, true);

  renderEditModeCopy();
  syncButtonLabels();
})();
