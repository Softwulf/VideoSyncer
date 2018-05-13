/*
 * renders html elements
 */
import jquery from 'jquery';
var $ = jquery;
import Observable from '../import/observable';
import autobind from 'auto-bind';
import browser from 'webextension-polyfill';

import { FrameCom } from '../import/communication';

export default class Renderer extends Observable {
    constructor(observing) {
        super('renderer', observing);

        this.insertId = 'videosyncer_content_div'; // ID of inserted status div
        this.playerClass = 'videosyncer_player';
        this.shadowRoot = null;

        this.frameCom = new FrameCom();

        autobind(this);

        if(window.top == window.self) {
            this.insertShadow();
        }

        this.video.on('found', this.markVideo);
        this.video.on('remove', this.unmarkVideo);

        this.frameCom.addTopFrameListener('VIDEO_FOUND', this.videoFound);

        this.frameCom.addTopFrameListener('VIDEO_GONE', this.videoGone);
    }

    videoFound() {
        $('#vsync_status', this.shadowRoot).addClass('found');
    }

    videoGone() {
        $('#vsync_status', this.shadowRoot).removeClass('found');
    }

    markVideo(data) {
        var player = data.player;
        player.classList.add(this.playerClass);
    }

    unmarkVideo() {
        var player = this.video.videoPlayer;
        if(player) {
            player.classList.remove(this.playerClass);
        }
    }

    insertShadow() {
        var shadowHost = jquery('body').prepend('<div id="vsync_container" />');
        if(jquery('#vsync_container')[0].attachShadow) {
            this.shadowRoot = jquery('#vsync_container')[0].attachShadow({mode: 'open'});
        } else {
            this.shadowRoot = jquery('#vsync_container').prepend('<div id="shadow-unsupported" />');
        }
        
        jquery(this.shadowRoot).prepend(`<style>@import url('${browser.extension.getURL('content_script/tracker.css')}')</style>`);
        $(this.shadowRoot).append('<div id="vsync_status"></div>');
    }

}