import { BottomUpMessenger } from "../messaging/frame-messages";
import { bind } from "bind-decorator";
import { debug } from "vlogger";

import './selector.less';
import { ElementSelection } from "../messaging/selection";
import { browser } from "webextension-polyfill-ts";
import { TopDownMessageUnion } from "../messaging/top-messages";

export const SELECTOR_CLASSNAME = 'vsync_hover'

export class FrameSelector {
    messenger: BottomUpMessenger
    id: string

    searchingFor: ElementSelection | undefined

    constructor(id: string) {
        this.id = id;
        this.messenger = new BottomUpMessenger(id);

        this.listenForMessages();
        this.handleDisconnects();
    }

    @bind
    isInVsyncGui(element: HTMLElement): boolean {
        if(element.getAttribute('id') === 'vsync-content-react-root') {
            return true;
        }

        if(element.parentElement) {
            return this.isInVsyncGui(element.parentElement);
        } else {
            return false;
        }
    }

    @bind
    handleClick(event: MouseEvent) {
        const t = event.target as HTMLElement;
        if(this.isInVsyncGui(t)) return;

        t.classList.remove(SELECTOR_CLASSNAME);

        event.preventDefault();
        event.stopImmediatePropagation();

        let query = this.getQuery(t);

        if(this.searchingFor === 'videoPlayerHost') {
            const videoElement = document.querySelector('video');
            if(!videoElement) {
                window.alert('We could not find a video here');
                return;
            }
        }

        if(query) {
            debug('QUERY: ', query);
            debug('QUERY_SELECTOR: ', document.querySelector(query))
    
            this.messenger.selectionDone(this.searchingFor, query, window.location.host);
        }
    }

    @bind
    handleMouseOver(event: MouseEvent) {
        if(!this.searchingFor) return;

        const t = event.target as HTMLElement;
        
        if(t.nodeName !== 'IFRAME' && !this.isInVsyncGui(t)) {
            t.classList.add(SELECTOR_CLASSNAME);
        }
    }

    @bind
    handleMouseOut(event: MouseEvent) {
        const t = event.target as HTMLElement;
        t.classList.remove(SELECTOR_CLASSNAME);
    }

    @bind
    removeAllHovers() {
        const elements = document.getElementsByClassName(SELECTOR_CLASSNAME);
        if(elements && (elements as any).forEach) {
            (elements as any).forEach(element => {
                element.classList.remove(SELECTOR_CLASSNAME);
            })
        }
    }

    @bind
    setupEventListeners() {
        document.addEventListener('mouseover', this.handleMouseOver);
        document.addEventListener('mouseout', this.handleMouseOut);
        window.addEventListener('mouseleave', this.removeAllHovers);
        document.addEventListener('click', this.handleClick);
    }

    @bind
    removeEventListeners() {
        document.removeEventListener('click', this.handleClick);
        document.removeEventListener('mouseover', this.handleMouseOver);
        document.removeEventListener('mouseout', this.handleMouseOut);
        window.removeEventListener('mouseleave', this.removeAllHovers);
    }

    @bind
    listenForMessages() {
        browser.runtime.onMessage.addListener((message: TopDownMessageUnion, sender) => {
            if(message.type && message.type === '@@gateway') {
                if(message.subtype) {
                    switch(message.subtype) {
                        case '@@frame/REQUEST_SELECTION':
                            this.searchingFor = message.selection;
                            this.setupEventListeners();
                            break;
                        case '@@frame/STOP_SELECTION':
                            this.searchingFor = undefined;

                            this.removeEventListeners();
                            this.removeAllHovers();
                    }
                }
            }
        });
    }

    @bind
    handleDisconnects() {
        // Handle disconnect
        browser.runtime.connect().onDisconnect.addListener(p => {
            this.searchingFor = undefined;

            this.removeEventListeners();
            this.removeAllHovers();
        })
    }

    /*
     *  Function code by BenM @ https://stackoverflow.com/a/28997302
     */
    @bind
    getQuery(el: any) {
        function previousElementSibling(element) {
            if (element.previousElementSibling !== 'undefined') {
                return element.previousElementSibling;
            } else {
                // Loop through ignoring anything not an element
                while (element = element.previousSibling) {
                    if (element.nodeType === 1) {
                        return element;
                    }
                }
            }
        }
        function getPath(element) {
            // False on non-elements
            if (!(element instanceof HTMLElement)) { return false; }
            var path = [];
            while (element.nodeType === Node.ELEMENT_NODE) {
                var selector = element.nodeName;
                if (element.id) { selector += ('#' + element.id); }
                else {
                    // Walk backwards until there is no previous sibling
                    var sibling = element;
                    // Will hold nodeName to join for adjacent selection
                    var siblingSelectors = [];
                    while (sibling !== null && sibling.nodeType === Node.ELEMENT_NODE) {
                        siblingSelectors.unshift(sibling.nodeName);
                        sibling = previousElementSibling(sibling);
                    }
                    // :first-child does not apply to HTML
                    if (siblingSelectors[0] !== 'HTML') {
                        siblingSelectors[0] = siblingSelectors[0] + ':first-child';
                    }
                    selector = siblingSelectors.join(' + ');
                }
                path.unshift(selector);
                element = element.parentNode;
            }
            return path.join(' > ');
        }

        return getPath(el);
    }
}