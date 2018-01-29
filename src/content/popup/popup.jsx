/*global chrome*/

import 'semantic-ui-css/semantic.min.css';
import './popup.css';

import React from 'react';
import ReactDOM from 'react-dom';

import weh from 'weh-content';

import { firebase } from '../../import/firebase-config';
import user from '../../import/user';
import LoggedIn from './logged-in';

import { Button, Loader, Container, Header, Icon, Segment } from 'semantic-ui-react';

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
                    <Header as='h2' className='loginHeader'>
                        <Icon name='address card outline' />
                        <Header.Content>
                            {weh._('login')}
                            <Header.Subheader>
                                {weh._('login_question')}
                            </Header.Subheader>
                        </Header.Content>
                    </Header>
                    <Button loading={this.state.loading} onClick={() => { this.login(true) }} content={weh._('login')} color='google plus' icon='google plus' labelPosition='left'>
                    </Button>
                </div>
            );
        }

        return (
            <div style={{ display:"flex", minHeight:"100vh", flexDirection:"column" }}>
                <div style={{flex:1}}>
                    <Container fluid className='page-container'>
                        {content}
                    </Container>
                </div>
                <Segment inverted>
                    <Header as='h4' color='teal' icon='refresh' content={weh._('app_name')} />
                </Segment>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <App />,
    document.getElementById('root')
)