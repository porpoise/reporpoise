import { getDependentHandler } from "./watchful";

export function stateful<T extends object = object>(initial: T): T {
    const internalState = Object.create(null);
    const dependencies: Record<string, Set<Function>> = Object.create(null);

    // Loop over object:
    Object.entries(initial).forEach(([key, value]) => {
        if (typeof value === "object") {
            internalState[key] = stateful(value);
        }

        else {
            // Add to state:
            internalState[key] = value;
        }
    });

    return new Proxy(internalState, {
        get(target, key: string) {
            // Make sure dependency array exists:
            if (!(dependencies[key] instanceof Set)) {
                dependencies[key] = new Set<Function>();
            }

            // Add dependency:
            const handler = getDependentHandler();
            if (typeof handler === "function") {

                dependencies[key].add(handler);
            }

            return target[key];
        },

        set(target, key: string, value: any) {
            // Make sure dependency array exists:
            if (!(dependencies[key] instanceof Set)) {
                dependencies[key] = new Set<Function>();
            }

            // Modify value:
            target[key] = value;

            // Call dependencies:
            dependencies[key].forEach(handler => handler());

            return true;    
        }
    });
}