import * as React from 'react';

import MaterialButton, { ButtonProps } from '@material-ui/core/Button';

export const Button: React.SFC<ButtonProps> = (props: ButtonProps) => (
    <MaterialButton {...props} style={{textTransform: 'none', ...props.style}} />
)