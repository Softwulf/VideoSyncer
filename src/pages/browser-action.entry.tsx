import * as React from 'react';
import * as ReactDOM from 'react-dom';

class BrowserAction extends React.Component {
    render() {
        return (
            <div style={{display: 'flex', flex: 1, flexDirection: 'column', flexWrap: 'nowrap', alignItems: 'stretch', justifyContent: 'center'}}>
                <div style={{backgroundColor: 'blue', flexBasis: 'content'}}>
                    <div style={{height: '30px'}}>
                        Header
                    </div>
                </div>
                <div style={{display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'yellow', overflow: 'auto', overflowX: 'hidden', zIndex: 999}}>
                    <div style={{display: 'flex', backgroundColor: 'red'}}>
                        Content
                    </div>
                </div>
                <div style={{backgroundColor: 'green', flexBasis: 'content'}}>
                    <div style={{height: '30px'}}>
                        VideoSyncer Footer
                    </div>
                </div>
            </div>
        )
    }
}

ReactDOM.render(
    <BrowserAction />,
    document.getElementById('root')
)