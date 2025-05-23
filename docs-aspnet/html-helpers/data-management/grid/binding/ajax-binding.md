---
title: Ajax Binding
page_title: Ajax Binding
description: "Learn how to implement Ajax binding with the Telerik UI Grid component for {{ site.framework }}."
previous_url: /helpers/html-helpers/grid/ajax-binding, /helpers/data-management/grid/binding/ajax-binding
slug: htmlhelpers_grid_aspnetcore_ajaxbinding
position: 4
---

# Ajax Binding

You can configure the Grid component extension for Ajax binding.

When configured for Ajax binding, the Grid for {{ site.framework }} makes Ajax requests when doing paging, sorting, filtering, grouping, or when saving data. For a runnable example, refer to the [demo on Ajax binding of the Grid](https://demos.telerik.com/{{ site.platform }}/grid/remote-data-binding).  

The Ajax-bound mode has the following features:
- The Grid retrieves only the data (in JSON format) representing the current page. As a result, only the Grid is updated.
- All Grid templates (column, detail) are executed client-side. They follow the [Kendo UI for jQuery template](https://docs.telerik.com/kendo-ui/framework/templates/overview) definition rules and may contain embedded JavaScript code.

{% if site.core %}
@[template](/_contentTemplates/core/json-serialization-note.md#json-serialization-note)
{% endif %}

To configure the Grid for {{ site.framework }} to do Ajax binding to the **Products** table of a sample database:

1. Create a new {{ site.framework }} web application. Follow the steps from the [introductory article]({% if site.core %}{% slug gettingstarted_aspnetmvc6_aspnetmvc %}{% else %}{% slug gettingstarted_aspnetmvc %}{% endif %}) to add {{ site.product }} to the application. 
{% if site.core %}
1. Install the `Microsoft.EntityFrameworkCore` NuGet package.
1. Install `Microsoft.EntityFrameworkCore.SqlServer` package.
1. Install `Microsoft.EntityFrameworkCore.Tools` package.
1. Run a `Scaffold-DbContext` command in the Visual Studio Package Management Console. It will generate models from the tables in a database called 'Sample'. For more information on scaffolding a model from an existing database refer to [this Microsoft article](https://docs.microsoft.com/en-us/ef/core/get-started/aspnetcore/existing-db#reverse-engineer-your-model).

    Scaffold-DbContext 'Server=(localdb)\MSSQLLocalDB;Integrated Security=true;AttachDbFileName=D:\MyProjects\TelerikAspNetCoreApp1\TelerikAspNetCoreApp1\App_Data\Sample.mdf;Trusted_Connection=True;' Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models -Context SampleEntities
    
Note that the command specifies the path to the database `Sample.mdf` file.

{% else %}
If you have installed the [Telerik UI for ASP.NET MVC Visual Studio Extensions]({% slug overview_visualstudio_aspnetcore %}), create a Telerik UI for ASP.NET MVC application using the [New Project Wizard]({% slug newprojectwizards_visualstudio_aspnetcore %}). 

1. Add a new `Entity Framework Data Model`. Right-click the `~/Models` folder in the solution explorer and pick **Add new item**. Choose **Data** > **ADO.NET Entity Data Model** in the **Add New Item** dialog. Name the model `SampleModel` and click **Next**. This starts the **Entity Data Model Wizard**.
1.  Pick the **EF Designer from database** option and click **Next**. Configure a connection to the Northwind database. Click **Next**.

    ![{{ site.product_short }} Choosing the connection](../images/grid-binding-choose-data-connection.png)

1. Choose the **Products** table in the **Which database objects do you want to include in your model?** section. Leave all other options as they are by default. Click **Finish**.

    ![{{ site.product_short }} Choosing the Product table in the database objects](../images/grid-binding-choose-database-objects.png)

{% endif %}

1. Open the `HomeController.cs` and add a new action method which will return the Products as JSON. The Grid makes Ajax requests to this action.

    ```C#
    public ActionResult Products_Read()
    {
    }
    ```

1. Add a new parameter of type `Kendo.Mvc.UI.DataSourceRequest` to the action. It will contain the current Grid request information&mdash;page, sort, group, and filter. Decorate that parameter with the `Kendo.Mvc.UI.DataSourceRequestAttribute`. This attribute will populate the `DataSourceRequest` object from the posted data. Now import the `Kendo.Mvc.UI` namespace.

    ```C#
    public ActionResult Products_Read([DataSourceRequest]DataSourceRequest request)
    {
    }
    ```

1. Use the `ToDataSourceResult` extension method to convert the Products to a `Kendo.Mvc.UI.DataSourceResult` object. This extension method will page, filter, sort, or group your data using the information provided by the `DataSourceRequest` object. To use the `ToDataSourceResult` extension method, import the `Kendo.Mvc.Extensions` namespace.

    ```C#
    public ActionResult Products_Read([DataSourceRequest]DataSourceRequest request)
    {
        using (var northwind = new SampleEntities())
        {
            IQueryable<Product> products = northwind.Products;
            DataSourceResult result = products.ToDataSourceResult(request);
            return Json(result);
        }
    }
    ```

1. Return `DataSourceResult` as JSON. Alternatively, you can use an asynchronous action and return `ToDataSourceResultAsync` as JSON.

    ```C#
    public ActionResult Products_Read([DataSourceRequest]DataSourceRequest request)
    {
        using (var northwind = new SampleEntities())
        {
            IQueryable<Product> products = northwind.Products;
            DataSourceResult result = products.ToDataSourceResult(request);
            return Json(result);
        }
    }
    ```

    The asynchronous `ToDataSourceResultAsync` counterpart:

    ```C#
    public async Task<ActionResult> Products_Read([DataSourceRequest]DataSourceRequest request)
    {
        using (var northwind = new SampleEntities())
        {
            IQueryable<Product> products = northwind.Products;
            DataSourceResult result = await products.ToDataSourceResultAsync(request);
            return Json(result);
        }
    }
    ```

1. In the view, configure the Grid to use the action method created in the previous steps.

    {% if site.core %}
    ```HtmlHelper
        @(Html.Kendo().Grid<TelerikAspNetCoreApp1.Models.Products>()
            .Name("grid")
            .DataSource(dataSource => dataSource //Configure the Grid data source.
                .Ajax() //Specify that Ajax binding is used.
                .Read(read => read.Action("Products_Read", "Home")) // Set the action method which will return the data in JSON format.
            )
            .Columns(columns =>
            {
                //Create a column bound to the ProductId property.
                columns.Bound(product => product.ProductId);
                //Create a column bound to the ProductName property.
                columns.Bound(product => product.ProductName);
                //Create a column bound to the UnitsInStock property.
                columns.Bound(product => product.UnitsInStock);
            })
            .Pageable() // Enable paging
                .Sortable() // Enable sorting
        )
    ```
    ```TagHelper
    <div style="width:500px">
        <kendo-grid name="grid">
            <datasource type="DataSourceTagHelperType.Ajax">
                <transport>
                    <read url="@Url.Action("Products_Read", "Home")" />
                </transport>
            </datasource>
            <pageable enabled="true">
            </pageable>
            <sortable enabled="true"/>
            <columns>
                <column field="ProductID"/>
                <column field="ProductName"/>
                <column field="UnitsInStock"/>
            </columns>
        </kendo-grid>
    </div>
    ```
    {% else %}
    ```HtmlHelper
        @(Html.Kendo().Grid<TelerikMvcApp1.Models.Product>()
            .Name("grid")
            .DataSource(dataSource => dataSource //Configure the Grid data source.
                .Ajax() //Specify that Ajax binding is used.
                .Read(read => read.Action("Products_Read", "Home")) // Set the action method which will return the data in JSON format.
            )
            .Columns(columns =>
            {
                //Create a column bound to the ProductID property.
                columns.Bound(product => product.ProductID);
                //Create a column bound to the ProductName property.
                columns.Bound(product => product.ProductName);
                //Create a column bound to the UnitsInStock property.
                columns.Bound(product => product.UnitsInStock);
            })
            .Pageable() // Enable paging
                .Sortable() // Enable sorting
        )
    ```
    {% endif %}

1. Build and run the application.

    {% if site.core %}
    ![{{ site.product_short }} The final result is a Grid bound to data](../images/grid-binding-core.png)
    {% else %}
    ![{{ site.product_short }} The final result is a Grid bound to data](../images/grid-binding-mvc.png)
    {% endif %}

To download a Visual Studio Project, refer to [this GitHub repository]({% if site.mvc %} https://github.com/telerik/ui-for-aspnet-mvc-examples/tree/master/Telerik.Examples.Mvc/Telerik.Examples.Mvc/Areas/GridAjaxBindingDatabase{% else %}https://github.com/telerik/ui-for-aspnet-core-examples/blob/master/Telerik.Examples.Mvc/Telerik.Examples.Mvc/Views/Grid/AjaxBinding.cshtml{% endif %}).

## See Also

{% if site.core %}
* [ASP.NET Core DataGrid Homepage](https://www.telerik.com/aspnet-core-ui/grid)
{% endif %}
* [DataSource Overview]({% slug htmlhelpers_datasource_aspnetcore %})
* [Grid FAQs]({% slug freqaskedquestions_gridhelper_aspnetmvc %})
* [Custom Ajax Binding by the Grid HtmlHelper for {{ site.framework }} (Demo)](https://demos.telerik.com/{{ site.platform }}/grid/customajaxbinding)
* [Knowledge Base Section](/knowledge-base)
* [Server-Side API](/api/grid)
