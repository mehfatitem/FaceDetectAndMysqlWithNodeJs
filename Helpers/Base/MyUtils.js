class MyUtils {

  static monthsTr = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

  static  months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
  static constructor() {

  }

  static unixTimeToDateTimeString(unixTime) {
    const date = new Date(unixTime * 1000);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    const datetimeString = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    return datetimeString;
  }

  static unixTimeToDateTimeStringWithNames(unixTime) {
    const date = new Date(unixTime * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate()
    let first = MyUtils.convertDateToName(day , month , year);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    const datetimeString = `${first} ${hours}:${minutes}:${seconds}`;
    return datetimeString;
  }

  static convertMonthNumberToName(month) {
  return MyUtils.months[month - 1] || "";
  }

  static convertDayNumberToName(day) {
    return day;
  }

  static convertYearNumberToName(year) {
    return year.toString();
  }

  static convertDateToName(day, month, year) {
    const monthName = MyUtils.convertMonthNumberToName(month);
    const dayName = MyUtils.convertDayNumberToName(day);
    const yearName = MyUtils.convertYearNumberToName(year);
    return `${dayName} ${monthName} ${yearName}`;
  }

  static isUnixTimestamp(value) {
    const timestamp = Number(value);
    return !isNaN(timestamp) && timestamp >= 0 && new Date(timestamp * 1000).getTime() > 0 && value.toString().length >= 10;
  }

  static createHTMLTable(data) {
    let html = `<table id="face-detect-table" class="table table-striped table-bordered" cellspacing="0" style="width:90%;">`;
    html += '<thead><tr>';

    for (let key in data[0]) {
      html += '<th>' + key + '</th>';
    }

    html += '</tr></thead>';
    html += '<tbody>';

    for (let i = 0; i < data.length; i++) {
      html += '<tr>';

      for (let key in data[i]) {
        if (typeof data[i][key] === 'string') {
          if (data[i][key].startsWith('data:image')) {
            html += '<td align="center" style="vertical-align: middle !important;"><img src="' + data[i][key] + '"></td>';
          } else {
            html += '<td>' + data[i][key] + '</td>';
          }
        } else if (MyUtils.isUnixTimestamp(data[i][key])) {
          html += '<td>' + MyUtils.unixTimeToDateTimeStringWithNames(data[i][key]) + '</td>';
        } else {
          html += '<td>' + data[i][key] + '</td>';
        }
      }

      html += '</tr>';
    }

    html += '</tbody>';
    html += '</table>';

    return html;
  }
}

module.exports = MyUtils;