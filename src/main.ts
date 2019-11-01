const JourneyIFrameClient = require("journey-iframe-client");
import "./sass/main.scss";

require("./vendor/dhtmlxscheduler/dhtmlxscheduler");

require("./vendor/dhtmlxscheduler/ext/dhtmlxscheduler_minical.js");
require("./vendor/dhtmlxscheduler/ext/dhtmlxscheduler_timeline.js");
require("./vendor/dhtmlxscheduler/ext/dhtmlxscheduler_limit.js");
require("./vendor/dhtmlxscheduler/ext/dhtmlxscheduler_tooltip.js");

require("./vendor/dhtmlxscheduler/ext/dhtmlxscheduler_editors.js");

require("./vendor/dhtmlxscheduler/ext/dhtmlxscheduler_collision.js");

const journeyIFrameClient = new JourneyIFrameClient();
declare global {
  interface Window {
    scheduler: any;
    dhtmlx: any;
    showRooms: any;
  }
}
let initialLoadingDone = false;
journeyIFrameClient.on("loadInitialEvents", function(events) {
  events.forEach(function(event) {
    window.scheduler.addEvent(event);
  });
  initialLoadingDone = true;
  console.log("Got initial events from app", events);
});

journeyIFrameClient.on("addEvent", function(event) {
  window.scheduler.addEvent(event);
});


journeyIFrameClient.on("changeRoomStatus", function() {
    // Currenltly hardcoded for demo to change Room 1's status:
    let allRooms = window.scheduler.serverList("rooms");
    allRooms[0].status = "2";
    window.scheduler.render();
  });

window.scheduler.skin = "material";
(window as any)._isIE = false;
window.showRooms = function showRooms(type) {
  var allRooms = window.scheduler.serverList("rooms");
  var visibleRooms;
  if (type == "all") {
    visibleRooms = allRooms.slice();
  } else {
    visibleRooms = allRooms.filter(function(room) {
      return room.type == type;
    });
  }

  window.scheduler.updateCollection("visibleRooms", visibleRooms);
};

window.scheduler.locale.labels.section_text = "Name";
window.scheduler.locale.labels.section_room = "Room";
window.scheduler.locale.labels.section_status = "Status";
window.scheduler.locale.labels.section_is_paid = "Paid";
window.scheduler.locale.labels.section_time = "Time";

window.scheduler.config.details_on_create = true;
window.scheduler.config.details_on_dblclick = true;

//===============
//Configuration
//===============

window.scheduler.serverList("roomTypes");
window.scheduler.serverList("roomStatuses");
window.scheduler.serverList("bookingStatuses");
window.scheduler.serverList("rooms");

window.scheduler.createTimelineView({
  name: "timeline",
  x_unit: "day",
  x_date: "%j",
  x_step: 1,
  x_size: 31,
  section_autoheight: false,
  y_unit: window.scheduler.serverList("visibleRooms"),
  y_property: "room",
  render: "bar",
  round_position: true,
  event_dy: "full",
  dy: 60,
  second_scale: {
    x_unit: "month",
    x_date: "%F, %Y"
  }
});

window.scheduler.attachEvent("onBeforeViewChange", function(
  old_mode,
  old_date,
  mode,
  date
) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var d = new Date(year, month, 0);
  var daysInMonth = d.getDate();
  var timeline = window.scheduler.getView("timeline");
  timeline.x_size = daysInMonth;
  return true;
});

window.scheduler.attachEvent("onEventChanged", function(id, event) {
  console.log("event has changed:", event);
  journeyIFrameClient.post('eventChanged', event);
});

window.scheduler.attachEvent("onEventAdded", function(id, event) {
    console.log("event has been added", event);
    if(initialLoadingDone) {
        journeyIFrameClient.post('eventAdded', event);
    }
});

window.scheduler.attachEvent("onEventDeleted", function(id, event) {
    console.log("event has been deleted", event);
    if(initialLoadingDone) {
        journeyIFrameClient.post('eventDeleted', event);
    }
});

