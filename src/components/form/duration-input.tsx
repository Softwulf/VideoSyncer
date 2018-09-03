import * as React from 'react';
import { FormControl, InputLabel, Input, FormHelperText, InputAdornment, Typography } from '@material-ui/core';
import { InputProps } from '@material-ui/core/Input';
import { VInputProps } from './types';
import { bind } from 'bind-decorator';
import { secondsToHms, shorten } from 'vutil';

export class VDurationInput<T> extends React.Component<VInputProps<InputProps, T>> {
    render() {
        const { formik, fieldName, ...restProps } = this.props;
        const value = formik.values[fieldName];

        return (
            <FormControl error={formik.errors[fieldName] != null}>
                <InputLabel>{restProps.label}</InputLabel>
                <Input
                    value={value as any}
                    onChange={event => formik.setFieldValue(fieldName, event.target.value)}
                    startAdornment={
                        <InputAdornment position='start'>
                            <Typography variant='caption'>
                                {shorten(secondsToHms(value as any, true), 10, 'end')}
                            </Typography>
                        </InputAdornment>
                    }
                    inputProps={{
                        type: 'number'
                    }}
                    
                    {...restProps}
                />
                <FormHelperText>{formik.errors[fieldName]}</FormHelperText>
            </FormControl>
        )
    }
}