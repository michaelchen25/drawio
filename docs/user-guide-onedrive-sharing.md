# OneDrive Sharing Guide

The editor stores diagrams in each user's own Microsoft 365 OneDrive for
Business space. Sharing is handled through native OneDrive sharing links.

## Save a Diagram to Microsoft 365

1. Sign in with your company Microsoft account.
2. Choose `File -> Save As`.
3. Select `M365`.
4. Pick a folder in your own OneDrive for Business space.
5. Save the `.drawio` file.

## Share with Coworkers

1. Open OneDrive in the browser.
2. Find the saved `.drawio` file.
3. Select `Share`.
4. Create a sharing link for the target coworkers.
5. Send that link through your normal internal channel.

## Known Limits

- The MVP does not support real-time collaboration inside the editor.
- draw.io's OneDrive path does not reliably save directly into shared folders.
- Granting access uses OneDrive's normal sharing permissions, not editor-side
  permission rules.

## Workaround for Shared Folders

If your team needs the file inside a shared folder:

1. Save the file to your own OneDrive for Business space first.
2. Download the `.drawio` file if needed.
3. Upload or move it through the OneDrive web interface into the shared folder.
4. Share the shared-folder link from OneDrive.

## Practical Recommendation

- Treat the `.drawio` file in your OneDrive as the editable source.
- Use OneDrive sharing links for review and cross-team handoff.
- Keep a local download only as a fallback backup, not the primary workflow.
