(function(global, requirejs, require) {

var storage_code  = "editor_code",
    storage_mode  = "editor_mode",
    slice  = Array.prototype.slice,
    concat = Array.prototype.concat,
    push   = Array.prototype.push;

requirejs.config({
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});

require(["./sweet", "./source-map", 'underscore', "./rx.jquery.min", "text!./helpers.js", "./rx.dom.compat.min"], function (sweet,  srcmap, _, Rx, helpers) {

srcmap = srcmap || sourceMap;
/**
* Constructs an observable sequence that depends on a resource object, whose lifetime is tied to the resulting observable sequence's lifetime.
* @param {Function} resourceFactory Factory function to obtain a resource object.
* @param {Function} observableFactory Factory function to obtain an observable sequence that depends on the obtained resource.
* @returns {Observable} An observable sequence whose lifetime controls the lifetime of the dependent resource object.
*/
Rx.Observable.using = function (resourceFactory, observableFactory) {
    return Rx.Observable.create(function (observer) {
        var disposable = Rx.Disposable.empty, resource, source;
        try {
            resource = resourceFactory();
            resource && (disposable = resource);
            source = observableFactory(resource);
        } catch (exception) {
            return new Rx.CompositeDisposable(Rx.Observable.throw(exception).subscribe(observer), disposable);
        }
        return new Rx.CompositeDisposable(source.subscribe(observer), disposable);
    });
};

var documentReadyObs = $(window).readyAsObservable().take(1).publishLast(),
    windowResizeObs  = $(window).resizeAsObservable().startWith(true),

    initEditorObs = documentReadyObs
        .map(_.partial($, "#editor", undefined))
        .map(_.partial(initEditor, getEditorOptions))
        .map(initEditorKeyMap),

    initOutputObs = documentReadyObs
        .map(_.partial($, "#output", undefined))
        .map(_.partial(initEditor, getOutputOptions)),

    // Initialize both CodeMirror instances on document
    // ready, then select them into a list together.
    mirrors = initEditorObs.zip(initOutputObs, concat.bind([])).publish(),

    keyMapSelector = _.partial(selectKeyMapClicks, $('#btn-vim'), $('#btn-emacs'), $('#btn-default')),
    mirrorDragSelector = _.partial(selectMirrorDrags, $("#edit-box")),
    commitResizes = _.partial(commitMirrorResizes, $("#edit-box"), $("#error-box"), $("#output-box")),

    errorRecoverySelector = _.partial(
        recoverFromError,
        $("#edit-box"),
        $("#error-box"),
        $("#error-text"),
        $("#show-error-line")
    ),
    compileTypeSelector = _.partial(
        selectCompileType,
        $("#ck-auto-compile"),
        $("#ck-readable-names"),
        $("#ck-highlighting"),
        $("#input-step-label"),
        $("#input-step"),
        $("#btn-compile"),
        errorRecoverySelector
    ),
    commitOutput = _.partial(commitEditorOutput, $("#edit-box"), $("#error-box"));

// Select the keyMap button clicks into their
// keyMap values, then commit them in the editor.
mirrors
    .flatMapLatest(applyArgs(keyMapSelector))
    .subscribe(applyArgs(commitKeyMap));

mirrors
    .flatMapLatest(applyArgs(_.partial(selectEvalClicks, $("#btn-eval"))))
    .subscribe(safeEvalOutput);

mirrors
    // Combine the codeMirror instances with each window resize event.
    .combineLatest(windowResizeObs, concat.bind([]))
    // select each codeMirror/resize event pair into a mouse drag Observable.
    .flatMapLatest(applyArgs(mirrorDragSelector))
    // Set the size of the editor and output boxes to the latest drag result.
    .subscribe(applyArgs(commitResizes));

mirrors
    // Combine the event sources that can cause us to
    // compile the editor contents. When the user compiles,
    // handle errors internally so they don't surface later.
    // Forward on the compilation result.
    .flatMapLatest(applyArgs(compileTypeSelector))
    // When we successfully compile the source, forward
    // on the editor's "cursorActivity" events.
    .flatMapLatest(applyArgs(selectCursorPosition))
    // Write the results of the compilation into the output window
    .doAction(applyArgs(commitOutput))
    // If we compiled with macro highlighting, cross-
    // reference the cursor position with the matched
    // macro syntaxes and onNext tuples of [codeMirror, [highlight]]
    .flatMap(applyArgs(selectEditorHightlights))
    // Apply the highlights for each codeMirror instance
    // as CodeMirror overlays.
    .subscribe(applyArgs(commitHighlights));

// macrofication
var candidates = mirrors.flatMap(editorChange).
    combineLatest(ckMacrofy(), concat.bind([])).
    map(applyArgs(macroCandidates));

// highlight macro candidates
candidates.
    subscribe(applyArgs(commitHighlights));

// popup dialog on macro candidate
candidates.
    combineLatest(mirrors.flatMap(editorCursor), concat.bind([])).
    flatMap(applyArgs(selectMacroficationHighlight)).
    debounce(100).
    subscribe(applyArgs(popupMacrofication));

return mirrors.connect() && documentReadyObs.connect();

function applyArgs(f, x) {
    return function(a) {
        return f.apply(x, a);
    };
}

function selectKeyMapClicks(vim, emacs, defaultBtn, editor) {
    return Rx.Observable.empty()
        .merge(vim
            .clickAsObservable()
            .map(Rx.helpers.just("vim")))
        .merge(emacs
            .clickAsObservable()
            .map(Rx.helpers.just("emacs")))
        .merge(defaultBtn
            .clickAsObservable()
            .map(Rx.helpers.just("default")))
        .map(concat.bind([editor]));
}

function commitKeyMap(editor, keyMap) {
    localStorage[storage_mode] = keyMap;
    editor.setOption("keyMap", keyMap);
    editor.focus();
}

function selectEvalClicks(btnEval, editor, output) {
    return btnEval.clickAsObservable().map(output.getValue.bind(output, undefined));
}

function safeEvalOutput(code) {
    try {
        eval(code);
    } catch(e) {
        console.error(e && e.stack || e);
    }
}

function selectMirrorDrags(editBox, editor, output, resizeEvent) {

    var windowWidth = $(window).width(),
        editorGutter = $(editor.getGutterElement()),
        resizeGutter = $(output.getGutterElement()).css({ "cursor": "ew-resize" }),
        leftGutterWidth = editorGutter.outerWidth(),
        rightGutterWidth = resizeGutter.outerWidth(),
        downObs = resizeGutter.mousedownAsObservable(),
        moveObs = $(window).mousemoveAsObservable(),
        upObs = $(window).mouseupAsObservable();

    // project each mousedown event into a series of future mousemove events.
    return downObs.flatMap(function (downEvent) {
            var editorWidth = editBox.outerWidth();
            leftGutterWidth = editorGutter.outerWidth();
            rightGutterWidth = resizeGutter.outerWidth();

            // project each mousemove event into an editorWidth integer
            return moveObs.map(function (moveEvent) {
                    return editorWidth + (moveEvent.pageX - downEvent.pageX);
                })
                // stop listening to mousemoves when we receive a mouseup
                .takeUntil(upObs);
        })
        // don't update the DOM between browser repaints
        .debounce(0, Rx.Scheduler.requestAnimationFrameScheduler)
        .startWith(editBox.outerWidth())
        .map(function (codeAreaWidth) {
            return [editor, output, {
                editBoxWidth: Math.max(Math.min(codeAreaWidth, windowWidth - leftGutterWidth), leftGutterWidth),
                outputBoxLeft: Math.max(Math.min(codeAreaWidth, windowWidth - leftGutterWidth), leftGutterWidth),
                editBoxRight: Math.min(Math.max(windowWidth - codeAreaWidth, rightGutterWidth), windowWidth - rightGutterWidth),
                outputBoxWidth: Math.min(Math.max(windowWidth - codeAreaWidth, rightGutterWidth), windowWidth - rightGutterWidth),
            }];
        });
}

function commitMirrorResizes(editBox, errorsBox, outputBox, editor, output, coords) {
    editBox.css("right", coords.editBoxRight + "px");
    errorsBox.css("right", coords.editBoxRight + "px");
    outputBox.css("left", coords.outputBoxLeft + "px");
    editor.setSize(coords.editBoxWidth, null);
    output.setSize(coords.outputBoxWidth, null);
}

function initEditor(getOptions, $editor) {
    var options = getOptions($editor),
        initial = options.value,
        compile = options.initialCompile,
        editor  = CodeMirror.fromTextArea($editor[0], options);
    if(initial) { editor.setValue(initial); }
    if(compile) { editor.initialCompile = compile; }
    return editor;
}

function initEditorKeyMap(editor) {
    if(localStorage[storage_mode]) {
        editor.setOption("keyMap", localStorage[storage_mode]);
    }
    return editor;
}

function getEditorOptions($editor) {
    var starting_code, initial_code = $editor.text();
    if(window.location.hash) {
        starting_code = decodeURI(window.location.hash.slice(1));
    } else if(localStorage[storage_code]) {
        starting_code = localStorage[storage_code];
    } else {
        starting_code = initial_code;
    }
    return {
        initialCompile: starting_code === initial_code,
        lineNumbers: true,
        smartIndent: false,
        indentWithTabs: false,
        tabSize: 4,
        indentUnit: 4,
        autofocus: true,
        theme: 'solarized dark',
        showCursorWhenSelecting: true,
        value: starting_code,
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
    };

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
}

function getOutputOptions() {
    return {
        lineNumbers: true,
        theme: 'solarized dark',
        readOnly: true
    };
}

function selectCompileType(
        autoCompile, readableNames, highlight,
        stepLabel, stepper,
        compileMacrosBtn,
        errorRecoverySelector,
        editor, output
    ) {

    var compileButtonObs    = compileMacrosBtn
            .clickAsObservable()
            .doAction(stepper.val.bind(stepper, 0))
            .publish(),
        lastCompileType     = "full",
        initialCompile      = editor.initialCompile,
        compileChangeSubj   = new Rx.Subject(),
        compileChangeObs    = Rx.Observable.defer(function() {
            return autoCompile
                .changeAsObservable()
                // Select each change event into a Boolean that flips on each click.
                .scan(autoCompile.is(":checked"), Rx.helpers.not)
                .startWith(autoCompile.is(":checked"));
        })
        .multicast(compileChangeSubj).refCount(),

        namesChangeObs      = Rx.Observable.defer(function() {
            return readableNames
                .changeAsObservable()
                .scan(readableNames.is(":checked"), Rx.helpers.not)
                .startWith(readableNames.is(":checked"));
        }),

        reverseChangeObs      = Rx.Observable.defer(function() {
            return readableNames
                .changeAsObservable()
                .scan(readableNames.is(":checked"), Rx.helpers.not)
                .startWith(readableNames.is(":checked"));
        }),

        highlightChangeObs  = Rx.Observable.defer(function() {
            return highlight
                .changeAsObservable()
                .scan(highlight.is(":checked"), Rx.helpers.not)
                .doAction(function(checked) {
                    if(checked === true) {
                        autoCompile.prop("checked", checked);
                        compileChangeSubj.onNext(checked);
                    }
                })
                .startWith(highlight.is(":checked"));
        })
        .publish().refCount(),

        editorChangeObs   = Rx.Observable.defer(function() {

            var changeEventObs = Rx.Observable.fromEvent(editor, "change");

            if(initialCompile === true) {
                initialCompile = false;
                changeEventObs = changeEventObs
                    .pausable(compileChangeObs)
                    .debounce(750)
                    .startWith(0);
            } else {
                changeEventObs = changeEventObs
                    .debounce(750)
                    .startWith(0)
                    .pausable(compileChangeObs);

                if(!startWithInitialValue("full")) {
                    changeEventObs = changeEventObs.merge(highlightChangeObs);
                }
            }

            return changeEventObs.map(_.bind(editor.getCursor, editor));
        }),

        stepLabelClicks = Rx.Observable.defer(function() {

            var clickEventObs = stepLabel.clickAsObservable();

            if(startWithInitialValue("partial")) {
                clickEventObs = clickEventObs.startWith(0);
            }

            return clickEventObs.map(function(val) {
                return stepper.
                    val(val = Math.max(parseInt(stepper.val()) || 0, 0) + 1) &&
                    val || val;
            });
        }),

        stepperChanges = stepper
            .changeAsObservable()
            .map(function(val) {
                return (val = Math.max(parseInt(stepper.val()) || 0, 1)) &&
                    stepper.val(val) && val || val;
            }),

        compileFullBtnObs = compileButtonObs.map(getFullValues),

        compileFullEvents = namesChangeObs
            .combineLatest(
                highlightChangeObs,
                editorChangeObs,
                concat.bind([])
            )
            .merge(compileFullBtnObs)
            .doAction(saveCompileType("full"))
            .map(concat.bind([editor, output]))
            .map(applyArgs(compileFull)),

        compilePartialEvents = stepLabelClicks
            .merge(stepperChanges)
            .combineLatest(namesChangeObs, concat.bind([]))
            .doAction(saveCompileType("partial"))
            .map(concat.bind([editor, output]))
            .map(applyArgs(compilePartial));

    return Rx.Observable.using(
        function() { return compileButtonObs.connect(); },
        function() {
            return compileFullEvents
                .merge(compilePartialEvents)
                .switchLatest()
                .catchException(function(err) {
                    return Rx.Observable.throwException(err)
                        .startWith([editor, output, false, {}]);
                })
                .retryWhen(function(errors) {
                    return errors.flatMapLatest(function(error) {
                        return errorRecoverySelector(editor, stepLabel, stepper, compileButtonObs, error);
                    });
                });
        });

    function saveCompileType(type) {
        return function() {
            lastCompileType = type;
        };
    }

    function startWithInitialValue(type) {
        return lastCompileType === type && (
            autoCompile.is(":checked") || (
            initialCompile && !(initialCompile = false)));
    }

    function getFullValues() {
        return [
            readableNames.is(":checked"),
            highlight.is(":checked"),
            editor.getCursor()
        ];
    }
}

function compileFull(editor, output, readableNames, highlight, cursor) {
    return Rx.Observable.create(function(observer) {

        var code = editor.getValue(), result;

        window.location = "editor.html#" + encodeURI(code);
        localStorage[storage_code] = code;

        observer.onNext([
            editor, output, highlight,
            sweet.compile(code, helpers)
          ]);
        observer.onCompleted();
    });
}

function compilePartial(editor, output, currentStep, readableNames) {
    return Rx.Observable.create(function(observer) {

        var code = editor.getValue(),
            unparsedStr = syn.prettyPrint(sweet.expand(
                code, undefined,
                { maxExpands: currentStep }
            ), !readableNames);

        observer.onNext([
            editor, output, false,
            { code: unparsedStr }
        ]);
        observer.onCompleted();
    });
}

function recoverFromError(
    editBox, errorsBox, errorsText, showErrorBtn,
    editor, stepLabel, stepper, compileMacrosObs,
    error) {

    errorsBox.css("height", "65px");
    editBox.css("top", "130px");
    errorsText.text(error);

    return showErrorBtn
        .clickAsObservable()
        .doAction(_.partial(highlightError, editor, error))
        .ignoreElements()
        .merge(compileMacrosObs)
        .merge(stepLabel.clickAsObservable())
        .merge(stepper.changeAsObservable())
        .merge(Rx.Observable.fromEvent(editor, "change"))
        .take(1);
}

function highlightError(editor, error) {
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
}

function selectCursorPosition(editor, output, highlight, result) {
    var obs = Rx.Observable.returnValue(undefined);
    if(highlight === true) {
        obs = Rx.Observable
            .fromEvent(editor, "cursorActivity")
            .startWith(0)
            .map(_.bind(editor.getCursor, editor));
    }
    return obs.map(concat.bind([editor, output, result]));
}

function commitEditorOutput(editBox, errorsBox, editor, output, result, cursor) {
    output.setValue(result.code || "");
    errorsBox.css("height", "0px");
    editBox.css("top", "65px");
    editor.focus();
}

function selectEditorHightlights(editor, output, result, cursor) {

    var logs      = result.log || [],
        sourcemap = result.sourceMap || "",
        macro     = _(logs).find(function(log) {
            var nameCol = log.name.range[0] - log.name.lineStart;
            return log.name.lineNumber == cursor.line + 1
                && nameCol <= cursor.ch
                && nameCol + log.name.value.length >= cursor.ch;
        });

    // only show macro highlights if cursor on macro name
    if (!sourcemap || !macro || !logs.length) {
        return [
            [editor, "macro", []],
            [output, "macro", []]
        ];
    }

    var consumer   = new srcmap.SourceMapConsumer(sourcemap),
        mappings   = [],
        outHighlights,
        srcHighlights = [
                tokenToHighlight(macro.next, true),
                tokenToHighlight(macro.name, false, true)
            ].concat(macro.matchedTokens.map(tokenToHighlight));

    consumer.eachMapping(function(mapping) { mappings.push(mapping); });

    outHighlights = mappings.reduce(reduceMappingsToOutHighlights, [undefined, []]).pop();

    return [
        [editor, "macro", slice.call(srcHighlights, 1)],
        [output, "macro", outHighlights]
    ];

    function reduceMappingsToOutHighlights(tuple, mapping) {

        var prev = tuple[0], list = tuple[1], macro;

        if(!!prev) {
            prev.end = {
                line: mapping.generatedLine,
                column: mapping.generatedColumn
            };
        }

        macro = _.any(srcHighlights, function(x) {
            return (
                mapping.originalLine > x.start.line || (
                    mapping.originalLine === x.start.line &&
                    mapping.originalColumn >= x.start.column)) && (
                mapping.originalLine < x.end.line || (
                    mapping.originalLine === x.end.line &&
                    mapping.originalColumn < x.end.column));
        });

        if(!macro) {
            prev = undefined;
        } else if(!prev) {
            list.push(prev = {
                start: {
                    line: mapping.generatedLine,
                    column: mapping.generatedColumn
                },
                end: {
                    line: mapping.generatedLine,
                    column: mapping.generatedColumn
                }
            });
        }

        tuple[0] = prev;
        tuple[1] = list;

        return tuple;
    }
}

function commitHighlights(editor, name, highlights) {
    editor.removeOverlay(name);
    if (highlights.length === 0) return;
    highlights.sort(function(a, b) {
        if (a.start.line < b.start.line) return -1;
        if (a.start.line > b.start.line) return 1;
        return a.start.column - b.start.column;
    });
    var line = 0, currentIdx = 0;
    editor.addOverlay({
        name: name,
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
            return current.name ? name + "-name" : name;
        },
        blankLine: function() { line++; }
    });
}

function editorChange(editors) {
    return Rx.Observable.fromEvent(editors[0], "change").
        debounce(750).
        startWith(0).
        map(function() { return editors[0]; });
}

function editorCursor(editors) {
    return Rx.Observable.fromEvent(editors[0], "cursorActivity").
        debounce(750).
        map(function() { return editors[0].doc.getCursor(); });
}

function macroCandidates(editor, macrofy) {
    var highlights = [];
    if (macrofy) {
        try {
            var highlights = reverse.findReverseMatches(editor.getValue()).
                map(function(match) {
                    var start = useOriginalLoc(match.matchedTokens[0].token);
                    var end = useOriginalLoc(_.last(match.matchedTokens).token);
                    return {
                        start: tokenToHighlight(start).start,
                        end: tokenToHighlight(end).end,
                        match: match
                    }
                });
        } catch(e) { }
    }
    return [editor, "candidate", highlights];

    function useOriginalLoc(token) {
        var props = ['lineStart', 'lineNumber', 'range', 'startLineStart',
            'startLineNumber', 'startRange', 'endLineStart',
            'endLineNumber', 'endRange'];
        var obj = _.clone(token);
        for (var i = 0; i < props.length; i++) {
            if (obj.hasOwnProperty('sm_' + props[i])) {
                obj[props[i]] = obj['sm_' + props[i]];
            }
        }
        return obj;
    }
}

function tokenToHighlight(token, isStart, isName) {
    var highlight = (token.type === parser.Token.Delimiter) ?
        {
            start: {
                line: token.startLineNumber,
                column: token.startRange[0] - token.startLineStart
            },
            end: {
                line: token.endLineNumber,
                column: token.endRange[1] - token.endLineStart
            }
        } :
        {
            start: {
                line: token.lineNumber,
                column: token.range[0] - token.lineStart
            },
            end: {
                line: token.lineNumber,
                column: token.range[1] - token.lineStart
            }
        };

    if(isStart === true) {
        highlight.end = highlight.start;
    }
    if(isName === true) {
        highlight.name = true;
    }
    return highlight;
}

function ckMacrofy() {
    var highlightMacrofy = $("#ck-macrofy");
    return highlightMacrofy
        .changeAsObservable()
        .scan(highlightMacrofy.is(":checked"), Rx.helpers.not)
        .startWith(highlightMacrofy.is(":checked"))
}

function selectMacroficationHighlight(editor, name, highlights, cursor) {
    $('.replace').hide('fast', function() { $(this).remove(); });
    return highlights.
        filter(function(highlight) {
            return  (highlight.start.line < cursor.line + 1 ||
                        (highlight.start.line === cursor.line + 1 &&
                        highlight.start.column < cursor.ch)) &&
                    (highlight.end.line > cursor.line + 1 ||
                        (highlight.end.line === cursor.line + 1 &&
                        highlight.end.column > cursor.ch)); }).
        map(function(highlight) {
            return [editor, highlight.match];
        });
}

function popupMacrofication(editor, highlight) {
    var coords = editor.cursorCoords();
    var options = {
        theme: 'solarized dark',
        readOnly: 'nocursor',
        lineNumbers: false,
        scrollbarStyle: 'null'
    };
    var srcView = $('<textarea class="CodeMirror cm-s-solarized cm-s-dark">' + highlight.replacement + '</textarea>');
    $('<div class="replace"></div>').
        css('left', coords.left).
        css('top', coords.top).
        css('display', 'none').
        append($('<span>Replace with macro?</span>')).
        append(srcView).
        click(function() {
            editor.removeOverlay('candidates');
            editor.setValue(highlight.replacedSrc);
            $(this).hide('fast', function() { $(this).remove(); });
        }).
        appendTo('#edit-box').
        show('fast');
    _.defer(function() { CodeMirror.fromTextArea(srcView[0], options) });
}

});
}(this, requirejs, require));
