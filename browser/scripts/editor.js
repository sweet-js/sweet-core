requirejs.config({
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});

require(["./sweet"], function(sweet) {
    var storage_code = 'editor_code';
    var storage_mode = 'editor_mode';

    var starting_code = $("#editor").text();
    var compileWithSourcemap = $("body").attr("data-sourcemap") === "true";

    var editor = CodeMirror.fromTextArea($('#editor')[0], {
        lineNumbers: true,
        smartIndent: false,
        indentWithTabs: true,
        tabSize: 2,
        autofocus: true,
        theme: 'solarized dark'
    });
    editor.setValue(localStorage[storage_code] ? localStorage[storage_code] : starting_code);
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

    var updateTimeout;
    editor.on("change", function(e) {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(updateExpand, 200);
    });

    function updateExpand() {
        var code = editor.getValue();
        var expanded, compiled, res;
        try {
            if (compileWithSourcemap) {
                res = sweet.compile(code, {
                    sourceMap: true,
                    filename: "test.js"
                });
            } else {
                res = sweet.compile(code, {
                    sourceMap: false
                });
            }
            compiled = res.code;
            output.setValue(compiled);
            localStorage[storage_code] = code;

            $('#errors').text('');
        } catch (e) {
            $('#errors').text(e);
        }
    }
    updateExpand();
});
