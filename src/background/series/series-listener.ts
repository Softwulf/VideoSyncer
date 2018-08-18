import { firebase } from '../../firebase';
import { VSyncStorage } from '../storage';


export class SeriesListener {
    vStorage = new VSyncStorage();

    seriesRef?: firebase.database.Reference

    constructor() {
        this.vStorage.subscribe<'user'>('user', changes => {
            const user = changes.newValue;
            if(user) {
                this.subscribeToSeries(user);
            } else {
                this.clean();
            }
        });
    }

    subscribeToSeries(user?: VSync.User) {
        this.seriesRef = firebase.database().ref(`vsync/series/${user.uid}`);
        this.seriesRef.on('value', snap => {
            const seriesList = [];
            if(snap && snap.exists() && snap.hasChildren()) {
                snap.forEach(child => {
                    seriesList.push({
                        key: child.key,
                        ...child.val()
                    });
                });
            } else {
            }

            this.vStorage.set({
                series_list: seriesList
            });

            console.debug('FETCHED Series: ', seriesList);
        })
    }

    clean() {
        if(this.seriesRef) this.seriesRef.off();
        this.vStorage.set({
            series_list: []
        });
        
        console.debug('CLEANED Series');
    }
}