import '@progress/kendo-ui/src/kendo.button.js';
import { getButton } from "../../helpers/unit/button.js";

let button, buttonContainer;

describe("initialization", function() {
    afterEach(function() {
        if (button && button.data("kendoButton")) {
            button.data("kendoButton").destroy();
            button.remove();
            button = null;
        }
        if (buttonContainer && buttonContainer.length) {
            kendo.destroy(buttonContainer);
            buttonContainer.remove();
            buttonContainer = null;
        }
    });

    it("initialization adds a k-button class", async function() {
        button = getButton().kendoButton();

        assert.isOk(button.data("kendoButton").element.hasClass("k-button"));
    });

    it("Button element gets all default classes", function() {
        button = getButton().kendoButton();

        assert.isOk(button.hasClass("k-button-md"));
        assert.isOk(button.hasClass("k-rounded-md"));
        assert.isOk(button.hasClass("k-button-solid"));
        assert.isOk(button.hasClass("k-button-solid-base"));
    });

    it("Button element applies classes specified in styles options", function() {
        button = getButton().kendoButton({
            size: "large",
            rounded: "full",
            fillMode: "link",
            themeColor: "primary"
        });

        assert.isOk(button.hasClass("k-button-lg"));
        assert.isOk(button.hasClass("k-rounded-full"));
        assert.isOk(button.hasClass("k-button-link"));
        assert.isOk(button.hasClass("k-button-link-primary"));
    });

    it("Button element applies fillMode clear classes specified in styles options", function() {
        button = getButton().kendoButton({
            size: "large",
            rounded: "full",
            fillMode: "clear",
            themeColor: "primary"
        });

        assert.isOk(button.hasClass("k-button-lg"));
        assert.isOk(button.hasClass("k-rounded-full"));
        assert.isOk(button.hasClass("k-button-clear"));
        assert.isOk(button.hasClass("k-button-clear-primary"));
    });

    it("Button has inner element with class k-button-text", function() {
        button = getButton().kendoButton();

        assert.isOk(button.children().eq(0).hasClass("k-button-text"));
    });

    it("spriteCssClass prepends a span element with corresponding class(es)", function() {
        button = getButton().kendoButton({
            spriteCssClass: "foo bar"
        });

        let icon = button.data("kendoButton").element.children("span.k-sprite");

        assert.equal(icon.length, 1);
        assert.isOk(icon.hasClass("foo"));
        assert.isOk(icon.hasClass("bar"));
    });

    it("spriteCssClass adds corresponding class(es) to span.k-sprite element if already exists", function() {
        button = getButton('<span class="k-sprite"></span>text').kendoButton({
            spriteCssClass: "foo bar"
        });

        let icon = button.data("kendoButton").element.children("span.k-sprite");

        assert.equal(icon.length, 1);
        assert.isOk(icon.hasClass("foo"));
        assert.isOk(icon.hasClass("bar"));
    });

    it("icon adds a k-icon-button class to empty button", function() {
        button = getButton("").kendoButton({
            icon: "foo"
        });

        assert.isOk(button.children().eq(0).hasClass("k-button-icon"));
        assert.isOk(button.hasClass("k-icon-button"));
    });

    it("spriteCssClass adds a k-button-icon class to empty button with only an icon span inside", function() {
        button = getButton('<span class="k-sprite"></span>').kendoButton({
            spriteCssClass: "foo"
        });

        assert.isOk(button.children().eq(0).hasClass("k-button-icon"));
        assert.isOk(button.hasClass("k-icon-button"));
    });

    it("spriteCssClass adds a k-button-text class if button has content", function() {
        button = getButton().kendoButton({
            spriteCssClass: "foo"
        });

        assert.isOk(button.children().eq(1).hasClass("k-button-text"));
    });

    it("icon prepends a span element with corresponding class(es)", function() {
        button = getButton().kendoButton({
            icon: "plus"
        });

        let icon = button.data("kendoButton").element.children("span.k-svg-icon");

        assert.equal(icon.length, 1);
        assert.isOk(icon.hasClass("k-svg-i-plus"));
    });

    it("icon adds corresponding class(es) to span.k-icon element if already exists", function() {
        button = getButton('<span class="k-icon khjgjhg"></span>text').kendoButton({
            icon: "plus"
        });

        let icon = button.data("kendoButton").element.children("span.k-icon");

        assert.equal(icon.length, 1);
        assert.isOk(icon.hasClass("k-svg-i-plus"));
    });

    it("icon adds a k-button-icon and k-icon-button class to empty button", function() {
        button = getButton("").kendoButton({
            icon: "foo"
        });

        assert.isOk(button.children().eq(0).hasClass("k-button-icon"));
        assert.isOk(button.hasClass("k-icon-button"));
    });

    it("icon adds a k-button-icon class to empty button with only an icon span inside", function() {
        button = getButton('<span class="k-icon"></span>').kendoButton({
            icon: "foo"
        });

        assert.isOk(button.children().eq(0).hasClass("k-button-icon"));
        assert.isOk(button.hasClass("k-icon-button"));
    });

    it("icon adds a k-button-text class if button has content", function() {
        button = getButton().kendoButton({
            icon: "foo"
        });

        assert.isOk(button.children().eq(1).hasClass("k-button-text"));
    });

    it("iconClass prepends a span element with corresponding class(es)", function() {
        button = getButton().kendoButton({
            iconClass: "fa fa-test"
        });

        let icon = button.data("kendoButton").element.children("span");

        assert.isOk(icon.hasClass("fa"));
        assert.isOk(icon.hasClass("fa-test"));
    });

    it("iconClass adds a k-button-icon and k-icon-button class to empty button", function() {
        button = getButton("").kendoButton({
            iconClass: "fa fa-test"
        });

        assert.isOk(button.children().eq(0).hasClass("k-button-icon"));
        assert.isOk(button.hasClass("k-icon-button"));
    });

    it("imageUrl prepends an img element with src attribute", function() {
        button = getButton().kendoButton({
            imageUrl: "foo"
        });

        let image = button.data("kendoButton").element.children("img.k-image");

        assert.equal(image.length, 1);
        assert.equal(image.attr("src"), "foo");
    });

    it("imageUrl sets a src attribute to img.k-image element if already exists", function() {
        button = getButton('<img class="k-image" />text').kendoButton({
            imageUrl: "foo"
        });

        let image = button.data("kendoButton").element.children("img.k-image");

        assert.equal(image.length, 1);
        assert.equal(image.attr("src"), "foo");
    });

    it("imageUrl adds a k-button-icon and k-icon-button class to empty button", function() {
        button = getButton("").kendoButton({
            imageUrl: "foo"
        });

        assert.isOk(button.children().eq(0).hasClass("k-button-icon"));
        assert.isOk(button.hasClass("k-icon-button"));
    });

    it("imageUrl adds a k-button-icon and k-icon-button class to empty button with only an icon image inside", function() {
        button = getButton('<img class="k-image" />').kendoButton({
            imageUrl: "foo"
        });

        assert.isOk(button.children().eq(0).hasClass("k-button-icon"));
        assert.isOk(button.hasClass("k-icon-button"));
    });

    it("imageUrl adds a k-button-text class if button has content", function() {
        button = getButton().kendoButton({
            imageUrl: "foo"
        });

        assert.isOk(button.children().eq(1).hasClass("k-button-text"));
    });

    it("default button does not have a k-disabled class", function() {
        button = getButton().addClass("k-disabled").kendoButton();

        assert.isOk(!button.data("kendoButton").element.hasClass("k-disabled"));
    });

    it("enable:false adds a k-disabled class", function() {
        button = getButton().kendoButton({
            enable: false
        });

        assert.isOk(button.data("kendoButton").element.hasClass("k-disabled"));
    });

    it("enable:false adds a disabled attribute", function() {
        button = getButton().kendoButton({
            enable: false
        });

        assert.include(["disabled", "true"], button.data("kendoButton").element.attr("disabled"));
    });

    it("enabled:false adds a k-disabled class", function() {
        button = getButton().kendoButton({
            enabled: false
        });

        assert.isOk(button.data("kendoButton").element.hasClass("k-disabled"));
    });

    it("enabled:false adds a disabled attribute", function() {
        button = getButton().kendoButton({
            enabled: false
        });

        assert.include(["disabled", "true"], button.data("kendoButton").element.attr("disabled"));
    });

    it("disabled attribute adds a k-disabled class", function() {
        button = getButton().attr("disabled", "disabled").kendoButton();

        assert.isOk(button.data("kendoButton").element.hasClass("k-disabled"));
    });

    it("initialization adds a tabindex attribute if not present", function() {
        button = getButton().kendoButton();

        assert.equal(button.data("kendoButton").element.attr("tabindex"), 0);
    });

    it("initialization preserves set tabindex attribute", function() {
        button = getButton().attr("tabindex", 1).kendoButton();

        assert.equal(button.data("kendoButton").element.attr("tabindex"), 1);
    });

    it("when badge is enabled a kendo.ui.Badge is initialized", function() {
        button = getButton().attr("tabindex", 1).kendoButton({
            badge: "1"
        });

        assert.isOk(button.data("kendoButton").badge instanceof kendo.ui.Badge);
    });

    it("Button element type attribute is preserved", function() {
        button = getButton().attr("type", "submit").kendoButton();

        assert.equal(button.attr("type"), "submit");
    });
});
