/* Reactive / observable list */
import { stateful } from "./stateful";
import { getDependentHandler } from "./watchful";

interface IListTemplate {
    template: HTMLTemplateElement,
    target: DocumentFragment
}

export function list<T>(...arr: T[]): T[] {
    const dependencies: Record<string, Set<Function>> = Object.create(null);
    const templates: IListTemplate[] = [];

    const reactiveArray: T[] = arr.map(item => {
        if (Array.isArray(item)) return list(item);
        else if (typeof item === "object") return stateful(item as any);
        else return item;
    });

    return new Proxy(reactiveArray, {
        get(target, key: string) {
            // JSONify the list on toString()
            if (key === "toString") {
                return () => JSON.stringify(target);
            }

            // Symbol return early to prevent errors:
            else if (typeof key === "symbol") {
                return target[key];
            }

            // Allow reactivity if the key is array item:
            const isValidIndex = 
                Number.isInteger(Number(key)) && // Is an integer:
                Number(key) < target.length && // Within array length;
                Number(key) >= 0 && // Not negative
                key in target; // Exists on array

            if (isValidIndex || key === "length") {
                // Make sure dependency array exists:
                if (!(dependencies[key] instanceof Set)) {
                    dependencies[key] = new Set<Function>();
                }

                // Add dependency handler if exists:
                const handler = getDependentHandler();
                if (typeof handler === "function") {
                    dependencies[key].add(handler);
                }

                return target[key as any];
            }

            else if (typeof target[key as any] === "function") {
                return (...args: any[]) => {
                    const oldLength = Number(target.length);
                    const value = (target[key as any] as any)(...args);

                    if (oldLength !== target.length) {
                        dependencies.length.forEach(handler => handler());
                    }

                    return value;
                };
            }
        },

        set(target, key: string & keyof T[], value: any) {
            const isValidIndex = 
                Number.isInteger(Number(key)) && // Is an integer:
                Number(key) < target.length && // Within array length;
                Number(key) >= 0 && // Not negative
                key in target; // Exists on array

            if (!isValidIndex) {
                console.error(`"${key}" is a readonly property or cannot be assigned to.`);
                return false;
            }

            // Set the value:
            if (Array.isArray(value)) {
                target[key] = list(...value) as any;
            }

            else if (typeof value === "object") {
                target[key] = stateful(value);
            }

            else {
                // Modify value:
                target[key] = value;
            }

            // Allow reactivity if the key is array item:
            if (isValidIndex) {
                // Make sure dependency array exists:
                if (!(dependencies[key] instanceof Set)) {
                    dependencies[key] = new Set<Function>();
                }

                // Call dependencies:
                dependencies[key].forEach(handler => handler());
            }

            return true;    
        }
    });
}