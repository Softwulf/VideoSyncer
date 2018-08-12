import * as React from 'react';

export type LayoutProps = {
    header?: React.ReactNode
    children: React.ReactNode
    footer?: React.ReactNode
}

export const Layout: React.SFC<LayoutProps> = (props: LayoutProps) => (
    <div style={{display: 'flex', flex: 1, flexDirection: 'column', flexWrap: 'nowrap', alignItems: 'stretch', justifyContent: 'center'}}>
        {
            props.header && 
            <div style={{flexBasis: 'content'}}>
                {props.header}
            </div>
        }
        
        {
            props.children
        }

        {
            props.footer && 
            <div style={{flexBasis: 'content'}}>
                {props.footer}
            </div>
        }
    </div>
)