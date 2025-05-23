import '@progress/kendo-ui/src/kendo.numerictextbox.js';
import { stub } from '../../helpers/unit/stub.js';

let NumericTextBox = kendo.ui.NumericTextBox,
    input;

describe("kendo.ui.NumericTextBox label", function() {
    beforeEach(function() {
        input = $("<input />").appendTo(Mocha.fixture);
    });
    afterEach(function() {
        kendo.destroy(Mocha.fixture);
    });

    it("create a label with inner HTML equal to configuration text", function() {
        let numerictextbox = new NumericTextBox(input, {
            label: "<b>text</b>"
        });

        assert.equal(numerictextbox.wrapper.parent().find(".k-label")[0].innerHTML, "<b>text</b>");
    });

    it("create a label with inner HTML equal to configuration function", function() {
        let numerictextbox = new NumericTextBox(input, {
            label: function() {
                return "<b>function</b>";
            }
        });

        assert.equal(numerictextbox.wrapper.parent().find(".k-label")[0].innerHTML, "<b>function</b>");
    });

    it("create a label with inner HTML equal to configuration object text", function() {
        let numerictextbox = new NumericTextBox(input, {
            label: {
                content: "<b>content text</b>"
            }
        });

        assert.equal(numerictextbox.wrapper.parent().find(".k-label")[0].innerHTML, "<b>content text</b>");
    });

    it("create a label with inner HTML equal to configuration object function", function() {
        let numerictextbox = new NumericTextBox(input, {
            label: {
                content: function() {
                    return "<b>content function</b>";
                }
            }
        });

        assert.equal(numerictextbox.wrapper.parent().find(".k-label")[0].innerHTML, "<b>content function</b>");
    });

    it("floating label wraps the widget", function() {
        let numerictextbox = new NumericTextBox(input, {
            label: {
                content: "test",
                floating: true
            }
        });

        assert.isOk(numerictextbox.wrapper.parent().hasClass("k-floating-label-container"));
        assert.isOk(numerictextbox.wrapper.parent().hasClass("k-empty"));
    });

    it("floating label removes k-empty class when the input has value", function() {
        let numerictextbox = new NumericTextBox(input, {
            value: 23,
            label: {
                content: "test",
                floating: true
            }
        });

        assert.isNotOk(numerictextbox.floatingLabel.element.hasClass("k-empty"));
    });

    it("floating label removes k-empty on focusout when the input has value", function() {
        let numerictextbox = new NumericTextBox(input, {
            label: {
                content: "test",
                floating: true
            }
        });

        assert.isOk(numerictextbox.floatingLabel.element.hasClass("k-empty"));

        numerictextbox.value(23);
        numerictextbox.element.trigger("focusout");

        assert.isNotOk(numerictextbox.floatingLabel.element.hasClass("k-empty"));
    });

    it("floating label adds k-focus when the user focuses the input", function() {
        let numerictextbox = new NumericTextBox(input, {
            label: {
                content: "test",
                floating: true
            }
        });

        numerictextbox.focus();

        assert.isOk(numerictextbox.floatingLabel.element.hasClass("k-focus"));
    });

    it("floating label removes k-focus on blur", function() {
        let numerictextbox = new NumericTextBox(input, {
            label: {
                content: "test",
                floating: true
            }
        });

        numerictextbox.focus();

        assert.isOk(numerictextbox.floatingLabel.element.hasClass("k-focus"));

        $(document.activeElement).trigger("blur");

        assert.isNotOk(numerictextbox.floatingLabel.element.hasClass("k-focus"));
    });

    it("numerictextbox enable calls floating label enable", function() {
        let numerictextbox = new NumericTextBox(input, {
            label: {
                content: "test",
                floating: true
            }
        });

        stub(numerictextbox, { enable: numerictextbox.floatingLabel.enable });

        numerictextbox.enable();

        assert.equal(numerictextbox.calls("enable"), 1);
    });

    it("numerictextbox readonly calls floating label readonly", function() {
        let numerictextbox = new NumericTextBox(input, {
            label: {
                content: "test",
                floating: true
            }
        });

        stub(numerictextbox, { readonly: numerictextbox.floatingLabel.readonly });

        numerictextbox.readonly();

        assert.equal(numerictextbox.calls("readonly"), 1);
    });

    it("numerictextbox destroy calls floating label destroy", function() {
        let numerictextbox = new NumericTextBox(input, {
            label: {
                content: "test",
                floating: true
            }
        });

        stub(numerictextbox, { destroy: numerictextbox.floatingLabel.destroy });

        numerictextbox.destroy();

        assert.equal(numerictextbox.calls("destroy"), 1);
    });

    it("k-empty is not added if the value is zero", function() {
        let numerictextbox = new NumericTextBox(input, {
            value: 0,
            label: {
                content: "test",
                floating: true
            }
        });

        assert.isNotOk(numerictextbox.wrapper.parent().hasClass("k-empty"));
    });
});
