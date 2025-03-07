---
title: NumericTextBox
page_title: Configuration, methods and events of Kendo UI NumericTextBox
description: Code examples and tips how to configure NumericTextBox widget, use available methods and events.
res_type: api
component: numeric-textbox
---

# kendo.ui.NumericTextBox

Represents the Kendo UI NumericTextBox widget. Inherits from [Widget](/api/javascript/ui/widget).

## Configuration

### autoAdjust `Boolean` *(default: true)*

If this property is enabled and you have configured `min` and/or `max` values, and the user enters a value that falls out of that range, the value will automatically be set to either the minimum or maximum allowed value.

#### Example - prevent automatic value adjustments

    <h3>Input a value higher than 20 or lower than 10 and then focus out the input.</h3>
    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        min: 10,
        max: 20,
        autoAdjust: false
    });
    </script>

### culture `String`*(default: "en-US")*

 Specifies the culture info used by the widget.

#### Example - specify German culture internationalization

    <!--
        TODO: Add the kendo.culture.de-DE.min.js file as it is required!

        Here is a sample script tag:
        <script src="https://kendo.cdn.telerik.com/{kendo version}/js/cultures/kendo.culture.de-DE.min.js"></script>

        For more information check this help topic:
        https://docs.telerik.com/kendo-ui/framework/globalization/overview
    -->

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        culture: "de-DE"
    });
    </script>

### decimals `Number`*(default: null)*

Specifies the number precision applied to the widget value and when the NumericTextBox is focused. If not set, the precision defined by the current culture is used. If the user enters a number with a greater precision than is currently configured, the widget value will be rounded. For example, if `decimals` is `2` and the user inputs `12.346`, the value will become `12.35`. If `decimals` is `1` the user inputs `12.99`, the value will become `13.00`.

Compare with the [`format`](/api/javascript/ui/numerictextbox#configuration-format) property.

#### Example

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        decimals: 1
    });
    </script>

### downArrowText `String`*(default: "Decrease value")*

Specifies the text of the tooltip on the down arrow.

#### Example

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        downArrowText: "Less"
    });
    </script>

### factor `Number`*(default: "1")*

Specifies the factor by which the value is multiplied. The obtained result is used as edit value. So, if `15` as string is entered in the **NumericTextBox** and the factor value is set to `100` the visual value will be `1500`. On blur the visual value will be divided by `100` thus scaling the widget value to the original proportion.

#### Example

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
       format: "p0",
       factor: 100,
       min: 0,
       max: 1,
       step: 0.01
    });
    </script>

### fillMode `String`*(default: "solid")*

Sets a value controlling how the color is applied. Can also be set to the following string values:

- "none"
- "solid"
- "flat"
- "outline"

#### Example - sets the fillMode

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        fillMode: "flat"
    });
    </script>

### format `String`*(default: "n")*

Specifies the number format used when the widget is not focused. Check this page for all [valid number formats](/framework/globalization/numberformatting).

Compare with the [`decimals`](/api/javascript/ui/numerictextbox#configuration-decimals) property.

#### Example

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
       format: "c0"
    });
    </script>


### inputMode `String`*(default: "text")*

Specifies the [`inputmode` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode) of the inner `<input />` element. It is used to specify the type of on-screen keyboard that should be displayed when the user focuses the input.


### label `String|Function|Object` *(default: null)*

Adds a label before the input. If the input has no `id` attribute, a generated `id` will be assigned. The `string` and the `function` parameters are setting the inner HTML of the label.

#### Example - create a label from a string

    <input id="numerictextbox" />
    <script>
        $("#numerictextbox").kendoNumericTextBox({
            label: "First name"
        });
    </script>

The function context (available through the keyword `this`) will be set to the widget instance.

#### Example - create a label from a function

    <input id="numerictextbox" />
    <script>
        $("#numerictextbox").kendoNumericTextBox({
            label: function() {
                return "First name";
            }
        });
    </script>

### label.content `String|Function` *(default: "")*

Sets the inner HTML of the label.

#### Example - create a label from a string

    <input id="numerictextbox" />
    <script>
        $("#numerictextbox").kendoNumericTextBox({
            label: {
                content: "First name"
            }
        });
    </script>

The function context (available through the keyword `this`) will be set to the widget instance.

