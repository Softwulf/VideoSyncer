import * as React from 'react';
import { auth } from '../firebase';

export type AuthConsumerProps = AuthProviderState;

export type AuthProviderProps = {
    component: React.ComponentClass<AuthConsumerProps> | React.SFC<AuthConsumerProps>
}

export type AuthProviderState = {
    loading: boolean
    user?: firebase.User
}

export class AuthProvider extends React.Component<AuthProviderProps, AuthProviderState> {
    constructor(props) {
        super(props);

        this.state = {
            loading: true
        }
    }

    componentDidMount() {
        auth.onAuthStateChanged(user => {
            this.setState({
                loading: false,
                user
            })
        });
    }

    render() {
        return <this.props.component {...this.props} loading={this.state.loading} user={this.state.user} />
    }
}