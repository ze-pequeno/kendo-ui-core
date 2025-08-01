---
title: Disable Dirty Indicators in Grid by Using CSS
description: Learn how to disable dirty indicators in the Kendo UI Grid by using CSS.
type: how-to
page_title: Disable Dirty Indicators by Using CSS - Kendo UI for jQuery Data Grid
slug: disable-dirty-indicator-using-css
tags: dirty, indicator, grid, disable, css
ticketid: 1136481
res_type: kb
component: grid
---

## Environment

<table>
 <tr>
  <td>Product</td>
  <td>Progress® Kendo UI® Grid for jQuery</td> 
 </tr>
 <tr>
  <td>Operating System</td>
  <td>All</td>
 </tr>
 <tr>
  <td>Browser</td>
  <td>All</td>
 </tr>
 <tr>
  <td>Browser Version</td>
  <td>All</td>
 </tr>
</table>

## Description

How can I disable the dirty indicator which appears when the Grid uses batch editing?

## Solution

Use CSS and utilize the `.k-dirty` class.

```css
<style>
  .k-dirty{
    display: none;      
  }
</style>
```

For the full implementation, open the following example in the Dojo.

```dojo
<style>
  .k-dirty{
    display: none;      
  }
</style>
<div id="example">
  <div id="grid"></div>

  <script>
    $(document).ready(function () {
      var crudServiceBaseUrl = "https://demos.telerik.com/service/v2/core",
          dataSource = new kendo.data.DataSource({
            transport: {
                read:  {
                    url: crudServiceBaseUrl + "/Products"
                },
                update: {
                    url: crudServiceBaseUrl + "/Products/Update",
                    type: "POST",
            		contentType: "application/json"
                },
                destroy: {
                    url: crudServiceBaseUrl + "/Products/Destroy",
                    type: "POST",
            		contentType: "application/json"
                },
                create: {
                    url: crudServiceBaseUrl + "/Products/Create",
                    type: "POST",
            		contentType: "application/json"
                },
                parameterMap: function(options, operation) {
                    if (operation !== "read" && options.models) {
                        return kendo.stringify(options.models);
                    }
                }
            },
            batch: true,
            pageSize: 20,
            schema: {
              model: {
                id: "ProductID",
                fields: {
                  ProductID: { editable: false, nullable: true },
                  ProductName: { validation: { required: true } },
                  UnitPrice: { type: "number", validation: { required: true, min: 1} },
                  Discontinued: { type: "boolean" },
                  UnitsInStock: { type: "number", validation: { min: 0, required: true } }
                }
              }
            }
          });

      $("#grid").kendoGrid({
        dataSource: dataSource,
        navigatable: true,
        pageable: true,
        height: 550,
        toolbar: ["create", "save", "cancel"],
        columns: [
          "ProductName",
          { field: "UnitPrice", title: "Unit Price", format: "{0:c}", width: 120 },
          { field: "UnitsInStock", title: "Units In Stock", width: 120 },
          { field: "Discontinued", width: 120 },
          { command: "destroy", title: "&nbsp;", width: 150 }],
        editable: true
      });
    });
  </script>
</div>
```

## See Also

* [Customization of Appearance in Kendo UI]({% slug sassbasedthemes_customization_kendoui %})
