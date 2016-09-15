var incognito;
var url;

function settingChanged(event) {
    var type = this.id;
    var setting = this.checked;
    console.log(type + ': ' + setting);
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var current = tabs[0];
        incognito = current.incognito;
        url = current.url;
        loadConfig();
    });

    var selects = document.querySelectorAll('input');
    for (var i = 0; i < selects.length; i++) {
        selects[i].addEventListener('change', settingChanged);
    }

    function loadConfig() {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                var data = JSON.parse(xhr.response);
                document.getElementById('HideBinary').checked = data.HideBinary;
            }
        };
        xhr.open("GET", chrome.extension.getURL('/config.json'), true);
        xhr.send();
    }
});