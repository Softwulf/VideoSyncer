import * as React from 'react';
import * as ReactDOM from 'react-dom';

import browser from 'webextension-polyfill';

import 'semantic-ui-css/semantic.min.css';
import { Container, Header } from 'semantic-ui-react';

class Tutorial extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Container>
                <Header as='h1'>VideoSyncer updated to Version {browser.runtime.getManifest().version}</Header>
            </Container>
        );
    }
}

ReactDOM.render(
    <Tutorial />,
    document.getElementById('root')
)