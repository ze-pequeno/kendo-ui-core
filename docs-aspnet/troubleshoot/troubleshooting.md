---
title: Common Issues
page_title: Common Issues Troubleshooting
description: "Learn about the solutions of common issues that may occur while working with Telerik UI for ASP.NET MVC."
previous_url: /troubleshooting
slug: troubleshooting_aspnetmvc
position: 1
---

# Common Issues

This page provides solutions to common issues you may encounter while working with Telerik UI for ASP.NET MVC.

Because Telerik UI for ASP.NET MVC is powered by Kendo UI, check the [general article on Kendo UI troubleshooting](https://docs.telerik.com/kendo-ui/troubleshoot/troubleshooting-common-issues) for more issues and their solutions.

### Troubleshooting

#### Kendo.Mvc.Examples upgraded to 4.6.2

The examples project is 4.6.2 targetFramework. Installation of Microsoft .NET Framework 4.6.2 is required. If you cannot install it, you could switch the targetFramework to 4.5 and run the examples without using `Telerik.Web.PDF` dependency. `Telerik.Web.PDF` is a netstandard project that uses DPL libraries to convert PDF documents into json that is utilized by the PDFViewer component.

#### I Am Still Getting the Old Version

Sometimes the .NET Framework caches the old Kendo.MVC dll. As a result, the upgrade may seem to have failed.

**Solution**

1. From the Windows **Task Manager**, terminate the IIS process and close Visual Studio.
1. Clean up the Temporary ASP.NET files from `<sysdrive>:\Windows\Microsoft.NET\Framework[64] <vernum>\Temporary ASP.NET Files`.
1. Delete your browser cache. For Internet Explorer, select **Tools** > **Internet Options** > **Delete Files**.
1. Clean up the Windows WebSite Cache from `\Users<UserName>\AppData\Local\Microsoft\WebsiteCache`. The location of this cache may vary from one operating system to another.
1. Clean up the Visual Studio Backup from `<sysdrive>:\Users\<UserName>\Documents\Visual Studio <vsVersion>\Backup Files`. The exact location depends on your Visual Studio settings and installation.

#### The Icons Are Missing after the Upgrade

As of the [Kendo UI R1 2017 release](https://docs.telerik.com/kendo-ui/backwards-compatibility/2017-backward-compatibility#kendo-ui-2017-r1), the Telerik UI for ASP.NET MVC uses [font icons](https://docs.telerik.com/kendo-ui/styles-and-layout/icons-web), which might lead to compatibility issues.

**Solution**

If you upgrade your project from a prior version to the R1 2017 version (2017.1.118) or later, you have to change the [classes of the custom CSS rules that you use accordingly](https://docs.telerik.com/kendo-ui/backwards-compatibility/2017-backward-compatibility#kendo-ui-2017-r1).

If the icons are still missing after you change the classes, verify that the version is fully [updated]({% slug upgrade_aspnetcore%}).


## JavaScript

### jQuery Is Unavailable or Undefined

This error is triggered in the following cases:

* jQuery is not included at all.
* jQuery is included after the Telerik UI for ASP.NET MVC script files.
* jQuery is included after a Kendo UI widget or an MVC wrapper declaration.

For more symptoms on that, refer to the [article on JavaScript errors](https://docs.telerik.com/kendo-ui/troubleshoot/troubleshooting-js-errors).

**Solution**

Make sure that jQuery is included before the Telerik UI for ASP.NET MVC JavaScript files, and before any Kendo UI widget or MVC wrapper declarations, unless [deferred initialization]({% slug overview_aspnetmvc6_aspnetmvc %}) is used. If you use the ASP.NET bundles, move the `Scripts.Render("~/bundles/jquery")` block before the Telerik UI for ASP.NET MVC JavaScript files.

### Widgets Are Unavailable or Undefined

If jQuery is included more than once in the page, all existing jQuery plugins (including Kendo UI) are wiped out. This issue also occurs if the [required Kendo UI JavaScript files](https://docs.telerik.com/kendo-ui/intro/installation/prerequisites) are not included.

For more similar issues, refer to the [article on troubleshooting in Kendo UI for jQuery](https://docs.telerik.com/kendo-ui/troubleshoot/troubleshooting-common-issues#kendo-ui-widgets-are-unavailable-or-undefined).

**Solution**

1. Make sure that jQuery is not included more than once in your page.
1. Remove any duplicate `script` references to jQuery.
1. Include all [required Kendo UI JavaScript files](https://docs.telerik.com/kendo-ui/intro/installation/prerequisites).
1. If the application is using Telerik Extensions for ASP.NET MVC, indicate to the `ScriptRegistrar` not to include jQuery.



        Html.Telerik().ScriptRegistrar().jQuery(false)

1. If the application is using ASP.NET bundles, make sure that the `Scripts.Render("~/bundles/jquery")` block appears before the Kendo UI JavaScript files. If not, do not include jQuery as a `script` element.

### The System.Web.Mvc Versions Referenced in the Application and Used by Kendo.Mvc.dll Are Different

`Kendo.Mvc.dll` is regularly updated to support the latest ASP.NET MVC 5 version. If you try to use the latest version of Telerik UI for ASP.NET MVC in an ASP.NET MVC 5 application that uses an older version of `System.Web.Mvc`, an exception is thrown saying that the versions of the `System.Web.Mvc` do not match.

If an older version of `Kendo.Mvc.dll` is referenced and it uses a version of `System.Web.Mvc` older than the one referenced in the application, a warning will be displayed.

**Solution**

1. [Upgrade ASP.NET MVC 5](https://www.nuget.org/packages/Microsoft.AspNet.Mvc/) which is used in the application to the newest version ASP.NET MVC 5 Nuget.
1. Update the binding redirect for `System.Web.Mvc` in the `web.config` file.

        <dependentAssembly>
            <assemblyIdentity name="System.Web.Mvc" publicKeyToken="31bf3856ad364e35" />
            <bindingRedirect oldVersion="0.0.0.0-<latest ASP.NET MVC 5 version>" newVersion="<latest ASP.NET MVC 5 version>" />
        </dependentAssembly>

### Live Method Is Unavailable, Undefined or Unsupported

This error occurs after upgrading jQuery to 1.9. The `live` method is no longer available in this version of jQuery. As a result, some JavaScript libraries which are often used in ASP.NET MVC applications, throw errors.

These libraries are:
* `jquery.unobtrusive-ajax`
* `jquery.validate`
* `jquery.validate.unobtrusive`

**Solution**

Below are listed the packages you need to update through [NuGet](https://www.nuget.org/).

* [`jQuery.Validation`](https://www.nuget.org/packages/jQuery.Validation)
* [`Microsoft.jQuery.Unobtrusive.Ajax`](https://www.nuget.org/packages/Microsoft.jQuery.Unobtrusive.Ajax)
* [`Microsoft.jQuery.Unobtrusive.Validation`](https://www.nuget.org/packages/Microsoft.jQuery.Unobtrusive.Validation)

> In ASP.NET MVC 3 applications `jquery.unobtrusive-ajax` and `jquery.validate.unobtrusive` are not installed as NuGet packages. Install them separately. The packages are [`Microsoft.jQuery.Unobtrusive.Ajax`](https://www.nuget.org/packages/Microsoft.jQuery.Unobtrusive.Ajax) and [`Microsoft.jQuery.Unobtrusive.Validation`](https://www.nuget.org/packages/Microsoft.jQuery.Unobtrusive.Validation). First, delete `jquery.unobtrusive-ajax.js`, `jquery.unobtrusive-ajax.min.js`, `jquery.validate.unobtrusive.js`, and `jquery.validate.unobtrusive.min.js` from your `~/Sripts` folder. Then, install `Microsoft.jQuery.Unobtrusive.Ajax` and `Microsoft.jQuery.Unobtrusive.Validation`.

### DOM-Based Open Redirection Issue in kendo.aspnetmvc.min.js Is Reported

Some JavaScript security tools report a possible DOM-based open redirection issue in the `kendo.aspnetmvc.min.js` file.

The relevant part of the source code is used when a Kendo UI Grid is server-bound and data operations, such as paging and sorting, reload the whole web page. The code takes the query string portion of the current URL, manipulates some of the parameter values, such as the page number, and sets it as a new `location.href`. In standard scenarios, the same page will be loaded as a result, but with different query string parameters which, anyway, should be subject to server-side validation as a best practice.

In theory, it is possible to configure a different URL rather than the current page in the DataSource settings of the Grid. However, this is under the control of the developer. If the configured URL is changed by a third party, the application is already compromised.

**Solution**

This issue does not represent a justifiable reason for concern and can be marked as a false positive.

## Server Side

### Visual Studio Server IntelliSense Does Not Show MVC Helper Extension Methods

**Solution**

Below are listed the steps for you to follow to fix this issue.

1. Make sure the `Kendo.Mvc.UI` namespace is imported in `web.config`.

    * If you are using the WebForms view engine, open the `web.config` file in the root folder of your application. Add `<add namespace="Kendo.Mvc.UI" />` before the closing `namespaces` tag.



            <namespaces>
                <add namespace="System.Web.Mvc" />
                <add namespace="System.Web.Mvc.Ajax" />
                <add namespace="System.Web.Mvc.Html" />
                <add namespace="System.Web.Routing" />
                <add namespace="System.Linq" />
                <add namespace="System.Collections.Generic" />
                <add namespace="Kendo.Mvc.UI" />
            </namespaces>

    * If you are using the Razor view engine, open the `web.config` file which is in the `Views` folder of your application. Add `<add namespace="Kendo.Mvc.UI" />` before the closing `namespaces` tag.



            <system.web.webPages.razor>
                <pages pageBaseType="System.Web.Mvc.WebViewPage">
                    <namespaces>
                        <add namespace="System.Web.Mvc" />
                        <add namespace="System.Web.Mvc.Ajax" />
                        <add namespace="System.Web.Mvc.Html" />
                        <add namespace="System.Web.Routing" />
                        <add namespace="Kendo.Mvc.UI" />
                    </namespaces>
                </pages>
            </system.web.webPages.razor>

1. Rebuild your solution.

1. Close and open again the view you were editing. IntelliSense should be working now.

### Html.Kendo().SomeKendoWidgetFor() Does Not Update Bound Properties on Server

Most probably this is happening because you have a specified `Name()` for the widget which is different from the property name. Since the `Name()` controls not only the `id` attribute of the input element, but also the `name` attribute as well, the MVC model binder fails to bind the value.

**Solution**

Omit specifying the `Name()` or use the same `Name()` as the name of the property.

### Nesting MVC Wrappers Produces Server-Side Exceptions When Using WebForms View Engine

This can happen if the nested wrappers are declared within code blocks, which output content directly, for example, `<%= %>` or `<%: %>`. An `Invalid expression term ')'` exception is thrown.

The following example demonstrates a wrong approach to avoid the issue.



    <%: Html.Kendo().Splitter()
        .Name("splitter")
        .Panes(panes =>
        {
            panes.Add()
            .Content(() =>
            { %>
                <%:  Html.Kendo().NumericTextBox().Name("textbox") %>
            <% });
        })
    %>

**Solution**

The following example demonstrates the proper approach to avoid the issue.



    <% Html.Kendo().Splitter()
        .Name("splitter")
        .Panes(panes =>
        {
            panes.Add()
            .Content(() =>
            { %>
                <%:  Html.Kendo().NumericTextBox().Name("textbox") %>
            <% });
        })
        .Render();
    %>

### Nesting MVC Wrappers Produces Server-Side Exceptions When Using Razor View Engine

This can happen if there are nested `<text>` tags, which is not allowed by the Razor view engine. An `Inline markup blocks cannot be nested. Only one level of inline markup is allowed` exception is thrown.

**Solution**

In such scenarios, the inner widget can be included through a custom helper.



    @helper PanelBarHelper()
    {
        @(
            Html.Kendo().PanelBar()
                .Name("PanelBar")
                .Items(items =>
                {
                    items.Add().Text("Item 1")
                        .Content(@<text>
                            Root Item 1 Inner Content
                        </text>);
                })
        )
    }

    @(Html.Kendo().TabStrip()
        .Name("tabstrip")
        .Items(tabstrip =>
        {
            tabstrip.Add().Text("Text")
                .Content(@<text>
                    <p>some text before</p>
                    @PanelBarHelper()
                    <p>some text after</p>
                </text>);
        })
    )

### High Memory Consumption On Server

Using the [ASP.NET Bundling](http://www.asp.net/mvc/overview/performance/bundling-and-minification) with the large, pre-minified files, such as `kendo.all.min`, can result in a high memory usage.

**Solution**

Use a plain `Bundle` instead of `ScriptBudle` for these files.



    bundles.Add(new Bundle("~/bundles/kendo").Include(
                "~/Scripts/kendo.all.min.js",
                "~/Scripts/kendo.aspnetmvc.min.js",
                "~/Scripts/kendo.timezones.min.js"));

## Performance

### Menu Renders Too Slowly in Debug Mode

The Menu has security trimming functionality, which is enabled by default. Under the hood, it creates an [`AuthorizationContext`](https://msdn.microsoft.com/en-us/library/system.web.mvc.authorizationcontext(v=vs.108).aspx) for every menu item with set Action/Controller. In the debug mode these context objects&mdash;`ControllerContext`, `ActionContext`, and the resulting `AuthorizationContext`&mdash;are not cached and are recreated each time the Menu is rendered. As a result, there may be delay in rendering the menu in case there are a lot of items. When your application is deployed and debug mode is disabled, the authorization context objects are cached.

For more information on the ASP.NET debug mode, refer to the Scott Guthrie's [Don’t Run Production ASP.NET Applications with debug="true" Enabled](http://weblogs.asp.net/scottgu/introducing-asp-net-5) blog post.

**Solution**

Below are listed the steps for you to follow while handling this issue.

1. Disable security trimming if not needed or during development. Enable it again when deploying the site.

    ```ASPX
        <%: Html.Kendo().Menu()
            .SecurityTrimming(false)
        %>
    ```
    ```Razor
        @(Html.Kendo().Menu()
            .SecurityTrimming(false)
        )
    ```

1. Disable debug mode. Set the `debug` attribute of the `compilation` element in the `web.config` to `false`.



        <compilation debug="false">

## Widgets

### Kendo UI MVC Wrappers Do Not Work Inside Client Templates

This can happens if the wrapper is declared without `ToClientTemplate()`.

**Solution**

For more information on this issue, refer to the [article on Kendo UI wrappers fundamentals]({% slug client_templates_overview %})

On the other hand, note that [template script expressions](https://docs.telerik.com/kendo-ui/framework/templates/overview#handle-external-templates-and-expressions) that include brackets (function calls) or arithmetic operators cannot be included in the `Name()` method of Kendo UI MVC wrappers. For example, the following implementations will trigger **invalid template** JavaScript errors:

    Html.Kendo().Grid().Name("grid_#=myFunction()#")
    Html.Kendo().Grid().Name("grid_#=myVariable1+myVariable2 #")

In other words, the `Name()` of a Kendo UI MVC widget can only contain a Kendo UI template with a reference to a variable.

### Widget Value Is Not Bound to Model Property

If the name of a widget is different from the property of the Model, the `ModelBinder` is not able to update the model.

**Solution**

Verify that the name of the widget is the same as the Model's property you want to update.

> If strongly-typed widget is used, do not set the `Name` manually, because a name is generated automatically.

### Widget Loading Icon Continues Spinning

This issue refers to the Kendo UI AutoComplete, ComboBox, DropDownList, and MultiSelect widgets. The most common cause is an [internal server error](http://www.checkupdown.com/status/E500.html).

**Solution**

Apply either of the two options below:

* Verify that `GET` requests are allowed.

        public JsonResult GetCascadeCategories()
        {
            var northwind = new NorthwindDataContext();

            return Json(northwind.Categories, **JsonRequestBehavior.AllowGet**);
        }

* Change HTTP verb of the DataSource.

    ```ASPX
        <%: Html.Kendo().ComboBox()
            .Name("ComboBox")
            .DataSource(read => {
                read.Action("GetCascadeCategories", "ComboBox").Type(HttpVerbs.Post);
            })
        %>
    ```
    ```Razor
        @(Html.Kendo().ComboBox()
            .Name("ComboBox")
            .DataSource(read => {
                read.Action("GetCascadeCategories", "ComboBox").Type(HttpVerbs.Post);
            })
        )
    ```

### Widgets Do Not Work with Remote Binding and Throw No Errors

This issue refers to the Kendo UI AutoComplete, ComboBox, DropDownList, and MultiSelect widgets. The most common cause is the usage of the `ToDataSourceResult` extension method when returning Data. Note that the method returns the result in a JSON structure, which is understandable only for the Grid widget.

**Solution**

Apply either of the two options below:

* Return a simple array of data.

        public JsonResult GetCascadeCategories()
        {
            var northwind = new NorthwindDataContext();

            //TODO: Do not use northwind.Categories.ToDataSourceResult();

            return Json(northwind.Categories, **JsonRequestBehavior.AllowGet**);
        }

* Return the `Data` property only.

        public JsonResult GetCascadeCategories([DataSourceRequest] DataSourceRequest request)
        {
            var northwind = new NorthwindDataContext();

            return Json(northwind.Categories.ToDataSourceResult(request).Data, **JsonRequestBehavior.AllowGet**);
        }

More information on how to configure Kendo UI widgets for Ajax binding and return data to the client, refer to the overview article of each widget.

### Widgets Display Zero Values

This issue refers to the Kendo UI ComboBox widget. It supports item selection or custom values. In the latter case, the custom value is displayed as `text`, because this is how the custom value is treated.

The widget displays a `0` value if it is bound to the `non-nullable integer` or other number type. In this case, the widget retrieves the default value which is `0` and sets it, and it is a perfectly valid value. When the widget is initialized on the client, it cannot find such a data item and considers the value as a custom one. This is why it is displayed in the visible input.

**Solution**

To avoid this default behavior, clear the value of the widget using its `Value` method.

    @model int
    @(Html.Kendo().ComboBoxFor(m)
            .Value(m == 0 ? "" : m.ToString())

    @* other options are omitted for breavity *@

### Only One Widget Instance Works on Page

This happens if two or more widgets or MVC server wrappers have the same `Name()`. The value specified via the `Name()` method is used as the `id` HTML attribute of the widget. The latter must be unique in the page.

**Solution**

Always use unique widget or MVC server wrappers names. For example, append an index to make the name unique.

### Loading Partial Views Containing Widgets Work Only the First Time

This happens because there is more than one Kendo UI widget with the same `Name()`.

**Solution**

Check the solution of the previous problem.

### MVC Wrappers Cause Double AJAX Postback in Debug Mode Using Ajax.Beginform()

**Solution**

Add the line from the example below to the `bundleconfig.cs` file.

    bundles.IgnoreList.Ignore("*.unobtrusive-ajax.min.js", OptimizationMode.WhenDisabled)

This prevents the unobtrusive Ajax script from loading twice&mdash;the minified and non-minified&mdash;in debug mode, which is what causes the double postback.

Alternatively, just remove the non-minified script from the project. Obviously, this has implications for debugging, if you are inclined to debug the scripts included in the project template.

### Theme Images Do Not Appear When Using CSS Bundling

**Solution**

When the Kendo UI theme images do not appear in this case, refer to the [article on CSS bundling]({% slug fundamentals_aspnetmvc %}#using-css-bundling).

### MVC Wrapper with Ajax Binding Shows Outdated Data

If a widget does not show the updated data on a page visit, the most common reason for this is a cached Ajax request. The Internet Explorer is notorious with its requests caching, which returns the cached `XmlHttpRequest` result instead of making a new request.

**Solution**

Choose either of the options to overcome this behavior:

* Force the `check for newer versions of stored pages` [(link)](https://docs.telerik.com/aspnet-mvc/getting-started/helper-basics/fundamentals#using-css-bundling).
* Disable caching using HTTP headers.

        [OutputCache(Duration=0,NoStore=true,VaryByParam="None")]
        public JsonResult Index()
        {
            //TODO: return the updated data here!
            return Json(new string[] {});
        }

## Date Picker HtmlHelpers

### Display the DateTimeOffset Value in a Widget

The DatePicker, DateTimePicker, and TimePicker widgets support only the `DateTime` structure.

**Solution**

Convert [`DateTimeOffset`](http://msdn.microsoft.com/en-us/library/system.datetimeoffset.aspx) into a DatePicker, DateTimePicker, or TimePicker to show the date and time correctly.

### Client Validation Fails with Invalid Date

By default, the ASP.NET MVC project uses jQuery validate framework, which does not provide support for internationalized dates. This means that every string which [`Date.parse`](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/parse) is not able to define as a valid date, is reported as invalid.

**Solution**

As extending open source libraries is outside the Kendo UI scope, you need to resolve this issue manually. For more information, check [this link](http://www.dotnet-programming.com/post/2011/12/14/Globalization-Validation-and-DateNumber-Formats-in-AspNet-MVC.aspx), or use the [Kendo UI Validator](https://demos.telerik.com/kendo-ui/web/validator/index.html), which supports the validation of internationalized dates.

## Editor HtmlHelper

### Editor Shows HTML Tags after Validation

After the server-side validation, the Editor displays the posted `encoded` value from the `ModelState`. The Razor view engine encodes it once again and, as a result,
HTML tags appear inside the widget content area. More information about this behavior related to ASP.NET MVC is available at
the blog post on [wrong value rendering by ASP.NET MVC's HtmlHelpers](https://docs.microsoft.com/bg-bg/archive/blogs/simonince/asp-net-mvcs-html-helpers-render-the-wrong-value).

**Solution**

You have two alternative options to tackle this scenario:

* Clear the `ModelState` in the controller's action method after the `POST`.
* Set `Encode(false)` for the Editor and set an `[AllowHtml]` attribute to the model property, so that the Editor's value is submitted non-encoded.

For additional tips on the Editor widget, refer to the [troubleshooting article on common Kendo UI Editor issues](https://docs.telerik.com/kendo-ui/controls/editor/troubleshooting).

## See Also

* [Validation Issues in Telerik UI for ASP.NET MVC]({% slug troubleshooting_validation_aspnetmvc %})
* [Scaffolding Issues in Telerik UI for ASP.NET MVC]({% slug troubleshooting_scaffolding_aspnetmvc %})
* [Common Issues in the Grid ASP.NET MVC HtmlHelper Extension]({% slug troubleshoot_gridhelper_aspnetmvc %})
* [Excel Export with the Grid ASP.NET MVC HtmlHelper Extension]({% slug excelissues_gridhelper_aspnetmvc %})
* [Common Issues in the Spreadsheet ASP.NET MVC HtmlHelper Extension]({% slug troubleshoot_spreadsheethelper_aspnetmvc %})
* [Common Issues in the Upload ASP.NET MVC HtmlHelper Extension]({% slug troubleshoot_uploadhelper_aspnetmvc %})
* [Common Issues in Kendo UI](https://docs.telerik.com/kendo-ui/troubleshoot/troubleshooting-common-issues)
* [JavaScript Errors](https://docs.telerik.com/kendo-ui/troubleshoot/troubleshooting-js-errors)
* [Performance Issues](https://docs.telerik.com/kendo-ui/troubleshoot/troubleshooting-memory-leaks)
* [Content Security Policy](https://docs.telerik.com/kendo-ui/troubleshoot/content-security-policy)
* [Common Issues in Kendo UI Excel Export](https://docs.telerik.com/kendo-ui/framework/excel/troubleshoot/common-issues)
* [Common Issues in Kendo UI Charts](https://docs.telerik.com/kendo-ui/controls/charts/troubleshoot/common-issues)
* [Performance Issues in Kendo UI Widgets for Data Visualization](https://docs.telerik.com/kendo-ui/troubleshoot/troubleshooting-memory-leaks)
* [Common Issues in Kendo UI ComboBox](https://docs.telerik.com/kendo-ui/controls/combobox/troubleshoot/troubleshooting)
* [Common Issues in Kendo UI Diagram](https://docs.telerik.com/kendo-ui/controls/diagram/troubleshoot/common-issues)
* [Common Issues in Kendo UI DropDownList](https://docs.telerik.com/kendo-ui/controls/dropdownlist/troubleshoot/troubleshooting)
* [Common Issues in Kendo UI Editor](https://docs.telerik.com/kendo-ui/controls/editor/troubleshoot/troubleshooting)
* [Common Issues in Kendo UI MultiSelect](https://docs.telerik.com/kendo-ui/controls/multiselect/troubleshoot/troubleshooting)
* [Common Issues in Kendo UI Scheduler](https://docs.telerik.com/kendo-ui/controls/scheduler/troubleshoot/troubleshooting)
* [Common Issues in Kendo UI Upload](https://docs.telerik.com/kendo-ui/controls/upload/troubleshoot/troubleshooting)
* [Common Issues Related to Styling, Appearance, and Rendering](https://docs.telerik.com/kendo-ui/styles-and-layout/troubleshoot/troubleshooting)
