# Reporpoise

## HTML:

```html
<div id="app">
    <h1>The Classic Counter :D</h1>

    <input r r-model="count" />

    <button r @click="increaseCount">+</button>
    <button r @click="decreaseCount">-</button>
</div>
```

## JavaScript:

```js
import { Model, query } from "reporpoise";

// Initialize data store:
const store = new Model({
    count: 0
}, {
    increaseCount: data => data.count++,
    decreaseCount: data => data.count--
});

store.mount(query("#app"));
```

