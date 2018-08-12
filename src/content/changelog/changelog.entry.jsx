import React from 'react';
import ReactDOM from 'react-dom';

import { browser } from 'webextension-polyfill-ts';
import changes from './changes';

import 'semantic-ui-css/semantic.min.css';
import { Container, Header, Item, List} from 'semantic-ui-react';

class Changelog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            changes: changes
        }
    }
    render() {
        const releases = changes.releases.map((release) => {
            const changeList = release.changes.map((text) => (
                <List.Item key={text} content={text} as='li' value='-' />
            ))
            return (
                <Item key={release.version}>
                    <Item.Content>
                        <Item.Header as='h2'>{release.version}</Item.Header>
                        <Item.Description>
                            <List as='ol'>
                                {changeList}
                            </List>
                        </Item.Description>
                    </Item.Content>
                </Item>
            )
        });
        return (
            <Container>
                <Header as='h1'>VideoSyncer updated to Version {browser.runtime.getManifest().version}</Header>
                <Item.Group divided>
                    {releases}
                </Item.Group>
            </Container>
        );
    }
}

ReactDOM.render(
    <Changelog />,
    document.getElementById('root')
)