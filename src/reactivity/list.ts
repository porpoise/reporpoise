/* Reactive / observable list */
import { stateful } from "./stateful";
import { getDependentHandler } from "./watchful";

export type MethodWatcher<T> = (methodName: string & keyof T[]) => any;

export type ReactiveList<T> = T[] & {
    watchMethod(handler: MethodWatcher<T>): void;
};

export function list<T>(...arr: T[]): ReactiveList<T> {
    const dependencies: Record<string, Set<Function>> = Object.create(null);
    const methodWatchers: Set<MethodWatcher<T>> = new Set();

    const reactiveArray: T[] = arr.map(item => {
        if (Array.isArray(item)) return list(item);
        else if (typeof item === "object") return stateful(item as any);
        else return item;
    });

    return new Proxy(reactiveArray as ReactiveList<T>, {
        get(target, key: string) {
            // JSONify the list on toString()
            if (key === "toString") {
                return () => JSON.stringify(target);
            }

            // Add a method watch (listen for push/pop/...):
            if (key === "watchMethod") {
                return (handler: MethodWatcher<T>) => methodWatchers.add(handler);
            }

            // Symbol return early to prevent errors:
            if (typeof key === "symbol") {
                return target[key];
            }

            // Length:
            if (key === "length") { return target.length; }

            // Allow reactivity if the key is array item:
            const isValidIndex = 
                Number.isInteger(Number(key)) && // Is an integer:
                Number(key) < target.length && // Within array length;
                Number(key) >= 0 && // Not negative
                key in target; // Exists on array

            if (isValidIndex) {
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

            // Add change watcher to push/pop/... methods:
            if (typeof target[key as any] === "function") {
                return (...args: any[]) => {
                    const value = (target[key as any] as any)(...args);
                    methodWatchers.forEach(handler => handler(key as string & keyof T[]));
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

            // Set the value (make it reactive list):
            if (Array.isArray(value)) {
                target[key] = list(...value) as any;
            }

            // Set the value (make it reactive object):
            else if (typeof value === "object") {
                target[key] = stateful(value);
            }

            // Set the value (primitive):
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