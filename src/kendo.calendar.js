import "./kendo.core.js";
import "./kendo.selectable.js";
import "./kendo.icons.js";

export const __meta__ = {
    id: "calendar",
    name: "Calendar",
    category: "web",
    description: "The Calendar widget renders a graphical calendar that supports navigation and selection.",
    depends: [ "core", "selectable" ]
};

(function($, undefined) {
    let kendo = window.kendo,
        support = kendo.support,
        ui = kendo.ui,
        Widget = ui.Widget,
        keys = kendo.keys,
        parse = kendo.parseDate,
        encode = kendo.htmlEncode,
        adjustDST = kendo.date.adjustDST,
        weekInYear = kendo.date.weekInYear,
        Selectable = kendo.ui.Selectable,
        RangeSelectable = kendo.ui.RangeSelectable,
        extractFormat = kendo._extractFormat,
        template = kendo.template,
        getCulture = kendo.getCulture,
        transitionOrigin = "transform-origin",
        cellTemplate = template((data) => `<td class="${data.cssClass}" role="gridcell"><span tabindex="-1" class="k-link" data-href="#" data-${data.ns}value="${data.dateString}">${data.value}</span></td>`),
        emptyCellTemplate = template(() => '<td role="gridcell" class="k-calendar-td k-empty"></td>'),
        otherMonthCellTemplate = template(() => '<td role="gridcell" class="k-calendar-td k-empty">&nbsp;</td>'),
        weekNumberTemplate = template((data) => `<td class="k-calendar-td k-alt">${data.weekNumber}</td>`),
        outerWidth = kendo._outerWidth,
        ns = ".kendoCalendar",
        CLICK = "click" + ns,
        KEYDOWN_NS = "keydown" + ns,
        DOT = ".",
        EMPTY = " ",
        TABLE = "table",
        CALENDAR_VIEW = "k-calendar-view",
        ID = "id",
        MIN = "min",
        LEFT = "left",
        SLIDE = "slideIn",
        MONTH = "month",
        CENTURY = "century",
        CHANGE = "change",
        NAVIGATE = "navigate",
        VALUE = "value",
        HOVER = "k-hover",
        DISABLED = "k-disabled",
        FOCUSED = "k-focus",
        OTHERMONTH = "k-other-month",
        EMPTYCELL = "k-empty",
        TODAY = "k-calendar-nav-today",
        CELLSELECTOR = "td:has(.k-link)",
        START = "start",
        END = "end",
        CELLSELECTORVALID = "td:has(.k-link):not(." + DISABLED + "):not(." + EMPTYCELL + ")",
        WEEKCOLUMNSELECTOR = "td:not(:has(.k-link))",
        SELECTED = "k-selected",
        BLUR = "blur" + ns,
        FOCUS = "focus",
        FOCUS_WITH_NS = FOCUS + ns,
        MOUSEENTER = support.touch ? "touchstart" : "mouseenter",
        MOUSEENTER_WITH_NS = support.touch ? "touchstart" + ns : "mouseenter" + ns,
        MOUSELEAVE = support.touch ? "touchend" + ns + " touchmove" + ns : "mouseleave" + ns,
        MS_PER_MINUTE = 60000,
        MS_PER_DAY = 86400000,
        PREVARROW = "_prevArrow",
        NEXTARROW = "_nextArrow",
        ARIA_DISABLED = "aria-disabled",
        ARIA_SELECTED = "aria-selected",
        ARIA_LABEL = "aria-label",
        extend = $.extend,
        DATE = Date,
        views = {
            month: 0,
            year: 1,
            decade: 2,
            century: 3
        },
        HEADERSELECTOR = '.k-header, .k-calendar-header',
        CLASSIC_HEADER_TEMPLATE = ({ actionAttr, size, isRtl }) => `<div class="k-header k-hstack">
            <span tabindex="-1" data-href="#" ${actionAttr}="prev" role="button" class="k-calendar-nav-prev k-button ${size} k-rounded-md k-button-flat k-button-flat-base k-icon-button" ${ARIA_LABEL}="Previous">${kendo.ui.icon({ icon: `caret-alt-${isRtl ? "right" : "left"}`, iconClass: "k-button-icon" })}</span></span>
            <span tabindex="-1" data-href="#" ${actionAttr}="nav-up" id="` + kendo.guid() + `" role="button" class="k-calendar-nav-fast k-button ${size} k-rounded-md k-button-flat k-button-flat-base  k-flex"></span>
            <span tabindex="-1" data-href="#" ${actionAttr}="next" role="button" class="k-calendar-nav-next k-button ${size} k-rounded-md k-button-flat k-button-flat-base  k-icon-button" ${ARIA_LABEL}="Next">${kendo.ui.icon({ icon: `caret-alt-${isRtl ? "left" : "right"}`, iconClass: "k-button-icon" })}</span>
        </div>`,
        MODERN_HEADER_TEMPLATE = ({ actionAttr, size, messages, isRtl }) => `<div class="k-calendar-header">
            <button ${actionAttr}="nav-up" id="` + kendo.guid() + `" class="k-calendar-title k-button ${size} k-button-flat k-button-flat-primary k-rounded-md">
                <span class="k-button-text"></span>
            </button>
            <span class="k-spacer"></span>
            <span class="k-calendar-nav">
                <button tabindex="-1" ${actionAttr}=${isRtl ? "next" : "prev"} class="k-calendar-nav-prev k-button ${size} k-button-flat k-button-flat-base k-rounded-md k-icon-button">
                    ${kendo.ui.icon({ icon: `chevron-${isRtl ? "right" : "left"}`, iconClass: "k-button-icon" })}
                </button>
                <button tabindex="-1" ${actionAttr}="today" class="k-calendar-nav-today k-button ${size} k-button-flat k-button-flat-primary k-rounded-md" role="link">
                    <span class="k-button-text">${kendo.htmlEncode(messages.today)}</span>
                </button>
                <button tabindex="-1" ${actionAttr}=${isRtl ? "prev" : "next"} class="k-calendar-nav-next k-button ${size} k-button-flat k-button-flat-base k-rounded-md k-icon-button">
                    ${kendo.ui.icon({ icon: `chevron-${isRtl ? "left" : "right"}`, iconClass: "k-button-icon" })}
                </button>
            </span>
        </div>`;

    var Calendar = Widget.extend({
        init: function(element, options) {
            var that = this, value, id;
            options = options || {};
            options.componentType = options.componentType || "classic";
            Widget.fn.init.call(that, element, options);

            element = that.wrapper = that.element;
            options = that.options;

            options.url = kendo.unescape(options.url);

            that.options.disableDates = getDisabledExpr(that.options.disableDates);

            that._templates();

            that._selectable();

            that._header();

            that._viewWrapper();

            if (that.options.hasFooter) {
                that._footer(that.footer);
            } else {
                that._today = that.element.find('.k-calendar-nav-today');
                that._toggle();
            }

            id = element
                .addClass("k-calendar k-calendar-md " + (options.weekNumber ? " k-week-number" : ""))
                .on(MOUSEENTER_WITH_NS + " " + MOUSELEAVE, CELLSELECTOR, mousetoggle)
                .on(KEYDOWN_NS, "table.k-calendar-table", that._move.bind(that))
                .on(CLICK + " touchend", CELLSELECTORVALID, function(e) {
                    var link = e.currentTarget.firstChild,
                        value = toDateObject(link);

                    if ($(link).data("href").indexOf("#") != -1) {
                        e.preventDefault();
                    }

                    if (that._view.name == "month" && that.options.disableDates(value)) {
                        return;
                    }
                    if (that._view.name != "month" || that._isSingleSelection()) {
                            that._click($(link));
                    }
                })
                .on("mouseup" + ns, "table.k-calendar-table, .k-calendar-footer", function() {
                    that._focusView(that.options.focusOnNav !== false);
                })
                .attr(ID);

            if (that.options.weekNumber) {
                element.on(CLICK, WEEKCOLUMNSELECTOR, function(e) {
                        var first = $(e.currentTarget).closest("tr").find(CELLSELECTORVALID).first(),
                            last = $(e.currentTarget).closest("tr").find(CELLSELECTORVALID).last();

                        if (that._isMultipleSelection()) {
                            that.selectable._lastActive = last;
                            that.selectable.selectRange(first, last);
                            that.selectable.trigger(CHANGE, { event: e });
                        }

                        if (that._isRangeSelection()) {
                            that.rangeSelectable._lastActive = last;
                            that.rangeSelectable.range(first, last);
                            that.rangeSelectable.change();
                        }

                        that._current = that._value = toDateObject(last.find("span"));
                        that._setCurrent(that._current);
                });
            }

            normalize(options);
            value = parse(options.value, options.format, options.culture);
            that._selectDates = [];

            that._index = views[options.start];

            that._current = new DATE(+restrictValue(value, options.min, options.max));

            that._addClassProxy = function() {
                that._active = true;

                if (that._cell.hasClass(DISABLED)) {
                    var todayString = that._view.toDateString(getToday());
                    that._cell = that._cellByDate(todayString);
                }

                that._cell.addClass(FOCUSED);
            };

            that._removeClassProxy = function() {
                that._active = false;
                if (that._cell) {
                    that._cell.removeClass(FOCUSED);
                }
            };

            that.value(value);

            if (that._isMultipleSelection() && options.selectDates.length > 0) {
                that.selectDates(options.selectDates);
            }

            that._range = options.range;

            if (that._isRangeSelection()) {
                that.selectRange(that._range);
            }

            kendo.notify(that);
        },

        options: {
            name: "Calendar",
            value: null,
            min: new DATE(1900, 0, 1),
            max: new DATE(2099, 11, 31),
            dates: [],
            disableDates: null,
            allowReverse: false,
            centuryCellsFormat: "long",
            url: "",
            culture: "",
            footer: "",
            format: "",
            month: {},
            weekNumber: false,
            range: { start: null, end: null, target: START },
            selectable: "single",
            selectDates: [],
            start: MONTH,
            depth: MONTH,
            size: "medium",
            showOtherMonthDays: true,
            animation: {
                horizontal: {
                    effects: SLIDE,
                    reverse: true,
                    duration: 500,
                    divisor: 2
                },
                vertical: {
                    effects: "zoomIn",
                    duration: 400
                }
            },
            messages: {
                weekColumnHeader: "",
                today: "Today",
                navigateTo: "Navigate to ",
                parentViews: {
                    month: "year view",
                    year: "decade view",
                    decade: "century view"
                }
            },
            componentType: "classic"
        },

        events: [
            CHANGE,
            NAVIGATE
        ],

        componentTypes: {
            "classic": {
                header: {
                    template: CLASSIC_HEADER_TEMPLATE
                },
                hasFooter: true,
                linksSelector: ".k-button",
                contentClasses: "k-calendar-table"
            },
            "modern": {
                header: {
                    template: MODERN_HEADER_TEMPLATE
                },
                hasFooter: false,
                linksSelector: ".k-button",
                contentClasses: "k-calendar-table"
            }
        },

        setOptions: function(options) {
            let that = this,
            isComponentTypeChanged;

            isComponentTypeChanged = options.componentType ? true : false;

            normalize(options);

            options.disableDates = getDisabledExpr(options.disableDates);
            that._destroySelectable();

            if (options.messages) {
                options.messages = $.extend({}, true, that.options.messages, options.messages);
            }

            Widget.fn.setOptions.call(that, options);

            that._templates();

            that._selectable();

            if (isComponentTypeChanged) {
                let componentTypes = Calendar.prototype.componentTypes;

                that.options.header = componentTypes[options.componentType].header;
                that.options.hasFooter = componentTypes[options.componentType].hasFooter;
                let header = that.element.find(HEADERSELECTOR)[0];

                if (header) {
                    header.remove();
                }

                that._header();
            }

            that._viewWrapper();

            if (that.options.hasFooter) {
                that._footer(that.footer);
            } else {
                that.element.find(".k-calendar-footer").hide();
                that._toggle();
            }
            that._index = views[that.options.start];

            that.navigate();

            if (isComponentTypeChanged) {
                let value = parse(that.options.value, options.format, options.culture);
                that._current = new DATE(+restrictValue(value, options.min, options.max));
                that._cell = null;
                that._table = null;
                that.value(value);
            }

            if (options.weekNumber) {
                that.element.addClass('k-week-number');
            }
        },

        destroy: function() {
            var that = this,
            today = that._today;

            that.element.off(ns);
            that._title.off(ns);
            that[PREVARROW].off(ns);
            that[NEXTARROW].off(ns);
            that._destroySelectable();
            kendo.destroy(that._table);

            if (today) {
                kendo.destroy(today.off(ns));
            }

            Widget.fn.destroy.call(that);
        },

        current: function() {
            return this._current;
        },

        view: function() {
            return this._view;
        },

        focus: function(table) {
            table = table || this._table;
            this._bindTable(table);
            table.trigger("focus");
        },

        min: function(value) {
            return this._option(MIN, value);
        },

        max: function(value) {
            return this._option("max", value);
        },

        navigateToPast: function() {
            this._navigate(PREVARROW, -1);
        },

        navigateToFuture: function() {
            this._navigate(NEXTARROW, 1);
        },

        navigateUp: function() {
            var that = this,
            index = that._index;

            if (that._title.hasClass(DISABLED)) {
                return;
            }

            that.navigate(that._current, ++index);
        },

        navigateDown: function(value) {
            var that = this,
            index = that._index,
            depth = that.options.depth;

            if (!value) {
                return;
            }

            if (index === views[depth]) {
                if (!isEqualDate(that._value, that._current) || !isEqualDate(that._value, value)) {
                    that.value(value);
                    that.trigger(CHANGE);
                }
                return;
            }

            that.navigate(value, --index);
        },

        navigate: function(value, view) {
            view = isNaN(view) ? views[view] : view;

            var that = this,
                options = that.options,
                culture = options.culture,
                min = options.min,
                max = options.max,
                title = that._title,
                from = that._table,
                old = that._oldTable,
                currentValue = that._current,
                future = value && +value > +currentValue,
                vertical = view !== undefined && view !== that._index,
                to, currentView, compare,
                disabled,
                viewWrapper = that.element.children(".k-calendar-view");

            if (!value) {
                value = currentValue;
            }

            that._current = value = new DATE(+restrictValue(value, min, max));

            if (view === undefined) {
                view = that._index;
            } else {
                that._index = view;
            }

            that._view = currentView = calendar.views[view];
            compare = currentView.compare;

            disabled = view === views[CENTURY];
            title.toggleClass(DISABLED, disabled).attr(ARIA_DISABLED, disabled);

            disabled = compare(value, min) < 1;
            that[PREVARROW].toggleClass(DISABLED, disabled).attr(ARIA_DISABLED, disabled);

            disabled = compare(value, max) > -1;
            that[NEXTARROW].toggleClass(DISABLED, disabled).attr(ARIA_DISABLED, disabled);

            if (from && old && old.data("animating")) {
                old.kendoStop(true, true);
                from.kendoStop(true, true);
            }

            that._oldTable = from;

            if (!from || that._changeView) {
                title.html('<span class="k-button-text">' + currentView.title(value, min, max, culture) + '</span>');

                if (that.options.messages.parentViews && that._view.name !== CENTURY) {
                    title.attr("title", encode(that.options.messages.navigateTo + that.options.messages.parentViews[that._view.name]));
                } else {
                    title.removeAttr("title");
                }

                that._table = to = $(currentView.content(extend({
                    min: min,
                    max: max,
                    date: value,
                    url: options.url,
                    dates: options.dates,
                    format: options.format,
                    showOtherMonthDays: options.showOtherMonthDays,
                    centuryCellsFormat: options.centuryCellsFormat,
                    culture: culture,
                    disableDates: options.disableDates,
                    isWeekColumnVisible: options.weekNumber,
                    messages: options.messages,
                    contentClasses: that.options.contentClasses
                }, that[currentView.name])));

                that._aria();

                var replace = from && from.data("start") === to.data("start");
                that._animate({
                    from: from,
                    to: to,
                    vertical: vertical,
                    future: future,
                    replace: replace
                });

                viewWrapper.removeClass("k-calendar-monthview k-calendar-yearview k-calendar-decadeview k-calendar-centuryview");
                viewWrapper.addClass("k-calendar-" + currentView.name + "view");

                that.trigger(NAVIGATE);

                that._focus(value);
            }

            if (view === views[options.depth] && that._selectDates.length > 0) {
                that._visualizeSelectedDatesInView();
            }

            if (that._isSingleSelection()) {
                if (view === views[options.depth] && that._value && !that.options.disableDates(that._value)) {
                    that._selectCell(that._value);
                }
            }

            that._setCurrent(value);

            if (!from && that._cell) {
                that._cell.removeClass(FOCUSED);
            }

            that._changeView = true;
        },

        selectDates: function(dates) {
            var that = this,
                validSelectedDates,
                datesUnique;

            if (dates === undefined) {
                return that._selectDates;
            }

            datesUnique = dates
                .map(function(date) { return date.getTime(); })
                .filter(function(date, position, array) {
                    return array.indexOf(date) === position;
                })
                .map(function(time) { return new Date(time); });

            validSelectedDates = $.grep(datesUnique, function(value) {
                if (value) {
                    return +that._validateValue(new Date(value.setHours(0, 0, 0, 0))) === +value;
                }
            });
            that._selectDates = validSelectedDates.length > 0 ? validSelectedDates : (datesUnique.length === 0 ? datesUnique : that._selectDates);
            that._visualizeSelectedDatesInView();
        },

        value: function(value) {
            var that = this,
                old = that._view,
                view = that._view;

            if (value === undefined) {
                return that._value;
            }

            value = that._validateValue(value);
            if (value && that._isMultipleSelection()) {
                var date = new Date(+value);
                date.setHours(0, 0, 0, 0);
                that._selectDates = [date];
                that.selectable._lastActive = null;
            }

            if (old && value === null && that._cell) {
                that._cell.removeClass(SELECTED);
            } else {
                that._changeView = !value || view && view.compare(value, that._current) !== 0;
                that.navigate(value);
            }
        },

        isRtl: function() {
            return kendo.support.isRtl(this.wrapper);
        },

        _aria: function() {
            var table = this._table;

            table.attr("aria-labelledby", this._title.attr("id"));

            if (this._view.name === "month" && this._isMultipleSelection()) {
                table.attr("aria-multiselectable", "true");
            }
        },

        _validateValue: function(value) {
            var that = this,
                options = that.options,
                min = options.min,
                max = options.max;

            if (value === null) {
                that._current = createDate(that._current.getFullYear(), that._current.getMonth(), that._current.getDate());
            }

            value = parse(value, options.format, options.culture);

            if (value !== null) {
                value = new DATE(+value);

                if (!isInRange(value, min, max)) {
                    value = null;
                }
            }

            if (value === null || !that.options.disableDates(new Date(+value))) {
                that._value = value;
            } else if (that._value === undefined) {
                that._value = null;
            }

            return that._value;
        },

        _visualizeSelectedDatesInView: function() {
            var that = this;
             var selectedDates = {};
            $.each(that._selectDates, function(index, value) {
                selectedDates[kendo.calendar.views[0].toDateString(value)] = value;
            });
            that.selectable.clear();
             var cells = that._table
                .find(CELLSELECTOR)
                .filter(function(index, element) {
                    return selectedDates[$(element.firstChild).attr(kendo.attr(VALUE))];
                });
            if (cells.length > 0) {
                that.selectable._selectElement(cells, true);
            }
        },

        _isSingleSelection: function() {
            let selectable = this.options.selectable,
            selectableOptions = Selectable.parseOptions(selectable);
            return selectableOptions.single;
        },

        _isMultipleSelection: function() {
            let selectable = this.options.selectable,
            selectableOptions = Selectable.parseOptions(selectable);
            return selectableOptions.multiple;
        },

        _isRangeSelection: function() {
            let selectable = this.options.selectable,
            selectableOptions = Selectable.parseOptions(selectable);
            return selectableOptions.range;
        },

        _selectable: function() {
            let that = this,
                selectable = that.options.selectable,
                selectableOptions = Selectable.parseOptions(selectable);

            if (!that._isMultipleSelection() && !that._isRangeSelection()) {
                return;
            }

            if (that.rangeSelectable) {
                that.rangeSelectable.destroy();
                that.rangeSelectable = null;
            }

            if (selectableOptions.range) {
                that.rangeSelectable = new RangeSelectable(that.wrapper, {
                    widget: that,
                    filter: ".k-calendar-monthview table " + CELLSELECTORVALID,
                    cellSelector: CELLSELECTOR,
                    cellSelectorValid: CELLSELECTORVALID,
                    change: that._onSelect.bind(that),
                    reverse: that.options.allowReverse,
                    resetOnStart: true,
                    ns: ns
                });

                that.element.addClass("k-calendar-range");
            } else {
                that.selectable = new Selectable(that.wrapper, {
                    aria: true,
                    //excludes the anchor element
                    inputSelectors: "input,textarea,.k-multiselect-wrap,select,button,.k-button>span,.k-button>img,span.k-icon.k-i-caret-alt-down,span.k-icon.k-i-caret-alt-up,span.k-svg-icon.k-svg-i-caret-alt-down,span.k-svg-icon.k-svg-i-caret-alt-up",
                    multiple: selectableOptions.multiple,
                    filter: "table.k-calendar-table:eq(0) " + CELLSELECTORVALID,
                    change: that._onSelect.bind(that),
                    relatedTarget: that._onRelatedTarget.bind(that)
                });
            }
        },

        _restoreSelection: function() {
            const that = this;
            let range;

            that._preventChange = true;

            if (that._isRangeSelection()) {
                range = that.selectRange();

                if (!range || !range.start) {
                    that._preventChange = false;
                    return;
                }

                that.selectRange(range);
            }

            that._preventChange = false;
        },

        selectRange: function(range) {
            const that = this, view = that._view;
            let startInRange, endInRange, visibleRange;

            if (range === undefined) {
                return that._range;
            }

            that._range = range;

            if (!range.start) {
                return;
            }

            visibleRange = that._visibleRange();

            startInRange = that._dateInViews(range.start);
            endInRange = range.end && that._dateInViews(range.end);

            if (!startInRange && endInRange) {
                that.rangeSelectable.selectTo(that._cellByDate(view.toDateString(range.end)));
            }

            if (startInRange && endInRange) {
                that.rangeSelectable.range(that._cellByDate(view.toDateString(range.start)), that._cellByDate(view.toDateString(range.end)), false, that.options.allowReverse);
            }

            if (range.end && startInRange && !endInRange) {
                that.rangeSelectable.selectFrom(that._cellByDate(view.toDateString(range.start)));
            }

            if (!range.end && startInRange) {
                that.rangeSelectable.start(that._cellByDate(view.toDateString(range.start)));
            }

            if (+visibleRange.start > +range.start && +visibleRange.end < +range.end) {
                that.rangeSelectable.mid(that.element.find(CELLSELECTORVALID));
            }
        },

        _onRelatedTarget: function(target) {
            var that = this;

            if (that.selectable.options.multiple && target.is(CELLSELECTORVALID)) {
                that._current = toDateObject(target.find("span"));
                that._setCurrent(that._current);
            }

        },

        _onSelect: function(e) {
            let that = this,
                eventArgs = e,
                range,
                useEnd = e.sender._useEnd,
                useStart = e.sender._useStart,
                initialRange,
                start,
                end,
                value,
                target,
                selectableOptions = Selectable.parseOptions(that.options.selectable);

            if (that._isRangeSelection()) {
                range = e.sender.range();
                initialRange = that.selectRange() || {};
                target = initialRange.target;
                if (range.start && range.start.length) {
                    start = toDateObject(range.start.find("span"));
                }

                if (range.end && range.end.length) {
                    end = toDateObject(range.end.find("span"));
                }

                if (target === END) {
                    target = START;
                } else {
                    target = END;
                }

                that._range = { start: useStart ? initialRange.start : start, end: useEnd ? initialRange.end : end, target: target };

                if (!that._preventChange) {
                    that.trigger(CHANGE);
                }

                value = end || start;

                if (end && !that._dateInViews(end)) {
                    value = start;
                }

                that.selectRange(that._range);
                that.value(value);
                return;
            }

            if (!selectableOptions.multiple) {
                if ($(eventArgs.event.currentTarget).is("td") && !$(eventArgs.event.currentTarget).hasClass("k-selected")) {
                    $(eventArgs.event.currentTarget).addClass("k-selected");
                }
                else {
                    that._click($(eventArgs.event.currentTarget).find("span"));
                }
                return;
            }

            if (eventArgs.event.ctrlKey || eventArgs.event.metaKey) {
                if ($(eventArgs.event.currentTarget).is(CELLSELECTORVALID)) {
                    that._toggleSelection($(eventArgs.event.currentTarget));
                }
                else {
                    that._cellsBySelector(CELLSELECTORVALID).each(function(index, element) {
                        var value = toDateObject($(element).find("span"));
                        that._deselect(value);
                    });
                    that._addSelectedCellsToArray();
                }
            }
            else if (eventArgs.event.shiftKey) {
                that._rangeSelection(that._cell);
            }
            else if ($(eventArgs.event.currentTarget).is(CELLSELECTOR)) {
                that.value(toDateObject($(eventArgs.event.currentTarget).find("span")));
            }
            else {
                that._selectDates = [];
                that._addSelectedCellsToArray();
            }
             that.trigger(CHANGE);
        },

        _destroySelectable: function() {
            var that = this;

            if (that.selectable) {
                that.selectable.destroy();
                that.selectable = null;
            }

            if (that.rangeSelectable) {
                that.rangeSelectable.destroy();
                that.rangeSelectable = null;
            }
        },

        //when ctrl key is clicked
        _toggleSelection: function(currentCell) {
            var that = this,
                date = toDateObject(currentCell.find("span"));
                if (currentCell.hasClass("k-selected")) {
                    that._selectDates.push(date);
                }
                else {
                    that._deselect(date);
                }
        },

        //shift selection
        _rangeSelection: function(toDateCell, startDate) {
            var that = this,
                fromDate = startDate || toDateObject(that.selectable.value().first().find("span")),
                toDate = toDateObject(toDateCell.find("span")),
                daysDifference;

            if (that.selectable._lastActive || that._value) {
                fromDate = that.selectable._lastActive ? toDateObject(that.selectable._lastActive.find("span")) : new Date(+that._value);
            } else {
                that.selectable._lastActive = startDate ? that._cellByDate(that._view.toDateString(startDate), CELLSELECTORVALID) : that.selectable.value().first();
            }

            that._selectDates = [];
            daysDifference = daysBetweenTwoDates(fromDate, toDate);
            addDaysToArray(that._selectDates, daysDifference, fromDate, that.options.disableDates);

            that._visualizeSelectedDatesInView();
        },

        _visibleRange: function() {
            let table = this.element.find(DOT + CALENDAR_VIEW + EMPTY + TABLE),
                firstDateInView = toDateObject(table.first().find(CELLSELECTOR).first().find("span")),
                lastDateInView = toDateObject(table.last().find(CELLSELECTOR).last().find("span"));
            return { start: firstDateInView, end: lastDateInView };
        },

        _cellsBySelector: function(selector) {
            var that = this;
            return that._table.find(selector);
        },

        _addSelectedCellsToArray: function() {
            var that = this;
            that.selectable.value().each(function(index, item) {
                var date = toDateObject($(item.firstChild));
                if (!that.options.disableDates(date)) {
                    that._selectDates.push(date);
                }
            });
        },

         _deselect: function(date) {
            var that = this;
             var currentDateIndex = that._selectDates.map(Number).indexOf(+date);
            if (currentDateIndex != -1) {
                that._selectDates.splice(currentDateIndex, 1);
            }
        },

        _dateInView: function(date) {
            var that = this,
                firstDateInView = toDateObject(that._cellsBySelector(CELLSELECTORVALID).first().find("span")),
                lastDateInView = toDateObject(that._cellsBySelector(CELLSELECTORVALID).last().find("span"));

            return +date <= +lastDateInView && +date >= +firstDateInView;
        },

        _isNavigatable: function(currentValue, cellIndex) {
            var that = this;
            var isDisabled = that.options.disableDates;
            var cell;
            var index;

            if (that._view.name == "month") {
                return !isDisabled(currentValue);
            } else {
                index = that.wrapper.find("." + FOCUSED).index();
                cell = that.wrapper.find(".k-calendar-table td").eq(index + cellIndex);
                return cell.is(CELLSELECTORVALID) || !isDisabled(currentValue);
            }
        },

        _dateInViews: function(date) {
            let that = this,
                tables = that.element.find(".k-calendar-view table"),
                firstDateInView = toDateObject(tables.first().find(CELLSELECTOR).first().find("span")),
                lastDateInView = toDateObject(tables.last().find(CELLSELECTOR).last().find("span"));

            date = new Date(date.toDateString());

            return +date <= +lastDateInView && +date >= +firstDateInView;
        },

        _move: function(e) {
            var that = this,
                options = that.options,
                key = e.keyCode,
                view = that._view,
                index = that._index,
                min = that.options.min,
                max = that.options.max,
                currentValue = new DATE(+that._current),
                isRtl = that.isRtl(),
                isDisabled = that.options.disableDates,
                value, prevent, method, temp, cell, focusedCell, lastActive;

            if (e.target === that._table[0]) {
                that._active = true;
            }

            if (key == keys.RIGHT && !isRtl || key == keys.LEFT && isRtl) {
                value = 1;
                prevent = true;
            } else if (key == keys.LEFT && !isRtl || key == keys.RIGHT && isRtl) {
                value = -1;
                prevent = true;
            } else if (key == keys.UP) {
                value = index === 0 ? -7 : -4;
                prevent = true;
            } else if (key == keys.DOWN) {
                value = index === 0 ? 7 : 4;
                prevent = true;
            } else if (key == keys.SPACEBAR) {
                value = 0;
                prevent = true;
            } else if (key == keys.HOME || key == keys.END) {
                method = key == keys.HOME ? "first" : "last";
                temp = view[method](currentValue);
                currentValue = new DATE(temp.getFullYear(), temp.getMonth(), temp.getDate(), currentValue.getHours(), currentValue.getMinutes(), currentValue.getSeconds(), currentValue.getMilliseconds());
                currentValue.setFullYear(temp.getFullYear());
                prevent = true;
            } else if (key === 84) {
                that._todayClick(e);
                prevent = true;
            }

            if (e.ctrlKey || e.metaKey) {
                if (key == keys.RIGHT && !isRtl || key == keys.LEFT && isRtl) {
                    that.navigateToFuture();
                    prevent = true;
                } else if (key == keys.LEFT && !isRtl || key == keys.RIGHT && isRtl) {
                    that.navigateToPast();
                    prevent = true;
                } else if (key == keys.UP) {
                    that.navigateUp();
                    prevent = true;
                } else if (key == keys.DOWN) {
                    that._click($(that._cell[0].firstChild));
                    prevent = true;
                }
                  else if ((key == keys.ENTER || key == keys.SPACEBAR) && that._isMultipleSelection()) {
                    that._keyboardToggleSelection(e);

                    var focusedDate = toDateObject($(that._cell[0]).find("span"));
                    that._setCurrent(focusedDate);

                }
            } else if (e.shiftKey) {
                if (value !== undefined || method) {
                    if (!method) {
                        view.setDate(currentValue, value);
                    }

                    if (!isInRange(currentValue, min, max)) {
                        currentValue = restrictValue(currentValue, options.min, options.max);
                    }

                    if (isDisabled(currentValue)) {
                        currentValue = that._nextNavigatable(currentValue, value);
                    }

                    min = createDate(min.getFullYear(), min.getMonth(), min.getDate());
                    if (that._isMultipleSelection()) {
                        that._keyboardRangeSelection(e, currentValue);
                    } else if (that._isRangeSelection()) {
                        if (!that._dateInViews(currentValue)) {
                            if (value > 0) {
                                that.navigateToFuture();
                            } else {
                                that.navigateToPast();
                            }
                        }
                    } else {
                        that._focus(currentValue);
                    }
                }

                if (that.rangeSelectable) {
                    cell = that._cellByDate(view.toDateString(currentValue));
                    lastActive = toDateObject((that.rangeSelectable._lastActive || focusedCell).find("span"));
                    if (!that._dateInViews(lastActive)) {
                        if (+lastActive > +currentValue) {
                            that.rangeSelectable._end = that.rangeSelectable._lastActive;
                            that.rangeSelectable.selectFrom(cell);
                        } else {
                            that.rangeSelectable.selectTo(cell);
                        }
                    } else {
                        if (that.rangeSelectable._end && that.rangeSelectable._end.is("." + FOCUSED)) {
                            that.rangeSelectable._lastActive = that.rangeSelectable._start;
                        } else {
                            that.rangeSelectable._lastActive = that._cellByDate(view.toDateString(lastActive));
                        }
                        that.rangeSelectable.range(that.rangeSelectable._lastActive, cell);
                    }
                    that.rangeSelectable.change();
                    that._setCurrent(currentValue);
                }
            } else {
                if (key == keys.ENTER || key == keys.SPACEBAR) {
                    if (view.name == "month" && that._isMultipleSelection()) {
                        that.value(toDateObject($(that._cell.find("span"))));
                        that.selectable._lastActive = $(that._cell[0]);
                        that.trigger(CHANGE);
                    } else if (that.rangeSelectable) {
                        that.rangeSelectable.change();
                    } else {
                        that._click($(that._cell[0].firstChild));
                    }
                    prevent = true;
                } else if (key == keys.PAGEUP) {
                    prevent = true;
                    that.navigateToPast();
                } else if (key == keys.PAGEDOWN) {
                    prevent = true;
                    that.navigateToFuture();
                }

                if (value || method) {
                    if (!method) {
                        view.setDate(currentValue, value);
                    }

                    min = createDate(min.getFullYear(), min.getMonth(), min.getDate());

                    if (!isInRange(currentValue, min, max)) {
                        currentValue = restrictValue(currentValue, options.min, options.max);
                    }

                    if (!that._isNavigatable(currentValue, value)) {
                        currentValue = that._nextNavigatable(currentValue, value);
                    }

                    if (that._isMultipleSelection()) {
                        if (!that._dateInView(currentValue)) {
                            that.navigate(currentValue);
                        }
                        else {
                            that._current = currentValue;
                            that._setCurrent(currentValue);
                        }
                    }
                    else {
                        that._focus(currentValue);
                    }
                }
            }

            if (prevent) {
                e.preventDefault();
            }

            return that._current;
        },

        _keyboardRangeSelection: function(event, currentValue) {
            var that = this,
                fromDate,
                daysDifference;

            if (!that._dateInView(currentValue)) {
                that._selectDates = [];

                fromDate = that.selectable._lastActive ? toDateObject(that.selectable._lastActive.find("span")) : currentValue;
                daysDifference = daysBetweenTwoDates(fromDate, new Date(+currentValue));

                addDaysToArray(that._selectDates, daysDifference, fromDate, that.options.disableDates);

                that.navigate(currentValue);
                that._current = currentValue;
                that.selectable._lastActive = that.selectable._lastActive || that._cellByDate(that._view.toDateString(currentValue), CELLSELECTORVALID);
                that.trigger(CHANGE);
                return;
            }
            that.selectable.options.filter = that.wrapper.find("table").length > 1 && +currentValue > +that._current ? "table.k-calendar-table:eq(1) " + CELLSELECTORVALID : "table.k-calendar-table:eq(0) " + CELLSELECTORVALID;
            that._setCurrent(currentValue);
            that._current = currentValue;

            that._rangeSelection(that._cellByDate(that._view.toDateString(currentValue), CELLSELECTORVALID), currentValue);

            that.trigger(CHANGE);

            that.selectable.options.filter = "table.k-calendar-table:eq(0) " + CELLSELECTORVALID;
        },

        _keyboardToggleSelection: function(event) {
            var that = this;

            event.currentTarget = that._cell[0];
            that.selectable._lastActive = $(that._cell[0]);

            if ($(that._cell[0]).hasClass(SELECTED)) {
                that.selectable._unselect($(that._cell[0]));
            }
            else {
                that.selectable.value($(that._cell[0]));
            }
            that.selectable.trigger(CHANGE, { event: event });
        },

        _nextNavigatable: function(currentValue, value) {
            var that = this,
            disabled = true,
            view = that._view,
            min = that.options.min,
            max = that.options.max,
            isDisabled = that.options.disableDates,
            navigatableDate = new Date(currentValue.getTime());

            view.setDate(navigatableDate, -value);

            while (disabled) {
                view.setDate(currentValue, value);

                if (!isInRange(currentValue, min, max)) {
                    currentValue = navigatableDate;
                    break;
                }
                disabled = isDisabled(currentValue);
            }
            return currentValue;
        },

        _animate: function(options) {
            var that = this;
            var from = options.from;
            var to = options.to;
            var active = that._active;
            var viewWrapper = that.element.children(".k-calendar-view");

            if (!from) {
                viewWrapper.append(to);
                that._bindTable(to);
            } else if (from.parent().data("animating")) {
                from.off(ns);
                from.parent().kendoStop(true, true).remove();
                from.remove();

                viewWrapper.append(to);
                that._focusView(active);
            } else if (!from.is(":visible") || that.options.animation === false || options.replace) {
                to.insertAfter(from);
                from.off(ns).remove();

                that._focusView(active);
            } else {
                that[options.vertical ? "_vertical" : "_horizontal"](from, to, options.future);
            }
        },

        _horizontal: function(from, to, future) {
            var that = this,
                active = that._active,
                horizontal = that.options.animation.horizontal,
                effects = horizontal.effects,
                viewWidth = outerWidth(from),
                margin = (outerWidth(from, true) - viewWidth);

            if (effects && effects.indexOf(SLIDE) != -1) {
                from.add(to).css({ width: viewWidth });

                from.wrap("<div/>");

                that._focusView(active, from);

                from.parent()
                .css({
                    position: "relative",
                    width: (viewWidth * 2) + (2 * margin),
                    display: "flex",
                    [future ? "margin-right" : "margin-left"]: (-viewWidth - margin)
                });

                to[future ? "insertAfter" : "insertBefore"](from);

                extend(horizontal, {
                    effects: SLIDE + ":" + (future ? "right" : LEFT),
                    complete: function() {
                        from.off(ns).remove();
                        that._oldTable = null;

                        to.unwrap();

                        that._focusView(active);

                    }
                });

                from.parent().kendoStop(true, true).kendoAnimate(horizontal);
            }
        },

        _vertical: function(from, to) {
            var that = this,
                vertical = that.options.animation.vertical,
                effects = vertical.effects,
                active = that._active, //active state before from's blur
                cell, position;

            if (effects && effects.indexOf("zoom") != -1) {
                to.insertBefore(from);

                from.css({
                    position: "absolute",
                    width: to.width()
                });

                if (transitionOrigin) {
                    cell = that._cellByDate(that._view.toDateString(that._current));
                    position = cell.position();
                    position = (position.left + parseInt(cell.width() / 2, 10)) + "px" + " " + (position.top + parseInt(cell.height() / 2, 10) + "px");
                    to.css(transitionOrigin, position);
                }

                from.kendoStop(true, true).kendoAnimate({
                    effects: "fadeOut",
                    duration: 600,
                    complete: function() {
                        from.off(ns).remove();
                        that._oldTable = null;

                        that._focusView(active);
                    }
                });

                to.kendoStop(true, true).kendoAnimate(vertical);
            }
        },

        _cellByDate: function(value, selector) {
            return this._table.find(selector ? selector : "td:not(." + OTHERMONTH + ")")
            .filter(function() {
                return $(this.firstChild).attr(kendo.attr(VALUE)) === value;
            });
        },

        _selectCell: function(date) {
            var that = this,
                cell = that._selectedCell,
                value = that._view.toDateString(date);

                if (cell && cell[0]) {
                    cell[0].removeAttribute(ARIA_SELECTED);
                    cell.removeClass(SELECTED);
                }

                cell = that._cellByDate(value, CELLSELECTOR);

                that._selectedCell = cell;
                cell.addClass(SELECTED)
                    .attr(ARIA_SELECTED, true);
        },

        _setCurrent: function(date) {
            var that = this,
                id = kendo.guid(),
                cell = that._cell,
                value = that._view.toDateString(date);

                if (cell && cell[0]) {
                    cell.removeClass(FOCUSED);
                    cell[0].removeAttribute(ARIA_LABEL);
                    cell[0].removeAttribute(ID);
                }

                cell = that._cellByDate(value, that._isMultipleSelection() ? CELLSELECTOR : "td:not(." + OTHERMONTH + ")");

                that._cell = cell;

                cell.attr(ID, id)
                    .addClass(FOCUSED);

                if (that._table[0]) {
                    that._table[0].removeAttribute("aria-activedescendant");
                    that._table.attr("aria-activedescendant", id);
                }
        },

        _bindTable: function(table) {
            table
            .on(FOCUS_WITH_NS, this._addClassProxy)
            .on(BLUR, this._removeClassProxy);
        },

        _click: function(link) {
            var that = this,
            options = that.options,
            currentValue = new Date(+that._current),
            value = toDateObject(link);

            adjustDST(value, 0);

            if (that._view.name == "month" && that.options.disableDates(value)) {
                value = that._value;
            }

            that._view.setDate(currentValue, value);

            that.navigateDown(restrictValue(currentValue, options.min, options.max));
        },

        _focus: function(value) {
            var that = this,
            view = that._view;

            if (view.compare(value, that._current) !== 0) {
                that.navigate(value);
            } else {
                that._current = value;
                that._setCurrent(value);
            }
        },

        _focusView: function(active, table) {
            if (active) {
                this.focus(table);
            }
        },

        _viewWrapper: function() {
            var that = this;
            var element = that.element;
            var viewWrapper = element.children(".k-calendar-view");

            if (!viewWrapper[0]) {
                viewWrapper = $("<div class='k-calendar-view k-align-items-start k-justify-content-center k-hstack' />").insertAfter(element.find(HEADERSELECTOR));
            }
        },

        _footer: function(template) {
            var that = this,
            today = getToday(),
            element = that.element,
            footer = element.find(".k-calendar-footer");

            if (!template) {
                that._toggle(false);
                footer.hide();
                return;
            }

            if (!footer[0]) {
                footer = $(`<div class="k-calendar-footer">
                    <button tabindex="-1" class="k-calendar-nav-today k-flex k-button k-button-md k-button-flat k-button-flat-primary k-rounded-md" role="link">
                        <span class="k-button-text"></span>
                    </button>
                </div>`).appendTo(element);
            }

            that._today = footer.show()
                .find(".k-button-flat-primary")
                .attr("title", kendo.toString(today, "D", that.options.culture));

            footer.find(".k-button-text")
                .html(template(today));

            that._toggle();
        },

        _header: function() {
            var that = this,
            element = that.element,
            linksSelector = that.options.linksSelector;

            if (!element.find(HEADERSELECTOR)[0]) {
                element.html(kendo.template(that.options.header.template)($.extend(true,{}, that.options, {
                    actionAttr: kendo.attr("action"),
                    size: kendo.getValidCssClass("k-button-", "size", that.options.size),
                    isRtl: that.isRtl()
                })));
            }

            element.find(linksSelector)
                .on(CLICK + " touchend" + ns, function() { return false; } );

            that._title = element.find('[' + kendo.attr("action") + '="nav-up"]').on(CLICK + " touchend" + ns, function() {
                that._active = that.options.focusOnNav !== false;
                that.navigateUp();
            });
            that[PREVARROW] = element.find('[' + kendo.attr("action") + '="prev"]').on(CLICK + " touchend" + ns, function() {
                that._active = that.options.focusOnNav !== false;
                that.navigateToPast();
            });
            that[NEXTARROW] = element.find('[' + kendo.attr("action") + '="next"]').on(CLICK + " touchend" + ns, function() {
                that._active = that.options.focusOnNav !== false;
                that.navigateToFuture();
            });
            element.find('[' + kendo.attr("action") + '="today"]').on(CLICK + " touchend" + ns, that._todayClick.bind(that));

        },

        _navigate: function(arrow, modifier) {
            var that = this,
            index = that._index + 1,
            currentValue = new DATE(+that._current);

            if (that._isMultipleSelection()) {
                var firstDayCurrentMonth = that._table.find("td:not(." + OTHERMONTH + "):not(." + EMPTYCELL + ")").has(".k-link").first();
                currentValue = toDateObject(firstDayCurrentMonth.find("span"));
                that._current = new Date(+currentValue);
            }

            arrow = that[arrow];

            if (!arrow.hasClass(DISABLED)) {
                if (index > 3) {
                    currentValue.setFullYear(currentValue.getFullYear() + 100 * modifier);
                } else {
                    calendar.views[index].setDate(currentValue, modifier);
                }

                that.navigate(currentValue);
                that._restoreSelection();
            }
        },

        _option: function(option, value) {
            var that = this,
                options = that.options,
                currentValue = that._value || that._current,
                isBigger;

            if (value === undefined) {
                return options[option];
            }

            value = parse(value, options.format, options.culture);

            if (!value) {
                return;
            }

            options[option] = new DATE(+value);

            if (option === MIN) {
                isBigger = value > currentValue;
            } else {
                isBigger = currentValue > value;
            }

            if (isBigger || isEqualMonth(currentValue, value)) {
                if (isBigger) {
                    that._value = null;
                }
                that._changeView = true;
            }

            if (!that._changeView) {
                that._changeView = !!(options.month.content || options.month.empty);
            }

            that.navigate(that._value);

            that._toggle();
        },

        _toggle: function(toggle) {
            var that = this,
                options = that.options,
                isTodayDisabled = that.options.disableDates(getToday()),
                link = that._today,
                todayClass = that._todayClass();

            if (toggle === undefined) {
                toggle = isInRange(getToday(), options.min, options.max);
            }

            if (link) {
                link.off(CLICK);

                if (toggle && !isTodayDisabled) {
                    link.addClass(todayClass)
                    .removeClass(DISABLED)
                    .on(CLICK, that._todayClick.bind(that));
                } else {
                    link.removeClass(todayClass)
                    .addClass(DISABLED)
                    .on(CLICK, prevent);
                }
            }
        },

        _todayClass: function() {
            return TODAY;
        },

        _todayClick: function(e) {
            var that = this,
            depth = views[that.options.depth],
            disabled = that.options.disableDates,
            today = getToday();

            e.preventDefault();

            if (disabled(today)) {
                return;
            }

            if (that._view.compare(that._current, today) === 0 && that._index == depth) {
                that._changeView = false;
            }

            if (that._isMultipleSelection()) {
                that._selectDates = [today];
                that.selectable._lastActive = null;
            }

            that._value = today;
            that.navigate(today, depth);

            that.trigger(CHANGE);
        },

        _templates: function() {
            var that = this,
                options = that.options,
                footer = options.footer,
                month = options.month,
                content = month.content,
                weekNumber = month.weekNumber,
                empty = month.empty,
                footerTemplate = (data) => `${kendo.toString(data,"D",options.culture)}`;

            that.month = {
                content: (data) => `<td class="${data.cssClass}" role="gridcell"><span tabindex="-1" class="k-link ${data.linkClass}" data-href="${data.url}" ${kendo.attr(VALUE)}="${data.dateString}" title="${data.title}">${executeTemplate(content, data) || data.value}</span></td>`,
                empty: (data) => `<td role="gridcell">${executeTemplate(empty, data) || "&nbsp;"}</td>`,
                weekNumber: (data) => `<td class="k-calendar-td k-alt">${executeTemplate(weekNumber, data) || data.weekNumber}</td>`
            };

            that.year = {
                content: template((data) => `<td class="${data.cssClass}" role="gridcell"><span tabindex="-1" class="k-link" data-href="#" data-${data.ns}value="${data.dateString}" aria-label="${data.label}">${data.value}</span></td>`)
            };

            if (footer && footer !== true) {
                footerTemplate = footer;
            }

            that.footer = footer !== false ? template(footerTemplate, { useWithBlock: false }) : null;
        },

        _updateAria: function(ariaTemplate, date) {
            var that = this;
            var cell = that._cell;
            var valueType = that.view().valueType();
            var current = date || that.current();
            var text;

            if (valueType === "month") {
                text = kendo.toString(current, "MMMM");
            } else if (valueType === "date") {
                text = kendo.toString(current, "D");
            } else {
                text = cell.text();
            }

            cell.attr("aria-label", ariaTemplate({ current: current, valueType: valueType, text: text }));

            return cell.attr("id");
        }
    });

    ui.plugin(Calendar);

    var calendar = {
        firstDayOfMonth: function(date) {
            return createDate(
                date.getFullYear(),
                date.getMonth(),
                1
            );
        },

        firstVisibleDay: function(date, calendarInfo) {
            calendarInfo = calendarInfo || kendo.culture().calendar;

            var firstDay = calendarInfo.firstDay,
            firstVisibleDay = new DATE(date.getFullYear(), date.getMonth(), 1, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
            firstVisibleDay.setFullYear(date.getFullYear());

            while (firstVisibleDay.getDay() != firstDay) {
                calendar.setTime(firstVisibleDay, -1 * MS_PER_DAY);
            }

            return firstVisibleDay;
        },

        setTime: function(date, time) {
            var tzOffsetBefore = date.getTimezoneOffset(),
            resultDATE = new DATE(date.getTime() + time),
            tzOffsetDiff = resultDATE.getTimezoneOffset() - tzOffsetBefore;

            date.setTime(resultDATE.getTime() + tzOffsetDiff * MS_PER_MINUTE);
        },
        views: [{
            name: MONTH,
            title: function(date, min, max, culture) {
                return getCalendarInfo(culture).months.names[date.getMonth()] + " " + date.getFullYear();
            },
            content: function(options) {
                var that = this,
                    idx = 0,
                    min = options.min,
                    max = options.max,
                    date = options.date,
                    dates = options.dates,
                    format = options.format,
                    culture = options.culture,
                    navigateUrl = options.url,
                    showHeader = options.showHeader,
                    showOtherMonthDays = options.showOtherMonthDays,
                    isWeekColumnVisible = options.isWeekColumnVisible,
                    hasUrl = navigateUrl && dates[0],
                    currentCalendar = getCalendarInfo(culture),
                    firstDayIdx = currentCalendar.firstDay,
                    days = currentCalendar.days,
                    names = shiftArray(days.names, firstDayIdx),
                    shortNames = shiftArray(days.namesShort, firstDayIdx),
                    start = calendar.firstVisibleDay(date, currentCalendar),
                    firstDayOfMonth = that.first(date),
                    lastDayOfMonth = that.last(date),
                    toDateString = that.toDateString,
                    today = getToday(),
                    contentClasses = options.contentClasses,
                    html = '<table tabindex="0" role="grid" class="' + contentClasses + '" cellspacing="0" data-start="' + toDateString(start) + '">';

                if (showHeader) {
                    html += '<caption class="k-calendar-caption k-month-header">' + this.title(date, min, max, culture) + '</caption>';
                }

                html += '<thead class="k-calendar-thead"><tr role="row" class="k-calendar-tr">';

                if (isWeekColumnVisible) {
                    html += '<th scope="col" class="k-calendar-th k-alt">' + encode(options.messages.weekColumnHeader) + '</th>';
                }

                for (; idx < 7; idx++) {
                    html += '<th scope="col" class="k-calendar-th" aria-label="' + names[idx] + '">' + shortNames[idx] + '</th>';
                }

                adjustDST(today, 0);
                today = +today;

                return view({
                    cells: 42,
                    perRow: 7,
                    html: html += '</tr></thead><tbody class="k-calendar-tbody"><tr role="row" class="k-calendar-tr">',
                    start: createDate(start.getFullYear(), start.getMonth(), start.getDate()),
                    isWeekColumnVisible: isWeekColumnVisible,
                    weekNumber: options.weekNumber,
                    min: createDate(min.getFullYear(), min.getMonth(), min.getDate()),
                    max: createDate(max.getFullYear(), max.getMonth(), max.getDate()),
                    showOtherMonthDays: showOtherMonthDays,
                    content: options.content,
                    lastDayOfMonth: lastDayOfMonth,
                    empty: options.empty,
                    setter: that.setDate,
                    disableDates: options.disableDates,
                    build: function(date, idx, disableDates) {
                        var cssClass = [ "k-calendar-td" ],
                            day = date.getDay(),
                            linkClass = "",
                            url = "#";

                        if (date < firstDayOfMonth || date > lastDayOfMonth) {
                            cssClass.push(OTHERMONTH);
                        }

                        if (disableDates(date)) {
                            cssClass.push(DISABLED);
                        }

                        if (+date === today) {
                            cssClass.push("k-today");
                        }

                        if (day === 0 || day === 6) {
                            cssClass.push("k-weekend");
                        }

                        if (hasUrl && inArray(+date, dates)) {
                            url = navigateUrl.replace("{0}", kendo.toString(date, format, culture));
                            linkClass = " k-action-link";
                        }

                        return {
                            date: date,
                            dates: dates,
                            ns: kendo.ns,
                            title: kendo.toString(date, "D", culture),
                            value: date.getDate(),
                            dateString: toDateString(date),
                            cssClass: cssClass.join(" "),
                            linkClass: linkClass,
                            url: url
                        };
                    },
                    weekNumberBuild: function(date) {
                        return {
                            weekNumber: weekInYear(date, kendo.culture().calendar.firstDay),
                            currentDate: date
                        };
                    }
                });
            },
            first: function(date) {
                return calendar.firstDayOfMonth(date);
            },
            last: function(date) {
                var last = createDate(date.getFullYear(), date.getMonth() + 1, 0),
                first = calendar.firstDayOfMonth(date),
                timeOffset = Math.abs(last.getTimezoneOffset() - first.getTimezoneOffset());

                if (timeOffset) {
                    last.setHours(first.getHours() + (timeOffset / 60));
                }

                return last;
            },
            compare: function(date1, date2) {
                var result,
                month1 = date1.getMonth(),
                year1 = date1.getFullYear(),
                month2 = date2.getMonth(),
                year2 = date2.getFullYear();

                if (year1 > year2) {
                    result = 1;
                } else if (year1 < year2) {
                    result = -1;
                } else {
                    result = month1 == month2 ? 0 : month1 > month2 ? 1 : -1;
                }

                return result;
            },
            setDate: function(date, value) {
                var hours = date.getHours();
                if (value instanceof DATE) {
                    date.setFullYear(value.getFullYear(), value.getMonth(), value.getDate());
                } else {
                    calendar.setTime(date, value * MS_PER_DAY);
                }
                adjustDST(date, hours);
            },
            toDateString: function(date) {
                return date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();
            },
            valueType: function() {
                return "date";
            }
        },
        {
            name: "year",
            title: function(date) {
                return date.getFullYear();
            },
            content: function(options) {
                var calendarMonths = getCalendarInfo(options.culture).months,
                    namesAbbr = calendarMonths.namesAbbr,
                    namesFull = calendarMonths.names,
                    toDateString = this.toDateString,
                    min = options.min,
                    max = options.max,
                    html = "";

                if (options.showHeader) {
                    html += '<table tabindex="0" role="grid" class="k-calendar-table" cellspacing="0">';
                        html += '<caption class="k-calendar-caption k-meta-header">';
                            html += this.title(options.date);
                        html += '</caption>';
                        html += '<tbody class="k-calendar-tbody">';
                            html += '<tr role="row" class="k-calendar-tr">';
                }

                return view({
                    min: createDate(min.getFullYear(), min.getMonth(), 1),
                    max: createDate(max.getFullYear(), max.getMonth(), 1),
                    start: createDate(options.date.getFullYear(), 0, 1),
                    html: html,
                    setter: this.setDate,
                    content: options.content,
                    build: function(date) {
                        var cssClass = [ "k-calendar-td" ];

                        return {
                            value: namesAbbr[date.getMonth()],
                            label: namesFull[date.getMonth()],
                            ns: kendo.ns,
                            dateString: toDateString(date),
                            cssClass: cssClass.join(" ")
                        };
                    }
                });
            },
            first: function(date) {
                return createDate(date.getFullYear(), 0, date.getDate());
            },
            last: function(date) {
                return createDate(date.getFullYear(), 11, date.getDate());
            },
            compare: function(date1, date2) {
                return compare(date1, date2);
            },
            setDate: function(date, value) {
                var month,
                hours = date.getHours();

                if (value instanceof DATE) {
                    month = value.getMonth();

                    date.setFullYear(value.getFullYear(), month, date.getDate());

                    if (month !== date.getMonth()) {
                        date.setDate(0);
                    }
                } else {
                    month = date.getMonth() + value;

                    date.setMonth(month);

                    if (month > 11) {
                        month -= 12;
                    }

                    if (month > 0 && date.getMonth() != month) {
                        date.setDate(0);
                    }
                }

                adjustDST(date, hours);
            },
            toDateString: function(date) {
                return date.getFullYear() + "/" + date.getMonth() + "/1";
            },
            valueType: function() {
                return "month";
            }
        },
        {
            name: "decade",
            title: function(date, min, max) {
                return title(date, min, max, 10);
            },
            content: function(options) {
                var year = options.date.getFullYear(),
                toDateString = this.toDateString,
                html = "";

                if (options.showHeader) {
                    html += '<table tabindex="0" role="grid" class="k-calendar-table" cellspacing="0">';
                        html += '<caption class="k-meta-header">';
                            html += this.title(options.date, options.min, options.max);
                        html += '</caption>';
                        html += '<tbody class="k-calendar-thead">';
                            html += '<tr role="row" class="k-calendar-tr">';
                }

                return view({
                    start: createDate(year - year % 10, 0, 1),
                    min: createDate(options.min.getFullYear(), 0, 1),
                    max: createDate(options.max.getFullYear(), 0, 1),
                    showOtherMonthDays: options.showOtherMonthDays,
                    html: html,
                    setter: this.setDate,
                    build: function(date, idx) {
                        var cssClass = [ "k-calendar-td" ];

                        if (idx === 10 || idx === 11) {
                            cssClass.push(EMPTYCELL);
                        }

                        return {
                            value: date.getFullYear(),
                            ns: kendo.ns,
                            dateString: toDateString(date),
                            cssClass: cssClass.join(" ")
                        };
                    }
                });
            },
            first: function(date) {
                var year = date.getFullYear();
                return createDate(year - year % 10, date.getMonth(), date.getDate());
            },
            last: function(date) {
                var year = date.getFullYear();
                return createDate(year - year % 10 + 9, date.getMonth(), date.getDate());
            },
            compare: function(date1, date2) {
                return compare(date1, date2, 10);
            },
            setDate: function(date, value) {
                setDate(date, value, 1);
            },
            toDateString: function(date) {
                return date.getFullYear() + "/0/1";
            },
            valueType: function() {
                return "year";
            }
        },
        {
            name: CENTURY,
            title: function(date, min, max) {
                return title(date, min, max, 100);
            },
            content: function(options) {
                var year = options.date.getFullYear(),
                min = options.min.getFullYear(),
                max = options.max.getFullYear(),
                toDateString = this.toDateString,
                minYear = min,
                maxYear = max,
                html = "";

                minYear = minYear - minYear % 10;
                maxYear = maxYear - maxYear % 10;

                if (maxYear - minYear < 10) {
                    maxYear = minYear + 9;
                }

                if (options.showHeader) {
                    html += '<table tabindex="0" role="grid" class="k-calendar-table" cellspacing="0">';
                        html += '<caption class="k-calendar-caption k-meta-header">';
                            html += this.title(options.date, options.min, options.max);
                        html += '</caption>';
                        html += '<tbody class="k-calendar-tbody">';
                            html += '<tr role="row" class="k-calendar-tr">';
                }

                return view({
                    start: createDate(year - year % 100, 0, 1),
                    min: createDate(minYear, 0, 1),
                    max: createDate(maxYear, 0, 1),
                    showOtherMonthDays: options.showOtherMonthDays,
                    html: html,
                    setter: this.setDate,
                    build: function(date, idx) {
                        var cssClass = [ "k-calendar-td" ];
                        var start = date.getFullYear(),
                            end = start + 9;

                        if (idx === 10 || idx === 11) {
                            cssClass.push(EMPTYCELL);
                        }

                        if (start < min) {
                            start = min;
                        }

                        if (end > max) {
                            end = max;
                        }

                        return {
                            ns: kendo.ns,
                            value: options.centuryCellsFormat === "long" ? `${start} - ${end}` : start,
                            dateString: toDateString(date),
                            cssClass: cssClass.join(" ")
                        };
                    }
                });
            },
            first: function(date) {
                var year = date.getFullYear();
                return createDate(year - year % 100, date.getMonth(), date.getDate());
            },
            last: function(date) {
                var year = date.getFullYear();
                return createDate(year - year % 100 + 99, date.getMonth(), date.getDate());
            },
            compare: function(date1, date2) {
                return compare(date1, date2, 100);
            },
            setDate: function(date, value) {
                setDate(date, value, 10);
            },
            toDateString: function(date) {
                var year = date.getFullYear();
                return (year - year % 10) + "/0/1";
            },
            valueType: function() {
                return "decade";
            }
        }]
    };

    function title(date, min, max, modular) {
        var start = date.getFullYear(),
            minYear = min.getFullYear(),
            maxYear = max.getFullYear(),
            end;

        start = start - start % modular;
        end = start + (modular - 1);

        if (start < minYear) {
            start = minYear;
        }
        if (end > maxYear) {
            end = maxYear;
        }

        return start + "-" + end;
    }

    function view(options) {
        var idx = 0,
            data,
            min = options.min,
            max = options.max,
            start = options.start,
            setter = options.setter,
            build = options.build,
            weekNumberBuild = options.weekNumberBuild,
            length = options.cells || 12,
            isWeekColumnVisible = options.isWeekColumnVisible,
            cellsPerRow = options.perRow || 4,
            showOtherMonthDays = options.showOtherMonthDays,
            lastDayOfMonth = options.lastDayOfMonth,
            weekNumber = options.weekNumber || weekNumberTemplate,
            content = options.content || cellTemplate,
            empty = options.empty || emptyCellTemplate,
            otherMonthTemplate = options.otherMonthCellTemplate || otherMonthCellTemplate,
            html = options.html || '<table tabindex="0" role="grid" class="k-calendar-table" cellspacing="0"><tbody class="k-calendar-tbody"><tr role="row" class="k-calendar-tr">';

        if (isWeekColumnVisible) {
            html += weekNumber(weekNumberBuild(start));
        }


        for (; idx < length; idx++) {
            if (idx > 0 && idx % cellsPerRow === 0) {
                html += '</tr><tr role="row" class="k-calendar-tr">';
                if (isWeekColumnVisible) {
                    html += showOtherMonthDays || (+start <= +lastDayOfMonth) ? weekNumber(weekNumberBuild(start)) : weekNumber({ weekNumber: "&nbsp;" });
                }
            }

            start = createDate(start.getFullYear(), start.getMonth(), start.getDate());
            adjustDST(start, 0);

            data = build(start, idx, options.disableDates);

            if (data.cssClass.indexOf(OTHERMONTH) !== -1 && !showOtherMonthDays) {
                html += otherMonthTemplate(data);
            } else {
                if (isInRange(start, min, max) && data.cssClass.indexOf(EMPTYCELL) === -1) {
                    html += content(data);
                } else {
                    html += empty(data);
                }
            }

            setter(start, 1);
        }

        return html + "</tr></tbody></table>";
    }

    function compare(date1, date2, modifier) {
        var year1 = date1.getFullYear(),
            start = date2.getFullYear(),
            end = start,
            result = 0;

        if (modifier) {
            start = start - start % modifier;
            end = start - start % modifier + modifier - 1;
        }

        if (year1 > end) {
            result = 1;
        } else if (year1 < start) {
            result = -1;
        }

        return result;
    }

    function getToday() {
        var today = new DATE();
        return new DATE(today.getFullYear(), today.getMonth(), today.getDate());
    }

    function restrictValue(value, min, max) {
        var today = getToday();

        if (value) {
            today = new DATE(+value);
        }

        if (min > today) {
            today = new DATE(+min);
        } else if (max < today) {
            today = new DATE(+max);
        }
        return today;
    }

    function isInRange(date, min, max) {
        return +date >= +min && +date <= +max;
    }

    function shiftArray(array, idx) {
        return array.slice(idx).concat(array.slice(0, idx));
    }

    function setDate(date, value, multiplier) {
        value = value instanceof DATE ? value.getFullYear() : date.getFullYear() + multiplier * value;
        date.setFullYear(value);
    }

    function daysBetweenTwoDates(startDate, endDate) {
        if (+endDate < +startDate) {
            var temp = +startDate;
            calendar.views[0].setDate(startDate, endDate);
            calendar.views[0].setDate(endDate, new Date(temp));
        }
        var fromDateUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        var endDateUTC = Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

        return Math.ceil((+endDateUTC - +fromDateUTC) / kendo.date.MS_PER_DAY);
    }

    function addDaysToArray(array, numberOfDays, fromDate, disableDates) {
        for (var i = 0; i <= numberOfDays; i++) {
            var nextDay = new Date(fromDate.getTime());
            nextDay = new Date(nextDay.setDate(nextDay.getDate() + i));
            if (!disableDates(nextDay)) {
                array.push(nextDay);
            }
        }
    }

    function mousetoggle(e) {
        var disabled = $(this).hasClass("k-disabled");

        if (!disabled) {
            $(this).toggleClass(HOVER, MOUSEENTER.indexOf(e.type) > -1 || e.type == FOCUS);
        }
    }

    function prevent(e) {
        e.preventDefault();
    }

    // creates date with full year
    function createDate(year, month, date) {
        var dateObject = new DATE(year, month, date);
        dateObject.setFullYear(year, month, date);
        return dateObject;
    }

    function getCalendarInfo(culture) {
        return getCulture(culture).calendars.standard;
    }

    function normalize(options) {
        var start = views[options.start],
            depth = views[options.depth],
            culture = getCulture(options.culture);

        options.format = extractFormat(options.format || culture.calendars.standard.patterns.d);

        if (isNaN(start)) {
            start = 0;
            options.start = MONTH;
        }

        if (depth === undefined || depth > start) {
            options.depth = MONTH;
        }

        if (options.dates === null) {
            options.dates = [];
        }
    }

    function inArray(date, dates) {
        for (var i = 0, length = dates.length; i < length; i++) {
            if (date === +dates[i]) {
                return true;
            }
        }
        return false;
    }

    function isEqualDatePart(value1, value2) {
        if (value1) {
            return value1.getFullYear() === value2.getFullYear() &&
                value1.getMonth() === value2.getMonth() &&
                value1.getDate() === value2.getDate();
        }

        return false;
    }

    function isEqualMonth(value1, value2) {
        if (value1) {
            return value1.getFullYear() === value2.getFullYear() &&
                value1.getMonth() === value2.getMonth();
        }

        return false;
    }


    function getDisabledExpr(option) {
        if (kendo.isFunction(option)) {
            return option;
        }

        if (Array.isArray(option)) {
            return createDisabledExpr(option);
        }
        return $.noop;
    }

    function convertDatesArray(dates) {
        var result = [];
        for (var i = 0; i < dates.length; i++) {
            result.push(dates[i].setHours(0, 0, 0, 0));
        }
        return result;
    }

    function createDisabledExpr(dates) {
        var callback,
            disabledDates = [],
            days = ["su", "mo", "tu", "we", "th", "fr", "sa"];

        if (dates[0] instanceof DATE) {
            disabledDates = convertDatesArray(dates);
            callback = (date) => !!(date && disabledDates.indexOf((new Date(date)).setHours(0, 0, 0, 0)) > -1);
        } else {
            disabledDates = dates.map(day => {
                day = day.slice(0,2).toLowerCase();
                let index = days.indexOf(day);
                if (index > -1) {
                    return index;
                }
            });

            callback = (date) => !!(date && disabledDates.indexOf((new Date(date)).getDay()) > -1);
        }

        return callback;
    }

    function isEqualDate(oldValue, newValue) {
       if (oldValue instanceof Date && newValue instanceof Date) {
           oldValue = oldValue.getTime();
           newValue = newValue.getTime();
       }

       return oldValue === newValue;
    }

    function toDateObject(link) {
        var value = $(link).attr(kendo.attr(VALUE)).split("/");
        //Safari cannot create correctly date from "1/1/2090"
        value = createDate(value[0], value[1], value[2]);

        return value;
    }

    // Backwards compatibility after CSP changes.
    function executeTemplate(tmpl, data) {
        if (tmpl) {
            if (kendo.isFunction(tmpl)) {
                return tmpl(data);
            }
            return template(tmpl)(data);
        }
        return undefined;
    }

    calendar.isEqualDatePart = isEqualDatePart;
    calendar.isEqualDate = isEqualDate;
    calendar.restrictValue = restrictValue;
    calendar.isInRange = isInRange;
    calendar.normalize = normalize;
    calendar.viewsEnum = views;
    calendar.disabled = getDisabledExpr;
    calendar.toDateObject = toDateObject;
    calendar.getToday = getToday;
    calendar.createDate = createDate;

    kendo.calendar = calendar;
})(window.kendo.jQuery);
export default kendo;

