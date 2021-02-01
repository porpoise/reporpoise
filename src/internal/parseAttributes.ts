/* Efficiently parse the attributes and make reactive bindings: */

import { Model } from "../dom/Model";
import { getNodeAttributes } from "./getNodeAttributes";

export function parseAttributes<T extends object>(el: HTMLElement, model: Model<T>) {
    const attributes = getNodeAttributes(el);

    Object.entries(attributes).forEach(([key, value]) => {
        let removeAttribute = true;

        if (key.startsWith("@")) {
            const eventName = key.replace("@", "").trim();
            el.addEventListener(eventName, e => model.methods[value](e));
        }

        else if (key.startsWith(":")) {
            const propName = key.replace(":", "").trim();
            model.oneWayBind(value as keyof T)(el, propName);
        }

        else if (key === "r-model") {
            model.twoWayBind(value as keyof T)(el as HTMLInputElement);
        }

        else {
            removeAttribute = false;
        }

        // Remove the attribute after parse to be spec-compliant:
        if (removeAttribute) el.removeAttribute(key);
    });
}