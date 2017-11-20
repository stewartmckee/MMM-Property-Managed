/* Magic Mirror
 * Node Helper: MMM-Property-Managed
 *
 * By Stewart McKee
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {
		if (notification === "mmm-property-managed-update_event") {
			// Send notification
			this.sendNotificationTest(payload); //Is possible send objects :)
		}
	},

	// Example function send notification test
	sendNotificationTest: function(payload) {
		this.sendSocketNotification("mmm-property-managed-update_event", payload);
	}

});