#### Example - create a label from a function

    <input id="numerictextbox" />
    <script>
        $("#numerictextbox").kendoNumericTextBox({
            label: {
                content: function() {
                    return "First name";
                }
            }
        });
    </script>

### label.floating `Boolean` *(default: false)*

If set to `true`, the widget will be wrapped in a container that will allow the floating label functionality.

> **Important:** The [value](/api/javascript/ui/numerictextbox/methods/value) method **does not trigger** the `focusout` event of the input.
This can affect the floating label functionality.
To overcome this behavior, manually invoke the `refresh` method of the Floating Label: `$("#numerictextbox").data("kendoNumericTextBox").floatingLabel.refresh();`
#### Example - create a floating label

    <input id="numerictextbox" />
    <script>
        $("#numerictextbox").kendoNumericTextBox({
            label: {
                content: "First name",
                floating: true
            }
        });
    </script>

### max `Number`*(default: null)*

 Specifies the largest value the user can enter.

#### Example - specify max option

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        max: 100
    });
    </script>

#### Example - specify max option as a HTML attribute

    <input id="numerictextbox" max="100" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();
    </script>

### min `Number`*(default: null)*

 Specifies the smallest value the user can enter.

#### Example - specify min option

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        min: -100
    });
    </script>

#### Example - specify min option as a HTML attribute

    <input id="numerictextbox" min="-100" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();
    </script>

### placeholder `String`*(default: "")*

The hint displayed by the widget when it is empty. Not set by default.

#### Example

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        placeholder: "Select A Value"
    });
    </script>


### prefixOptions `Object`

The configuration for the prefix adornment of the component.

#### Example - specify prefix adornment template

    <input id="numerictextbox" />
    <script>
        $("#numerictextbox").kendoNumericTextBox({
            prefixOptions: {
                template: () => `${kendo.ui.icon("search")}`
            }
        });
    </script>

### prefixOptions.icon `String`

Defines the name for an existing icon in a Kendo UI theme or SVG content

#### Example - specify prefix adornment icon

    <input id="numerictextbox" />
    <script>
        $("#numerictextbox").kendoNumericTextBox({
            prefixOptions: {
                icon:"search"
            }
        })
    </script>

### prefixOptions.template `String|Function`

The [template](/api/javascript/kendo/methods/template) for the prefix adornment of the component.

#### Example - specify prefix adornment template

    <input id="numerictextbox" />
    <script>
        $("#numerictextbox").kendoNumericTextBox({
            prefixOptions: {
                template: () => `${kendo.ui.icon("search")}`
            }
        })
    </script>

### prefixOptions.separator `Boolean` *(default: true)*

If set to `false`, the prefix adornment will not have a separator.

#### Example - specify prefix adornment separator

    <input id="numerictextbox" />
    <script>
        $("#numerictextbox").kendoNumericTextBox({
            prefixOptions: {
                template: () => `${kendo.ui.icon("search")}`,
                separator: false
            }
        })
    </script>



### restrictDecimals `Boolean`*(default: false)*

 Specifies whether the decimals length should be restricted during typing. The length of the fraction is defined by the `decimals` value.

#### Example

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        decimals: 3,
        restrictDecimals: true
    });
    </script>

### round `Boolean`*(default: true)*

 Specifies whether the value should be rounded or truncated. The length of the fraction is defined by the `decimals` value.

#### Example

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        round: false
    });
    </script>

### rounded `String`*(default: "medium")*

Sets a value controlling the border radius. Can also be set to the following string values:

- "none"
- "small"
- "medium"
- "large"
- "full"

#### Example - sets the rounded value

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        rounded: "large"
    });
    </script>

### selectOnFocus `Boolean`*(default: false)*

 When set to true, the text of the input will be selected after the widget is focused.

#### Example

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        selectOnFocus: true
    });
    </script>

### size `String`*(default: "medium")*

Sets a value controlling size of the component. Can also be set to the following string values:

- "small"
- "medium"
- "large"
- "none"

#### Example - sets a size

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        size: "large"
    });
    </script>

### spinners `Boolean`*(default: true)*

 Specifies whether the up and down spin buttons should be rendered

#### Example - hide spin buttons

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        spinners: false
    });
    </script>

### step `Number`*(default: 1)*

 Specifies the value used to increment or decrement widget value.

