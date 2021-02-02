/* Mounting model to DOM target middleman function */

import { Model } from "../dom/Model";
import { parseAttributes } from "./parseAttributes";

export function mountModel<T extends object>(model: Model<T>, el: HTMLElement) {
    // Remove the attribute after parse to be spec-compliant:
    const elementsToParse = el.querySelectorAll("[r]");

    if (el.hasAttribute("r")) {
        el.removeAttribute("r");
        parseAttributes(el, model);
    }

    elementsToParse.forEach(node => {
        node.removeAttribute("r");

        if (node instanceof HTMLElement) {
            parseAttributes(node, model);
        }
    });
}