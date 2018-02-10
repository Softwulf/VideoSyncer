/*
 * Connects all the different components
 */
import { SyncClient } from '../import/sync';
import VideoInterface from './video_interface';
import Renderer from './renderer';
import Events from './events';

var Client = new SyncClient();
var video = new VideoInterface([Client]);
var renderer = new Renderer([Client, video]);
var events = new Events([Client, video]);

Client.fetchProfile();