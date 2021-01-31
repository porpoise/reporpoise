import { stateful } from "../reactivity/stateful";
import { watchful } from "../reactivity/watchful";

export class Model<T extends object> {
    data: T;

    constructor(data: T) {
        this.data = stateful<T>(data);
    }

    oneWayBind(prop: keyof T) {
        return (el: HTMLElement, elementProp: string) => 
            watchful(() => (el as any)[elementProp] = this.data[prop]);
    }

    twoWayBind(prop: keyof T) {
        return (el: HTMLInputElement) => {
            // Bind from store change:
            this.oneWayBind(prop)(el, "value");

            // Bind from input change:
            el.addEventListener("change", () => this.data[prop] = el.value as any);
        }
    }
}