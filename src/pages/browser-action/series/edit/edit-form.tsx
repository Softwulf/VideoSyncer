import * as React from 'react';

import { TextField, InputAdornment, Typography, colors, Button, Divider } from "@material-ui/core";
import { UrlPicker } from "../inputs/url";
import * as Yup from 'yup';
import { withFormik, FormikProps, Form } from 'formik';
import { VTextInput } from 'components/form/text-input';
import { VButton } from 'components/button';
import { MessageSender } from 'background/messages/message-sender';
import { toast, vswal } from 'vsync-swal';
import { shorten } from 'vutil';
import { HasDispatch, mapDispatch } from '../../../_redux';
import { connect } from 'react-redux';
import { replace } from 'connected-react-router';

interface FormValues {
    host: string
    pathbase: string
    name: string
    startTime: number
    endTime: number
}

interface OuterFormValues extends HasDispatch {
    series: VSync.Series
}

const SeriesEditFormBase: React.SFC<OuterFormValues & FormikProps<FormValues>> = (props) => {
    const {
        values,
        touched,
        errors,
        dirty,
        isSubmitting,
        handleChange,
        setFieldValue,
        handleBlur,
        handleSubmit,
        handleReset,
    } = props;

    return (
        <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'stretch', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch' }}>
                <VTextInput<FormValues>
                    formik={props}
                    fieldName='name'
                    label='Name'
                    id='name'
                    fullWidth
                />
                <VTextInput<FormValues>
                    formik={props}
                    fieldName='host'
                    label='Website'
                    id='website'
                    fullWidth
                />
                <VTextInput<FormValues>
                    formik={props}
                    fieldName='pathbase'
                    label='Path'
                    id='path'
                    fullWidth
                    startAdornment={<InputAdornment position='start'><Typography variant='caption'>{shorten(values.host, 20)}/</Typography></InputAdornment>}
                />
            </div>


            <div style={{ display: 'flex', alignItems: 'stretch', flexDirection: 'column', flexBasis: 'content' }}>
                <VButton
                    onClick={() => handleSubmit()}
                    variant='contained'
                    style={{
                        backgroundColor: colors.green[500],
                        color: '#FFF'
                    }}

                    status={props.isSubmitting ? 'loading' : (props.isValid ? 'default' : 'disabled')}
                    >
                    Save
                </VButton>
                <VButton
                    onClick={() => props.resetForm()}
                    style={{marginTop: '5px'}}
                >
                    Reset
                </VButton>
                <Divider style={{
                    marginTop: '10px',
                    marginBottom: '10px'
                }} />
                <VButton
                    variant='contained'
                    style={{
                        backgroundColor: colors.red[500],
                        color: '#FFF'
                    }}
                    status={props.isSubmitting ? 'loading' : 'default'}
                    onClick={async () => {
                        props.setSubmitting(true);
                        const { name } = props.values;
                        const key = props.series.key;

                        const result = await vswal({
                            title: 'Are you sure?',
                            html: `<b>${name}</b> will be gone forever`,
                            type: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Delete',
                            confirmButtonColor: colors.red[500]
                        });
                        if(result.value) {
                            try {
                                await MessageSender.requestSeriesDelete(key);

                                props.setSubmitting(false);
                                props.dispatch(replace('/'))

                                toast(
                                    'Deleted!',
                                    `<b>${name}</b> was deleted successfully`,
                                    'success'
                                )
                            } catch(err) {
                                vswal(
                                    'Error',
                                    `The following error occurred: <b>${JSON.stringify(err)}</b>`,
                                    'error'
                                )
                                props.setSubmitting(false);
                            }
                        }
                    }}
                    >
                    Delete
                </VButton>
            </div>
        </div>
    )
}

export const SeriesEditForm = connect(null, mapDispatch)(withFormik<OuterFormValues, FormValues>({
    displayName: 'SeriesEditForm',
    mapPropsToValues: (props) => {
        return {
            host: props.series.host,
            name: props.series.name,
            pathbase: props.series.pathbase,
            endTime: props.series.endTime,
            startTime: props.series.startTime,
            key: props.series.key
        }
    },
    validationSchema: Yup.object().shape({
        host: Yup.string().ensure().required('You need to set a website').test('is-host', 'This must be a valid website (eg. watch.example.com)', value => {
            const host: string = value;
            const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/
            const domainRegex = /^[a-zA-Z0-9]+([-.][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/
            if(!host.match(ipRegex) && !host.match(domainRegex)) {
                return false;
            }
            return true;
        }),
        pathbase: Yup.string().ensure().required('You need to provide a path'),
        name: Yup.string().ensure().required('You need to provide a name').min(2, 'The name must atleast be 2 characters long').max(20, 'The name must have at most 20 characters'),
        startTime: Yup.number().default(0).positive('The video cannot start at a negative time').max(1000000000, 'The startime cannot exceed 1000000000 seconds'),
        endTime: Yup.number().default(0).positive('The video cannot end at a negative time').max(1000000000, 'The end time must not exceed 1000000000 seconds')
    }),

    handleSubmit: async (values, { setSubmitting, ...rest }) => {
        const { host, name, startTime, endTime, pathbase } = values;
        const key = rest.props.series.key;

        try {
            await MessageSender.requestSeriesEdit(key, {
                host: host,
                name: name,
                startTime: startTime,
                endTime: endTime,
                pathbase: pathbase
            });

            setSubmitting(false);

            rest.props.dispatch(replace('/'));

            toast(
                'Saved!',
                `<b>${name}</b> was saved successfully`,
                'success'
            )
        } catch(err) {
            vswal(
                'Error',
                `The following error occurred: <b>${JSON.stringify(err)}</b>`,
                'error'
            )
            setSubmitting(false);
        }
    },
})(SeriesEditFormBase));