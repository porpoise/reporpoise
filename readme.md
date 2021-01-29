# RePorpoise

```tsx
import {
    compute, //
    component, // create component
    h, markup // h for JSX, markup for string
} from "reporpoise";

export const GreetingDisplay = component<IProps, IData>((props, options) => ({
    data: {
        name: () => props.name,
        language: () => props.language,

        greeting: compute(data => {
            switch(data.language) {
                case "American":
                    return "What's poppin";

                case "Britain":
                    return "Good day";

                default:
                    return "Hello";
            }
        })
    },


    render: data => (
        <h1>{() => `${data.greeting} ${data.name}`}</h1>
    ),
}));
``` 