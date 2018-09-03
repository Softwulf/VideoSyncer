import * as React from 'react';
import { FormikProps } from 'formik';
import { VUrlPicker } from 'components/form/url-picker';
import { VTextInput } from 'components/form/text-input';
import { InputAdornment, Typography } from '@material-ui/core';
import { shorten } from 'vutil';
import { VDurationInput } from 'components/form/duration-input';

type NameSelectorValues = {
    name: string
}

export type NameSelectorProps<FormValues extends NameSelectorValues> = {
    formik: FormikProps<FormValues>
}

export class NameSelector<FormValues extends NameSelectorValues> extends React.Component<NameSelectorProps<FormValues>> {
    render() {
        const props = this.props;

        return (
            <div style={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                <VTextInput<FormValues>
                    formik={props.formik}
                    fieldName='name'
                    label='Name'
                />
            </div>
        )
    }
}