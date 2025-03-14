import '@progress/kendo-ui/src/kendo.window.js';

function createWindow(options, element) {
    element = element || $("<div class='wnd' />").appendTo(Mocha.fixture);
    return element.kendoWindow(options).data("kendoWindow");
}

describe("Window WAI-ARIA with AXE", function() {
    afterEach(function() {
        Mocha.fixture
            .closest("body")
            .find(".k-window-content")
            .each(function(idx, element) {
                $(element)
                    .data("kendoWindow")
                    .destroy();
            });
        Mocha.fixture
            .closest("body")
            .find(".k-overlay")
            .remove();
    });

    it("Window is accessible", async function() {
        let wnd = createWindow(
            { title: "Test" },
            $("<div id='window' />")
        );

        await axeRun(wnd.element.parent());
    });

    it("Window with all tools is accessible", async function() {
        let wnd = createWindow(
            {
                title: "Test",
                actions: ["Close", "Refresh", "Minimize", "Maximize", "Pin"]
            },
            $("<div id='window' />")
        );

        await axeRun(wnd.element.parent());
    });

    it("modal Window is accessible", async function() {
        let wnd = createWindow(
            {
                title: "Test",
                modal: true
            },
            $("<div id='window' />")
        );

        await axeRun(wnd.element.parent());
    });
});

describe("initialization", function() {
    beforeEach(function() {
        let Window = kendo.ui.Window;
        $.mockjax({
            url: "echo",
            responseTime: 0,
            response: function(request) {
                this.contentType = "text/json";
                this.responseText = request.data;
            }
        });
        $.mockjax({
            url: /foo|telerik\.com/i,
            responseText: "foo bar baz"
        });
    });
    afterEach(function() {
        Mocha.fixture
            .closest("body")
            .find(".k-window-content")
            .each(function(idx, element) {
                $(element)
                    .data("kendoWindow")
                    .destroy();
            });
        Mocha.fixture
            .closest("body")
            .find(".k-overlay")
            .remove();
        $.mockjax.clear();
    });

    it("Window adds role to the element", function() {
        let wnd = createWindow(
            { title: "Test" },
            $("<div id='window' />")
        );

        assert.equal(wnd.wrapper.attr("role"), "dialog");
    });

    it("Window sets id to the title", function() {
        let wnd = createWindow(
            { title: "Test" },
            $("<div id='window' />")
        );

        assert.equal(
            wnd.wrapper.find("#window_wnd_title").html(),
            "Test"
        );
    });

    it("Window adds aria-labelledby", function() {
        let wnd = createWindow(
            { title: "Test" },
            $("<div id='window' />")
        );

        assert.equal(
            wnd.wrapper.attr("aria-labelledby"),
            "window_wnd_title"
        );
    });

    it("Window adds role button to the titlebar buttons", function() {
        let wnd = createWindow(
            { title: "Test", visible: true },
            $("<div id='window'>Content</div>")
        );
        assert.equal(
            wnd.wrapper.find(".k-window-titlebar-action").attr("role"),
            "button"
        );
    });

    it("Window adds aria-hidden='true' on resize handles", function() {
        let wnd = createWindow(
            { title: "Test", resizable: true },
            $("<div id='window' />")
        );

        let handles = wnd.wrapper.find(".k-resize-handle");

        assert.equal(handles.length, 8);

        handles.each(function(i, h) {
            assert.isOk(h.getAttribute("aria-hidden"), "true");
        });
    });
});
