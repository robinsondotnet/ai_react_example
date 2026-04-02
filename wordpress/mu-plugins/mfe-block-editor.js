/**
 * MFE Component — Gutenberg Block Editor Script
 *
 * Uses WordPress globals (wp.blocks, wp.element, wp.blockEditor, wp.components).
 * No build step required.
 */
(function () {
  var el = wp.element.createElement;
  var Fragment = wp.element.Fragment;
  var useState = wp.element.useState;
  var registerBlockType = wp.blocks.registerBlockType;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var BlockControls = wp.blockEditor.BlockControls;
  var useBlockProps = wp.blockEditor.useBlockProps;
  var PanelBody = wp.components.PanelBody;
  var SelectControl = wp.components.SelectControl;
  var TextControl = wp.components.TextControl;
  var Button = wp.components.Button;
  var ToolbarGroup = wp.components.ToolbarGroup;
  var ToolbarButton = wp.components.ToolbarButton;
  var Placeholder = wp.components.Placeholder;
  var Dashicon = wp.components.Dashicon;

  var bundlesData = window.mfeBlockData || { elements: [], previewUrl: "" };

  function getElementOptions() {
    var options = [{ label: "— Select element —", value: "" }];
    bundlesData.elements.forEach(function (item) {
      options.push({
        label: item.element + " (" + item.bundle + ")",
        value: item.element,
      });
    });
    return options;
  }

  // Serialize key-value pairs array to the stored "key=value key2=value2" string
  function pairsToString(pairs) {
    return pairs
      .filter(function (p) {
        return p.key.trim() !== "";
      })
      .map(function (p) {
        return p.key.trim() + "=" + p.value;
      })
      .join(" ");
  }

  // Parse stored string back to pairs array
  function stringToPairs(str) {
    if (!str) return [];
    return str
      .split(" ")
      .filter(Boolean)
      .map(function (chunk) {
        var idx = chunk.indexOf("=");
        if (idx === -1) return { key: chunk, value: "" };
        return {
          key: chunk.substring(0, idx),
          value: chunk.substring(idx + 1),
        };
      });
  }

  function getPreviewSrc(element, attrs, style) {
    if (!element) return "";
    var params = new URLSearchParams({ mfe_preview: "1", element: element });
    if (attrs) params.set("attrs", attrs);
    if (style) params.set("style", style);
    return bundlesData.previewUrl + "?" + params.toString();
  }

  /* ─── Reusable key-value pair editor component ─────────────────────── */

  function AttrRows(props) {
    // Keep pairs in local state so empty rows survive until the user fills them in.
    // Only serialize non-empty pairs back to the parent via props.onChange.
    var localState = useState(function () {
      var initial = stringToPairs(props.value);
      return initial.length > 0 ? initial : [];
    });
    var pairs = localState[0];
    var setPairs = localState[1];
    var compact = props.compact;

    function syncToParent(newPairs) {
      setPairs(newPairs);
      // Only persist rows that have a non-empty key
      props.onChange(pairsToString(newPairs));
    }

    function changeKey(i, val) {
      var copy = pairs.slice();
      copy[i] = { key: val, value: copy[i].value };
      syncToParent(copy);
    }

    function changeValue(i, val) {
      var copy = pairs.slice();
      copy[i] = { key: copy[i].key, value: val };
      syncToParent(copy);
    }

    function removeRow(i) {
      var copy = pairs.slice();
      copy.splice(i, 1);
      syncToParent(copy);
    }

    function addRow(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      // Append empty row — local state keeps it visible even though the key is empty
      setPairs(pairs.concat([{ key: "", value: "" }]));
    }

    function handleRemoveClick(i) {
      return function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        removeRow(i);
      };
    }

    var inputStyle = compact
      ? {
          flex: 1,
          minWidth: 0,
          padding: "4px 8px",
          fontSize: "13px",
          border: "1px solid #c4c7ca",
          borderRadius: "3px",
        }
      : {};

    var rows = pairs.map(function (pair, i) {
      return el(
        "div",
        {
          key: i,
          style: {
            display: "flex",
            gap: "6px",
            alignItems: "center",
            marginBottom: "6px",
          },
        },
        compact
          ? el("input", {
              type: "text",
              placeholder: "attribute",
              value: pair.key,
              onChange: function (e) {
                changeKey(i, e.target.value);
              },
              onClick: function (e) { e.stopPropagation(); },
              style: inputStyle,
            })
          : el(TextControl, {
              placeholder: "attribute",
              value: pair.key,
              onChange: function (val) {
                changeKey(i, val);
              },
              __nextHasNoMarginBottom: true,
              style: { flex: 1, marginBottom: 0 },
            }),
        compact
          ? el("input", {
              type: "text",
              placeholder: "value",
              value: pair.value,
              onChange: function (e) {
                changeValue(i, e.target.value);
              },
              onClick: function (e) { e.stopPropagation(); },
              style: inputStyle,
            })
          : el(TextControl, {
              placeholder: "value",
              value: pair.value,
              onChange: function (val) {
                changeValue(i, val);
              },
              __nextHasNoMarginBottom: true,
              style: { flex: 1, marginBottom: 0 },
            }),
        el(Button, {
          icon: "trash",
          label: "Remove",
          isSmall: true,
          isDestructive: true,
          onClick: handleRemoveClick(i),
        }),
      );
    });

    return el(
      "div",
      null,
      rows.length > 0
        ? el(
            "div",
            {
              style: compact
                ? {
                    display: "flex",
                    gap: "6px",
                    marginBottom: "4px",
                    fontSize: "11px",
                    color: "#757575",
                    paddingLeft: "2px",
                  }
                : {
                    display: "flex",
                    gap: "6px",
                    marginBottom: "4px",
                    fontSize: "11px",
                    color: "#757575",
                  },
            },
            el("span", { style: { flex: 1 } }, "Name"),
            el("span", { style: { flex: 1 } }, "Value"),
            el("span", { style: { width: "36px" } }), // spacer for delete button
          )
        : null,
      rows,
      el(
        "button",
        {
          type: "button",
          onMouseDown: function (e) {
            e.preventDefault();
            e.stopPropagation();
            addRow(e);
          },
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            marginTop: rows.length > 0 ? "4px" : "0",
            padding: "6px 12px",
            fontSize: "13px",
            border: "1px solid #757575",
            borderRadius: "4px",
            background: "#fff",
            cursor: "pointer",
            color: "#1e1e1e",
          },
        },
        "+ Add Attribute",
      ),
    );
  }

  /* ─── Block registration ───────────────────────────────────────────── */

  registerBlockType("mfe/component", {
    title: "MFE Component",
    description: "Embed a microfrontend web component with live preview.",
    icon: "superhero-alt",
    category: "embed",
    keywords: ["microfrontend", "web component", "mfe", "aem", "embed"],
    supports: {
      html: false,
      align: ["wide", "full"],
      reusable: true,
    },
    attributes: {
      element: { type: "string", default: "" },
      attrs: { type: "string", default: "" },
      style: { type: "string", default: "display:block;min-height:200px" },
    },

    edit: function (props) {
      var attributes = props.attributes;
      var setAttributes = props.setAttributes;
      var previewState = useState(false);
      var showPreview = previewState[0];
      var setShowPreview = previewState[1];
      var blockProps = useBlockProps();

      function getAttrsSummary() {
        if (!attributes.attrs) return "No attributes";
        var pairs = stringToPairs(attributes.attrs);
        return pairs
          .map(function (p) {
            return p.key + '="' + p.value + '"';
          })
          .join("  ");
      }

      // ── Sidebar ──
      var inspector = el(
        InspectorControls,
        null,
        el(
          PanelBody,
          { title: "Component Settings", initialOpen: true },
          el(SelectControl, {
            label: "Element",
            value: attributes.element,
            options: getElementOptions(),
            onChange: function (val) {
              setAttributes({ element: val });
            },
          }),
          el(TextControl, {
            label: "Inline Style",
            value: attributes.style,
            onChange: function (val) {
              setAttributes({ style: val });
            },
          }),
        ),
        el(
          PanelBody,
          { title: "Attributes", initialOpen: true },
          el(AttrRows, {
            value: attributes.attrs,
            onChange: function (val) {
              setAttributes({ attrs: val });
            },
            compact: false,
          }),
        ),
      );

      // ── Toolbar ──
      var toolbar = el(
        BlockControls,
        null,
        el(
          ToolbarGroup,
          null,
          el(ToolbarButton, {
            icon: showPreview ? "edit" : "visibility",
            label: showPreview ? "Edit" : "Preview",
            onClick: function () {
              setShowPreview(!showPreview);
            },
            isPressed: showPreview,
          }),
        ),
      );

      // ── Content area ──
      var content;

      if (!attributes.element) {
        // No element yet — setup placeholder
        content = el(
          Placeholder,
          {
            icon: "superhero-alt",
            label: "MFE Component",
            instructions: "Select a microfrontend element to get started.",
          },
          el(
            "div",
            { style: { width: "100%", maxWidth: "360px" } },
            el(SelectControl, {
              value: attributes.element,
              options: getElementOptions(),
              onChange: function (val) {
                setAttributes({ element: val });
              },
            }),
          ),
        );
      } else if (showPreview) {
        // Live preview via iframe
        var src = getPreviewSrc(
          attributes.element,
          attributes.attrs,
          attributes.style,
        );
        content = el(
          "div",
          {
            style: {
              position: "relative",
              minHeight: "250px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              overflow: "hidden",
              background: "#f9f9f9",
            },
          },
          el(
            "div",
            {
              style: {
                background: "#1e1e1e",
                color: "#fff",
                padding: "4px 12px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              },
            },
            el(
              "span",
              null,
              "⚡ Live Preview: ",
              el(
                "code",
                { style: { color: "#96f" } },
                "<" + attributes.element + ">",
              ),
            ),
            el(
              "button",
              {
                onClick: function () {
                  setShowPreview(false);
                },
                style: {
                  background: "transparent",
                  border: "1px solid #555",
                  color: "#ccc",
                  padding: "2px 8px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "11px",
                },
              },
              "← Back to Edit",
            ),
          ),
          el("iframe", {
            src: src,
            style: {
              width: "100%",
              minHeight: "400px",
              border: "none",
              display: "block",
            },
            sandbox: "allow-scripts allow-same-origin",
            title: "MFE Preview: " + attributes.element,
          }),
        );
      } else {
        // Edit card — element selector + inline attribute editor
        content = el(
          "div",
          {
            style: {
              border: "2px solid #3858e9",
              borderRadius: "8px",
              background: "#f8f9ff",
              overflow: "hidden",
            },
          },
          // Header bar
          el(
            "div",
            {
              style: {
                background: "#3858e9",
                color: "#fff",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              },
            },
            el(
              "div",
              { style: { display: "flex", alignItems: "center", gap: "8px" } },
              el(Dashicon, { icon: "superhero-alt" }),
              el("strong", null, "MFE Component"),
            ),
            el(
              "button",
              {
                onClick: function () {
                  setShowPreview(true);
                },
                style: {
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  color: "#fff",
                  padding: "4px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                },
              },
              "👁 Preview",
            ),
          ),
          // Body
          el(
            "div",
            {
              style: {
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              },
            },
            // Element selector row
            el(
              "div",
              { style: { display: "flex", alignItems: "center", gap: "12px" } },
              el(
                "label",
                {
                  style: {
                    fontWeight: "600",
                    fontSize: "13px",
                    color: "#1e1e1e",
                    whiteSpace: "nowrap",
                  },
                },
                "Element:",
              ),
              el(
                "div",
                { style: { flex: 1 } },
                el(
                  "select",
                  {
                    value: attributes.element,
                    onChange: function (e) {
                      setAttributes({ element: e.target.value });
                    },
                    style: {
                      width: "100%",
                      padding: "6px 10px",
                      fontSize: "13px",
                      border: "1px solid #c4c7ca",
                      borderRadius: "4px",
                      background: "#fff",
                    },
                  },
                  getElementOptions().map(function (opt) {
                    return el(
                      "option",
                      { key: opt.value, value: opt.value },
                      opt.label,
                    );
                  }),
                ),
              ),
            ),
            // Tag preview
            el(
              "code",
              {
                style: {
                  display: "block",
                  background: "#eef1ff",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: "#3858e9",
                  border: "1px solid #d0d5f5",
                  fontFamily: "monospace",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              },
              "<" + attributes.element + " " + getAttrsSummary() + ">",
            ),
            // Attribute editor
            el(
              "div",
              null,
              el(
                "div",
                {
                  style: {
                    fontWeight: "600",
                    fontSize: "13px",
                    color: "#1e1e1e",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  },
                },
                el(Dashicon, {
                  icon: "admin-settings",
                  style: { fontSize: "16px", width: "16px", height: "16px" },
                }),
                "Attributes",
              ),
              el(AttrRows, {
                value: attributes.attrs,
                onChange: function (val) {
                  setAttributes({ attrs: val });
                },
                compact: true,
              }),
            ),
          ),
        );
      }

      return el(
        Fragment,
        null,
        inspector,
        toolbar,
        el("div", blockProps, content),
      );
    },

    save: function () {
      return null;
    },
  });
})();
