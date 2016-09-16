/*global chrome*/
(function() {
    'use strict';
    var DefaultExtensionSetting = {ShowBinary : false};
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
        document.getElementById('diffs').addEventListener('keypress', function(event) {
            console.log(event);
        });
    }

    function hasClass(ele, cls) {
        if (!ele || !cls) return false;
        return Array.prototype.indexOf.call(ele.classList, cls) !== -1;
    }

    function addClass(ele, cls) {
        if (!ele || !cls)
            return false;
        if (!hasClass(ele, cls)) {
            ele.classList.toggle(cls);
        }
        return true;
    }

    function removeClass(ele, cls) {
        if (!ele || !cls)
            return false;
        if (hasClass(ele, cls)) {
            ele.classList.toggle(cls);
        }
        return true;
    }

    function toggleClass(ele, cls, keepClass) {
        if (!ele || !cls)
            return false;
        if (keepClass === false) {
            removeClass(ele, cls);
        } else if (keepClass === true) {
            addClass(ele, cls);
        } else {
            ele.classList.toggle(cls);
        }
        return true;
    }

    function addTogglerIcon() {
        if (document.querySelectorAll('#diff_index .loading').length > 0) { //is loading diff detail
            return;
        }
        var diffParent = document.getElementById('diffs');
        if (hasClass(diffParent, 'rb-extension-loaded')) {
            return;
        }
        addClass(diffParent, 'rb-extension-loaded');

        var files = document.getElementsByClassName('filename-row');
        Array.prototype.forEach.call(files, function(fileEle) {
            var diffRow = findAncestor(fileEle, 'diff-container');
            var table = findAncestor(fileEle, 'sidebyside');
            addTogglerIconToRow(fileEle);
            if (hasClass(table, 'diff-binary'))
                addClass(diffRow, 'diff-binary-container');

            diffRow.addEventListener('mouseenter', function(event) {
                addClass(this, 'rb-diff-current');
            });
            diffRow.addEventListener('mouseleave', function(event) {
                removeClass(this, 'rb-diff-current');
            });
        });
        
        chrome.storage.sync.get(DefaultExtensionSetting, function(val) {
            toggleBinary(val.ShowBinary);
        });
    }

    function addTogglerIconToRow(fileEle) {
        var th = fileEle.children[0];
        for (var index = 0; index < th.children.length; index++) {
            var ele = th.children[index];
            if (hasClass(ele, 'rb-file-toggler-icon'))
                return false;
        }
        if (th.children.length > 2) {
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
        event.stopPropagation();
        var diffRow = findAncestor(event.target, 'diff-container');
        diffRow.classList.toggle('rb-file-collapse');

        var toggled = diffRow.classList.contains('rb-file-collapse');
        var highlight = (document.getElementsByClassName('diff-highlight') || [])[0];
        if (!highlight) {
            return false;
        }
        var curTop = diffRow.offsetTop + 1;
        if (highlight.offsetTop === curTop) {
            highlight.style.height = toggled ? '32px' : '63px';
        } else if (highlight.offsetTop > curTop) {
            highlight.style.top = '10000px';
        }

        return false;
    }

    function findAncestor(ele, cls) {
        while ((ele = ele.parentElement) && !ele.classList.contains(cls));
        return ele;
    }

    function throttle(fn, threshhold, scope) {
        threshhold = threshhold || 250;
        var last,
            deferTimer,
            running = false;
        return function() {
            var now = performance.now(),
                args = arguments;
            if (running) {
                return;
            }
            running = true;
            var context = scope || this;
            if (last && now < last + threshhold) {
                clearTimeout(deferTimer);
            }
            last = now;
            deferTimer = setTimeout(function() {
                fn.apply(context, args);
                running = false;
            }, threshhold);
        };
    }
    chrome.runtime.onConnect.addListener(function(port) {
        port.onMessage.addListener(function(msg) {
            console.log(msg);
        });
    });

    chrome.storage.onChanged.addListener(function(changes) {
        if (changes.ShowBinary) {
            changes.ShowBinary.newValue = changes.ShowBinary.newValue === undefined ? false : changes.ShowBinary.newValue;
            toggleBinary(changes.ShowBinary.newValue);
        }
    });
    function toggleBinary(showBinary){
        var binaries = document.querySelectorAll('.diff-container.diff-binary-container');
        var length = binaries ? binaries.length : 0;
        for (var index = 0; index < length; index++) {
            toggleClass(binaries[index], 'show', showBinary);
        }
    }
})();