import swal, { SweetAlertOptions } from 'sweetalert2';
import {browser} from 'webextension-polyfill-ts';

import withReactContent from 'sweetalert2-react-content';

const ReactSwal = withReactContent(swal);

const vSwal = {
    askForProfileRemoval: function (profile: vsync.Profile) {
        return new Promise((resolve, reject) => {
            swal({
                title: browser.i18n.getMessage('you_sure'),
                text: browser.i18n.getMessage('profile_removed_question_detail', profile.name),
                type: 'warning',
                showCancelButton: true,
                confirmButtonText: browser.i18n.getMessage('yes'),
                cancelButtonText: browser.i18n.getMessage('no')
            }).then((result) => {
                if (result.value) {
                    resolve();
                } else {
                    reject();
                }
            });
        });
    },

    editProfile: function (profile) {
        return new Promise((resolve, reject) => {
            browser.tabs.query({
                currentWindow: true,
                active: true
            }).then((tabs) => {
                var url = tabs[0].url;

                if (profile == undefined || profile == null) {
                    profile = {
                        name: '',
                        urlPattern: url
                    };
                }

                swal.setDefaults({
                    input: 'text',
                    confirmButtonText: browser.i18n.getMessage('next') + ' &rarr;',
                    showCancelButton: true,
                    progressSteps: ['1', '2', '3', '4']
                })

                const steps: SweetAlertOptions[] = [
                    {
                        title: browser.i18n.getMessage('name'),
                        text: browser.i18n.getMessage('name_desc'),
                        input: 'text',
                        inputValue: profile.name,
                        inputAttributes: {
                            maxlength: '25'
                        },
                        inputValidator: (value: string) => {
                            return new Promise((resolve) => {
                                if (value && value.length > 0) {
                                    resolve();
                                } else {
                                    resolve(browser.i18n.getMessage('error_profile_name_empty'));
                                }
                            });
                        }
                    },
                    {
                        title: browser.i18n.getMessage('url'),
                        text: browser.i18n.getMessage('url_desc'),
                        input: 'text',
                        inputValue: profile.urlPattern,
                        inputValidator: (value: string) => {
                            return new Promise((resolve) => {
                                if (value && value.length > 0) {
                                    resolve();
                                } else {
                                    resolve(browser.i18n.getMessage('error_profile_url_empty'));
                                }
                            });
                        }
                    },
                    {
                        title: browser.i18n.getMessage('starttime'),
                        text: browser.i18n.getMessage('starttime_desc'),
                        input: 'number',
                        inputValue: profile.startTime
                    },
                    {
                        title: browser.i18n.getMessage('endtime'),
                        text: browser.i18n.getMessage('endtime_desc'),
                        input: 'number',
                        inputValue: profile.endTime
                    }
                ]

                swal.queue(steps).then((result) => {
                    swal.resetDefaults()

                    if (result.value) {
                        profile.name = result.value[0];
                        profile.urlPattern = result.value[1];
                        profile.startTime = result.value[2];
                        profile.endTime = result.value[3];

                        if (!profile.endTime || profile.endTime == '') {
                            profile.endTime = 0;
                        }
                        if (!profile.startTime || profile.startTime == '') {
                            profile.startTime = 0;
                        }

                        resolve(profile);
                    } else {
                        reject();
                    }
                });
            }, (err) => {
                reject();
            });

        });
    },

    showProfileUrl: function (url) {
        return swal(url);
    }
}

export default vSwal;