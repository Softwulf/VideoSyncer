import * as React from 'react';

import { TextField, InputAdornment, Typography, colors, Button, Divider, Collapse, Dialog, DialogTitle, DialogContent, FormControlLabel, Checkbox } from "@material-ui/core";
import { LockRounded, LockOpenRounded } from '@material-ui/icons';
import { withFormik, FormikProps, Form } from 'formik';
import { VTextInput } from 'components/form/text-input';
import { VButton } from 'components/button';
import { MessageSender } from 'background/messages/message-sender';
import { toast, vswal } from 'vsync-swal';
import { shorten, SeriesValidationSchema } from 'vutil';
import { HasDispatch, mapDispatch } from '../../../_redux';
import { connect } from 'react-redux';
import { replace } from 'connected-react-router';
import { VDurationInput } from 'components/form/duration-input';
import { VUrlPicker } from 'components/form/url-picker';

interface FormValues {
    host: string
    pathbase: string
    protocol: string
    name: string
    startTime: number
    endTime: number
    autoplay: boolean
}

interface OuterFormValues extends HasDispatch {
    series: VSync.Series
}

type SeriesEditStateForm = {
    advancedSettingsOpen: boolean
}

class SeriesEditFormBase extends React.Component<OuterFormValues & FormikProps<FormValues>, SeriesEditStateForm> {
    
    constructor(props) {
        super(props);

        this.state = {
            advancedSettingsOpen: false
        }
    }

    render() {
        const props = this.props;
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
            <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'stretch', flexDirection: 'column'}}>
                <div style={{
                        flexGrow: 1,
                        overflowY: 'auto'
                    }}
                    className='has-scrollbars'
                >
                    <div style={{ display: 'flex', flexGrow: 1, flexShrink: 0, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch' }}>
                        <VTextInput<FormValues>
                            formik={props}
                            fieldName='name'
                            label='Name'
                            id='name'
                            fullWidth
                        />
                        <VUrlPicker<FormValues>
                            formik={props}
                            fieldName='host'
                            label='Websites'
                            id='website'
                            placeholder='Or enter one manually'
                            pickText='Pick a website'
                            dialogTitle='Choose Website'
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
                        <VDurationInput<FormValues>
                            formik={props}
                            fieldName='startTime'
                            label='Starting time (seconds)'
                            id='startTime'
                            fullWidth
                        />
                        <VDurationInput<FormValues>
                            formik={props}
                            fieldName='endTime'
                            label='Ending time (seconds)'
                            id='endTime'
                            fullWidth
                        />
                    </div>

                    <div style={{
                        flexGrow: 1,
                        flexShrink: 0
                    }}>
                        <Button
                            variant='text'
                            color='secondary'
                            onClick={() => {
                                this.setState({
                                    advancedSettingsOpen: !this.state.advancedSettingsOpen
                                })
                            }}
                            fullWidth
                            >
                            Advanced Settings
                        </Button>
                        <Collapse in={this.state.advancedSettingsOpen} /*onClose={() => this.setState({ advancedSettingsOpen: false })}*/>
                            <div
                                style={{
                                    display: 'flex',
                                    flexGrow: 1,
                                    flexShrink: 0,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'stretch'
                                }}
                                >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            icon={<LockOpenRounded style={{ color: colors.red[500] }} />}
                                            checkedIcon={<LockRounded style={{ color: colors.green[500] }} />}
                                            value='https'
                                            checked={this.props.values.protocol === 'https'}
                                            onChange={(event) => {
                                                const use = event.target.checked;
                                                this.props.setFieldValue('protocol', use ? 'https' : 'http');
                                            }}
                                            />
                                    }
                                    label={this.props.values.protocol === 'https' ? 'HTTPS enabled' : 'HTTPS disabled'}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            value='autoplay'
                                            checked={this.props.values.autoplay}
                                            onChange={(event) => {
                                                const use = event.target.checked;
                                                this.props.setFieldValue('autoplay', use);
                                            }}
                                        />
                                    }
                                    label={'Autoplay'}
                                />
                            </div>
                        </Collapse>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'stretch', flexDirection: 'column', flexBasis: 'content', flexShrink: 0 }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}>
                        <VButton
                            onClick={() => props.resetForm()}
                            variant='text'
                            style={{
                                flexGrow: 1,
                            }}
                        >
                            Reset
                        </VButton>
                        <VButton
                            onClick={() => handleSubmit()}
                            variant='contained'
                            style={{
                                backgroundColor: colors.green[500],
                                color: '#FFF',
                                flexGrow: 1
                            }}

                            status={props.isSubmitting ? 'loading' : (props.isValid ? 'default' : 'disabled')}
                            >
                            Save
                        </VButton>
                    </div>
                    <Divider style={{
                        marginBottom: '5px',
                        marginTop: '5px'
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
                            } else {
                                props.setSubmitting(false);
                            }
                        }}
                        >
                        Delete
                    </VButton>
                </div>
            </div>
        )
    }
}

export const SeriesEditForm = connect(null, mapDispatch)(withFormik<OuterFormValues, FormValues>({
    displayName: 'SeriesEditForm',
    mapPropsToValues: (props) => {
        return {
            name: props.series.name,
            host: props.series.host,
            pathbase: props.series.pathbase,
            protocol: props.series.protocol,
            endTime: props.series.endTime,
            startTime: props.series.startTime,
            autoplay: props.series.autoplay,
            key: props.series.key
        }
    },
    validationSchema: SeriesValidationSchema,

    handleSubmit: async (values, { setSubmitting, ...rest }) => {
        const { host, name, startTime, endTime, pathbase, protocol, autoplay } = values;
        const key = rest.props.series.key;

        try {
            await MessageSender.requestSeriesEdit(key, {
                host: host,
                name: name,
                startTime: startTime,
                endTime: endTime,
                pathbase: pathbase,
                protocol: protocol as VSync.Protocol,
                autoplay: autoplay
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