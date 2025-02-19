import '@progress/kendo-ui/src/kendo.resizable.js';

let Resizable = kendo.ui.Resizable,
    handle,
    div;

function setup(options) {
    return new Resizable(div, options);
}

function ev(options) {
    return new $.Event(options.type, options);
}

function dragEvent(x, y, handle) {
    return {
        x: { location: x, startLocation: x },
        y: { location: y, startLocation: y },
        currentTarget: handle
    };
}

describe("kendo.ui.Resizable", function() {
    beforeEach(function() {
        div = $("<div id='resizable'></div>").appendTo(Mocha.fixture)[0];
    });
    afterEach(function() {
        kendo.destroy(Mocha.fixture);
        div.remove();
    });

    it("draggable element should be the same as resizable element by default", function() {
        let resizable = setup({});

        assert.equal(resizable.draggable.element[0], resizable.element[0]);
    });

    it("draggable element should be the same as options.draggableElement", function() {
        let draggableElement = $("<div id='element'></div>").appendTo(Mocha.fixture)[0];
        let resizable = setup({
            draggableElement: draggableElement
        });

        assert.equal(resizable.draggable.element[0], draggableElement);
    });
});

describe("kendo.ui.Resizable", function() {
    beforeEach(function() {
        div = $("<div style='position:absolute;top:0;left:0'><b></b><span style='position:absolute'></div>").appendTo(Mocha.fixture);
        handle = div.find("span");
    });
    afterEach(function() {
        kendo.destroy(Mocha.fixture);
        div.remove();
    });

    it("start is raised when element is dragged", function() {
        let called,
            resizable = setup({
                handle: "span",
                start: function() {
                    called = true;
                }
            });
        handle.trigger(ev({ type: "mousedown", pageX: 0, pageY: 0 }));
        handle.trigger(ev({ type: "mousemove", pageX: 10, pageY: 0 }));
        assert.isOk(called);
    });

    it("resize is raised when element is dragged", function() {
        let called,
            resizable = setup({
                handle: "span",
                resize: function() {
                    called = true;
                }
            });
        handle.trigger(ev({ type: "mousedown", pageX: 0, pageY: 0 }));
        handle.trigger(ev({ type: "mousemove", pageX: 10, pageY: 0 }));
        handle.trigger(ev({ type: "mousemove", pageX: 11, pageY: 0 }));
        assert.isOk(called);
    });

    it("resize is raised only if the handle is dragged", function() {
        let called,
            resizable = setup({
                handle: "span",
                resize: function() {
                    called = true;
                }
            });
        handle = div.find("b");
        handle.trigger(ev({ type: "mousedown", pageX: 0, pageY: 0 }));
        handle.trigger(ev({ type: "mousemove", pageX: 10, pageY: 0 }));
        handle.trigger(ev({ type: "mousemove", pageX: 11, pageY: 0 }));
        assert.isOk(!called);
    });

    it("resize is raised if the vertical handle is dragged vertically", function() {
        let called,
            resizable = setup({
                orientation: "vertical",
                handle: "span",
                resize: function() {
                    called = true;
                }
            });
        handle.trigger(ev({ type: "mousedown", pageX: 1, pageY: 1 }));
        handle.trigger(ev({ type: "mousemove", pageX: 1, pageY: 10 }));
        handle.trigger(ev({ type: "mousemove", pageX: 1, pageY: 11 }));
        assert.isOk(called);
    });

    it("resizeend is raised when user release the mouse", function() {
        let called,
            resizable = setup({
                handle: "span",
                resizeend: function() {
                    called = true;
                }
            });
        handle.trigger(ev({ type: "mousedown", pageX: 1, pageY: 1 }));
        handle.trigger(ev({ type: "mousemove", pageX: 10, pageY: 1 }));
        handle.trigger(ev({ type: "mousemove", pageX: 11, pageY: 1 }));
        $(document.documentElement).trigger({ type: "mouseup" });
        assert.isOk(called);
    });

    it("hint is moved during horizontal dragging", function() {
        let resizable = setup({
            handle: "span",
            hint: $("<div class='hint'/>")
        });

        resizable._start(dragEvent(0, 0, handle));
        resizable._resize(dragEvent(10, 0, handle));

        assert.equal(parseInt(div.find(".hint").offset().left), 10);
    });

    it("hint is not moved during horizontal dragging with vertical orientation", function() {
        let resizable = setup({
            handle: "span",
            orientation: "vertical",
            hint: $("<div class='hint'/>")
        });

        resizable._start(dragEvent(0, 0, handle));
        resizable._resize(dragEvent(10, 10, handle));

        assert.isOk(!parseInt(div.find(".hint").offset().left));
    });

    it("hint is not moved during vertical dragging with horizontal orientation", function() {
        let resizable = setup({
            handle: "span",
            orientation: "horizontal",
            hint: $("<div class='hint'/>")
        });

        resizable._start(dragEvent(0, 0, handle));
        resizable._resize(dragEvent(0, 10, handle));

        assert.isOk(!parseInt(div.find(".hint").offset().top));
    });

    it("hint is moved during vertical dragging", function() {
        let resizable = setup({
            handle: "span",
            orientation: "vertical",
            hint: $("<div class='hint'/>")
        });

        resizable._start(dragEvent(0, 0, handle));
        resizable._resize(dragEvent(0, 10, handle));

        assert.equal(parseInt(div.find(".hint").offset().top), 10);
    });

    it("hint is removed", function() {
        let resizable = setup({
            handle: "span",
            hint: $("<div class='hint'/>")
        });

        resizable._start(dragEvent(0, 0, handle));
        resizable._resize(dragEvent(10, 0, handle));
        resizable._stop(dragEvent(10, 0, handle));

        assert.equal(div.find(".hint").length, 0);
    });

    it("hint is create if function", function() {
        let el,
            resizable = setup({
                handle: "span",
                hint: function(e) {
                    el = e;
                    return $("<div class='hint'/>");
                }
            });
        resizable._start(dragEvent(0, 0, handle));

        assert.isOk(resizable.hint);
        assert.isOk(el);
    });
    it("hint is not moved over the max value", function() {
        let resizable = setup({
            handle: "span",
            hint: $("<div class='hint'/>"),
            max: 30
        });
        resizable._start(dragEvent(0, 0, handle));
        resizable._resize(dragEvent(60, 0, handle));

        assert.equal(parseInt(div.find(".hint").offset().left), 30);
    });

    it("hint is not moved out of the min value", function() {
        let resizable = setup({
            handle: "span",
            hint: $("<div class='hint'/>"),
            min: 30
        });
        resizable._start(dragEvent(60, 0, handle));
        resizable._resize(dragEvent(20, 0, handle));

        assert.equal(parseInt(div.find(".hint").offset().left), 30);
    });

    it("hint is not moved out of the min value if min is function", function() {
        let el,
            resizable = setup({
                handle: "span",
                hint: $("<div class='hint'/>"),
                min: function(e) {
                    el = e;
                    return 30;
                }
            });
        resizable._start(dragEvent(60, 0, handle));
        resizable._resize(dragEvent(20, 0, handle));

        assert.equal(parseInt(div.find(".hint").offset().left), 30);
        assert.isOk(el);
    });

    it("hint is not moved out of the max value if max is function", function() {
        let el,
            resizable = setup({
                handle: "span",
                hint: $("<div class='hint'/>"),
                max: function(e) {
                    el = e;
                    return 30;
                }
            });
        resizable._start(dragEvent(0, 0, handle));
        resizable._resize(dragEvent(40, 0, handle));

        assert.equal(parseInt(div.find(".hint").offset().left), 30);
        assert.isOk(el);
    });

    it("hint invalid class is applied if outsize of the max value", function() {
        let el,
            resizable = setup({
                handle: "span",
                hint: $("<div class='hint'/>"),
                max: function(e) {
                    el = e;
                    return 30;
                },
                invalidClass: "foo"
            });
        resizable._start(dragEvent(0, 0, handle));
        resizable._resize(dragEvent(40, 0, handle));

        assert.isOk(div.find(".hint").hasClass("foo"));
    });

    it("kendo.resize does not trigger resize event", function() {
        let resizable = setup({
            resize: function() {
                assert.isOk(true);
            }
        });

        div.css({ width: 10 });

        kendo.resize(div);
    });
});
