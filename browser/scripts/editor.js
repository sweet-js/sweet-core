requirejs.config({
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});

require(["./sweet", "./syntax", "./rx.jquery.min", "./rx.dom.compat.min"], function(sweet, syn, Rx) {
    
    var storage_code = 'editor_code';
    var storage_mode = 'editor_mode';

    var starting_code = $("#editor").text();
    var compileWithSourcemap = $("body").attr("data-sourcemap") === "true";

    var editor = CodeMirror.fromTextArea($('#editor')[0], {
        lineNumbers: true,
        smartIndent: false,
        indentWithTabs: false,
        tabSize: 4,
        indentUnit: 4,
        autofocus: true,
        theme: 'solarized dark',
        showCursorWhenSelecting: true,
        extraKeys: {
            Tab: function(cm) {
                if(cm.somethingSelected()) {
                    return cm.indentSelection("add");
                } else if(cm.options.indentWithTabs) {
                    return cm.replaceSelection("\t", "end", "+input");
                } else {
                    return cm.execCommand("insertSoftTab");
                }
            },
            Left: function(cm) {
                return cm.setSelections(cm.listSelections().map(function(selection) {
                    selection = cm.somethingSelected() && ((
                        selection.anchor.ch <= selection.head.ch) && (
                        selection.anchor.line <= selection.head.line) &&
                        selection.anchor || selection.head) || nextCursorPos(-1, 0, cm, selection.anchor).cursor;
                    return { anchor: selection, head: selection };
                }));
            },
            Right: function(cm) {
                return cm.setSelections(cm.listSelections().map(function(selection) {
                    selection = cm.somethingSelected() && ((
                        selection.anchor.ch <= selection.head.ch) && (
                        selection.anchor.line <= selection.head.line) &&
                        selection.head || selection.anchor) || nextCursorPos(1, 0, cm, selection.anchor).cursor;
                    return { anchor: selection, head: selection };
                }));
            },
            Backspace: function(cm) {
                var selected = cm.somethingSelected(), coords;
                return cm.setSelections(cm.listSelections().map(function(selection) {
                    coords = selected ? {
                        left:   selection.anchor,
                        right:  selection.head,
                        cursor: ((
                            selection.anchor.ch <= selection.head.ch) && (
                            selection.anchor.line <= selection.head.line) &&
                            selection.anchor || selection.head)
                    } : nextCursorPos(-1, 1, cm, selection.anchor);
                    cm.replaceRange("", coords.left, coords.right, cm.getRange(coords.left, coords.right));
                    return { anchor: coords.cursor, head: coords.cursor };
                }));
            }
        }
    });

    var currentStep = 1;

    if (window.location.hash) {
        editor.setValue(decodeURI(window.location.hash.slice(1)));
    } else {
        editor.setValue(localStorage[storage_code] ? localStorage[storage_code] : starting_code);
    }
    if(localStorage[storage_mode]) {
        editor.setOption("keyMap", localStorage[storage_mode]);
    }

    var output = CodeMirror.fromTextArea($('#output')[0], {
        lineNumbers: true,
        theme: 'solarized dark',
        readOnly: true
    });
    
    $('#btn-vim').click(function() {
        editor.setOption('keyMap', 'vim');
        editor.focus();
        localStorage[storage_mode] = "vim";
    });
    $('#btn-emacs').click(function() {
        editor.setOption('keyMap', 'emacs');
        editor.focus();
        localStorage[storage_mode] = "emacs";
    });

    $('#btn-step').click(function() {
        var unparsedString = syn.prettyPrint(
            sweet.expand(editor.getValue(), 
                         undefined, 
                         currentStep++),
            $("#ck-hygiene").prop("checked"));
        $("#lab-step").text(currentStep);
        output.setValue(unparsedString); 
    });

    var updateTimeout;
    editor.on("change", function(e) {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(updateExpand, 200);
    });

    function updateExpand() {
        var code = editor.getValue();
        var expanded, compiled, res;
        window.location = "editor.html#" + encodeURI(code);
        localStorage[storage_code] = code;
        try {
            if (compileWithSourcemap) {
                res = sweet.compile(code, {
                    sourceMap: true,
                    filename: "test.js",
                    readableNames: true
                });
            } else {
                res = sweet.compile(code, {
                    sourceMap: false,
                    readableNames: true
                });
            }
            compiled = res.code;
            output.setValue(compiled);

            $('#errors').text('');
            $('#errors').hide();
        } catch (e) {
            $('#errors').text(e);
            $('#errors').show();
        }
    }

    updateExpand();
    
    var editBox = $("#edit-box");
    var outputBox = $("#output-box");
    var resizeGutter = $(output.getGutterElement()).css({
        "cursor": "ew-resize",
        "border-left": "3px rgba(0,0,0,0.5) solid"
    });
    var editorGutter = $(editor.getGutterElement());
    var resizeObs = $(window).resizeAsObservable().startWith(0).debounce(100);
    var downObs = resizeGutter.mousedownAsObservable();
    var moveObs = $(window).mousemoveAsObservable();
    var upObs   = $(window).mouseupAsObservable();
    
    // Start with the latest window width when the browser resizes.
    resizeObs.flatMapLatest(function(resizeEvent) {
        
        var windowWidth = $(window).width(),
            editorWidth = editBox.outerWidth(),
            leftGutterWidth  = editorGutter.outerWidth(),
            rightGutterWidth = resizeGutter.outerWidth();
        
        // project each mousedown event into a series of future mousemove events.
        return downObs.flatMap(function(downEvent) {
            editorWidth = editBox.outerWidth();
            leftGutterWidth  = editorGutter.outerWidth();
            rightGutterWidth = resizeGutter.outerWidth();
            
            // project each mousemove event into an editorWidth integer
            return moveObs.map(function(moveEvent) {
                return editorWidth + (moveEvent.pageX - downEvent.pageX);
            }).
            // stop listening to mousemoves when we receive a mouseup
            takeUntil(upObs);
        }).
        // don't update the DOM between browser repaints
        debounce(0, Rx.Scheduler.requestAnimationFrameScheduler).
        startWith(editorWidth).
        map(function(editorWidth) {
            return {
                editBoxWidth:   Math.max(Math.min(editorWidth, windowWidth - leftGutterWidth), leftGutterWidth),
                outputBoxLeft:  Math.max(Math.min(editorWidth, windowWidth - leftGutterWidth), leftGutterWidth),
                editBoxRight:   Math.min(Math.max(windowWidth - editorWidth, rightGutterWidth), windowWidth - rightGutterWidth),
                outputBoxWidth: Math.min(Math.max(windowWidth - editorWidth, rightGutterWidth), windowWidth - rightGutterWidth),
            };
        });
    }).
    forEach(function(coords) {
        editBox.css("right", coords.editBoxRight + "px");
        editor.setSize(coords.editBoxWidth, null);
        outputBox.css("left", coords.outputBoxLeft + "px");
        output.setSize(coords.outputBoxWidth, null);
    });

    function nextCursorPos(dir, tabStop, cm, position) {
        
        // 0 if dir == -1, else 1
        var rightOffset = Number(Boolean(~dir));
        // 0 if dir == !1, else -1
        var leftOffset = -1 * Number(Boolean(dir - 1));
        
        var line = position.line;
        var ch   = position.ch;
        var content = cm.getLine(line);
        
        var hBound = ~dir ? content.length - ch : ch;
        var vBound = rightOffset * (cm.lineCount() - 1);
        var unit = cm.options.indentUnit;
        var range, left, right, cursor;
        
        // Is there enough room to jump over a tab-width of spaces?
        if(hBound < unit) {
            // should we jump lines?
            if(hBound === 0) {
                // Are we on the top or bottom line?
                if(line === vBound) {
                    left = position;
                    right = position;
                    cursor = position;
                } else {
                    // jump to the next/previous line
                    content = cm.getLine(line + dir);
                    left  = {line: line + (rightOffset - 1), ch: (content.length * leftOffset * -1) + (ch * rightOffset)};
                    right = {line: line + rightOffset, ch: 0};
                    cursor = rightOffset && right || left;
                }
            } else {
                // jump one space left or right
                left = {line: line, ch: ch + leftOffset};
                right = {line: line, ch: ch + rightOffset};
                cursor = rightOffset && right || left;
            }
        } else {
            left   = {line: line, ch: ch + ((((ch % unit) || unit) * tabStop) * leftOffset )};
            right  = {line: line, ch: ch + ((((ch % unit) || unit) * tabStop) * rightOffset)};
            range  = cm.getRange(left, right);
            // is the range to the left/right up to a tab's width of spaces?
            if(!(range === " " || range == "  " || range === "   " || range === "    ")) {
                // no, only jump one space left/right
                left = {line: line, ch: ch + leftOffset};
                right = {line: line, ch: ch + rightOffset};
                cursor = rightOffset && right || left;
            } else {
                tabStop *= -1;
                left.ch  = ch + ((ch % unit) * tabStop) + (unit * leftOffset);
                right.ch = ch + ((ch % unit) * tabStop) + (unit * rightOffset);
                cursor = {line: line, ch: ch + (unit * dir)};
            }
        }
        return { left: left, right: right, cursor: cursor };
    }
});
