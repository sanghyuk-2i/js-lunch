(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const CATEGORIES = [
  {
    label: "전체",
    value: "전체"
  },
  {
    label: "한식",
    value: "한식"
  },
  {
    label: "중식",
    value: "중식"
  },
  {
    label: "일식",
    value: "일식"
  },
  {
    label: "양식",
    value: "양식"
  },
  {
    label: "아시안",
    value: "아시안"
  },
  {
    label: "기타",
    value: "기타"
  }
];
const SORTINGS = [
  {
    label: "이름순",
    value: "name"
  },
  {
    label: "거리순",
    value: "distance"
  }
];
const RESTAURANTS = [
  {
    icon: { name: "category-korean", alt: "한식" },
    category: "한식",
    name: "피양콩할마니",
    distance: 10,
    description: "평양 출신의 할머니가 수십 년간 운영해온 비지 전문점 피양콩 할마니. 두부를 빼지 않은 되비지를 맛볼 수 있는 곳으로, ‘피양’은 평안도 사투리로 ‘평양’을 의미한다. 딸과 함께 운영하는 이곳에선 맷돌로 직접 간 콩만을 사용하며, 일체의 조미료를 넣지 않은 건강식을 선보인다. 콩비지와 피양 만두가 이곳의 대표 메뉴지만, 할머니가 옛날 방식을 고수하며 만들어내는 비지전골 또한 이 집의 역사를 느낄 수 있는 특별한 메뉴다. 반찬은 손님들이 먹고 싶은 만큼 덜어 먹을 수 있게 준비돼 있다."
  },
  {
    icon: { name: "category-chinese", alt: "중식" },
    category: "중식",
    name: "친친",
    distance: 5,
    description: "Since 2004 편리한 교통과 주차, 그리고 관록만큼 깊은 맛과 정성으로 정통 중식의 세계를 펼쳐갑니다."
  },
  {
    icon: { name: "category-japanese", alt: "일식" },
    category: "일식",
    name: "잇쇼우",
    distance: 10,
    description: "잇쇼우는 정통 자가제면 사누끼 우동이 대표메뉴입니다. 기술은 정성을 이길 수 없다는 신념으로 모든 음식에 최선을 다하는 잇쇼우는 고객 한분 한분께 최선을 다하겠습니다."
  },
  {
    icon: { name: "category-western", alt: "양식" },
    category: "양식",
    name: "이태리키친",
    distance: 20,
    description: "늘 변화를 추구하는 이태리키친입니다."
  },
  {
    icon: { name: "category-asian", alt: "아시안" },
    category: "아시안",
    name: "호아빈 삼성점",
    distance: 15,
    description: "푸짐한 양에 국물이 일품인 쌀국수."
  },
  {
    icon: { name: "category-etc", alt: "기타" },
    category: "기타",
    name: "도스타코스 선릉점",
    distance: 5,
    description: "멕시칸 캐주얼 그릴."
  }
];
let isInitialized = false;
const eventManager = {};
const handleEvents = (event) => {
  const handlers = eventManager[event.type];
  if (!handlers) return;
  for (const target in handlers) {
    const matchedElement = event.target.closest(target);
    if (matchedElement) {
      handlers[target](event);
      break;
    }
  }
};
const addEvent = (eventType, target, handler) => {
  if (!eventManager[eventType]) {
    eventManager[eventType] = {};
  }
  eventManager[eventType][target] = handler;
};
const initializeEventManager = () => {
  if (isInitialized) return;
  isInitialized = true;
  Object.keys(eventManager).forEach((eventType) => {
    document.body.addEventListener(eventType, handleEvents);
  });
};
const createObserver = (initialValue) => {
  let value = initialValue;
  const observers = /* @__PURE__ */ new Set();
  const subscribe = (observer) => observers.add(observer);
  const unsubscribe = (observer) => observers.delete(observer);
  const notify = () => observers.forEach((observer) => observer(value));
  const get = () => value;
  const set = (newValue) => {
    value = newValue;
    notify();
  };
  return { subscribe, unsubscribe, get, set };
};
const store = createObserver({
  // Bottom Sheet
  isBottomSheetOpen: false,
  bottomSheetLeftButtonText: "취소",
  bottomSheetRightButtonText: "확인",
  bottomSheetContent: null,
  bottomSheetConfirm: null,
  bottomSheetCancel: null,
  // Domains
  category: CATEGORIES[0].value,
  sorting: SORTINGS[0].value,
  restaurants: RESTAURANTS
});
const Button = (props) => {
  const { name, size, content, variant } = props;
  const _size = (() => {
    if (size === "lg") return 44;
    if (size === "sm") return 30;
    return 36;
  })();
  const { border, background, color } = (() => {
    if (variant === "outlined") {
      return {
        border: "1px solid var(--grey-300)",
        background: "transparent",
        color: "var(--grey-300)"
      };
    }
    return {
      border: "none",
      background: "var(--primary-color)",
      color: "var(--grey-100)"
    };
  })();
  return `
    <button
      id="${name}"
      style="
        width: 100%;
        height: ${_size}px;
        border: ${border};
        background: ${background};
        color: ${color};
        border-radius: 8px;
        pointer: cursor;
      "
    >
      ${content}
    </button>
  `;
};
const Backdrop = () => {
  return `
    <div class="modal-backdrop"></div>
  `;
};
const BottomSheet = () => {
  const open = store.get().isBottomSheetOpen ? "modal--open" : "";
  return `
    <div class="modal ${open}">
      ${Backdrop()}
      <div class="modal-container">
        ${store.get().bottomSheetContent}
        
        <div class="button-container" style="margin-top: 16px; gap: 8px;">
          ${Button({
    name: "bottom-sheet-confirm",
    size: "lg",
    variant: "outlined",
    content: store.get().bottomSheetLeftButtonText
  })}
          ${Button({
    name: "bottom-sheet-cancel",
    size: "lg",
    variant: "plain",
    content: store.get().bottomSheetRightButtonText
  })}
        </div>
      </div>
    </div>
  `;
};
addEvent("click", "#bottom-sheet-confirm", () => {
  var _a, _b;
  (_b = (_a = store.get()).bottomSheetConfirm) == null ? void 0 : _b.call(_a);
  store.set({
    ...store.get(),
    isBottomSheetOpen: false,
    bottomSheetLeftButtonText: "취소",
    bottomSheetRightButtonText: "확인"
  });
});
addEvent("click", "#bottom-sheet-cancel", () => {
  var _a, _b;
  (_b = (_a = store.get()).bottomSheetCancel) == null ? void 0 : _b.call(_a);
  store.set({
    ...store.get(),
    isBottomSheetOpen: false,
    bottomSheetLeftButtonText: "취소",
    bottomSheetRightButtonText: "확인"
  });
});
const Header = () => {
  return `
    <header style="padding: 16px 0; text-align:center; background-color: var(--primary-color)">
      <h1 class="text-title" style="color: var(--grey-100)">점심에는 뭐 먹지</h1>
    </header>
  `;
};
const List = (props) => {
  const { children } = props;
  return `
    <div style="display:flex; flex-direction: column; gap: 4px; overflow-y: auto;">
      ${children()}
    </div>
  `;
};
const SelectItem = (props) => {
  const { label, value, selected } = props;
  const _selected = selected ? "selected" : "";
  return `
    <option value="${value}" ${_selected}>${label}</option>
  `;
};
const SelectContainer = (props) => {
  const { name, children } = props;
  return `
    <select
      id="${name}"
      name="${name}"
      style="
        height: 44px;
        min-width: 125px;
        border: 1px solid #d0d5dd;
        border-radius: 8px;
        background: transparent;
        font-size: 16px;
      "
    >
      ${children()}
    </select>
  `;
};
const Select = Object.assign(SelectContainer, {
  Item: SelectItem
});
const Icon = (props) => {
  const { name, size } = props;
  const _size = (() => {
    if (size === "xl") return 36;
    if (size === "lg") return 32;
    if (size === "sm") return 20;
    if (size === "xs") return 14;
    return 26;
  })();
  return `
    <div 
      style="
        width: ${_size * 1.4}px; 
        height: ${_size * 1.4}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 6px;
        border-radius: 50%;
        background-color: var(--lighten-color);
      "
    >
      <img
        src="${"/js-lunch/"}assets/${name}.png"
        alt="${name} icon"
        style="
          width: ${_size}px; 
          height: ${_size}px;
          display: block;
        "
      />
    </div>
  `;
};
const RestaurantInfo = (props) => {
  const { icon, name, distance, description } = props;
  return `
    <div style="display: flex; flex-direction: column; justify-content: flex-start; gap: 16px;">
      ${Icon({ ...icon, size: "lg" })}

      <div style="display: flex; flex-direction: column; gap: 14px;">
        <h4 class="text-title">${name}</h4>
        <span class="text-subtitle" style="color: var(--primary-color);">캠퍼스로부터 ${distance}분 거리</span>
        <p class="text-body">${description}</p>
      </div>
    </div>
  `;
};
const RestaurantItem = (props) => {
  const { icon, name, distance, description } = props;
  const json = JSON.stringify(props);
  return `
    <div
      class="restaurant"
      style="gap: 16px;"
      data-json='${json}'
    >
      ${Icon({ ...icon, size: "lg" })}

      <div class="restaurant__info">
        <h4 class="restaurant__name">${name}</h4>
        <span class="restaurant__distance"
          >캠퍼스로부터 ${distance}분 거리</span
        >
        <p class="restaurant__description">${description}</p>
      </div>
    </div>
  `;
};
addEvent("click", ".restaurant", (event) => {
  const restaurantElement = event.target.closest(".restaurant");
  if (!restaurantElement) return;
  const { json } = restaurantElement.dataset;
  if (!json) return;
  const props = JSON.parse(json);
  const handleDelete = () => {
    const removed = store.get().restaurants.filter(({ name }) => props.name !== name);
    store.set({
      ...store.get(),
      restaurants: removed
    });
  };
  store.set({
    ...store.get(),
    isBottomSheetOpen: true,
    bottomSheetLeftButtonText: "삭제하기",
    bottomSheetRightButtonText: "닫기",
    bottomSheetContent: RestaurantInfo(props),
    bottomSheetConfirm: handleDelete
  });
});
const Home = () => {
  const { category, sorting, restaurants } = store.get();
  return `
    <section style="padding: 20px 16px; display: flex; flex-direction: column; flex: 1; gap: 16px;">
      <div style="width: 100%; display:flex; justify-content: space-between;">
        ${Select({
    name: "category",
    children: () => CATEGORIES.map(
      (props) => Select.Item({ ...props, selected: props.value === category })
    ).join("")
  })}
        ${Select({
    name: "sorting",
    children: () => SORTINGS.map(
      (props) => Select.Item({ ...props, selected: props.value === sorting })
    ).join("")
  })}        
      </div>
      
      ${List({
    children: () => restaurants.map((props) => RestaurantItem(props)).join("")
  })}
    </section>
  `;
};
addEvent("change", `#category`, (event) => {
  event.preventDefault();
  const selectedCategory = event.target.value;
  store.set({
    ...store.get(),
    category: selectedCategory,
    restaurants: RESTAURANTS.filter(
      ({ category }) => category === selectedCategory || selectedCategory === "전체"
    )
  });
});
addEvent("change", `#sorting`, (event) => {
  event.preventDefault();
  const selectedSorting = event.target.value;
  const copiedRestaurants = [...store.get().restaurants];
  if (selectedSorting === "name") {
    copiedRestaurants.sort(
      (a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0
    );
  }
  if (selectedSorting === "distance") {
    copiedRestaurants.sort((a, b) => a.distance - b.distance);
  }
  store.set({
    ...store.get(),
    sorting: selectedSorting,
    restaurants: copiedRestaurants
  });
});
const App = () => {
  return ` ${Header()} ${Home()} ${BottomSheet()}`;
};
initializeEventManager();
console.log("npm run dev 명령어를 통해 점심 뭐 먹지 미션을 시작하세요");
console.log(
  "%c ___       ___  ___  ________   ________  ___  ___     \n|\\  \\     |\\  \\|\\  \\|\\   ___  \\|\\   ____\\|\\  \\|\\  \\    \n\\ \\  \\    \\ \\  \\\\\\  \\ \\  \\\\ \\  \\ \\  \\___|\\ \\  \\\\\\  \\   \n \\ \\  \\    \\ \\  \\\\\\  \\ \\  \\\\ \\  \\ \\  \\    \\ \\   __  \\  \n  \\ \\  \\____\\ \\  \\\\\\  \\ \\  \\\\ \\  \\ \\  \\____\\ \\  \\ \\  \\ \n   \\ \\_______\\ \\_______\\ \\__\\\\ \\__\\ \\_______\\ \\__\\ \\__\\\n    \\|_______|\\|_______|\\|__| \\|__|\\|_______|\\|__|\\|__|",
  "color: #d81b60; font-size: 14px; font-weight: bold;"
);
const render = () => {
  const app = document.querySelector("#app");
  if (app) {
    app.innerHTML = App();
  }
};
render();
store.subscribe(render);
