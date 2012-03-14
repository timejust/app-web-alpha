App.Views.TitleView = Backbone.View.extend({
  className: 'title',
  initialize: function() {
    this.el = this.options.el;
    this.title = "";
    this.location = "";
    this.time = { year: 0, month: 0, date: 0, hour: 0, minute: 0, second: 0 };
  },
  clear: function() {
    this.title = "";
    this.location = "";
    this.time = { year: 0, month: 0, date: 0, hour: 0, minute: 0, second: 0 };
  },
  render: function() {
    $(this.el).html(this.layout({
      title: this.title,
      location: this.location,
      startTime: this.time
      }));
  },
  layout: _.template('\
    <div class="title"><%= title %></div>\
    <div class="location"><% if (location != null) { %><%= location %><% } else { %> &nbsp; <% } %></div>\
    <div class="schedule">\
      <% if (startTime != null) { %>\
      <div class="event_date"></div>\
      <div><%= $.format.date(google.calendar.utils.toDate(startTime), App.config.dateOnly) %></div>\
      <div class="event_time"></div>\
      <div><% if (startTime.hour < 10) { %>0<% } %><%=startTime.hour%>:<%if(startTime.minute < 10){%>0<%}%><%= startTime.minute %></div>\
      <% } else { %> &nbsp; <% }%>\
    </div>\
  '),
});