---
title: Disable Cascading Children ComboBoxes
page_title: Disable Cascading Children ComboBoxes
description: "Learn how to disable a cascading child Kendo UI ComboBox."
previous_url: /controls/editors/combobox/how-to/disable-child-combo, /controls/editors/combobox/how-to/cascade/disable-child-combo
slug: howto_disable_child_cascading_combobox
tags: telerik, kendo, jquery, combobox, disable, cascading, for, children
component: combobox
type: how-to
res_type: kb
---

## Environment

<table>
 <tr>
  <td>Product</td>
  <td>Progress® Kendo UI® ComboBox for jQuery</td>
 </tr>
 <tr>
  <td>Operating System</td>
  <td>Windows 10 64bit</td>
 </tr>
 <tr>
  <td>Visual Studio Version</td>
  <td>Visual Studio 2017</td>
 </tr>
 <tr>
  <td>Preferred Language</td>
  <td>JavaScript</td>
 </tr>
</table>

## Description

How can I disable a cascading child Kendo UI ComboBox?

## Solution

The following example demonstrates how to achieve the desired scenario.

```dojo
  <div id="example">
    <div class="demo-section k-header">
      <h4>View Order Details</h4>
      <p>
        <label for="categories">Categories:</label><input id="categories" style="width: 270px" value="1"/>
      </p>
      <p>
        <label for="products">Products:</label><input id="products" disabled="disabled" style="width: 270px" />
      </p>
    </div>

    <style scoped>
      .demo-section {
        width: 400px;
      }
      .demo-section p {
        margin-top: 1em;
      }
      .demo-section label {
        display: inline-block;
        width: 100px;
        padding-right: 5px;
        text-align: right;
      }
      .demo-section .k-button {
        margin: 1em 0 0 105px;
      }
      .k-readonly
      {
        color: gray;
      }
    </style>

    <script>
      $(document).ready(function() {
        var categories = $("#categories").kendoComboBox({
          filter: "contains",
          placeholder: "Select category...",
          dataTextField: "CategoryName",
          dataValueField: "CategoryID",
          dataSource: {
            type: "odata-v4",
            serverFiltering: true,
            transport: {
              read: "https://demos.telerik.com/service/v2/odata/Categories"
            }
          }
        }).data("kendoComboBox");

        var products = $("#products").kendoComboBox({
          cascadeFrom: "categories",
          filter: "contains",
          placeholder: "Type 'cha'...",
          dataTextField: "ProductName",
          dataValueField: "ProductID",
          dataSource: {
            type: "odata-v4",
            serverFiltering: true,
            transport: {
              read: "https://demos.telerik.com/service/v2/odata/Products"
            }
          },
          dataBound: function() {
            this.enable(false);
          }
        }).data("kendoComboBox");
      });
    </script>
  </div>
```

## See Also

* [ComboBox JavaScript API Reference](/api/javascript/ui/combobox)
* [Bypass Boundary Detection]({% slug howto_bypass_boudary_detection_combobox %})
* [Configure Deferred Value Binding]({% slug howto_configure_deffered_value_binding_combobox %})
* [Implement Cascading with Local Data]({% slug howto_implement_cascading_local_data_combobox %})
* [Make Visible Input Readonly]({% slug howto_make_visible_inputs_readonly_combobox %})
* [Open ComboBox When onFocus is Triggered]({% slug howto_open_onfocus_combobox %})
* [Prevent Adding Custom Values]({% slug howto_prevent_adding_custom_values_combobox %})
* [Underline Matched Search]({% slug howto_underline_matched_search_combobox %})