window.scheduler.date.timeline_start = window.scheduler.date.month_start;

window.scheduler.date.add_timeline = function(date, step) {
  if (step > 0) {
    step = 1;
  } else if (step < 0) {
    step = -1;
  }
  return window.scheduler.date.add(date, step, "month");
};

window.scheduler.addMarkedTimespan({
  days: [0, 6],
  zones: "fullday",
  css: "timeline_weekend"
});

window.scheduler.config.lightbox.sections = [
  { map_to: "text", name: "text", type: "textarea", height: 24 },
  {
    map_to: "room",
    name: "room",
    type: "select",
    options: window.scheduler.serverList("visibleRooms")
  },
  {
    map_to: "status",
    name: "status",
    type: "radio",
    options: window.scheduler.serverList("bookingStatuses")
  },
  {
    map_to: "is_paid",
    name: "is_paid",
    type: "checkbox",
    checked_value: true,
    unchecked_value: false
  },
  { map_to: "time", name: "time", type: "calendar_time" }
];

function show_minical() {
  if (window.scheduler.isCalendarVisible()) window.scheduler.destroyCalendar();
  else
    window.scheduler.renderCalendar({
      position: "dhx_minical_icon",
      date: window.scheduler.getState().date,
      navigation: true,
      handler: function(date, calendar) {
        window.scheduler.setCurrentView(date);
        window.scheduler.destroyCalendar();
      }
    });
}

(window as any).show_minical = show_minical;
window.scheduler.attachEvent("onEventCreated", function(event_id) {
  var ev = window.scheduler.getEvent(event_id);
  ev.status = 1;
  ev.is_paid = false;
  ev.text = "new booking";
});

window.scheduler.attachEvent("onParse", function() {
  window.showRooms("all");

  var roomSelect = document.querySelector("#room_filter");
  var types = window.scheduler.serverList("roomTypes");
  var typeElements = ["<option value='all'>All</option>"];
  types.forEach(function(type) {
    typeElements.push(
      "<option value='" + type.key + "'>" + type.label + "</option>"
    );
  });
  roomSelect.innerHTML = typeElements.join("");
});

var headerHTML =
  "<div class='timeline_item_separator'></div>" +
  "<div class='timeline_item_cell'>Number</div>" +
  "<div class='timeline_item_separator'></div>" +
  "<div class='timeline_item_cell'>Type</div>" +
  "<div class='timeline_item_separator'></div>" +
  "<div class='timeline_item_cell room_status'>Status</div>";

window.scheduler.locale.labels.timeline_scale_header = headerHTML;

