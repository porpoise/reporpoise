import { watchful } from "../reactivity/watchful";
import { Model } from "../dom/Model";
import { list } from "src/reactivity/list";
import { getNodeAttributes } from "./getNodeAttributes";

export interface ITemplateData {
    item: string, 
    index: string, 
    list: string
}

export function renderList<T extends object>(model: Model<T>, template: HTMLTemplateElement, templateData: ITemplateData) {
    const listContainer = document.createElement("div");
    template.parentNode?.insertBefore(listContainer, template);

    Object.entries(getNodeAttributes(template)).forEach(([key, value]) => {
        if (!key.startsWith("r-")) {
            listContainer.setAttribute(key, value);
        }
    });

    // Convert the model into a bunch of computed functions to use in the underlyingModels:
    const modelComputedCopy = Object.create(null);
    Object.keys(model.data).forEach(key => modelComputedCopy[key] = () => model.data[key as keyof T]);


    (model.data[templateData.list as keyof T] as unknown as any[]).forEach((item, index) => watchful(() => {

        const underlyingModel = new Model({ 
            data: {
                ...modelComputedCopy,
                [templateData.item]: (model.data[templateData.list as keyof T] as any)[index], // use this over the item parameter for reactivity
                [templateData.index]: index
            },

            methods: {}
        });

        const clone = template.content.firstElementChild && template.content.firstElementChild.cloneNode(true);

        if (clone) {
            if (listContainer.childNodes[index]) {
                listContainer.replaceChild(clone, listContainer.childNodes[index]);
            }

            else {
                listContainer.appendChild(clone);
            }

            underlyingModel.mount(clone as HTMLElement);
        }
    }));
}