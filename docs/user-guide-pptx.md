# PPTX Manual Conversion Guide

This MVP does not generate `.pptx` directly. Use SVG export, then convert the
diagram inside Microsoft PowerPoint.

## Recommended Path

1. Open the diagram in the biomed flowchart editor.
2. Choose `File -> Export as -> SVG`.
3. Save the exported `.svg` file.
4. Open Microsoft PowerPoint desktop app.
5. Insert the `.svg` onto a slide.
6. Right-click the SVG and choose `Convert to Shape`.
7. Ungroup only if you need to edit the individual PowerPoint shapes.

## What to Expect

- Standard ISO 5807 shapes usually convert well.
- Custom biomed preset shapes may break into many pieces after `Convert to Shape`.
- If the slide only needs a visual figure, keep the SVG as-is instead of converting.

## Known Limits

- This MVP does not provide one-click PPTX export.
- PowerPoint on the web may not offer the same `Convert to Shape` behavior as the
  desktop app.
- Complex custom biomed shapes can become harder to edit after conversion.

## Practical Recommendation

- Use SVG for reporting-quality output.
- Use `Convert to Shape` only when you really need to tweak the diagram inside
  PowerPoint.
- Keep the original `.drawio` file in OneDrive for future edits.
