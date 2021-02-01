/* Efficiently parse the attributes and make reactive bindings: */

import { Model } from "../dom/Model";
import { getNodeAttributes } from "./getNodeAttributes";

export function parseAttributes<T extends object>(el: HTMLElement, model: Model<T>) {
    const attributes = getNodeAttributes(el);

    Object.entries(attributes).forEach(([key, value]) => {
        let removeAttribute = true;

        // Event handling:
        if (key.startsWith("@")) {
            const eventName = key.replace("@", "").trim();
            el.addEventListener(eventName, e => model.methods[value](e));
        }

        // One way binding:
        else if (key.startsWith(":")) {
            const propName = key.replace(":", "").trim();
            model.oneWayBind(value as keyof T)(el, propName);
        }

        // inner text:
        else if (key === "r-text") {
            model.oneWayBind(value as keyof T)(el, "textContent");
        }

        // inner html
        else if (key === "r-unsafe-html") {
            model.oneWayBind(value as keyof T)(el, "innerHTML");
        }

        // two way data modeling on inputs:
        else if (key === "r-model") {
            model.twoWayBind(value as keyof T)(el as HTMLInputElement);
        }

        // List rendering:
        else if (key === "r-for" && el instanceof HTMLTemplateElement) {
            const [iteratorName, listName] = value.split(":");
            const [itemName, indexName] = iteratorName.split(",");

            model.listBind(el, {
                item: itemName.trim(), 
                index: indexName.trim(), 
                list: listName.trim()
            });
        }

        // do nothing
        else {
            removeAttribute = false;
        }

        // Remove the attribute after parse to be spec-compliant:
        if (removeAttribute) el.removeAttribute(key);
    });
}