import { mountModel } from "../internal/mountModel";
import { stateful } from "../reactivity/stateful";
import { watchful } from "../reactivity/watchful";

export class Model<T extends object> {
    data: T;
    methods: Record<string, () => any> = {};

    constructor(data: T, methods: Record<string, (data: T) => any> = {}) {
        this.data = stateful<T>(data);
        
        Object.entries(methods).forEach(([name, method]) => {
            this.methods[name] = () => method(this.data);
        });
    }

    oneWayBind(prop: keyof T) {
        return (el: HTMLElement, elementProp: string) => {

            watchful(() => el.setAttribute(elementProp, this.data[prop] as unknown as string));
        }
    }

    twoWayBind(prop: keyof T) {
        return (el: HTMLInputElement) => {

            // Bind from store change:
            watchful(() => (el as any).value = this.data[prop]);

            // Bind from input change:
            el.addEventListener("change", () => this.data[prop] = el.value as any);
        }
    }

    watch(handler: (data: T) => any) {
        watchful(() => handler(this.data));
    }

    mount(el: HTMLElement) {
        mountModel<T>(this, el);
    }
}