import * as React from 'react';
import { Button, CircularProgress, colors } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';

interface VButtonprops extends ButtonProps {
    status?: 'default' | 'disabled' | 'loading'
}

export const VButton: React.SFC<VButtonprops> = (props: VButtonprops) => {
    const { status, children, style, ...restProps } = props;

    const buttonStatus = status ? status : 'default'

    const disabled = buttonStatus === 'disabled' || buttonStatus === 'loading';

    const newStyle: React.CSSProperties = {
        ...style,
        backgroundColor: disabled ? colors.grey[500] : (style ? style.backgroundColor : undefined),
        color: disabled ? colors.grey[200] : (style ? style.color : undefined)
    }

    return (
        <Button
            {...restProps}
            disabled={disabled}
            style={newStyle}
            >
            {buttonStatus === 'loading' && <CircularProgress size={20} style={{marginRight: '10px'}} />}
            {children}
        </Button>
    )
}