---
title: Data Binding
page_title: Data Binding
description: "Learn how to bind the Telerik UI StockChart component for {{ site.framework }} (MVC 6 or {{ site.framework }} MVC) to data."
previous_url: /helpers/charts/stockchart/data-binding
slug: databinding_stockchart_aspnetcore
position: 2
---

# Data Binding

The Telerik UI StockChart provides the [single data-source](#single-data-source-mode) and [master and navigator data-source](#master-and-navigator-data-source-mode) binding modes.

In both modes, you have to set a [`DateField`](/api/kendo.mvc.ui.fluent/stockchartbuilder#datefieldsystemstring) to indicate the field that contains the date of the data item.

> * The StockChart supports only binding to time series.
> * Discrete categories and XY or Scatter series are not supported.

## Single Data-Source Mode

In the single data-source binding mode, the StockChart is set up with a single data source and that single Data Source instance is used for both the main and the **Navigator** panes. The single data-source binding mode is used for all series in the Chart including the **Navigator** pane. The Data Source is fetched once and is filtered internally by the Chart. No additional requests will be made unless the API methods of the Data Source are invoked. For a runnable example, refer to the [demo on the basic usage of the StockChart](https://demos.telerik.com/{{ site.platform }}/financial/index).

The following example demonstrates a StockChart in a single data-source binding mode.

```HtmlHelper
    @(Html.Kendo().StockChart<Kendo.Mvc.Examples.Models.StockDataPoint>()
        .Name("stockChart")
        .Title("The Boeing Company \n (NYSE:BA)")
        .DataSource(ds => ds.Read(read => read
            .Action("_BoeingStockData", "Financial")
        ))
        .DateField("Date")
        .Series(series =>
        {
            series.Candlestick(s => s.Open, s => s.High, s => s.Low, s => s.Close);
        })
        .Navigator(nav => nav
            .Series(series =>
            {
                series.Area(s => s.Close);
            })
            .Select(
                DateTime.Parse("2009/02/05"),
                DateTime.Parse("2011/10/07")
            )
        )
    )
```
{% if site.core %}
```TagHelper
    <kendo-stockchart name="stockChartTag"
            date-field="Date">
        <chart-title text=" The Boeing Company \n (NYSE:BA)"></chart-title>
        <datasource>
            <transport>
                <read  url="@Url.Action("_BoeingStockData", "Financial")"/>
            </transport>
             <schema>
                <model>
                    <fields>
                        <field name="Date" type="date"></field>
                        <field name="Close" type="number"></field>
                        <field name="Volume" type="number"></field>
                        <field name="Open" type="number"></field>
                        <field name="High" type="number"></field>
                        <field name="Low" type="number"></field>
                        <field name="Symbol" type="string"></field>
                    </fields>
                </model>
            </schema>
        </datasource>
        <series>
            <series-item type="ChartSeriesType.Candlestick" open-field="Open" high-field="High" low-field="Low" close-field="Close"></series-item>
        </series>
        <navigator>
            <navigator-series>
                <series-item type="ChartSeriesType.Area" field="Close"></series-item>
            </navigator-series>
            <select from="new DateTime(2009,02,05)" to="new DateTime(2011,10,07)"></select>
        </navigator>
    </kendo-stockchart>
```
{% endif %}

## Master and Navigator Data-Source Mode

You can configure a second data source to load the **Navigator** data usually with reduced time resolution. This approach enables the filtering of the main data source and can be made more efficient. In the master and navigator data-source binding mode, the StockChart is set up with two data source instances&mdash;one for the main chart (master) and one for the **Navigator** pane (navigator). For a runnable example, refer to the [demo on virtualization](https://demos.telerik.com/{{ site.platform }}/financial/virtualization).

This mode is useful when the service is expected to provide views over the data with a different time resolution. The navigator can then load a low resolution preview while the main data source handles the detailed data.

The data for the **Navigator** will be fetched only once and without any filters. To change this behavior, change its configuration or call methods directly on the DataSource. The fetched data will be displayed in its entirety in the **Navigator** pane.

The main data source will be filtered based on the selected date range before being fetched. It is recommended that you use server filtering to make sure that only the visible range data is transferred. Even without applying server filtering, a reduction in the processing time will occur which is needed by the Chart to display the data.

Each subsequent pan, zoom, and selection operation will update the filters on the main data source and fetch it.

The following example demonstrates a StockChart in the master and navigator data-source binding mode.

```HtmlHelper
    @(Html.Kendo().StockChart<Kendo.Mvc.Examples.Models.StockDataPoint>()
        .Name("stockChart")
        .Title("The ACME Company")
        .DataSource(ds => ds
            .Read(read => read
                .Action("_StockData", "Financial")
            )
            .ServerOperation(true)
        )
        .DateField("Date")
        .Series(series =>
        {
            series.Candlestick(s => s.Open, s => s.High, s => s.Low, s => s.Close);
        })
        .Navigator(nav => nav
            .DataSource(ds => ds
                .Read(read => read
                    .Action("_StockData", "Financial")
                )
            )
            .Series(series =>
            {
                series.Area(s => s.High);
            })
            .Select(
                DateTime.Parse("2009/02/05"),
                DateTime.Parse("2011/10/07")
            )
        )
    )
```
{% if site.core %}
```TagHelper
    <kendo-stockchart name="stockChart"
                      date-field="Date">
        <chart-title text="The ACME Company"></chart-title>
        <datasource type="DataSourceTagHelperType.Ajax">
            <transport>
                <read url="@Url.Action("_StockData", "Financial")" />
            </transport>
            <schema>
                <model>
                    <fields>
                        <field name="Date" type="date"></field>
                        <field name="Close" type="number"></field>
                        <field name="Volume" type="number"></field>
                        <field name="Open" type="number"></field>
                        <field name="High" type="number"></field>
                        <field name="Low" type="number"></field>
                        <field name="Symbol" type="string"></field>
                    </fields>
                </model>
            </schema>
        </datasource>
        <navigator>
            <datasource type="DataSourceTagHelperType.Ajax">
                <transport>
                    <read url="@Url.Action("_StockData", "Financial")" />
                </transport>
            </datasource>
            <navigator-series>
                <series-item type="ChartSeriesType.Area" field="High"></series-item>
            </navigator-series>
            <select from="new DateTime(2017,02,05)" to="new DateTime(2019,10,07)"></select>
        </navigator>
        <series>
            <series-item type="ChartSeriesType.Candlestick" open-field="Open" high-field="High" low-field="Low" close-field="Close"></series-item>
        </series>
    </kendo-stockchart>
```
{% endif %}

The following example demonstrates a sample filter submitted by the StockChart for the main data source. The `filter` field is always `Date` regardless of the `DateField` setting.

```json
    {
        "logic": "and",
        "filters": [
            {
                "field": "Date",
                "operator": "gte",
                "value": "2009-01-31T22:00:00.000Z"
            },
            {
                "field": "Date",
                "operator": "lt",
                "value": "2011-10-06T21:00:00.000Z"
            }
        ]
    }
```

## See Also

* [Basic Usage of the StockChart HtmlHelper for {{ site.framework }} (Demo)](https://demos.telerik.com/{{ site.platform }}/financial)
{% if site.core %}
* [StockChart in Razor Pages]({% slug htmlhelper_chart_razorpages_aspnetcore %})
* [Using Telerik UI for ASP.NET Core in Razor Pages](https://docs.telerik.com/aspnet-core/getting-started/razor-pages#using-telerik-ui-for-aspnet-core-in-razor-pages)
{% endif %}
* [Server-Side HtmlHelper API of the StockChart](/api/stockchart)
{% if site.core %}
* [Server-Side TagHelper API of the StockChart](/api/taghelpers/stockchart)
{% endif %}
