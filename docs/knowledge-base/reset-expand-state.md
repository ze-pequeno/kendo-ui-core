---
title: Reset the Expand State of the PivotGrid
page_title: Reset PivotGrid Expand State
description: "Learn how to reset expand/collapse state and fetch the data again in a Kendo UI PivotGrid component."
previous_url: /controls/data-management/pivotgrid/how-to/reset-expand-state, /controls/data-management/pivotgrid/how-to/dimensions/reset-expand-state
slug: howto_reset_expand_state_pivotgrid
tags: kendoui, pivotgrid, reset, expand, state
component: pivotgrid
type: how-to
res_type: kb
---

## Environment

<table>
 <tr>
  <td>Product</td>
  <td>Progress® Kendo UI® PivotGrid for jQuery</td>
 </tr>
 <tr>
  <td>Operating System</td>
  <td>Windows 10 64bit</td>
 </tr>
 <tr>
  <td>Browser</td>
  <td>Google Chrome</td>
 </tr>
 <tr>
  <td>Browser Version</td>
  <td>61.0.3163.100</td>
 </tr>
</table>


## Description

How can I reset the expand or collapse state of the Kendo UI PivotGrid?  

## Solution

The following example demonstrates how to reset the expand/collapse state and fetch the data again in a Kendo UI PivotGrid component.

```dojo
    <div id="example">
      <ol>
        <li>Expand "CY 2005" member</li>
        <li>Click "reset" button</li>
        <ol>
          <br />
          <button id="reset">Reset</button>
          <br />
          <div id="pivotgrid"></div>

          <script>
            $(document).ready(function () {
              var pivotgrid = $("#pivotgrid").kendoPivotGrid({
                filterable: true,
                columnWidth: 200,
                height: 580,
                dataSource: {
                  type: "xmla",
                  columns: [{ name: "[Date].[Calendar]", expand: true }, { name: "[Product].[Category]" } ],
                  rows: [{ name: "[Geography].[City]" }],
                  measures: ["[Measures].[Internet Sales Amount]"],
                  transport: {
                    connection: {
                      catalog: "Adventure Works DW 2008R2",
                      cube: "Adventure Works"
                    },
                    read: "https://demos.telerik.com/service/v2/olap/msmdpump.dll",
                    parameterMap: function(options, type) {
                      var query = kendo.data.transports.xmla.fn.options.parameterMap(options, type);

                      //modify the query here if needed

                      return query;
                    }
                  },
                  schema: {
                    type: "xmla"
                  },
                  error: function (e) {
                    alert("error: " + kendo.stringify(e.errors[0]));
                  }
                }
              }).data("kendoPivotGrid");

              $("#reset").click(function() {
                // Create a new dataSource instance using the same options.
                let clonedOptions = pivotgrid.dataSource.options,
                    newDs = new kendo.data.PivotDataSource(clonedOptions);

                // Set the dataSource.
                pivotgrid.setDataSource(newDs);
              });
            });
          </script>
          </div>
```

## See Also

* [PivotGrid JavaScript API Reference](/api/javascript/ui/pivotgrid)
* [Change Data Source Dynamically]({% slug howto_change_datasource_dynamically_pivotgrid %})
* [Drill Down Navigation Always Starting from Root Tuple]({% slug howto_drill_down_navigation_startingfrom_root_tuple_pivotgrid %})
* [Expand Multiple Column Dimensions]({% slug howto_expand_multiple_column_dimensions_pivotgrid %})
* [Filter by Using the include Operator]({% slug howto_use_include_operator_pivotgrid %})
