"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStatus = exports.Event = void 0;
class Event {
}
exports.Event = Event;
var EventStatus;
(function (EventStatus) {
    EventStatus["DRAFT"] = "DRAFT";
    EventStatus["PUBLISHED"] = "PUBLISHED";
    EventStatus["SELLING"] = "SELLING";
    EventStatus["SOLD_OUT"] = "SOLD_OUT";
    EventStatus["CANCELLED"] = "CANCELLED";
    EventStatus["COMPLETED"] = "COMPLETED";
})(EventStatus || (exports.EventStatus = EventStatus = {}));
//# sourceMappingURL=Event.js.map