import { ITemplateData, renderList } from "../internal/renderList";
import { mountModel } from "../internal/mountModel";
import { stateful } from "../reactivity/stateful";
import { watchful } from "../reactivity/watchful";

export type EventHandlerT<T> = (data: T, e?: Event, item?: any) => void;

interface IModelConfig<T> {
    data: T;
    events: Record<string, (
        EventHandlerT<T> | // Events
        Record<string, EventHandlerT<T>> // Scoped Events
    )>;
}

export class Model<T extends object> {
    data: T;
    events: Record<string, (
        (e?: Event) => void | // Events
        Record<string, (e?: Event) => void> // Scoped Events
    )> = {};
    scopedEvents: Record<string, Record<string, EventHandlerT<T>>> = {};

    constructor({ data, events }: IModelConfig<T>) {
        events = events || {};

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
        
        Object.entries(events || {}).forEach(([name, method]) => {
            if (typeof method === "function") {
                this.events[name] = (e?: Event) => method(this.data, e);
            }

            else if (typeof method === "object") {
                // Create scoped event object:
                this.scopedEvents[name] = Object.create(null);
                Object.entries<EventHandlerT<T>>(method).forEach(([scopedName, scopedMethod]) => {
                    this.scopedEvents[name][scopedName] = scopedMethod;
                });
            }
        });
    }

    oneWayBind(prop: keyof T) {
        const specialProps = ["textContent", "innerHTML", "value"];

        return (el: HTMLElement, elementProp: string) => {
            if (specialProps.includes(elementProp)) {
                watchful(() => (el as any)[elementProp] = this.getValue(prop as string));
            }

            else {
                watchful(() => el.setAttribute(elementProp, this.getValue(prop as string) as unknown as string));
            }
        }
    }

    twoWayBind(prop: keyof T) {
        return (el: HTMLInputElement) => {
            // Bind from store change:
            this.oneWayBind(prop)(el, "value");

            // Bind from input change:
            el.addEventListener("change", () => this.setValue(prop as keyof T & string, el.value as any));
        }
    }

    listBind(template: HTMLTemplateElement, templateData: ITemplateData) {
        renderList<T>(this, template, templateData);
    }

    watch(handler: (data: T) => any) {
        watchful(() => handler(this.data));
    }

    mount(el: HTMLElement) {
        mountModel<T>(this, el);
        return this;
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