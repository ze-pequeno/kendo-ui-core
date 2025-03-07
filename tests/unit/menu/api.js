import '@progress/kendo-ui/src/kendo.menu.js';
import { asyncTest } from '../../helpers/unit/async-utils.js';
import { mockFunc, removeMocksIn } from '../../helpers/unit/mock-utils.js';

let isOpenRaised, isCloseRaised, isSelectRaised, selected;

function getRootItem(index) {
    return $('#menu').find('> .k-item > .k-link').eq(index);
}

//handlers
function Open() {
    isOpenRaised = true;
}

function Close() {
    isCloseRaised = true;
}

function Select() {
    selected++;
    isSelectRaised = true;
}

let menu,
    CLICK = kendo.support.touch ? "touchend" : "click";

describe("menu api", function() {
    beforeEach(function() {
        Mocha.fixture.append(
            '    <ul id="menu" class="k-reset k-header k-menu" style="visibility: hidden; top: -10000px">' +
            '        <li class="k-item" style=""><span class="k-link">ASP.NET MVC<span' +
            '                class="k-icon k-i-caret-alt-down"></span></span>' +
            '            <ul class="k-menu-group">' +
            '                <li class="k-item"><span class="k-link">Grid</span>' +
            '                </li>' +
            '                <li class="k-item"><span class="k-link">Menu<span' +
            '                class="k-icon k-i-caret-alt-right"></span></span>' +
            '                    <ul class="k-menu-group">' +
            '                        <li class="k-item"><span class="k-link">Grid</span>' +
            '                        </li>' +
            '                        <li class="k-item"><span class="k-link">Menu</span>' +
            '                        </li>' +
            '                        <li class="k-item"><span class="k-link">PanelBar</span></li>' +
            '                        <li class="k-item"><span class="k-link">TabStrip</span></li>' +
            '                    </ul>' +
            '                </li>' +
            '                <li class="k-item"><span class="k-link">PanelBar</span></li>' +
            '                <li class="k-item"><span class="k-link">TabStrip</span></li>' +
            '            </ul>' +
            '        </li><li class="k-item"><span class="k-link">Silverlight<span' +
            '                class="k-icon k-i-caret-alt-down"></span></span>' +
            '            <ul class="k-menu-group">' +
            '                <li class="k-item"><span class="k-link">GridView</span>' +
            '                </li>' +
            '                <li class="k-item"><span class="k-link">Scheduler</span></li>' +
            '                <li class="k-item"><span class="k-link">Docking</span>' +
            '                </li>' +
            '                <li class="k-item"><span class="k-link">Chart</span></li>' +
            '                <li class="k-item"><a href="http://www.telerik.com/products/silverlight.aspx"' +
            '                                                      class="k-link">... and 28 more!</a></li>' +
            '            </ul>' +
            '        </li><li class="k-item"><span class="k-link">ASP.NET AJAX<span' +
            '                class="k-icon k-i-caret-alt-down"></span></span>' +
            '            <ul class="k-menu-group">' +
            '                <li class="k-item"><span class="k-link">Grid</span></li>' +
            '                <li class="k-item"><span class="k-link">Editor</span>' +
            '                </li>' +
            '                <li class="k-item"><span class="k-link">Scheduler</span></li>' +
            '                <li class="k-item"><a href="http://www.telerik.com/products/aspnet-ajax.aspx"' +
            '                                                      class="k-link">... and 28 more!</a></li>' +
            '            </ul>' +
            '        </li><li class="k-item"><a href="#Menu-4" class="k-link">OpenAccess ORM<span' +
            '                class="k-icon k-i-caret-alt-down"></span></a>' +
            '            <ul class="k-menu-group">' +
            '                <li class="k-item">' +
            '                    <div id="Menu-4" class="k-content">' +
            '                        <a href="http://www.telerik.com/purchase/individual/orm.aspx" id="buy">' +
            '                            Telerik OpenAccess ORM' +
            '                        </a>' +
            '                        <a href="http://www.telerik.com/community/license-agreement.aspx?pId=639" id="express">' +
            '                            Telerik OpenAccess ORM Express' +
            '                        </a>' +
            '                    </div>' +
            '                </li>' +
            '            </ul>' +
            '        </li><li class="k-item"><span class="k-link">Reporting</span></li><li class="k-item"><span class="k-link">Sitefinity ASP.NET CMS</span>' +
            '        </li><li style="border-right: 0;" class="k-item"><span class="k-link">Other products<span' +
            '                class="k-icon k-i-caret-alt-down"></span></span>' +
            '            <ul class="k-menu-group">' +
            '                <li class="k-item"><span class="k-link">Web Testing Tools</span>' +
            '                </li>' +
            '                <li class="k-item"><span class="k-link">WinForms UI Controls</span>' +
            '                </li>' +
            '                <li class="k-item"><span class="k-link">WPF UI Controls</span></li>' +
            '            </ul>' +
            '        </li>' +
            '    </ul>'
        );
        menu = new kendo.ui.Menu("#menu", { animation: false, select: Select, open: Open, close: Close, hoverDelay: 0, popupCollision: "flip" });
    });
    afterEach(function() {
        kendo.destroy(Mocha.fixture);
    });

    it('click method should set handled flag and select event is only fired once', function() {
        let link = getRootItem(7);
        let isCalled = false;

        let e = { target: link[0], stopPropagation: function() { }, preventDefault: function() { } };

        selected = 0;
        menu._click(e);

        assert.isOk(e.handled);
        assert.isOk(selected == 1);
    });

    asyncTest('hovering root item opens it and raises open event', function(done) {
        let item = getRootItem(1).parent();

        menu._mouseenter({ currentTarget: item[0], delegateTarget: menu.element[0] });

        setTimeout(() => {
            done(() => assert.isOk(isOpenRaised));
        }, 1);
    });

    asyncTest('leaving root item closes it and raises close event', function(done) {
        let item = getRootItem(1).parent();

        menu._mouseenter({ currentTarget: item[0], delegateTarget: menu.element[0] });

        menu.bind("close", function() {
            done(() => assert.isOk(true));
        });

        setTimeout(() => {
            menu._mouseleave({ currentTarget: item[0] });
        }, 1);
    });

    asyncTest('leaving item root outside viewport left direction viewport closes it and raises close event', function(done) {
        let item = getRootItem(1).parent();

        menu._mouseenter({ currentTarget: item[0], delegateTarget: menu.element[0] });

        menu.bind("close", function() {
            done(() => assert.isOk(true));
        });

        setTimeout(() => {
            menu._mouseleave({ currentTarget: item[0], target: item.find("span.k-link")[0], clientX: -1 });
        }, 1);

    });

    asyncTest('leaving item root outside viewport top direction closes it and raises close event', function(done) {
        let item = getRootItem(1).parent();

        menu._mouseenter({ currentTarget: item[0], delegateTarget: menu.element[0] });

        menu.bind("close", function() {
            done(() => assert.isOk(true));
        });

        setTimeout(() => {
            menu._mouseleave({ currentTarget: item[0], target: item.find("span.k-link")[0], clientY: -1 });
        }, 1);
    });

    asyncTest('leaving item root outside viewport bottom direction closes it and raises close event', function(done) {
        let item = getRootItem(1).parent();

        menu._mouseenter({ currentTarget: item[0], delegateTarget: menu.element[0] });

        menu.bind("close", function() {
            done(() => assert.isOk(true));
        });

        setTimeout(() => {
            menu._mouseleave({ currentTarget: item[0], target: item.find("span.k-link")[0], clientY: $(window).height() + 2 });
        }, 1);
    });

    asyncTest('leaving item root outside viewport right direction closes it and raises close event', function(done) {
        let item = getRootItem(1).parent();

        menu._mouseenter({ currentTarget: item[0], delegateTarget: menu.element[0] });

        menu.bind("close", function() {
            done(() => assert.isOk(true));
        });

        setTimeout(() => {
            menu._mouseleave({ currentTarget: item[0], target: item.find("span.k-link")[0], clientX: $(window).width() + 2 });
        }, 1);
    });

    it('clicking should raise select event', function() {
        let link = getRootItem(2);

        isSelectRaised = false;

        link.trigger(CLICK);

        assert.isOk(isSelectRaised);
    });

    it('clicking on sub item should close the menu', function() {
        let link = getRootItem(1);

        menu._mouseenter({ currentTarget: link[0] });

        let e = { stopPropagation: function() { }, preventDefault: function() { } };

        link.trigger(CLICK);

        assert.isOk(link.parent().is(":visible"));
    });

    it('clicking on item content should do nothing', function() {
        let element = $("#Menu-4");
        let isCalled = false;
        let failHandler = function() {
            assert.isOk(false);
        };

        let e = { target: element, preventDefault: function() { isCalled = true; }, stopPropagation: function() { } };

        menu.bind("select", failHandler);
        menu.bind("open", failHandler);
        menu.bind("close", failHandler);
        menu._click(e);

        assert.isOk(!isCalled);
    });

    asyncTest("open should open item even if disabled", function(done) {
        let item = getRootItem(6).parent();

        menu.disable(item);
        menu.open(item);

        setTimeout(function() {
            done(() => assert.isOk(item.find('.k-menu-group').is(":visible")));
        }, 1);
    });

    it.skip('open should apply max-height and overflow styles to group UL', function(done) {
        let item = getRootItem(1).parent(),
            ul = item.find(".k-menu-group");

        menu.open(item);

        setTimeout(function() {
            let maxHeightStyle = parseInt(ul.css("max-height"), 10),
                overflowStyle = ul.css("overflow"),
                windowHeight = $(window).height() - kendo.getShadows(ul).bottom - (ul.outerHeight() - ul.height());

            done(() => {
                assert.isOk(!isNaN(maxHeightStyle));
                assert.equal(overflowStyle, "auto");
                assert.equal(maxHeightStyle, windowHeight);
            });
        }, 30);
    });

    asyncTest("open should not apply max-height and overflow styles to group UL if it has children groups", function(done) {
        let item = getRootItem(0).parent(),
            ul = item.find(".k-menu-group").parent().css({ maxHeight: 1, overflow: "auto" });

        menu.open(item);

        setTimeout(function() {
            let maxHeightStyle = parseInt(ul.parent().css("max-height"), 10),
                overflowStyle = ul.parent().css("overflow");

            done(() => {
                assert.isOk(isNaN(maxHeightStyle));
                assert.notEqual(overflowStyle, "auto");
            });
        }, 1);
    });

    it('clicking should not open item if disabled', function() {
        let item = getRootItem(4).parent();

        menu.disable(item);

        item.children(".k-link").trigger(CLICK);

        assert.isOk(!item.find('.k-menu-group').is(":visible"));
    });

    it('disable method should disable enabled item', function() {
        let item = getRootItem(2).parent();

        menu.disable(item);

        assert.isOk(item.hasClass('k-disabled'));
    });

    it('enable method should enable disabled item', function() {
        let item = getRootItem(3).parent();

        menu.enable(item);

        assert.isOk(!item.hasClass('k-disabled'));
    });

    asyncTest("configure with popupCollision overrides the default", function(done) {
        let item = getRootItem(3).parent();

        menu.open(item);

        setTimeout(function() {
            done(() => {
                const popup = item.find(".k-menu-group").eq(0).parent().data("kendoPopup");
                assert.isOk(popup.options.collision == "flip");
            });
        }, 1);
    });

    it('setOptions resets the animation', function() {
        let m = new kendo.ui.Menu("<div />");

        assert.isOk(!("effects" in m.options.animation.open));

        m.setOptions({ animation: false });

        assert.isOk("effects" in m.options.animation.open);
        assert.isOk(kendo.size(m.options.animation.open.effects) == 0);
        m.destroy();
    });

    it('setOptions resets the dataSource object', function() {
        let m = new kendo.ui.Menu("<div />", { dataSource: [{ text: "Item 1" }] });

        assert.isOk(m.element.find("li").text() == "Item 1");

        m.setOptions({ dataSource: [{ text: "Changed" }] });

        assert.isOk(m.element.find("li").text() == "Changed");
        m.destroy();
    });

    it("Element with class k-icon doesn't get removed in an item", function() {
        let m = new kendo.ui.Menu("<ul><li><span class='k-icon'></span></li></ul>");

        assert.isOk(m.element.find(".k-icon")[0]);
        m.destroy();
    });

    it("Add dynamic item with cssClass", function() {
        let m = new kendo.ui.Menu("<ul></ul>");

        m.append({ text: "test", cssClass: "cssClass" });

        assert.isOk(m.element.find(".cssClass")[0]);
        m.destroy();
    });

    it("Adding dynamic content element renders properly on root and inner levels", function() {
        let m = new kendo.ui.Menu("<ul></ul>");

        m.append([
            {
                text: "Item 1",
                content: "Item 1 Content"
            },
            {
                text: "Item 2",
                items: [
                    {
                        text: "Sub Item 1",
                        content: "Sub Item 1 Content"
                    }
                ]
            }
        ]);

        assert.isOk(m.element.children("li:first").children("div.k-menu-popup").children(".k-content.k-menu-group")[0]);
        assert.isOk(m.element.find("> li:last > div > ul > li:first").children("div.k-menu-popup").children("div.k-content.k-menu-group")[0]);
        assert.isOk(!m.element.children("li:first").children("div.k-menu-popup").children("div.k-content.k-menu-group").is(":visible"));
        assert.isOk(!m.element.find("> li:last > div > ul > li:first").children("div.k-menu-popup").children("div.k-content.k-menu-group").is(":visible"));

        m.destroy();
    });

    it("Select handler for sub-menu items is attached correctly with append", function() {
        let m = new kendo.ui.Menu("<ul></ul>");

        m.append([
            {
                text: "Item 1",
                // eslint-disable-next-line no-alert
                items: [{ text: "Sub Item 1", select: () => alert("Sub Item 1 select") }, { text: "Sub Item 2" }]
            },
            {
                text: "Item 2",
                // eslint-disable-next-line no-alert
                select: () => alert("Item 2 select")
            }
        ]);

        assert.isOk(m.element.children("li:first").find(".k-menu-popup li:first .k-link").data("selectHandler"));

        m.destroy();
    });

    it("The new group of a newly inserted node is not visible", function() {
        let m = new kendo.ui.Menu("<ul id='menu'> <li >Item 1</li> <li class='target'> Item 2 </li> <li> Item 3 </li> </ul>");

        m.append({ text: 'appended' }, m.element.find(".target"));

        assert.equal(m.element.find(".target .k-menu-popup").css("display"), "none");

        m.destroy();
    });

    it("Appending a li item to a parent li adds it to a <ul> instead of the popup wrapper", function() {
        let m = new kendo.ui.Menu("<ul id='menu'> <li >Item 1</li> <li class='target'> Item 2 </li> <li> Item 3 </li> </ul>");

        const li = $("<li></li>", {
            text: "New Item"
        });
        const ref = m.element.find(">li:nth-child(3)");
        m.append(li, ref);
        assert.equal(ref.find(".k-menu-group").children().length, 1);

        m.destroy();
    });

    it("_itemHasChildren returns true when there is content item", function() {
        let m = new kendo.ui.Menu("<ul></ul>");

        m.append([
            {
                text: "Item 1",
                content: "Item 1 Content"
            }
        ]);

        assert.isOk(m._itemHasChildren(m.element.children("li:first")));
        m.destroy();
    });

    it("Adding dynamic contentUrl element renders contents on root and inner levels", function() {
        let m = new kendo.ui.Menu("<ul></ul>");

        m.append([
            {
                text: "Item 1",
                contentUrl: "AjaxView1.html"
            },
            {
                text: "Item 2",
                items: [
                    {
                        text: "Sub Item 1",
                        contentUrl: "AjaxView2.html"
                    }
                ]
            }
        ]);

        assert.isOk(m.element.children("li:first").children("div.k-menu-popup").children("div.k-content")[0]);
        assert.isOk(m.element.find("> li:last > div > ul > li:first").children("div.k-menu-popup").children("div.k-content")[0]);
        m.destroy();
    });

    it('insertAfter method moves an item if called with existing item', function() {
        let menu = $("<ul><li>Item 1</li><li>Item 2</li></ul>").kendoMenu().data("kendoMenu");

        try {
            menu.insertAfter("li:first-child", "li:last-child");

            assert.isOk(menu.element.children("li:last-child").text() == "Item 1");
        } finally {
            menu.destroy();
        }
    });

    it('overflow menu - setOptions reinitialize overflow wrapper', function() {
        let m = new kendo.ui.Menu("<div />");

        m.setOptions({ scrollable: true, orientation: "horizontal" });
        assert.isOk(!(m._overflowWrapper().is(".k-menu-scroll-wrapper-vertical")));

        m.setOptions({ scrollable: true, orientation: "vertical" });
        assert.isOk(m._overflowWrapper().is(".k-menu-scroll-wrapper-vertical"));

        m.destroy();
    });

    it('overflow menu - setOptions reattach events', function() {
        let m = new kendo.ui.Menu("<div />");

        mockFunc(kendo.ui.Menu.fn, "_detachMenuEventsHandlers", function() { assert.isOk(true); });
        mockFunc(kendo.ui.Menu.fn, "_attachMenuEventsHandlers", function() { assert.isOk(true); });

        m.setOptions({ scrollable: true, orientation: "horizontal" });

        removeMocksIn(kendo.ui.Menu.fn);

        m.destroy();
    });

    asyncTest("overflow menu - opened popups should be inserted after the menu", function(done) {
        menu.setOptions({ scrollable: true, orientation: "horizontal" });
        let item = getRootItem(6).parent();

        menu.open(item);

        setTimeout(function() {
            done(() => assert.equal(menu.element.siblings(".k-animation-container").length, 1));
        }, 1);
    });

    asyncTest("overflow menu - opened popups should contains scroll buttons", function(done) {
        menu.setOptions({ scrollable: true, orientation: "horizontal" });
        let item = getRootItem(6).parent();

        menu.open(item);

        setTimeout(function() {
            done(() => assert.equal(menu.element.siblings(".k-menu-scroll-button").length, 2));
        }, 1);
    });

    asyncTest("overflow menu - turning off scrollable should return back the opened UL groups to their parent LI", function(done) {
        menu.setOptions({ scrollable: true, orientation: "horizontal" });
        let item = getRootItem(6).parent();

        menu.open(item);

        setTimeout(function() {
            menu.close(item);
            setTimeout(function() {
                menu.setOptions({ scrollable: false });
                done(() => {
                    assert.isNotOk(menu._overflowWrapper());
                    assert.equal(menu.element.siblings(".k-animation-container,.k-menu-scroll-button").length, 0);
                });
            }, 1);
        }, 1);
    });

    it('remove with non-existing item should not throw js error', function() {
        try {
            menu.remove("#no-such-item");
        } catch (error) {
            assert.isOk(false);
        }

        assert.isOk(true);
    });

});

