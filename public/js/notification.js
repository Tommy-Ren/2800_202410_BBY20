// Check if the browser supports notifications
if ("Notification" in window) {
    // Request permission from the user to show notifications
    Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
            function showNotification(message) {
                var notification = new Notification("Food Expiry Notification", {
                    body: message,
                    icon: "image/logo.png",
                });
                notification.onclick = function () {
                    window.open("https://www.freshstock.com"); // Replace with your app URL
                };
            }
            function checkExpiry() {

                var message = "The food in your fridge is nearly expiry!";
                showNotification(message);
            }
            checkExpiry();
            setInterval(checkExpiry, 24 * 60 * 60 * 1000); // Adjust the interval as per your requirement
        }
    });
}