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
        
        <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', overflow: 'auto'}}>
            {
                props.children
            }
        </div>

        {
            props.footer && 
            <div style={{flexBasis: 'content'}}>
                {props.footer}
            </div>
        }
    </div>
)