/*global chrome*/
(function() {
    'use strict';
    var DefaultExtensionSetting = {ShowBinary : false};
    var rbSettings = {};

    function settingChanged(event) {
        var type = event.target.id;
        var setting = event.target.checked;
        rbSettings[type] = setting;
        chrome.storage.sync.set({ "ShowBinary": setting }, function() {
            syncSettings(rbSettings);
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        chrome.storage.sync.get(DefaultExtensionSetting, function(val) {
            rbSettings = val;
            document.getElementById('ShowBinary').checked = val.ShowBinary;
            syncSettings(rbSettings);
        });

        var selects = document.querySelectorAll('input');
        for (var i = 0; i < selects.length; i++) {
            selects[i].addEventListener('change', settingChanged);
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