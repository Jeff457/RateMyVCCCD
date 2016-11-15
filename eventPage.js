/**
 * Created by Jeff on 11/2/2016.
 */
//displays icon in address bar when script is active
function showPageAction(tabId, changeInfo, tab) {
    if (tab.url == "https://ssb.vcccd.edu/prod/pw_pub_sched.p_listthislist") {
        chrome.pageAction.show(tabId);
    }
};
chrome.tabs.onUpdated.addListener(showPageAction);

//function to make xmlhttprequests
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        callback(xhr.responseText);
    };
    xhr.onerror = function() {
        callback();
    };

    xhr.open('GET', request.url, true);
    xhr.send();
    return true; // prevents the callback from being called too early on return
});
