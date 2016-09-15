/*global chrome*/
(function() {
    'use strict';
    onExtLoad(onLoad);

    function onExtLoad(onLoadFunc) {
        if (document.loaded) {
            onLoadFunc();
            return;
        }
        window.addEventListener('load', onLoadFunc, false);
    }

    function onLoad() {
        document.getElementById('diffs').addEventListener("DOMSubtreeModified", throttle(addTogglerIcon), false);
    }

    function addTogglerIcon() {
        var files = document.getElementsByClassName('filename-row');
        Array.prototype.forEach.call(files, function(fileEle) {
            var table = fileEle.parentNode.parentNode;
            if (Array.prototype.indexOf.call(table.classList, 'rb-extension-loaded') !== -1){
                return false;
            }
            addTogglerIconToRow(fileEle);
            table.className += ' rb-extension-loaded';
            hideBinaryFile(fileEle);
        });
    }

    function addTogglerIconToRow(fileEle) {
        var th = fileEle.children[0];
        for (var index = 0; index < th.children.length; index++) {
            var ele = th.children[index];
            if (Array.prototype.indexOf.call(ele.classList, 'rb-file-toggler-icon') !== -1){
                return false;
            }
        }
        if (th.children.length > 2){
            return false;
        }
        var toggler = document.createElement('a');
        toggler.className = "rb-icon rb-file-toggler-icon";
        toggler.href = '#';
        toggler.onclick = togglerFile;
        th.appendChild(toggler);
    }

    function togglerFile(event) {
        event.preventDefault();
        event.target.parentNode.parentNode.parentNode.parentNode.classList.toggle('rb-file-collapse');
        return false;
    }

    function hideBinaryFile(fileEle) {
        console.log(fileEle);
    }

    function throttle(fn, threshhold, scope) {
        threshhold = threshhold || 250;
        var last,
            deferTimer,
            running = false;
        return function() {
            if (running) {
                return;
            }
            running = true;
            var context = scope || this;
            var now = +new Date(),
                args = arguments;
            if (last && now < last + threshhold) {
                clearTimeout(deferTimer);
            }
            deferTimer = setTimeout(function() {
                last = now;
                fn.apply(context, args);
                running = false;
            }, threshhold);
        };
    }

    chrome.storage.onChanged.addListener(function(changes) {
        if(changes.rbt){
            console.log(changes.rbt.newValue);
        }
    });
})();
