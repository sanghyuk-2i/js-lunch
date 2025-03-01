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
const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`스토리지에서 키 [${key}]를 가져오는 중 오류 발생`, error);
      return defaultValue;
    }
  },
  update: (key, value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`스토리지에 키 [${key}]를 저장하는 중 오류 발생`, error);
    }
  },
  delete: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`스토리지에서 키 [${key}]를 삭제하는 중 오류 발생`, error);
    }
  },
  reset: () => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error(`스토리지를 초기화하는 중 오류 발생`, error);
    }
  }
};
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
const createObserver = (initialValue, options = { enableStorage: false }) => {
  let value = initialValue;
  const observers = /* @__PURE__ */ new Set();
  const subscribe = (observer) => observers.add(observer);
  const unsubscribe = (observer) => observers.delete(observer);
  const notify = () => observers.forEach((observer) => observer(value));
  const get = () => value;
  const set = (newValue) => {
    value = newValue;
    if (options.enableStorage) {
      for (const [key, objectValue] of Object.entries(value)) {
        storage.update(key, objectValue);
      }
    }
    notify();
  };
  return { subscribe, unsubscribe, get, set };
};
const globalStore = createObserver({
  // Bottom Sheet
  isBottomSheetOpen: false,
  bottomSheetLeftButtonText: null,
  bottomSheetRightButtonText: null,
  bottomSheetContent: null,
  bottomSheetConfirm: null,
  bottomSheetCancel: null
});
const BUTTON_SIZES = {
  lg: 44,
  md: 36,
  sm: 30
};
const BUTTON_VARIANTS = {
  primary: {
    border: "none",
    background: "var(--primary-color)",
    color: "var(--grey-100)"
  },
  outlined: {
    border: "1px solid var(--grey-300)",
    background: "transparent",
    color: "var(--grey-300)"
  }
};
const Button = (props) => {
  const { name, size = "md", content, variant = "primary" } = props;
  const _size = BUTTON_SIZES[size];
  const { border, background, color } = BUTTON_VARIANTS[variant];
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
  const open = globalStore.get().isBottomSheetOpen ? "modal--open" : "";
  return `
    <div class="modal ${open}">
      ${Backdrop()}
      <div class="modal-container" style="max-height: 90%;">
        ${globalStore.get().bottomSheetContent}
        
        <div class="button-container" style="margin-top: 16px; gap: 8px;">
          ${Button({
    name: "bottom-sheet-confirm",
    size: "lg",
    variant: "outlined",
    content: globalStore.get().bottomSheetLeftButtonText ?? "확인"
  })}
          ${Button({
    name: "bottom-sheet-cancel",
    size: "lg",
    variant: "primary",
    content: globalStore.get().bottomSheetRightButtonText ?? "취소"
  })}
        </div>
      </div>
    </div>
  `;
};
addEvent("click", "#bottom-sheet-confirm", () => {
  var _a, _b;
  (_b = (_a = globalStore.get()).bottomSheetConfirm) == null ? void 0 : _b.call(_a);
  globalStore.set({
    ...globalStore.get(),
    isBottomSheetOpen: false,
    bottomSheetLeftButtonText: null,
    bottomSheetRightButtonText: null
  });
});
addEvent("click", "#bottom-sheet-cancel", () => {
  var _a, _b;
  (_b = (_a = globalStore.get()).bottomSheetCancel) == null ? void 0 : _b.call(_a);
  globalStore.set({
    ...globalStore.get(),
    isBottomSheetOpen: false,
    bottomSheetLeftButtonText: null,
    bottomSheetRightButtonText: null
  });
});
const ICON_SIZES = {
  xl: 36,
  lg: 32,
  md: 26,
  sm: 20,
  xs: 14
};
const Icon = (props) => {
  const { name, size = "md", removeBackground = false } = props;
  const _size = ICON_SIZES[size];
  return `
    <div 
      id="${name}_icon"
      style="
        width: ${_size * 1.4}px; 
        height: ${_size * 1.4}px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 6px;
        border-radius: 50%;
        background-color: ${removeBackground ? "transparent" : "var(--lighten-color)"};
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
const HelperLabel = (props) => {
  const { content } = props;
  return `
    <span style="color: var(--grey-400); font-size: 14px;">${content}</span>
  `;
};
const Label = (props) => {
  const { name, content, required = false } = props;
  return `
    <div style="display: flex; gap: 4px;">
      <label for="${name}" style="color: var(--grey-400); font-size: 14px;">${content}</label>
      ${required ? '<span style="color: var(--primary-color);">*</span>' : ""}
    </div>
  `;
};
const Input = (props) => {
  const { name, label, placeholder, helperText, required, fullWidth } = props;
  const width = fullWidth ? "width: 100%;" : "";
  const _placeholder = placeholder ? `placeholder: ${placeholder}` : "";
  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      ${label ? Label({ name, content: label, required }) : ""}
      <input
        id=${name}
        name=${name}
        style="${width} height: 44px; padding: 8px; border: 1px solid var(--grey-200); border-radius: 8px; font-size: 16px;"
        ${_placeholder}
      />
      ${helperText ? HelperLabel({ content: helperText }) : ""}
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
  const { name, label, children, required, fullWidth } = props;
  const width = fullWidth ? "width: 100%;" : "";
  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      ${label ? Label({ name, content: label, required }) : ""}
      <select
        id="${name}"
        name="${name}"
        style="
          ${width}
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
    </div>
  `;
};
const Select = Object.assign(SelectContainer, {
  Item: SelectItem
});
const Textarea = (props) => {
  const {
    name,
    label,
    placeholder,
    helperText,
    rows = 4,
    required
  } = props;
  const width = "width: 100%;";
  const _placeholder = placeholder ? `placeholder: ${placeholder}` : "";
  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      ${label ? Label({ name, content: label, required }) : ""}
      <textarea
        id=${name}
        name=${name}
        rows=${rows}
        style="${width} padding: 8px; border: 1px solid var(--grey-200); border-radius: 8px; font-size: 16px;"
        ${_placeholder}
      ></textarea>
      ${helperText ? HelperLabel({ content: helperText }) : ""}
    </div>
  `;
};
const RESTAURANTS = [
  {
    icon: { name: "category-korean", alt: "한식" },
    category: "KOREAN",
    name: "피양콩할마니",
    distance: 10,
    description: "평양 출신의 할머니가 수십 년간 운영해온 비지 전문점 피양콩 할마니. 두부를 빼지 않은 되비지를 맛볼 수 있는 곳으로, ‘피양’은 평안도 사투리로 ‘평양’을 의미한다. 딸과 함께 운영하는 이곳에선 맷돌로 직접 간 콩만을 사용하며, 일체의 조미료를 넣지 않은 건강식을 선보인다. 콩비지와 피양 만두가 이곳의 대표 메뉴지만, 할머니가 옛날 방식을 고수하며 만들어내는 비지전골 또한 이 집의 역사를 느낄 수 있는 특별한 메뉴다. 반찬은 손님들이 먹고 싶은 만큼 덜어 먹을 수 있게 준비돼 있다."
  },
  {
    icon: { name: "category-chinese", alt: "중식" },
    category: "CHINESE",
    name: "친친",
    distance: 5,
    description: "Since 2004 편리한 교통과 주차, 그리고 관록만큼 깊은 맛과 정성으로 정통 중식의 세계를 펼쳐갑니다."
  },
  {
    icon: { name: "category-japanese", alt: "일식" },
    category: "JAPANESE",
    name: "잇쇼우",
    distance: 10,
    description: "잇쇼우는 정통 자가제면 사누끼 우동이 대표메뉴입니다. 기술은 정성을 이길 수 없다는 신념으로 모든 음식에 최선을 다하는 잇쇼우는 고객 한분 한분께 최선을 다하겠습니다."
  },
  {
    icon: { name: "category-western", alt: "양식" },
    category: "WESTERN",
    name: "이태리키친",
    distance: 20,
    description: "늘 변화를 추구하는 이태리키친입니다."
  },
  {
    icon: { name: "category-asian", alt: "아시안" },
    category: "ASIAN",
    name: "호아빈 삼성점",
    distance: 15,
    description: "푸짐한 양에 국물이 일품인 쌀국수."
  },
  {
    icon: { name: "category-etc", alt: "기타" },
    category: "ETC",
    name: "도스타코스 선릉점",
    distance: 5,
    description: "멕시칸 캐주얼 그릴."
  }
];
const RESTAURANT_CATEGORIES = [
  {
    label: "전체",
    value: "ALL"
  },
  {
    label: "한식",
    value: "KOREAN",
    icon: { name: "category-korean", alt: "한식" }
  },
  {
    label: "중식",
    value: "CHINESE",
    icon: { name: "category-chinese", alt: "중식" }
  },
  {
    label: "일식",
    value: "JAPANESE",
    icon: { name: "category-japanese", alt: "일식" }
  },
  {
    label: "양식",
    value: "WESTERN",
    icon: { name: "category-western", alt: "양식" }
  },
  {
    label: "아시안",
    value: "ASIAN",
    icon: { name: "category-asian", alt: "아시안" }
  },
  {
    label: "기타",
    value: "ETC",
    icon: { name: "category-etc", alt: "기타" }
  }
];
const RESTAURANT_SORTINGS = [
  {
    label: "이름순",
    value: "name"
  },
  {
    label: "거리순",
    value: "distance"
  }
];
const RESTAURANT_DISTANCES = [
  {
    label: "5분",
    value: 5
  },
  {
    label: "10분",
    value: 10
  },
  {
    label: "15분",
    value: 15
  },
  {
    label: "20분",
    value: 20
  },
  {
    label: "30분",
    value: 30
  }
];
const initializeLocalStore = () => ({
  category: "ALL",
  distance: 5
});
const RestaurantEnroll = () => {
  const { category, distance } = initializeLocalStore();
  return `
    <div>
      <h4 class="text-subtitle" style="padding-bottom: 12px;">새로운 음식점</h4>

      <form action="#" id="restaurant_enroll_form" style="display: flex; flex-direction: column; gap: 24px;">
          ${Select({
    name: "category",
    label: "카테고리",
    required: true,
    fullWidth: true,
    children: () => RESTAURANT_CATEGORIES.map(
      (props) => Select.Item({
        ...props,
        selected: props.value === category
      })
    ).join("")
  })}

          ${Input({
    name: "name",
    label: "이름",
    required: true,
    fullWidth: true
  })}

          ${Select({
    name: "distance",
    label: "거리(도보 이동 시간)",
    required: true,
    fullWidth: true,
    children: () => RESTAURANT_DISTANCES.map(
      (props) => Select.Item({ ...props, selected: props.value === distance })
    ).join("")
  })}

          ${Textarea({
    name: "description",
    label: "설명",
    helperText: "메뉴 등 추가 정보를 입력해 주세요."
  })}

          ${Input({
    name: "link",
    label: "참고 링크",
    fullWidth: true,
    helperText: "매장 정보를 확인할 수 있는 링크를 입력해 주세요."
  })}
      </form>
    </div>
  `;
};
addEvent("change", `#category`, (event) => {
  event.preventDefault();
  event.target.value;
});
addEvent("change", `#distance`, (event) => {
  event.preventDefault();
  event.target.value;
});
const restaurantStore = createObserver(
  {
    // Domains
    category: storage.get("category", RESTAURANT_CATEGORIES[0].value),
    sorting: storage.get("sorting", RESTAURANT_SORTINGS[0].value),
    restaurants: storage.get("restaurants", RESTAURANTS)
  },
  { enableStorage: true }
);
const validateRestaurantEnrollForm = (formValues) => {
  const { category, name, distance } = formValues;
  return new Promise((resolve, reject) => {
    if (category === "") {
      reject({ isValid: false, reason: "카테고리가 선택되지 않았습니다." });
    }
    if (name === "" || name.trim() === "") {
      reject({ isValid: false, reason: "이름이 입력되지 않았습니다." });
    }
    if (distance === "") {
      reject({ isValid: false, reason: "거리가 선택되지 않았습니다." });
    }
    resolve({ isValid: true });
  });
};
const MainHeader = () => {
  return `
    <header style="padding: 16px 12px; text-align:center; background-color: var(--primary-color); display: flex; justify-content: space-between; align-items: center;">
      <h1 class="text-title" style="color: var(--grey-100)">점심에는 뭐 먹지</h1>
      ${Icon({ name: "add-button", size: "lg", removeBackground: true })}
    </header>
  `;
};
addEvent("click", `#add-button_icon`, (event) => {
  event.preventDefault();
  const handleSubmit = async () => {
    const targetForm = document.querySelector("#restaurant_enroll_form");
    const formValues = {};
    new FormData(targetForm).forEach((value, key) => {
      formValues[key] = value;
    });
    try {
      await validateRestaurantEnrollForm(formValues);
      restaurantStore.set({
        ...restaurantStore.get(),
        restaurants: [
          ...restaurantStore.get().restaurants,
          {
            ...formValues,
            ...RESTAURANT_CATEGORIES.filter(
              ({ value }) => formValues.category === value
            )[0]
          }
        ]
      });
    } catch ({ reason }) {
      alert(reason);
    }
  };
  globalStore.set({
    ...globalStore.get(),
    isBottomSheetOpen: true,
    bottomSheetLeftButtonText: "취소",
    bottomSheetRightButtonText: "등록하기",
    bottomSheetContent: RestaurantEnroll(),
    bottomSheetCancel: handleSubmit
  });
});
const List = (props) => {
  const { children } = props;
  return `
    <div style="display:flex; flex-direction: column; gap: 4px; overflow-y: auto;">
      ${children()}
    </div>
  `;
};
const RestaurantInfo = (props) => {
  const { icon, name, distance, description, link } = props;
  return `
    <div style="display: flex; flex-direction: column; justify-content: flex-start; gap: 16px;">
      ${Icon({ ...icon, size: "lg" })}

      <div style="display: flex; flex-direction: column; gap: 14px;">
        <h4 class="text-title">${name}</h4>
        <span class="text-subtitle" style="color: var(--primary-color);">캠퍼스로부터 ${distance}분 거리</span>
        <p class="text-body">${description}</p>
        ${link ? `<a href="${link}">${link}</a>` : ""}
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
    const removed = restaurantStore.get().restaurants.filter(({ name }) => props.name !== name);
    restaurantStore.set({
      ...restaurantStore.get(),
      restaurants: removed
    });
  };
  globalStore.set({
    ...globalStore.get(),
    isBottomSheetOpen: true,
    bottomSheetLeftButtonText: "삭제하기",
    bottomSheetRightButtonText: "닫기",
    bottomSheetContent: RestaurantInfo(props),
    bottomSheetConfirm: handleDelete
  });
});
const Home = () => {
  const { category, sorting, restaurants } = restaurantStore.get();
  return `
    <section id="home-container" style="padding: 20px 16px; display: flex; flex-direction: column; flex: 1; gap: 16px;">
      <div style="width: 100%; display:flex; justify-content: space-between;">
        ${Select({
    name: "category_filter",
    children: () => RESTAURANT_CATEGORIES.map(
      (props) => Select.Item({ ...props, selected: props.value === category })
    ).join("")
  })}
        ${Select({
    name: "sorting",
    children: () => RESTAURANT_SORTINGS.map(
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
const render$1 = () => {
  const oldContainer = document.querySelector("#home-container");
  if (!oldContainer) return;
  const newContainer = document.createElement("div");
  newContainer.id = "home-container";
  newContainer.innerHTML = Home();
  oldContainer.replaceWith(newContainer);
};
restaurantStore.subscribe(render$1);
addEvent("change", `#category_filter`, (event) => {
  event.preventDefault();
  const selectedCategory = event.target.value;
  restaurantStore.set({
    ...restaurantStore.get(),
    category: selectedCategory,
    restaurants: RESTAURANTS.filter(
      ({ category }) => category === selectedCategory || selectedCategory === "ALL"
    )
  });
});
addEvent("change", `#sorting`, (event) => {
  event.preventDefault();
  const selectedSorting = event.target.value;
  const copiedRestaurants = [...restaurantStore.get().restaurants];
  if (selectedSorting === "name") {
    copiedRestaurants.sort(
      (a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0
    );
  }
  if (selectedSorting === "distance") {
    copiedRestaurants.sort((a, b) => a.distance - b.distance);
  }
  restaurantStore.set({
    ...restaurantStore.get(),
    sorting: selectedSorting,
    restaurants: copiedRestaurants
  });
});
const App = () => {
  return ` ${MainHeader()} ${Home()} ${BottomSheet()}`;
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
globalStore.subscribe(render);