#### Example - specify step option

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        step: 0.1
    });
    </script>

#### Example - specify step option as a HTML attribute

    <input id="numerictextbox" step="0.1" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();
    </script>


### suffixOptions `Object`

The configuration for the suffix adornment of the component.

#### Example - specify suffix adornment template

    <input id="numerictextbox" />
    <script>
        $("#numerictextbox").kendoNumericTextBox({
            suffixOptions: {
                template: () => `${kendo.ui.icon("search")}`
            }
        });
    </script>

### suffixOptions.icon `String`

Defines the name for an existing icon in a Kendo UI theme or SVG content

#### Example - specify suffix adornment icon

    <input id="numerictextbox" />
    <script>
        $("#numerictextbox").kendoNumericTextBox({
            suffixOptions: {
                icon: "search"
            }
        })
    </script>

### suffixOptions.template `String|Function`

The [template](/api/javascript/kendo/methods/template) for the suffix adornment of the component.

#### Example - specify suffix adornment template

    <input id="numerictextbox" />
    <script>
        $("#numerictextbox").kendoNumericTextBox({
            suffixOptions: {
                template: () => `${kendo.ui.icon("search")}`
            }
        })
    </script>

### suffixOptions.separator `Boolean` *(default: true)*

If set to `false`, the suffix adornment will not have a separator.

#### Example - specify suffix adornment separator

    <input id="numerictextbox" />
    <script>
        $("#numerictextbox").kendoNumericTextBox({
            suffixOptions: {
                template: () => `${kendo.ui.icon("search")}`,
                separator: false
            }
        })
    </script>



### upArrowText `String`*(default: "Increase value")*

 Specifies the text of the tooltip on the up arrow.

#### Example

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        upArrowText: "More"
    });
    </script>

### value `Number`*(default: null)*

 Specifies the value of the NumericTextBox widget.

#### Example - specify value option

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        value: 10
    });
    </script>

#### Example - specify value option as a HTML attribute

    <input id="numerictextbox" value="10" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();
    </script>

## Fields

### options `Object`
An object, which holds the options of the widget.

#### Example - get options of the widget

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();

    var numerictextbox = $("#numerictextbox").data("kendoNumericTextBox");

    var options = numerictextbox.options;
    </script>

## Methods

### destroy
Prepares the **NumericTextBox** for safe removal from DOM. Detaches all event handlers and removes jQuery.data attributes to avoid memory leaks. Calls destroy method of any child Kendo widgets.

> **Important:** This method does not remove the NumericTextBox element from DOM.

#### Example

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();

    var numerictextbox = $("#numerictextbox").data("kendoNumericTextBox");

    // detach events
    numerictextbox.destroy();
    </script>

### enable

Enables or disables the widget.

#### Parameters

##### enable `Boolean`

If set to `true` the widget will be enabled. If set to `false` the widget will be disabled.

Setting this property to `true` does not affect other properties of the NumericTextBox. It applies the `.k-disabled` CSS class of the wrapper span and sets the `aria-disabled` property of the input to `true`.

#### Example - enable the widget

    <input id="numerictextbox" disabled="disabled" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();

    var numerictextbox = $("#numerictextbox").data("kendoNumericTextBox");
    numerictextbox.enable(true);
    </script>

### readonly

Toggles the readonly state of the widget. When the widget is readonly it doesn't allow user input.

> There is a difference between disabled and readonly mode. The value of a disabled widget is **not** posted as part of a `form` whereas the value of a readonly widget is posted.

#### Parameters

##### readonly `Boolean`

If set to `true` the widget will not allow user input. If set to `false` the widget will allow user input.

#### Example - make the widget readonly

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();

    var numerictextbox = $("#numerictextbox").data("kendoNumericTextBox");
    numerictextbox.readonly();
    </script>

### focus

Focuses the widget.

#### Example

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();

    var numerictextbox = $("#numerictextbox").data("kendoNumericTextBox");
    numerictextbox.focus();
    </script>

### max

Gets or sets the max value of the widget.

#### Parameters

##### value `Number | String`

The max value to set.

#### Returns

`Number` The max value of the widget.

