/*global chrome*/

import React from 'react';
import ReactDOM from 'react-dom';

import 'semantic-ui-css/semantic.min.css';

import './popup.css';

import { firebase } from '../../import/firebase-config';
import user from '../../import/user';
import LoggedIn from './logged-in';

import { Button, Loader, Container, Header, Icon } from 'semantic-ui-react';

class App extends React.Component {
    constructor(props) {
        super(props);

        var instance = this;

        this.state = {
            loading: false
        }

        firebase.auth().onAuthStateChanged(function (user) {
            instance.setState({ loading: false });
        });
    }

    login(interactive) {
        this.setState({ loading: true });
        user.login(true).then(() => {
            this.setState({ loading: false });
        }).catch((err) => {
            this.setState({ loading: false });
        });
    }

    render() {
        var content;

        if (firebase.auth().currentUser) {
            content = (
                <LoggedIn user={firebase.auth().currentUser} />
            );
        } else {
            content = (
                <div>
                    <Header as='h2'>
                        <Icon name='address card outline' />
                        <Header.Content>
                            Login
                            <Header.Subheader>
                                Please login to use VideoSyncer
                            </Header.Subheader>
                        </Header.Content>
                    </Header>
                    <Button loading={this.state.loading} onClick={() => { this.login(true) }} content='Login' color='google plus' icon='google plus' labelPosition='left'>
                    </Button>
                </div>
            );
        }

        return (
            <div>
                <Container fluid className='page-container'>
                    {content}
                </Container>
                <Header className='page-header' content='VideoSyncer' />
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <App />,
    document.getElementById('root')
)