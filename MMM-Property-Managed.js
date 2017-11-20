/* global Module */

/* Magic Mirror
 * Module: MMM-Property-Managed
 *
 * By Stewart McKee
 * MIT Licensed.
 */


Module.register("MMM-Property-Managed", {
	defaults: {
		updateInterval: 60000,
		retryDelay: 5000,
    useColor: true
	},

	// requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;
		//Flag for check if module is loaded
		this.loaded = false;
		// Schedule update timer.
		this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		var self = this;

		var urlApi = "https://www.property-managed.com/api/v1/buildings?token="+this.data.config.token;
		var retry = true;

		var dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);
		dataRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
					retry = false;
				} else {
					Log.error(self.name, "Could not load data.");
				}
				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataRequest.send();
	},


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

  parseActions: function(actionsData) {
    var actions = [];

    if (actionsData.certificates) {
      for(var i in actionsData.certificates) {
        var certificate = actionsData.certificates[i];
        actions.push({"name": this.titleize(certificate.certificate_type), "message": "Expired"});
      }
    }

    if (actionsData.landlord_inspections_due) {
      actions.push({"name": "Landlord Inspection", "message": "Inspection Due"});
    }

    if (actionsData.alarms) {
      for(var j in actionsData.alarms) {
        var alarm = actionsData.alarms[j];
        actions.push({"name": alarm.location + " Alarm", "message": "Needs Replacing"});
      }
    }
    if (actionsData.invoices) {
      actions.push({"name": "Invoices", "message": "Outstanding"});
    }

    if (actionsData.rent_payments) {
      actions.push({"name": "Rent Payment", "message": "Overdue"});
    }
    return actions;
  },

  emptyActions: function(actions) {
    var empty = true;
    for(var key in actions) {
      if (actions[key] === undefined || actions[key] === null){
      }
      else {
        if (key !== "invoices" && typeof(actions[key]) == "boolean") {
          if (actions[key]) {
            empty = false;
          }
        } else if (typeof(actions[key]) == "object") {
          if (actions[key].length > 0) {
            empty = false;
          }
        }
      }


    }
    return empty;
  },

  titleize: function(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1, str.length);
  },
  getDom: function() {

    var buildings = [];

    var loading = (this.dataNotification === undefined)
    var noBuildingsWithActions = true;

    for(var i in this.dataNotification) {
      var buildingData = this.dataNotification[i];
      delete buildingData.urgent_actions.invoices;
      delete buildingData.upcoming_actions.invoices;
      var data = {};
      data.name = buildingData.name;
      if (!this.emptyActions(buildingData.urgent_actions))
        data.urgentActions = this.parseActions(buildingData.urgent_actions);
      if (!this.emptyActions(buildingData.upcoming_actions))
        data.upcomingActions = this.parseActions(buildingData.upcoming_actions);

      if (data.urgentActions || data.upcomingActions) {
        data.hasActions = true;
        noBuildingsWithActions = false;
      } else {
        data.hasActions = false;
      }

      buildings.push(data);
    }


    var context = {
      buildings: buildings,
      noBuildingsWithActions: noBuildingsWithActions,
      loading: loading
    };

    if (this.config.useColor) {
      context.urgentClass = "red";
    } else {
      context.urgentClass = "bright";
    }

    var template = Handlebars.templates.propertyManagedMain;
    var parser = new DOMParser();
    return parser.parseFromString(template(context), "text/html").getElementById("mmm-property-managed");
  },
	getScripts: function() {
		return [
      "https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.10/handlebars.min.js",
      "propertyManagedMain.js"
    ];
	},

	getStyles: function () {
		return [
			"MMM-Property-Managed.css",
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},

	processData: function(data) {
		var self = this;
		this.dataRequest = data;
		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;
		// the data if load
		// send notification to helper
		this.sendSocketNotification("mmm-property-managed-update_event", data);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "mmm-property-managed-update_event") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}
	},
});