#### Example - get the max value of the NumericTextBox

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();

    var numerictextbox = $("#numerictextbox").data("kendoNumericTextBox");

    var max = numerictextbox.max();

	/* The result can be observed in the DevTools(F12) console of the browser. */
    console.log(max);
    </script>

#### Example - set the max value of the NumericTextBox

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();

    var numerictextbox = $("#numerictextbox").data("kendoNumericTextBox");

    var max = numerictextbox.max();

    numerictextbox.max(10);
    </script>

### min

Gets or sets the min value of the widget.

#### Parameters

##### value `Number | String`

The min value to set.

#### Returns

`Number` The min value of the widget.

#### Example - get the min value of the NumericTextBox

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();

    var numerictextbox = $("#numerictextbox").data("kendoNumericTextBox");

    var min = numerictextbox.min();

	/* The result can be observed in the DevTools(F12) console of the browser. */
    console.log(min);
    </script>

#### Example - set the min value of the NumericTextBox

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();

    var numerictextbox = $("#numerictextbox").data("kendoNumericTextBox");

    var min = numerictextbox.min();

    numerictextbox.min(10);
    </script>

### step

Gets or sets the step value of the widget.

#### Parameters

##### value `Number | String`

The step value to set.

#### Returns

`Number` The step value of the widget.

#### Example - get the step value of the NumericTextBox

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();

    var numerictextbox = $("#numerictextbox").data("kendoNumericTextBox");

    var step = numerictextbox.step();

	/* The result can be observed in the DevTools(F12) console of the browser. */
    console.log(step);
    </script>

#### Example - set the step value of the NumericTextBox

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();

    var numerictextbox = $("#numerictextbox").data("kendoNumericTextBox");

    var step = numerictextbox.step();

    numerictextbox.step(0.5);
    </script>

### value

Gets or sets the value of the NumericTextBox.

> **Important:** This method **does not trigger** the `focusout` event of the input.
This can affect the [floating label functionality](/api/javascript/ui/numerictextbox/configuration/label.floating).
To overcome this behavior, manually invoke the `refresh` method of the Floating Label: `$("#numerictextbox").data("kendoNumericTextBox").floatingLabel.refresh();`

#### Parameters

##### value `Number | String`

The value to set.

#### Returns

`Number` The value of the widget.

#### Example - get the value of the NumericTextBox

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();

    var numerictextbox = $("#numerictextbox").data("kendoNumericTextBox");

    var value = numerictextbox.value();

	/* The result can be observed in the DevTools(F12) console of the browser. */
    console.log(value);
    </script>

#### Example - set the value of the NumericTextBox

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();

    var numerictextbox = $("#numerictextbox").data("kendoNumericTextBox");

    var value = numerictextbox.value();

    numerictextbox.value(0.5);
    </script>

## Events

### change

Fires when the value is changed

#### Event Data

##### e.sender `kendo.ui.NumericTextBox`

The widget instance which fired the event.

#### Example - subscribe to the "change" event during initialization

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        change: function() {
            var value = this.value();
	/* The result can be observed in the DevTools(F12) console of the browser. */
            console.log(value); //value is the selected date in the numerictextbox
        }
    });
    </script>

#### Example - subscribe to the "change" event after initialization

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();

    var numerictextbox = $("#numerictextbox").data("kendoNumericTextBox");

    numerictextbox.bind("change", function() {
        var value = this.value();
	/* The result can be observed in the DevTools(F12) console of the browser. */
        console.log(value); //value is the selected date in the numerictextbox
    });
    </script>

### spin

Fires when the value is changed from the spin buttons

#### Event Data

##### e.sender `kendo.ui.NumericTextBox`

The widget instance which fired the event.

#### Example - subscribe to the "spin" event during initialization

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox({
        spin: function() {
            var value = this.value();
	/* The result can be observed in the DevTools(F12) console of the browser. */
            console.log(value); //value is the selected date in the numerictextbox
        }
    });
    </script>

#### Example - subscribe to the "spin" event after initialization

    <input id="numerictextbox" />
    <script>
    $("#numerictextbox").kendoNumericTextBox();

    var numerictextbox = $("#numerictextbox").data("kendoNumericTextBox");

    numerictextbox.bind("spin", function() {
        var value = this.value();
	/* The result can be observed in the DevTools(F12) console of the browser. */
        console.log(value); //value is the selected date in the numerictextbox
    });
    </script>
