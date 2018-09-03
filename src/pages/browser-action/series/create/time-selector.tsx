import * as React from 'react';
import { FormikProps } from 'formik';
import { VUrlPicker } from 'components/form/url-picker';
import { VTextInput } from 'components/form/text-input';
import { InputAdornment, Typography } from '@material-ui/core';
import { shorten } from 'vutil';
import { VDurationInput } from 'components/form/duration-input';

type TimeSelectorValues = {
    startTime: number
    endTime: number
}

export type TimeSelectorProps<FormValues extends TimeSelectorValues> = {
    formik: FormikProps<FormValues>
}

export class TimeSelector<FormValues extends TimeSelectorValues> extends React.Component<TimeSelectorProps<FormValues>> {
    render() {
        const props = this.props;

        return (
            <div style={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                <VDurationInput<FormValues>
                    formik={props.formik}
                    fieldName='startTime'
                    label='Start Time in seconds'
                    id='startTime'
                    fullWidth
                />
                <VDurationInput<FormValues>
                    formik={props.formik}
                    fieldName='endTime'
                    label='End Time in seconds (0=ignore)'
                    id='endTime'
                    fullWidth
                />
            </div>
        )
    }
}