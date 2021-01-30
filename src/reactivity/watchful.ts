let dependentHandler: Function | null = null;

export function getDependentHandler() {
    return dependentHandler;
}

export function watchful(handler: Function) {
    dependentHandler = handler;
    dependentHandler();
    dependentHandler = null;
}