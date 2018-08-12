import * as React from 'react';

export type ButtonProps = {
    onClick: () => any
    title: string
}

export const Button: React.SFC<ButtonProps> = (props: ButtonProps) => (
    <button onClick={props.onClick}>{props.title}</button>
)