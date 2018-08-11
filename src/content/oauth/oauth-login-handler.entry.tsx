import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as browser from 'webextension-polyfill-ts';

import 'semantic-ui-css/semantic.min.css';
import { Container, Header, Item, List} from 'semantic-ui-react';
import { Protocol } from '../../import/sync';
import { AuthCore } from '../../background/auth/auth-setup';

type LoginHandlerState = {
    type: 'success' | 'error' | 'pending'
    message: any
}

class LoginHandler extends React.Component<{}, LoginHandlerState> {
    constructor(props) {
        super(props);

        this.state = {
            type: 'pending',
            message: ''
        }
    }

    async componentDidMount() {
        try {
            await AuthCore.validate(window.location.href);
            this.setState({
                type: 'success',
                message: 'Successfully signed in'
            });
        } catch(err) {
            this.setState({
                type: 'error',
                message: err
            })
        }
    }

    render() {
        let title = 'Calculating...';
        if(this.state.type === 'error') title = 'Error!';
        if(this.state.type === 'success') title = 'Success!';

        return (
            <Container>
                <Header as='h1'>{title}</Header>
                {JSON.stringify(this.state.message)}
            </Container>
        );
    }
}

ReactDOM.render(
    <LoginHandler />,
    document.getElementById('root')
)