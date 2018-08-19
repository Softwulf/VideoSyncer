declare const ___DEBUG___: boolean;

let debug: (message?: any, ...optionalParams: any[]) => void;

if(___DEBUG___) {
    debug = console.debug.bind(window.console);
} else {
    debug = (message?: any, ...optionalParams: any[]) => {}
}

export {
    debug
}