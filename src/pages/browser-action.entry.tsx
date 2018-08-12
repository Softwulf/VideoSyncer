import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Layout } from 'components/layout';
import { Button } from 'components/button';

class BrowserAction extends React.Component {
    render() {
        return (
            <Layout
                header={<div>Header</div>}
                footer={<div>Footer</div>}
            >
                <Button onClick={() => {}} title='Content' />
            </Layout>
        )
    }
}

ReactDOM.render(
    <BrowserAction />,
    document.getElementById('root')
)