import { Model } from "../dom/Model";
import { parseAttributes } from "./parseAttributes";

export function mountModel<T extends object>(model: Model<T>, el: HTMLElement) {
    const elementsToParse = el.querySelectorAll("[r]");

    elementsToParse.forEach(node => {
        node.removeAttribute("r");

        if (node instanceof HTMLElement) {
            parseAttributes(node, model);
        }
    });
}