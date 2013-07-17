requirejs.config({
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});

require(["sweet","./parser", "./expander", "./escodegen"], function(sweet, parser, expander, escodegen) {
    var read = parser.read;
    var expand = expander.expand;
    var flatten = expander.flatten;

    var editor = CodeMirror.fromTextArea($('#editor')[0], {
        lineNumbers: true,
        smartIndent: false,
        tabSize: 2,
        autofocus: true,
        theme: 'solarized dark'
    });
    editor.setValue(localStorage['code'] ? localStorage['code'] : "");

    var output = CodeMirror.fromTextArea($('#output')[0], {
        lineNumbers: true,
        theme: 'solarized dark',
        readOnly: true
    });

    var updateTimeout;
    editor.on("change", function(e) {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(updateExpand, 200);
    });

    function updateExpand() {
        var code = editor.getValue();
        var expanded, compiled;
        try {
            expanded = expand(read(code));
            compiled = escodegen.generate(parser.parse(expanded));
            output.setValue(compiled);
            localStorage['code'] = code;

            $('#errors').text('');
        } catch (e) {
            $('#errors').text(e);
        }

        $('#syntax').empty();
        expanded.forEach(function(stx) {
            $newdiv = $("<div class='box-entry'>" + stx.toString() + "</div>");
            $('#syntax').append($newdiv);

            $newdiv.click(function(e) {
                updateContextBox(stx);
            });
        });
    }

    function mkContextString(ctx) {
        var div_string;
        if (typeof ctx.mark !== 'undefined') {
            div_string = "<div class='box-entry'>mark: " + ctx.mark + "</div>";
        } else if (typeof ctx.name !== 'undefined') {
            div_string = "<div class='box-entry'>rename: " + ctx.name + "</div>";
        } else if (typeof ctx.defctx !== 'undefined') {
            var sigma_map = ctx.defctx.map(function(def) {
                return def.id.token.value + " -> " + def.name;
            }).join(", ");
            div_string = "<div class='box-entry'>σ [" + sigma_map + "]</div>";
        } else {
            div_string = "<div class='box-entry'>unknown</div>";
        }
        return div_string;
    }

    function updateContextBox(stx) {
        var $box = $('#context');
        $box.empty();
        var stx_value = stx.token.value;
        var stx_resolve = expander.resolve(stx);
        $box.append("<div class='box-entry'>resolve(" + stx_value + ") = " + stx_resolve + "</div>");
        function appendCtx(ctx) {
            if(ctx === null) {
                return;
            }
            var $newdiv = $(mkContextString(ctx));
            $box.append($newdiv);
            $newdiv.click(function(e) {
                updateIdBox(ctx);
            });

            appendCtx(ctx.context);
        }
        appendCtx(stx.context);
    }

    function updateIdBox(ctx) {
        if(typeof ctx.id === 'undefined') {
            return;
        }
        var stx = ctx.id;
        var $box = $('#id-context');
        $box.empty();
        var stx_value = stx.token.value;
        var stx_resolve = expander.resolve(stx);
        $box.append("<div class='box-entry'>resolve(" + stx_value + ") = " + stx_resolve + "</div>");

        function appendCtx(ctx) {
            if(ctx === null) {
                return;
            }
            var $newdiv = $(mkContextString(ctx));
            $box.append($newdiv);
            appendCtx(ctx.context);
        }
        appendCtx(stx.context);
    }

    updateExpand();
});