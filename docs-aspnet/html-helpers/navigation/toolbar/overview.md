---
title: Overview
page_title: Overview
description: "Learn the basics when working with the Telerik UI ToolBar component for {{ site.framework }}."
previous_url: /helpers/html-helpers/toolbar, /helpers/navigation/toolbar/overview
slug: htmlhelpers_toolbar_aspnetcore
position: 0
---

# {{ site.framework }} ToolBar Overview

{% if site.core %}
The Telerik UI ToolBar TagHelper and HtmlHelper for {{ site.framework }} are server-side wrappers for the Kendo UI ToolBar widget.
{% else %}
The Telerik UI ToolBar HtmlHelper for {{ site.framework }} is a server-side wrapper for the Kendo UI ToolBar widget.
{% endif %}

The ToolBar is designed to hold different types of controls such as buttons, button groups, toggle buttons, split buttons, and other customized elements. The ToolBar consists of the ToolBar wrapper, overflow anchor, and command overflow popup main areas. The wrapper holds all commands that can be placed within the available container width. The ones that have no space to fit are moved to the command overflow popup.

* [Demo page for the ToolBar HtmlHelper](https://demos.telerik.com/{{ site.platform }}/toolbar/index)
{% if site.core %}
* [Demo page for the ToolBar TagHelper](https://demos.telerik.com/aspnet-core/toolbar/tag-helper)
{% endif %}

## Initializing the ToolBar

The following example demonstrates how to define the ToolBar.

```HtmlHelper
    @(Html.Kendo().ToolBar()
        .Name("ToolBar")
        .Items(items => {
            items.Add().Type(CommandType.Button).Text("Button");
            items.Add().Type(CommandType.Button).Text("Toggle Button").Togglable(true);
            items.Add().Type(CommandType.SplitButton).Text("Insert").MenuButtons(menuButtons =>
            {
                menuButtons.Add().Text("Insert above").Icon("insert-top");
                menuButtons.Add().Text("Insert between").Icon("insert-middle");
                menuButtons.Add().Text("Insert below").Icon("insert-bottom");
            });
        })
    )
```
{% if site.core %}
```TagHelper
    <kendo-toolbar name="ToolBar">
        <toolbar-items>
            <item type="CommandType.Button" text="Button 1" />
            <item type="CommandType.Separator" />
            <item type="CommandType.Button" text="Button 2" />
        </toolbar-items>
    </kendo-toolbar>
```
{% endif %}
```Controller
    public class ToolBarController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
    }
```

## Basic Configuration

The following example demonstrates the basic configuration of the ToolBar.

```HtmlHelper
    @(Html.Kendo().ToolBar()
        .Name("ToolBar")
        .Items(items => {
            items.Add().Type(CommandType.Button).Text("Button 1").Id("button1").Click("buttonClickHandler");
            items.Add().Type(CommandType.Button).Text("Button 2").Id("button2").Click("buttonClickHandler");
            items.Add().Type(CommandType.Separator);
            items.Add().Type(CommandType.Button).Togglable(true).Text("Toggle 1").Id("toggle1").Toggle("buttonToggleHandler");
            items.Add().Type(CommandType.Button).Togglable(true).Text("Toggle 2").Id("toggle2").Toggle("buttonToggleHandler");
            items.Add().Type(CommandType.Separator);
            items.Add().Template("<input id='dropdown' style='width: 150px;' />").Overflow(ShowInOverflowPopup.Never);
            items.Add().Type(CommandType.SplitButton).Text("Split Button").Id("mainButton").Click("splitButtonClickHandler").MenuButtons(menuButtons =>
            {
                menuButtons.Add().Text("Action 1").Id("action1");
                menuButtons.Add().Text("Action 2").Id("action2");
                menuButtons.Add().Text("Action 3").Id("action3");
            });
            items.Add().Type(CommandType.Separator);
            items.Add().Type(CommandType.ButtonGroup).Buttons(buttons =>
            {
                buttons.Add().Text("Radio 1").Id("radio1").Togglable(true).Group("radio").Toggle("buttonToggleHandler");
                buttons.Add().Text("Radio 2").Id("radio2").Togglable(true).Group("radio").Toggle("buttonToggleHandler");
                buttons.Add().Text("Radio 3").Id("radio3").Togglable(true).Group("radio").Toggle("buttonToggleHandler");
            });
            items.Add().Type(CommandType.Button).Text("Overflow button").Id("overflowButton").Overflow(ShowInOverflowPopup.Always);
        })
        .Events(e => e.Click("onClick").Toggle("onToggle").Open("onOpen").Close("onClose").OverflowOpen("onOverflowOpen").OverflowClose("onOverflowClose"))
    )

    <script type="text/javascript">
        $(function() {
    	    // Initialize a DropDownList in the template of a ToolBar item.
    		$("#dropdown").kendoDropDownList({
                optionLabel: "Paragraph",
                dataTextField: "text",
                dataValueField: "value",
                dataSource: [
                    { text: "Heading 1", value: 1 },
                    { text: "Heading 2", value: 2 },
                    { text: "Heading 3", value: 3 },
                    { text: "Title", value: 4 },
                    { text: "Subtitle", value: 5 },
                ]
            });

            // The Name() of the ToolBar is used to get its client-side instance.
            var toolbar = $("#ToolBar").data("kendoToolBar");
        });
    </script>
```
{% if site.core %}
```TagHelper

    <kendo-toolbar name="ToolBar">
        <toolbar-items>
            <item type="CommandType.Button" text="Button" />
            <item type="CommandType.Button" text="Toggle Button" togglable="true" />
            <item type="CommandType.SplitButton" text="Insert">
                <menu-buttons>
                    <toolbar-button text="Insert above" icon="insert-top" />
                    <toolbar-button text="Insert between" icon="insert-middle" />
                    <toolbar-button text="Insert below" icon="insert-bottom" />
                </menu-buttons>
            </item>
            <item type="CommandType.Separator" />
            <item template="<label for='dropdown'>Format:</label>" />
            <item template="<input id='dropdown' style='width: 150px;' />"     overflow="ShowInOverflowPopup.Never" />
            <item type="CommandType.Separator" />
            <item type="CommandType.ButtonGroup">
                <buttons>
                    <toolbar-button text="Left" togglable="true" group="text-align" icon="align-left"     />
                    <toolbar-button text="Center" togglable="true" group="text-align"     icon="align-center" />
                    <toolbar-button text="Right" togglable="true" group="text-align"     icon="align-right" />
                </buttons>
            </item>
            <item type="CommandType.Button" text="Action" overflow="ShowInOverflowPopup.Always"/>
            <item type="CommandType.Button" text="Another Action"     overflow="ShowInOverflowPopup.Always"/>
            <item type="CommandType.Button" text="Something else here"     overflow="ShowInOverflowPopup.Always"/>
        </toolbar-items>
    </kendo-toolbar>

    <script>
        $(document).ready(function () {
            // Initialize a DropDownList in a template of the ToolBar item.
            $("#dropdown").kendoDropDownList({
                optionLabel: "Paragraph",
                dataTextField: "text",
                dataValueField: "value",
                dataSource: [
                    { text: "Heading 1", value: 1 },
                    { text: "Heading 2", value: 2 },
                    { text: "Heading 3", value: 3 },
                    { text: "Title", value: 4 },
                    { text: "Subtitle", value: 5 },
                ]
            });

            // The Name() of the ToolBar is used to get its client-side instance.
            var toolbar = $("#ToolBar").data("kendoToolBar");
        });
    </script>
```
{% endif %}

## Functionality and Features

|Feature|Description|
|-------|-----------|
| [Appearance]({% slug toolbar_appearance %})| The component provides convenient built-in settings for changing its size and overflow options. |
| [Command Types]({% slug htmlhelpers_toolbar_button_aspnetcore %})| The ToolBar supports various button command types. |
| [Manual Closing]({% slug htmlhelpers_toolbar_popup_manual_close_aspnetcore %})| You can configure the ToolBar to close its popup through a button `click` event. |
| [FontAwesome Icons]({% slug htmlhelpers_use_fontawesome_icons_aspnetcore %})| The ToolBar enables you to use <a href="https://fontawesome.com/icons" target="_blank">FontAwesome icons</a> through its `SpriteCssClass()` configuration option. |
| [Resizing]({% slug toolbar_resizing %})| The ToolBar supports adaptive resizing functionality. |
| [Integration with Editors]({% slug toolbar_integration %})| The component can be integrated with various form editors to provide an interactive layout to the user. |
| [Events]({% slug toolbar_events %})| Explore the various ToolBar events that allow you to control what happens when the user interacts with the component. |
| [Accessibility]({% slug htmlhelpers_toolbar_accessibility %})| The ToolBar is accessible for screen readers, supports WAI-ARIA attributes, and delivers [keyboard shortcuts]({% slug keynav_aspnetcore_toolbar %}) for faster navigation. |

## Next Steps

* [Getting Started with the ToolBar]({% slug toolbar_getting_started %})
* [Basic Usage of the ToolBar HtmlHelper for {{ site.framework }} (Demo)](https://demos.telerik.com/{{ site.platform }}/toolbar/index)
{% if site.core %}
* [Basic Usage of the ToolBar TagHelper for ASP.NET Core (Demo)](https://demos.telerik.com/aspnet-core/toolbar/tag-helper)
* [ToolBar in Razor Pages]({% slug htmlhelpers_toolbar_aspnetcore_razor_page %})
{% endif %}

## See Also

* [Using the API of the ToolBar HtmlHelper for {{ site.framework }} (Demo)](https://demos.telerik.com/{{ site.platform }}/toolbar/api)
* [Knowledge Base Section](/knowledge-base)
