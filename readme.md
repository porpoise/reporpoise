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
new Model({
    data: {
        count: 0
    },
    methods: {
        increaseCount(data, e) { data.count++; },
        decreaseCount(data, e) { data.count--; }
    }
}).mount(query("#app"));
```

## What is this?

The HTML-looking portion of the above sample isn't some custom JSX-type expression. Instead, it goes directly in your *.html file.

The JavaScript is really just plain JavaScript. No need to transpile any JSX expressions or single-file components, just your standard web languages.

## How it works:
