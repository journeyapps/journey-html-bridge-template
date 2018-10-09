import JourneyIFrameClient from '../node_modules/@journeyapps/journey-iframe-client/dist/bundle';
import './sass/main.scss';

const g = require('./vendor/dhtmlxgantt');

declare global {
    interface Window { gantt: any; }
}

const gantt = window.gantt;

const journeyIFrameClient = new JourneyIFrameClient();

console.log("This is journeyIFrameClient: ", journeyIFrameClient);

console.log('gantt', g);

gantt.init("gantt_here");

journeyIFrameClient.on('loadTasks', (tasks) => {
    console.log('tasks', tasks);
    gantt.parse(tasks);
});

gantt.attachEvent("onAfterTaskAdd", function (id, item) {
    console.log('onAfterTaskAdd', 'item', item);
    journeyIFrameClient.post('addTask', item)
});


gantt.attachEvent("onAfterTaskDelete", function (id, item) {
    console.log('onAfterTaskDelete', 'item', item);
    journeyIFrameClient.post('deleteTask', item)
});

gantt.attachEvent("onAfterTaskUpdate", function (id, item) {
    console.log('onAfterTaskUpdate', 'item', item);
    journeyIFrameClient.post('updateTask', item);
});

gantt.attachEvent("onAfterLinkAdd", function (id, item) {
    console.log('onAfterLinkAdd', 'item', item);
    journeyIFrameClient.post('addLink', item);
});

gantt.attachEvent("onAfterLinkDelete", function (id, item) {
    console.log('onAfterLinkDelete', 'item', item);
    journeyIFrameClient.post('deleteLink', item)
});

gantt.attachEvent("onAfterLinkUpdate", function (id, item) {
    console.log('onAfterLinkUpdate', 'item', item);
    journeyIFrameClient.post('updateLink', item);
});