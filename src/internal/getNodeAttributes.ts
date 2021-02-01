/* parse Node.attributes into a clean key-value object */

export function getNodeAttributes(el: HTMLElement): Record<string, string> {
    const attributes: Record<string, string> = Object.create(null);

    for (let i = 0; i < el.attributes.length; i++) {
        attributes[el.attributes[i].nodeName] = el.attributes[i].nodeValue || "";
    }

    return attributes;
}