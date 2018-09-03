import * as React from 'react';
import { FormControl, InputLabel, Input, FormHelperText } from '@material-ui/core';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import { InputProps } from '@material-ui/core/Input';
import { VInputProps } from './types';

export class VTextInput<T> extends React.Component<VInputProps<InputProps, T>> {
    render() {
        const { formik, fieldName, ...restProps } = this.props;

        return (
            <FormControl error={formik.errors[fieldName] != null}>
                <InputLabel>{restProps.label}</InputLabel>
                <Input
                    value={formik.values[fieldName] as any}
                    onChange={event => formik.setFieldValue(fieldName, event.target.value)}
                    {...restProps}
                />
                <FormHelperText>{formik.errors[fieldName]}</FormHelperText>
            </FormControl>
        )
    }
}