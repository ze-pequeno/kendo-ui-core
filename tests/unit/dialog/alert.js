import '@progress/kendo-ui/src/kendo.dialog.js';
import { removeMocksIn, mockFunc, removeMock } from '../../helpers/unit/mock-utils.js';

describe("Alert dialog initialization", function() {
    afterEach(function() {
        Mocha.fixture.closest("body").find(".alert").each(function(idx, element) {
            let alertDialog = $(element).data("kendoAlert");
            removeMocksIn(kendo.ui.Alert.fn);
            removeMocksIn(alertDialog);
            alertDialog.destroy();
        });
        Mocha.fixture.closest("body").find(".k-overlay").remove();
    });

    function createAlert(options, element) {
        element = element || $("<div class='alert' />").appendTo(Mocha.fixture);
        return element.kendoAlert(options).data("kendoAlert");
    }

    it("creates default html structure", function() {
        let alertDialog = createAlert();
        let wrapper = alertDialog.wrapper;
        let wrapperChildren = wrapper.children();

        assert.isOk(wrapper.is(".k-dialog.k-window"));
        assert.isOk(wrapperChildren.eq(0).is(".k-window-titlebar"));
        assert.isOk(wrapperChildren.eq(1).is(".k-window-content"));
        assert.isOk(wrapperChildren.eq(2).is(".k-dialog-actions"));
        assert.isOk(wrapperChildren.eq(2).children().eq(0).is(".k-button"));
    });

    it("alert has wai-aria role='alertdialog'", function() {
        let alertDialog = createAlert();

        assert.equal(alertDialog.wrapper.attr("role"), "alertdialog");
    });

    it("title is window.location.host", function() {
        let alertDialog = createAlert();
        let host = window.location.host;

        assert.equal(alertDialog.options.title, host);
        assert.equal(alertDialog.title(), host);
    });

    it("closable is false", function() {
        let alertDialog = createAlert();
        assert.equal(alertDialog.options.closable, false);
    });

    it("created one default OK action", function() {
        let alertDialog = createAlert();
        assert.equal(alertDialog.options.actions.length, 1);
        assert.equal(alertDialog.options.actions[0].aciotn, undefined);
    });

    it("close should call destroy", function() {
        mockFunc(kendo.ui.Alert.fn, "destroy", function() { assert.isOk(true); });
        let alertDialog = createAlert();
        alertDialog.open();
        alertDialog.close();
        removeMock(kendo.ui.Alert.fn, "destroy");
    });

    it("focuses the OK button on first show", function() {
        mockFunc(kendo.ui.Alert.fn, "_focus", function(node) {
            assert.isOk($(node).hasClass("k-button"));
        });
        createAlert({ visible: true });
    });

    it("open focuses the OK button", function() {
        let dialog = createAlert({ visible: false });
        mockFunc(dialog, "_focus", function(node) {
            assert.isOk($(node).hasClass("k-button"));
        });
        dialog.open();
    });

    it("aria-describedby is set to content element", function() {
        let alertDialog = createAlert({ content: "message", visible: true });

        assert.equal(alertDialog.wrapper.attr("aria-describedby"), alertDialog.element.attr("id"));
    });

    it("ensure content has id", function() {
        let alertDialog = createAlert({ content: "message", visible: true });

        assert.isOk(alertDialog.element.attr("id"));
    });

    it("use existing content id for aria-describedby", function() {
        let node = $("<div class='alert' id='dialog-content'>content</div>").appendTo(Mocha.fixture);
        let alertDialog = createAlert({ visible: true }, node);

        assert.equal(alertDialog.wrapper.attr("aria-describedby"), "dialog-content");
    });
});

describe("kendo.alert method", function() {
    afterEach(function() {
        Mocha.fixture.closest("body").find(".k-window-content").each(function(idx, element) {
            $(element).data("kendoAlert").destroy();
        });
        Mocha.fixture.closest("body").find(".k-overlay").remove();
    });

    it("opens Alert dialog", function() {
        let alertDialog = kendo.alert("message");
        assert.isOk(alertDialog.options.visible);
    });

    it("text argument sets Alert dialog content", function() {
        let alertDialog = kendo.alert("message");
        assert.equal(alertDialog.content(), "message");
    });

});
