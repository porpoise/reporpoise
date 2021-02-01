import { watchful } from "../reactivity/watchful";
import { Model } from "../dom/Model";
import { getNodeAttributes } from "./getNodeAttributes";

export interface ITemplateData {
    item: string, 
    index: string, 
    list: string
}

export function renderList<T extends object>(model: Model<T>, template: HTMLTemplateElement, templateData: ITemplateData) {
    // Create the parent of nodes:
    const listContainer = document.createElement("div");
    template.parentNode?.insertBefore(listContainer, template);

    // Add all spec-compliant attributes:
    Object.entries(getNodeAttributes(template)).forEach(([key, value]) => {
        if (!key.startsWith("r-")) {
            listContainer.setAttribute(key, value);
        }
    });

    // Convert the model into a bunch of computed functions to use in the underlying models:
    const modelComputedCopy = Object.create(null);
    Object.keys(model.data).forEach(key => modelComputedCopy[key] = () => model.data[key as keyof T]);

    // Create clones:
    for (let i = 0; i < (model.data[templateData.list as keyof T] as any).length; i++) {
        const clone = (template.content.firstElementChild as Node).cloneNode(true) as HTMLElement;
        listContainer.appendChild(clone);

        // Use a watcher to autoupdate the
        watchful(() => {
            new Model({ 
                data: {
                    ...modelComputedCopy,
                    // Dynamic property, so that nested values update without full renders:
                    [templateData.item]: () => (model.data[templateData.list as keyof T] as any)[i],
                    [templateData.index]: i
                },

                methods: {}
            }).mount(clone);
        });
    }
}