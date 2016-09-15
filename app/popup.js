/*global chrome*/
(function() {
    'use strict';
    var rbSettings = {};

    function settingChanged(event) {
        var type = event.target.id;
        var setting = event.target.checked;
        rbSettings[type] = setting;
        chrome.storage.sync.set({ "rbt": rbSettings }, function() {
            syncSettings(rbSettings);
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        loadConfig();

        var selects = document.querySelectorAll('input');
        for (var i = 0; i < selects.length; i++) {
            selects[i].addEventListener('change', settingChanged);
        }

        function loadConfig() {
            chrome.storage.sync.get('rbt', function(val) {
                rbSettings = val.rbt;
                syncSettings(rbSettings);
            });
        }
    });

    function syncSettings(rbSettings) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            var port = chrome.tabs.connect(tabs[0].id);
            port.postMessage(rbSettings);
        });
    }
    /*
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (var key in changes) {
            if (changes.hasOwnProperty(key)) {
                var storageChange = changes[key];
                console.log('Storage key "%s" in namespace "%s" changed. ' +
                    'Old value was "%s", new value is "%s".',
                    key,
                    namespace,
                    storageChange.oldValue,
                    storageChange.newValue);
            }
        }
    });*/
})();
