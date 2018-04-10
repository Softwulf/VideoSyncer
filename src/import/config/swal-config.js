import swal from 'sweetalert2';
import weh from 'weh-content';

var exports = {};

exports.askForProfileRemoval = function(profile) {
    return new Promise((resolve, reject) => {
        swal({
            title: weh._('you_sure'),
            text: weh._('profile_removed_question_detail', profile.name),
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: weh._('yes'),
            cancelButtonText: weh._('no')
        }).then((result) => {
            if (result.value) {
                resolve();
            } else {
                reject();
            }
        });
    });
}

exports.editProfile = function(profile) {
    if(profile == undefined || profile == null) {
        profile = {
            name: '',
            urlPattern: ''
        };
    }
    return new Promise((resolve, reject) => {
        swal.setDefaults({
            input: 'text',
            confirmButtonText: weh._('next') + ' &rarr;',
            showCancelButton: true,
            progressSteps: ['1', '2', '3', '4']
        })

        var steps = [
            {
                title: weh._('name'),
                text: weh._('name_desc'),
                input: 'text',
                inputValue: profile.name,
                inputAttributes: {
                    'maxlength': 25
                },
                inputValidator: (value) => {
                    return new Promise((resolve) => {
                        if(value && value.length > 0) {
                            resolve();
                        } else {
                            resolve(weh._('error_profile_name_empty'));
                        }
                    });
                }
            },
            {
                title: weh._('url'),
                text: weh._('url_desc'),
                input: 'text',
                inputValue: profile.urlPattern,
                inputValidator: (value) => {
                    return new Promise((resolve) => {
                        if(value && value.length > 0) {
                            resolve();
                        } else {
                            resolve(weh._('error_profile_url_empty'));
                        }
                    });
                }
            },
            {
                title: weh._('starttime'),
                text: weh._('starttime_desc'),
                input: 'number',
                inputValue: profile.startTime
            },
            {
                title: weh._('endtime'),
                text: weh._('endtime_desc'),
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

                if(!profile.endTime || profile.endTime == '') {
                    profile.endTime = 0;
                }
                if(!profile.startTime || profile.startTime == '') {
                    profile.startTime = 0;
                }

                resolve(profile);
            } else {
                reject();
            }
        });
    });
}

exports.showProfileUrl = function(url) {
    return swal(url);
}

export default exports;