import JourneyIFrameClient from '../node_modules/@journeyapps/journey-iframe-client/dist/bundle';
import './sass/main.scss';

const g = require('./vendor/dhtmlxgantt');

declare global {
    interface Window { gantt: any; }
}

const gantt = window.gantt;

const journeyIFrameClient = new JourneyIFrameClient();

console.log("This is journeyIFrameClient: ", journeyIFrameClient);

var gridTimelineLayout = {
    css: 'gantt_container',
    cols: [
        {
            // the default grid view
            view: "grid",
            scrollX: "scrollHor",
            scrollY: "scrollVer"
        },
        { resizer: true, width: 1 },
        {
            rows: [
                { view: 'timeline', scrollX: 'scrollHor', scrollY: 'scrollVer' },
                { view: 'scrollbar', id: 'scrollHor', group: 'horizontal' },
            ]
        },
        { view: 'scrollbar', id: 'scrollVer' }
    ]
};
var timelineOnlyLayout = {
    css: 'gantt_container',
    cols: [
        {
            width: 1,
            rows: [
                { view: 'grid', scrollX: 'gridScrollX', scrollY: 'scrollVer' },
                { view: 'scrollbar', id: 'gridScrollX', group: 'horizontal' },
            ]
        },
        {
            rows: [
                { view: 'timeline', scrollX: 'scrollHor', scrollY: 'scrollVer' },
                { view: 'scrollbar', id: 'scrollHor', group: 'horizontal' },
            ]
        },
        { view: 'scrollbar', id: 'scrollVer' }
    ]
};

gantt.config.layout = gridTimelineLayout;

gantt.init("gantt_here");

journeyIFrameClient.post('ready');
document.getElementById('toggle_button').addEventListener("click", (e: Event) => { toggler(); });

journeyIFrameClient.on('toggle', toggler);

var toggle_value = -1;

function toggler() {
    if (toggle_value == 1) {
        gantt.config.layout = gridTimelineLayout;
    }
    else {
        gantt.config.layout = timelineOnlyLayout;
    }
    toggle_value = toggle_value * (-1);
    gantt.init("gantt_here");
    gantt.render();
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