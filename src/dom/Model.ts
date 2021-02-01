import { mountModel } from "../internal/mountModel";
import { stateful } from "../reactivity/stateful";
import { watchful } from "../reactivity/watchful";

interface IModelConfig<T> {
    data: T;
    methods: Record<string, (data: T, e?: Event) => any>;
}

export class Model<T extends object> {
    data: T;
    methods: Record<string, (e?: Event) => any> = {};

    constructor({ data, methods }: IModelConfig<T>) {
        const staticData: T = Object.create(null);
        const dynamicProperties: string[] = [];
        Object.entries(data).forEach(([key, value]) => {
            if (typeof value === "function") {
                dynamicProperties.push(key);
            }
            else {
                staticData[key as keyof T] = value;
            }
        });

        this.data = stateful<T>(staticData);

        dynamicProperties.forEach(key => {  
            watchful(() => this.data[key as keyof T] = (data[key as keyof T] as any)(this.data));
        });
        
        Object.entries(methods || {}).forEach(([name, method]) => {
            this.methods[name] = (e?: Event) => method(this.data, e);
        });
    }

    oneWayBind(prop: keyof T) {
        return (el: HTMLElement, elementProp: string) => {
            if (elementProp === "r-text") {
                watchful(() => (el as any).textContent = this.getValue(prop as string));
            }

            else if (elementProp === "r-html") {
                watchful(() => (el as any).innerHTML = this.getValue(prop as string));
            }

            else {
                watchful(() => el.setAttribute(elementProp, this.getValue(prop as string) as unknown as string));
            }
        }
    }

    twoWayBind(prop: keyof T) {
        return (el: HTMLInputElement) => {
            // Bind from store change:
            watchful(() => (el as any).value = this.getValue(prop as string));

            // Bind from input change:
            el.addEventListener("change", () => this.setValue(prop as keyof T & string, el.value as any));
        }
    }

    listBind(prop: keyof T) {
        
    }

    watch(handler: (data: T) => any) {
        watchful(() => handler(this.data));
    }

    mount(el: HTMLElement) {
        mountModel<T>(this, el);
    }

    getValue(prop: string) {
        let value: any = this.data;
        prop.split(".").forEach(p => value = value[p]);
    
        return value;
    }

    setValue(prop: keyof T & string, value: any) {
        const nestedChunks = prop.split(".");

        if (nestedChunks.length === 1) {
            this.data[prop] = value;
        }

        else {
            let nestedObject: any = this.data;
            nestedChunks.forEach((p, i) => {
                if (i === nestedChunks.length - 1) {
                    nestedObject[p as keyof T] = value;
                }
                else {
                    nestedObject = nestedObject[p];
                }
            });
        }
    }
}