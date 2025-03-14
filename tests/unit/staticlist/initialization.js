import '@progress/kendo-ui/src/kendo.list.js';

let StaticList = kendo.ui.StaticList,
    encode = kendo.htmlEncode,
    element;

describe("kendo.ui.StaticList initialization", function() {
    beforeEach(function() {
        kendo.ns = "kendo-";
        element = $("<ul></ul>").appendTo(Mocha.fixture);
    });
    afterEach(function() {
        element.data("kendoStaticList").destroy();

        kendo.support.touch = false;
        kendo.support.mobileOS = false;
        kendo.ns = "";
    });

    it("kendoStaticList attaches a StaticList object to the target", function() {
        element.kendoStaticList({});

        assert.isOk(element.data("kendoStaticList") instanceof StaticList);
    });

    it("StaticList extends passed options", function() {
        let templ = () => "test";
        let list = new StaticList(element, { template: templ });

        let options = list.options;

        assert.equal(options.template, templ);
    });

    it("StaticList adds listbox role to the element", function() {
        let list = new StaticList(element, {});

        assert.equal(element.attr("role"), "listbox");
    });

    it("StaticList builds a template", function() {
        let list = new StaticList(element, {
            template: () => "test"
        });

        assert.isOk(list.templates.template);
    });

    it("StaticList builds a groupTemplate", function() {
        let list = new StaticList(element, {
            groupTemplate: () => "test"
        });

        assert.isOk(list.templates.groupTemplate);
    });

    it("StaticList builds a fixedGroupTemplate", function() {
        let list = new StaticList(element, {
            fixedGroupTemplate: () => "test"
        });

        assert.isOk(list.templates.fixedGroupTemplate);
    });

    it("StaticList appends fixed header element before content element", function() {
        let list = new StaticList(element, {
            fixedGroupTemplate: () => "test"
        });

        let header = list.content.prev();

        assert.isOk(header.hasClass("k-list-group-sticky-header"));
    });

    it("StaticList creates a dataSource", function() {
        let list = new StaticList(element, {
            dataSource: ["item"]
        });

        assert.isOk(list.dataSource);
    });

    it("pointer over li should add hover state", function() {
        let list = new StaticList(element, {
            dataSource: ["item"],
            template: (data) => encode(data)
        });

        list.dataSource.read();

        let li = list.element.children().eq(0);
        li.mouseenter();

        assert.isOk(li.hasClass("k-hover"));
    });

    it("leave li should remove hover state", function() {
        let list = new StaticList(element, {
            dataSource: ["item"],
            template: (data) => encode(data)
        });

        list.dataSource.read();

        let li = list.element.children().eq(0);
        li.mouseenter();
        li.mouseleave();

        assert.isOk(!li.hasClass("k-hover"));
    });

    it("re-set value when add new item to the source", function() {
        let list = new StaticList(element, {
            dataSource: {
                data: [
                    { name: "item", value: 1, group: "a" },
                    { name: "item2", value: 2, group: "b" }
                ],
                group: { field: "group" }
            },
            dataValueField: "value",
            template: (data) => encode(data.name),
            groupTemplate: (data) => encode(data),
            value: 1
        });

        list.dataSource.read();

        list.dataSource.add({ name: "item3", value: 3, group: "" });

        assert.equal(list.select()[0], 1);
    });

    it("update selected data item on datasource read", function() {
        let data = [
            { name: "item", value: 1, group: "a" },
            { name: "item2", value: 2, group: "b" }
        ];

        let list = new StaticList(element, {
            dataSource: {
                transport: {
                    read: function(options) {
                        options.success(data);
                    }
                }
            },
            dataValueField: "value",
            template: (data) => encode(data.name),
            value: 1
        });

        list.dataSource.read();

        data[0].name = "Item new";

        list.dataSource.read();

        let selectedItem = list.selectedDataItems()[0];

        assert.equal(selectedItem.name, "Item new");
    });

    it("keep value when source is filtered from outside", function() {
        let list = new StaticList(element, {
            dataSource: {
                data: [
                    { name: "item", value: 1, group: "a" },
                    { name: "item2", value: 2, group: "b" }
                ],
                group: { field: "group" }
            },
            dataValueField: "value",
            template: (data) => encode(data.name),
            groupTemplate: (data) => encode(data),
            value: 1
        });

        list.dataSource.read();

        list.dataSource.filter({
            field: "name",
            operator: "eq",
            value: "none"
        });

        assert.equal(list.dataSource.view().length, 0);
        assert.equal(list.select()[0], 0);
        assert.equal(list.value()[0], 1);
    });
});
