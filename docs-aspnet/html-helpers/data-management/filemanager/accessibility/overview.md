---
title: Overview
page_title: FileManager Documentation | FileManager Accessibility
description: "Get started with the {{ site.product }} FileManager and learn about its accessibility support for WAI-ARIA, Section 508, and WCAG 2.2."
slug: htmlhelpers_filemanager_accessibility
position: 1
---

# FileManager Accessibility





Out of the box, the {{ site.product }} FileManager provides extensive accessibility support and enables users with disabilities to acquire complete control over its features.


The FileManager is compliant with the [Web Content Accessibility Guidelines (WCAG) 2.2 AA](https://www.w3.org/TR/WCAG22/) standards and [Section 508](https://www.section508.gov/) requirements, follows the [Web Accessibility Initiative - Accessible Rich Internet Applications (WAI-ARIA)](https://www.w3.org/WAI/ARIA/apg/) best practices for implementing the [keyboard navigation](#keyboard-navigation) for its `component` role, provides options for managing its focus and is tested against the most popular screen readers.

## WAI-ARIA


This section lists the selectors, attributes, and behavior patterns supported by the component and its composite elements, if any.


The FileManager component is a composite component that is used to represent file system-like structure. It contains:


 - `ToolBar` - on top of the component
 - `Splitter` - it separates the panes in the component
 - `TreeView` - in its left pane.
 - `Breadcrumb` - in the top of its center pane
 - `ListView` or a `Grid` - in its center pane.
 - `k-filemanager-preview` element - in its right pane


Each component implements its own dedicated ARIA spec.


The FileManager component integrates the ToolBar component and follows its WAI-ARIA spec:

[ToolBar accessibility specification]({% slug htmlhelpers_toolbar_accessibility %})


The component that organizes the inner structure of the FileManager is a Splitter:

[Splitter accessibility specification]({% slug htmlhelpers_splitter_accessibility %})


The main navigation component in the FileManager is the TreeView:

[TreeView accessibility specification]({% slug htmlhelpers_treeview_accessibility %})


The helper navigation component in the FileManager is the Breadcrumb:

[Breadcrumb accessibility specification]({% slug htmlhelpers_breadcrumb_accessibility %})


The component placed in the main pain of the FileManager can be a selectable ListView:

[ListView accessibility specification]({% slug htmlhelpers_listview_accessibility %})


or it can be a Grid:

[Grid accessibility specification]({% slug htmlhelpers_grid_accessibility %})


Apart from that the `.k-filemanager-preview` element must be focusable, so that its content would be comunicated to the users:

| Selector | Attribute | Usage |
| -------- | --------- | ----- |
| `.k-filemanager-preview` | `tabindex=0` | The element must be focusable, so that its content would be comunicated to the users. |

## Section 508


The FileManager is fully compliant with the [Section 508 requirements](http://www.section508.gov/).

## Testing


The FileManager has been extensively tested automatically with [axe-core](https://github.com/dequelabs/axe-core) and manually with the most popular screen readers.

> To report any accessibility issues, contact the team through the [Telerik Support System](https://www.telerik.com/account/support-center).

### Screen Readers


The FileManager has been tested with the following screen readers and browsers combinations:

| Environment | Tool |
| ----------- | ---- |
| Firefox | NVDA |
| Chrome | JAWS |
| Microsoft Edge | JAWS |



### Test Example

To test the FileManager component, refer to the [FileManager Accessibility Demo](https://demos.telerik.com/{{ site.platform }}/accessibility/filemanager).

## Keyboard Navigation

For details on how the FileManager keyboard navigation works, refer to the [FileManager Keyboard Navigation]({%slug keynav_aspnetcore_filemanager%}) article.

## See Also

* [Keyboard Navigation by the FileManager for {{ site.framework }} (Demo)](https://demos.telerik.com/{{ site.platform }}/filemanager/keyboard-navigation)
* [Keyboard Navigation by the FileManager for {{ site.framework }}]({% slug keynav_aspnetcore_filemanager %})
* [Accessibility in {{ site.product }}]({%slug overview_accessibility%})