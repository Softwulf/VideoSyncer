/*
 * Connects all the different components
 */
import Sync from './sync';
import VideoInterface from './video_interface';
import Publish from './publish';
import Renderer from './renderer';
import Events from './events';

// String the components together
VideoInterface.init(Sync);

Publish.init(Sync, VideoInterface);

Renderer.init(Sync, VideoInterface);

Events.init(Sync, VideoInterface);