/*
 * Connects all the different components
 */
import Sync from './sync';
import VideoInterface from './video_interface';
import Publish from './publish';
import Renderer from './renderer';
import Events from './events';

var sync = new Sync(null);
var video = new VideoInterface([sync]);
var publish = new Publish([sync, video]);
var renderer = new Renderer([sync, video]);
var events = new Events([sync, video]);

sync.fetch();