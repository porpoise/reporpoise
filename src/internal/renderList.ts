import { watchful } from "../reactivity/watchful";
import { EventHandlerT, Model } from "../dom/Model";
import { getNodeAttributes } from "./getNodeAttributes";
import { ReactiveList } from "../reactivity/list";

export interface ITemplateData {
    item: string, 
    index: string, 
    list: string
}

export function renderList<T extends object>(model: Model<T>, template: HTMLTemplateElement, templateData: ITemplateData) {
    // Create the parent of nodes:
    const listContainer = document.createElement("div");
    template.parentNode?.insertBefore(listContainer, template);

    let eventsAttribute: string | null = null;
    let uniqueTag:  string | null = null;

    // Add all spec-compliant attributes:
    Object.entries(getNodeAttributes(template)).forEach(([key, value]) => {
        if (!key.startsWith("r-")) {
            listContainer.setAttribute(key, value);
        }
        
        // Unique key prop:
        else if (key === "r-tag") {
            uniqueTag = value;
        }

        // Scoped events:
        else if (key === "r-events") {
            eventsAttribute = value;
            listContainer.removeAttribute(key);
        }
    });

    if (!uniqueTag) {
        throw new Error("List rendering requires a unique tag (r-tag) attribute to prevent ambiguous data bindings.");
    }

    // Convert the model into a bunch of computed functions to use in the underlying models:
    const modelComputedCopy = Object.create(null);
    Object.keys(model.data).forEach(key => modelComputedCopy[key] = () => model.data[key as keyof T]);

    const getMethodsFromModel = () => {
        if (!eventsAttribute) return {};

        const methods: Record<string, EventHandlerT<any>> = {};

        Object.entries(model.scopedEvents[eventsAttribute]).forEach(([ name, method ]) => {
            methods[name] = (data, e) => method(model.data, e, data);
        });

        return methods;
    }

    // Function to create list item:
    const renderIndex = (index: number) => {
        const clone = (template.content.firstElementChild as Node).cloneNode(true) as HTMLElement;
        listContainer.appendChild(clone);

        // Use a watcher to autoupdate the rendered content:
        watchful(() => {
            const internalModel = new Model({ 
                data: {
                    ...modelComputedCopy,
                    // Dynamic property, so that nested values update without full renders:
                    [templateData.item]: () => model.getValue(templateData.list)[index],
                    [templateData.index]: index
                },

                events: getMethodsFromModel()
            });

            internalModel.data._tag = internalModel.getValue(uniqueTag as string);

            //@ts-ignore
            window.XD = internalModel;

            internalModel.mount(clone);

            clone.dataset.rTag = internalModel.getValue(uniqueTag as string);
        });
    }

    // Create clones:
    for (let i = 0; i < model.getValue(templateData.list).length; i++) {
        renderIndex(i);
    }

    (model.getValue(templateData.list) as ReactiveList<any>).watchMethod((methodName, args) => {
        switch (methodName) {
            case "push":
                if (model.getValue(templateData.list).length !== listContainer.childNodes.length) {
                    renderIndex(model.getValue(templateData.list).length - 1);
                }
                break;

            case "pop":
                if (model.getValue(templateData.list).length !== listContainer.childNodes.length) {
                    listContainer.lastChild && listContainer.removeChild(listContainer.lastChild);
                }
                break;
            
            case "splice":
                break;
        }
    });
}