requirejs.config({
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});

require(["./sweet", "./syntax", "./parser", "./source-map", "./rx.jquery.min", "./rx.dom.compat.min"], function (sweet, syn, parser, srcmap, Rx) {

    var storage_code = 'editor_code';
    var storage_mode = 'editor_mode';

    var starting_code = $("#editor").text();
    var loaded_code, compile_start;

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
            Tab: function (cm) {
                if (cm.somethingSelected()) {
                    return cm.indentSelection("add");
                } else if (cm.options.indentWithTabs) {
                    return cm.replaceSelection("\t", "end", "+input");
                } else {
                    return cm.execCommand("insertSoftTab");
                }
            },
            Left: function (cm) {
                return cm.setSelections(cm.listSelections().map(function (selection) {
                    selection = cm.somethingSelected() && ((
                            selection.anchor.ch <= selection.head.ch) && (
                            selection.anchor.line <= selection.head.line) &&
                        selection.anchor || selection.head) || nextCursorPos(-1, 0, cm, selection.anchor).cursor;
                    return {
                        anchor: selection,
                        head: selection
                    };
                }));
            },
            Right: function (cm) {
                return cm.setSelections(cm.listSelections().map(function (selection) {
                    selection = cm.somethingSelected() && ((
                            selection.anchor.ch <= selection.head.ch) && (
                            selection.anchor.line <= selection.head.line) &&
                        selection.head || selection.anchor) || nextCursorPos(1, 0, cm, selection.anchor).cursor;
                    return {
                        anchor: selection,
                        head: selection
                    };
                }));
            },
            Backspace: function (cm) {
                var selected = cm.somethingSelected(),
                    coords;
                return cm.setSelections(cm.listSelections().map(function (selection) {
                    coords = selected ? {
                        left: selection.anchor,
                        right: selection.head,
                        cursor: ((
                                selection.anchor.ch <= selection.head.ch) && (
                                selection.anchor.line <= selection.head.line) &&
                            selection.anchor || selection.head)
                    } : nextCursorPos(-1, 1, cm, selection.anchor);
                    cm.replaceRange("", coords.left, coords.right, cm.getRange(coords.left, coords.right));
                    return {
                        anchor: coords.cursor,
                        head: coords.cursor
                    };
                }));
            }
        }
    });

    if (window.location.hash) {
        editor.setValue(loaded_code = decodeURI(window.location.hash.slice(1)));
    } else if (localStorage[storage_code]) {
        editor.setValue(loaded_code = localStorage[storage_code]);
    } else {
        editor.setValue(loaded_code = starting_code);
    }
    if (localStorage[storage_mode]) {
        editor.setOption("keyMap", localStorage[storage_mode]);
    }

    compile_start = loaded_code !== starting_code ?
        Rx.Observable.empty() :
        Rx.Observable.returnValue(true);

    var output = CodeMirror.fromTextArea($('#output')[0], {
        lineNumbers: true,
        theme: 'solarized dark',
        readOnly: true
    });

    var autoCompileCheckbox = $("#ck-auto-compile"),
        errorsBox = $("#error-box"),
        showLineButton = errorsBox.find("#show-error-line"),
        errorsText = errorsBox.find("#error-text");

    $('#btn-vim').click(function () {
        editor.setOption('keyMap', 'vim');
        editor.focus();
        localStorage[storage_mode] = "vim";
    });
    $('#btn-emacs').click(function () {
        editor.setOption('keyMap', 'emacs');
        editor.focus();
        localStorage[storage_mode] = "emacs";
    });
    $('#btn-default').click(function () {
        editor.setOption('keyMap', 'default');
        editor.focus();
        localStorage[storage_mode] = "default";
    });

    Rx.Observable.merge(
        $('#input-step-label').clickAsObservable().map(function () {
            return parseInt($('#input-step').val()) + 1 || 1;
        }),
        $('#input-step').changeAsObservable().map(function () {
            return parseInt($('#input-step').val()) || 1;
        })
    ).
    debounce(100).
    filter(function (val) {
        return val === val;
    }).
    map(function (currentStep) {
        currentStep = currentStep > 0 && currentStep || 1;
        var showIntermediates = Boolean($("#ck-readable-names").is(":checked")) == false;
        var unparsedStr = syn.prettyPrint(sweet.expand(
            editor.getValue(),
            undefined, {
                maxExpands: currentStep
            }
        ), showIntermediates);

        $('#input-step').val(currentStep);

        return unparsedStr;
    }).
    catchException(function (e) {
        return Rx.Observable.returnValue(e.stack || e.toString());
    }).
    repeat().
    subscribe(output.setValue.bind(output));

    var cursorActivityObs = Rx.Observable.create(function (observer) {
        function handler(e) {
            observer.onNext(e.doc.getCursor());
        }
        editor.on("cursorActivity", handler);
        return function () {
            editor.off("cursorActivity", handler);
        }
    }).debounce(100); // Ignore events that fire within 100ms of each other.
    var compileStartTime;
    var compileBuildTime = 1000;
    var compileSourceObs = autoCompileCheckbox.
    changeAsObservable().
    scan(false, Rx.helpers.not).
    map(function (selected, subscribed) {
        subscribed = true;
        return Rx.Observable.defer(function () {
            return !selected && subscribed ? Rx.Observable.never() : Rx.Observable.defer(function () {
                return subscribed ?
                    Rx.Observable.returnValue(subscribed = false) :
                    Rx.Observable.empty()
            }).concat(cursorActivityObs.
                // This is essentially delayWithSelector,
                // but rx.lite doesn't include that operator.
                flatMapLatest(function (e) {
                    return Rx.Observable.timer(compileBuildTime);
                })).
            merge($("#ck-readable-names").changeAsObservable()).
            merge($("#ck-highlighting").changeAsObservable());
        });
    }).
    publishValue(Rx.Observable.never());

    compileSourceObs.connect();

    compileSourceObs = compileSourceObs.
    switchLatest().
    merge(compile_start.delay(100)).
    merge($("#btn-compile").clickAsObservable()).
    map(function () {
        return {
            code: editor.getValue(),
            readableNames: $("#ck-readable-names").is(":checked"),
            highlighting: $("#ck-highlighting").is(":checked")
        };
    }).
    // After the user has stopped typing for a while,
    // try to compile the code in the editor. If the
    // compile step throws an exception, Rx will catch
    // it and forward it on for us.
    map(function (opts) {
        window.location = "editor.html#" + encodeURI(opts.code);
        localStorage[storage_code] = opts.code;
        compileStartTime = Date.now();
        return sweet.compile(opts.code, {
            sourceMap: opts.highlighting,
            filename: opts.highlighting && "test.js" || undefined,
            readableNames: opts.readableNames,
            log: opts.highlighting && [] || undefined
        });
    }).
    // Materialize the sequence, so errors are onNext'd instead
    // of invoking the observer's onError handler. Since Errors
    // are mapped to Completions, repeat() ensures the source
    // sequence is re-subscribed to when an error occurs.
    materialize().repeat().publish();

    compileSourceObs.
    dematerialize().
    ignoreElements().
    catchException(function (e) {
        return showLineButton.
        clickAsObservable().
        flatMap(Rx.Observable.returnValue(e)).
        takeUntil(compileSourceObs);
    }).
    repeat().
    subscribe(function highlightError(error) {
        error = {
            line: error.lineNumber - 1,
            ch: error.column
        };
        editor.scrollIntoView({
            from: error,
            to: error
        }, 100);
        editor.setCursor(error);
        editor.focus();
    });

    compileSourceObs.
    dematerialize().
    catchException(function (error) {
        errorsBox.css("height", "65px");
        editBox.css("top", "130px");
        errorsText.text(error);
        return Rx.Observable.empty();
    }).
    repeat().
    subscribe(function onSuccess(compiled) {
        output.setValue(compiled.code);
        errorsBox.css("height", "0px");
        editBox.css("top", "65px");
        compileBuildTime = Date.now() - compileStartTime;
    });

    /* Visualize macro expansions */
    compileSourceObs.
    dematerialize().
    catchException(function (error) {
        return Rx.Observable.empty();
    }).
    repeat().
    combineLatest(cursorActivityObs, function (compiled, cursor) {
        return {log: compiled.log, map: compiled.sourceMap, cursor: cursor};
    }).
    filter(function(logAndCursor) {
        return logAndCursor.log && $("#ck-highlighting").is(":checked");
    }).
    flatMap(function(logAndCursor) {
        // only show macro highlights if cursor on macro name
        var macro = _(logAndCursor.log).find(function(l) {
            var nameCol = l.name.range[0] - l.name.lineStart;
            return l.name.lineNumber == logAndCursor.cursor.line + 1
                && nameCol <= logAndCursor.cursor.ch
                && nameCol + l.name.value.length >= logAndCursor.cursor.ch;
        });
        if (macro === undefined) {
            return [{editor: editor, highlights: []},
                    {editor: output, highlights: []}];
        }
        var highlights = [macro.next, macro.name].
        concat(macro.matchedTokens).
        // convert to start/end line/column format
        map(function(token) {
            if (token.type === parser.Token.Delimiter) {
                return {
                    start: {
                        line: token.startLineNumber,
                        column: token.startRange[0] - token.startLineStart
                    },
                    end: {
                        line: token.endLineNumber,
                        column: token.endRange[1] - token.endLineStart
                    }
                };
            } else {
                return {
                    start: {
                        line: token.lineNumber,
                        column: token.range[0] - token.lineStart
                    },
                    end: {
                        line: token.lineNumber,
                        column: token.range[1] - token.lineStart
                    }
                };
            }
        });
        // range for the whole macro
        highlights[0] = {start: highlights[1].start, end: highlights[0].start};
        highlights[1].name = true;

        var smc = new sourceMap.SourceMapConsumer(logAndCursor.map);
        var to = [], prev;
        smc.eachMapping(function(m) {
            if (prev) {
                prev.end = {
                    line: m.generatedLine,
                    column: m.generatedColumn
                }
            }
            var fromMacro = _.any(highlights, function(h) {
                return (m.originalLine > h.start.line ||
                        (m.originalLine === h.start.line &&
                         m.originalColumn >= h.start.column)) &&
                       (m.originalLine < h.end.line ||
                        (m.originalLine === h.end.line &&
                         m.originalColumn < h.end.column));
            });
            if (fromMacro && !prev) {
                prev = {
                    start: {
                        line: m.generatedLine,
                        column: m.generatedColumn
                    },
                    end: {
                        line: m.generatedLine,
                        column: m.generatedColumn
                    }
                };
                to.push(prev);
            }
            if (!fromMacro) prev = undefined;
        });
        return [{editor: editor, highlights: _.rest(highlights)},
                {editor: output, highlights: to}];
    }).
    subscribe(function onSuccess(editorAndHighlights) {
        var editor = editorAndHighlights.editor;
        var highlights = editorAndHighlights.highlights.
        sort(function(a,b) {
            if (a.start.line < b.start.line) return -1;
            if (a.start.line > b.start.line) return 1;
            return a.start.column - b.start.column;
        });
        editor.removeOverlay("macro");
        if (highlights.length === 0) return;
        var line = 0, currentIdx = 0;
        editor.addOverlay({
            name: "macro",
            token: function(stream) {
                if (stream.sol()) line++;
                if (currentIdx >= highlights.length) { // no more highlights
                    stream.skipToEnd();
                    return null;
                }
                var current = highlights[currentIdx];
                if (current.start.line > line) { // no highlights on this line
                    stream.skipToEnd();
                    return null;
                }
                if (current.start.column > stream.pos) { // skip to highlight
                    stream.pos = current.start.column;
                    return null;
                }
                if (current.start.column < stream.pos) { // omit past highlight
                    currentIdx++;
                    return null;
                }
                // highlight current token
                if (current.end.line == line && stream.pos < current.end.column) {
                    stream.pos = current.end.column;
                    currentIdx++;
                } else if (current.end.line <= line) { // omit empty highlight
                    currentIdx++;
                } else { // multi-line token -> move to next line
                    current.start.column = 0;
                    stream.skipToEnd();
                }
                return current.name ? "macro-name" : "macro";
            },
            blankLine: function() { line++; }
        });
    });

    compileSourceObs.connect();

    var editBox = $("#edit-box");
    var outputBox = $("#output-box");
    var resizeGutter = $(output.getGutterElement()).css({
        "cursor": "ew-resize"
    });
    var editorGutter = $(editor.getGutterElement());
    var resizeObs = $(window).resizeAsObservable().startWith(0).debounce(100);
    var downObs = resizeGutter.mousedownAsObservable();
    var moveObs = $(window).mousemoveAsObservable();
    var upObs = $(window).mouseupAsObservable();

    // Start with the latest window width when the browser resizes.
    resizeObs.flatMapLatest(function (resizeEvent) {

        var windowWidth = $(window).width(),
            leftGutterWidth = editorGutter.outerWidth(),
            rightGutterWidth = resizeGutter.outerWidth();

        // project each mousedown event into a series of future mousemove events.
        return downObs.flatMap(function (downEvent) {
                var editorWidth = editBox.outerWidth();
                leftGutterWidth = editorGutter.outerWidth();
                rightGutterWidth = resizeGutter.outerWidth();

                // project each mousemove event into an editorWidth integer
                return moveObs.map(function (moveEvent) {
                        return editorWidth + (moveEvent.pageX - downEvent.pageX);
                    }).
                    // stop listening to mousemoves when we receive a mouseup
                takeUntil(upObs);
            }).
            // don't update the DOM between browser repaints
        debounce(0, Rx.Scheduler.requestAnimationFrameScheduler).
        startWith(editBox.outerWidth()).
        map(function (codeAreaWidth) {
            return {
                editBoxWidth: Math.max(Math.min(codeAreaWidth, windowWidth - leftGutterWidth), leftGutterWidth),
                outputBoxLeft: Math.max(Math.min(codeAreaWidth, windowWidth - leftGutterWidth), leftGutterWidth),
                editBoxRight: Math.min(Math.max(windowWidth - codeAreaWidth, rightGutterWidth), windowWidth - rightGutterWidth),
                outputBoxWidth: Math.min(Math.max(windowWidth - codeAreaWidth, rightGutterWidth), windowWidth - rightGutterWidth),
            };
        });
    }).
    forEach(function (coords) {
        errorsBox.css("right", coords.editBoxRight + "px");
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
        var ch = position.ch;
        var content = cm.getLine(line);

        var hBound = ~dir ? content.length - ch : ch;
        var vBound = rightOffset * (cm.lineCount() - 1);
        var unit = cm.options.indentUnit;
        var tabSpaces = Array(cm.options.tabSize + 1).join(" ");
        var range, left, right, cursor;

        // Is there enough room to jump over a tab-width of spaces?
        if (hBound < unit) {
            // should we jump lines?
            if (hBound === 0) {
                // Are we on the top or bottom line?
                if (line === vBound) {
                    left = position;
                    right = position;
                    cursor = position;
                } else {
                    // jump to the next/previous line
                    content = cm.getLine(line + dir);
                    left = {
                        line: line + (rightOffset - 1),
                        ch: (content.length * leftOffset * -1) + (ch * rightOffset)
                    };
                    right = {
                        line: line + rightOffset,
                        ch: 0
                    };
                    cursor = rightOffset && right || left;
                }
            } else {
                // jump one space left or right
                left = {
                    line: line,
                    ch: ch + leftOffset
                };
                right = {
                    line: line,
                    ch: ch + rightOffset
                };
                cursor = rightOffset && right || left;
            }
        } else {
            left = {
                line: line,
                ch: ch + ((((ch % unit) || unit) * tabStop) * leftOffset)
            };
            right = {
                line: line,
                ch: ch + ((((ch % unit) || unit) * tabStop) * rightOffset)
            };
            range = cm.getRange(left, right);
            // is the range to the left/right up to a tab's width of spaces?
            if (range !== tabSpaces) {
                // no, only jump one space left/right
                left = {
                    line: line,
                    ch: ch + leftOffset
                };
                right = {
                    line: line,
                    ch: ch + rightOffset
                };
                cursor = rightOffset && right || left;
            } else {
                tabStop *= -1;
                left.ch = ch + ((ch % unit) * tabStop) + (unit * leftOffset);
                right.ch = ch + ((ch % unit) * tabStop) + (unit * rightOffset);
                cursor = {
                    line: line,
                    ch: ch + (unit * dir)
                };
            }
        }
        return {
            left: left,
            right: right,
            cursor: cursor
        };
    }
});