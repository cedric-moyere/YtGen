const moment = require("moment");
const Holidays = require("date-holidays");
const hd = new Holidays("FR");
const daysOff = [0, 6];

const substractWorkingDays = (startDate, duration) => {
  const date = new moment(startDate, "YYYY-MM-DD");
  while (duration > 0) {
    let day = date.day();
    if (!hd.isHoliday(date) && !daysOff.includes(day)) {
      duration--;
    }
    date.add(1, "d");
  }
  return date;
};

exports.substractWorkingDays = substractWorkingDays;
