# Reporpoise

```html
<h1>The Classic Counter :D</h1>

<input id="countDisplay" />

<button id="increaseCount">+</button>
<button id="decreaseCount">-</button>
```

```ts
import { Model, query } from "reporpoise";

// Initialize data store:
const store = new Model({
    count: 0
});

// Create dynamic area property:
store.watch(data => data.area = data.width * data.height);

// Reactively display count:
store.twoWayBind("count")("#countDisplay");

// Event handling:
query("#increaseCount")
    .addEventListener("click", () => store.data.count++);

query("#decreaseCount")
    .addEventListener("click", () => store.data.count--);
```