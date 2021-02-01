/* Reactive / observable list */

import { stateful } from "./stateful";
import { getDependentHandler } from "./watchful";

export function list<T>(...arr: T[]): T[] {
    const dependencies: Record<string, Set<Function>> = Object.create(null);

    return new Proxy(arr, {
        get(target, key: string) {
            if (key === "toString") {
                return () => JSON.stringify(target);
            }

            if (typeof key === "symbol") {
                return target[key];
            }

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
            }

            return target[key as any];
        },

        set(target, key: string & keyof T[], value: any) {
            // Make sure dependency array exists:
            if (!(dependencies[key] instanceof Set)) {
                dependencies[key] = new Set<Function>();
            }

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

            // Call dependencies:
            dependencies[key].forEach(handler => handler());

            return true;    
        }
    });
}