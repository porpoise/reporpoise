import { stateful } from "../reactivity/stateful";
import { watchful } from "../reactivity/watchful";

export class Model<T extends object> {
    data: T;

    constructor(data: T) {
        this.data = stateful<T>(data);
    }

    oneWayBind(prop: keyof T) {
        return (selector: string, elementProp: string) => {
            const el: HTMLInputElement | null = document.querySelector(selector);

            // Don't bind if doesn't exist:
            if (el === null) return;

            watchful(() => (el as any)[elementProp] = this.data[prop]);
        }
    }

    twoWayBind(prop: keyof T) {
        return (selector: string) => {
            const el: HTMLInputElement | null = document.querySelector(selector);

            // Don't bind if doesn't exist:
            if (el === null) return;

            // Bind from store change:
            this.oneWayBind(prop)(selector, "value");

            // Bind from input change:
            el.addEventListener("change", () => this.data[prop] = el.value as any);
        }
    }

    watch(handler: (data: T) => any) {
        watchful(() => handler(this.data));
    }
}