window.scheduler.attachEvent("onTemplatesReady", function() {
  function findInArray(array, key) {
    for (var i = 0; i < array.length; i++) {
      if (key == array[i].key) return array[i];
    }
    return null;
  }

  function getRoomType(key) {
    return findInArray(window.scheduler.serverList("roomTypes"), key).label;
  }

  function getRoomStatus(key) {
    return findInArray(window.scheduler.serverList("roomStatuses"), key);
  }

  function getRoom(key) {
    return findInArray(window.scheduler.serverList("rooms"), key);
  }

  window.scheduler.templates.timeline_scale_label = function(
    key,
    label,
    section
  ) {
    var roomStatus = getRoomStatus(section.status);
    return [
      "<div class='timeline_item_separator'></div>",
      "<div class='timeline_item_cell'>" + label + "</div>",
      "<div class='timeline_item_separator'></div>",
      "<div class='timeline_item_cell'>" + getRoomType(section.type) + "</div>",
      "<div class='timeline_item_separator'></div>",
      "<div class='timeline_item_cell room_status'>",
      "<span class='room_status_indicator room_status_indicator_" +
        section.status +
        "'></span>",
      "<span class='status-label'>" + roomStatus.label + "</span>",
      "</div>"
    ].join("");
  };

  window.scheduler.templates.event_class = function(start, end, event) {
    return "event_" + (event.status || "");
  };

  function getBookingStatus(key) {
    var bookingStatus = findInArray(
      window.scheduler.serverList("bookingStatuses"),
      key
    );
    return !bookingStatus ? "" : bookingStatus.label;
  }

  function getPaidStatus(isPaid) {
    return isPaid ? "paid" : "not paid";
  }

  var eventDateFormat = window.scheduler.date.date_to_str("%d %M %Y");
  window.scheduler.templates.event_bar_text = function(start, end, event) {
    var paidStatus = getPaidStatus(event.is_paid);
    var startDate = eventDateFormat(event.start_date);
    var endDate = eventDateFormat(event.end_date);
    return [
      event.text + "<br />",
      startDate + " - " + endDate,
      "<div class='booking_status booking-option'>" +
        getBookingStatus(event.status) +
        "</div>",
      "<div class='booking_paid booking-option'>" + paidStatus + "</div>"
    ].join("");
  };

  window.scheduler.templates.tooltip_text = function(start, end, event) {
    var room = getRoom(event.room) || { label: "" };

    var html = [];
    html.push("Booking: <b>" + event.text + "</b>");
    html.push("Room: <b>" + room.label + "</b>");
    html.push("Check-in: <b>" + eventDateFormat(start) + "</b>");
    html.push("Check-out: <b>" + eventDateFormat(end) + "</b>");
    html.push(
      getBookingStatus(event.status) + ", " + getPaidStatus(event.is_paid)
    );
    return html.join("<br>");
  };

  window.scheduler.templates.lightbox_header = function(start, end, ev) {
    var formatFunc = window.scheduler.date.date_to_str("%d.%m.%Y");
    return formatFunc(start) + " - " + formatFunc(end);
  };
});

window.scheduler.attachEvent("onEventCollision", function(ev, evs) {
  for (var i = 0; i < evs.length; i++) {
    if (ev.room != evs[i].room) continue;
    window.dhtmlx.message({
      type: "error",
      text: "This room is already booked for this date."
    });
  }
  return true;
});

window.scheduler.init("scheduler_here", new Date(2017, 2, 30), "timeline");
window.scheduler.parse(
  JSON.stringify({
    // Loading these from the app over the bridge instead:
    //   "data":[
    //       {"room":"1","start_date":"2017-03-02","end_date":"2017-03-23","text":"A-12","id":"1","status":"1","is_paid":"1"},
    //       {"room":"3","start_date":"2017-03-07","end_date":"2017-03-21","text":"A-45","id":"2","status":"2","is_paid":"1"},
    //       {"room":"5","start_date":"2017-03-06","end_date":"2017-03-14","text":"A-58","id":"3","status":"3","is_paid":"0"},
    //       {"room":"7","start_date":"2017-03-04","end_date":"2017-03-18","text":"A-28","id":"4","status":"4","is_paid":"0"}],
    collections: {
      roomTypes: [
        { value: "1", label: "1 bed" },
        { value: "2", label: "2 beds" },
        { value: "3", label: "3 beds" },
        { value: "4", label: "4 beds" }
      ],
      roomStatuses: [
        { value: "1", label: "Ready" },
        { value: "2", label: "Dirty" },
        { value: "3", label: "Clean up" }
      ],
      bookingStatuses: [
        { value: "1", label: "New" },
        { value: "2", label: "Confirmed" },
        { value: "3", label: "Arrived" },
        { value: "4", label: "Checked Out" }
      ],
      rooms: [
        { value: "1", label: "101", type: "1", status: "1" },
        { value: "2", label: "102", type: "1", status: "3" },
        { value: "3", label: "103", type: "1", status: "2" },
        { value: "4", label: "104", type: "1", status: "1" },
        { value: "5", label: "105", type: "2", status: "1" },
        { value: "6", label: "201", type: "2", status: "2" },
        { value: "7", label: "202", type: "2", status: "1" },
        { value: "8", label: "203", type: "3", status: "3" },
        { value: "9", label: "204", type: "3", status: "3" },
        { value: "10", label: "301", type: "4", status: "2" },
        { value: "11", label: "302", type: "4", status: "2" }
      ]
    }
  }),
  "json"
);
