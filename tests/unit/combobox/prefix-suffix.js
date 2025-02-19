import '@progress/kendo-ui/src/kendo.combobox.js';

let ComboBox = kendo.ui.ComboBox;
let input;

describe("kendo.ui.ComboBox Prefix and Suffix", function() {
    beforeEach(function() {
        kendo.ns = "kendo-";
        input = $("<input />").appendTo(Mocha.fixture);
    });
    afterEach(function() {
        kendo.ns = "";

        let combobox = input.getKendoComboBox();

        if (combobox) {
            combobox.destroy();
        }

        let selectCombo = Mocha.fixture.find("select").getKendoComboBox();

        if (selectCombo) {
            selectCombo.destroy();
        }

        kendo.destroy(Mocha.fixture);
    });


    it("prefix template rendered", function() {
        let combobox = new ComboBox(input, {
            dataSource: [1, 2],
            prefixOptions: { template: () => "<span>prefix</span>" }
        });

        assert.equal(combobox._prefixContainer.length, 1);
        assert.equal(combobox._prefixContainer.html(), "<span>prefix</span>");
    });

    it("prefix renders a separator by default", function() {
        let combobox = new ComboBox(input, {
            dataSource: [1, 2],
            prefixOptions: { template: () => "<span>prefix</span>" }
        });

        assert.equal(combobox._prefixContainer.length, 1);
        assert.equal(combobox._prefixContainer.next().hasClass("k-input-separator"), true);
    });

    it("prefix does not render a separator", function() {
        let combobox = new ComboBox(input, {
            dataSource: [1, 2],
            prefixOptions: {
                template: () => "<span>prefix</span>",
                separator: false
            }
        });

        assert.equal(combobox._prefixContainer.length, 1);
        assert.equal(combobox._prefixContainer.next().hasClass("k-input-separator"), false);
    });

    it("suffix template is rendered", function() {
        let combobox = new ComboBox(input, {
            dataSource: [1, 2],
            suffixOptions: { template: () => "<span>suffix</span>" }
        });

        assert.equal(combobox._suffixContainer.length, 1);
        assert.equal(combobox._suffixContainer.html(), "<span>suffix</span>");
    });

    it("suffix renders a separator by default", function() {
        let combobox = new ComboBox(input, {
            dataSource: [1, 2],
            suffixOptions: { template: () => "<span>suffix</span>" }
        });

        assert.equal(combobox._suffixContainer.length, 1);
        assert.equal(combobox._suffixContainer.prev().hasClass("k-input-separator"), true);
    });

    it("suffix does not render a separator", function() {
        let combobox = new ComboBox(input, {
            dataSource: [1, 2],
            suffixOptions: {
                template: () => "<span>suffix</span>",
                separator: false
            }
        });

        assert.equal(combobox._suffixContainer.length, 1);
        assert.equal(combobox._suffixContainer.next().hasClass("k-input-separator"), false);
    });
});
