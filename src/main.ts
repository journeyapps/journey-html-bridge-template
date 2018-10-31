const JourneyIFrameClient = require('journey-iframe-client');
import './sass/main.scss';

const g = require('./vendor/dhtmlxgantt');

declare global {
    interface Window { gantt: any; }
}

const gantt = window.gantt;

const journeyIFrameClient = new JourneyIFrameClient();

console.log("This is journeyIFrameClient: ", journeyIFrameClient);

gantt.init("gantt_here");

ready();
document.getElementById('toggle_button').addEventListener("click", (e: Event) => { toggle_grid(); });
document.getElementById('nav_button').addEventListener("click", (e: Event) => { navigate(); });

journeyIFrameClient.on('toggle', toggle_grid);

async function ready() {
    let tasks = await journeyIFrameClient.post('ready');
    console.log('tasks', tasks);
    gantt.parse(tasks);
}

function navigate() {
    console.log('trigger linkToView');
    journeyIFrameClient.post('linkToView', 'foo')
}

var toggle = false;
function toggle_grid() {
    gantt.config.show_grid = toggle;
    toggle = !toggle;
    gantt.render()
    gantt.init("gantt_here");
}

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