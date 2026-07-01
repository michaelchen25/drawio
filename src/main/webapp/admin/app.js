(function()
{
  'use strict';

  var root = window;
  var data = root.BIOMED_ADMIN_DATA;

  function text(node, value)
  {
    node.textContent = value;
  }

  function createCell(tagName, value)
  {
    var cell = document.createElement(tagName);
    text(cell, value);
    return cell;
  }

  function renderSnapshot(items)
  {
    var grid = document.getElementById('snapshotGrid');

    for (var i = 0; i < items.length; i++)
    {
      var item = items[i];
      var tile = document.createElement('article');
      tile.className = 'metric-tile';

      var label = document.createElement('span');
      label.className = 'metric-label';
      text(label, item.label);
      tile.appendChild(label);

      var value = document.createElement('strong');
      value.className = 'metric-value';
      text(value, item.value);
      tile.appendChild(value);

      var note = document.createElement('span');
      note.className = 'metric-note';
      text(note, item.note);
      tile.appendChild(note);

      grid.appendChild(tile);
    }
  }

  function renderLibraries(items)
  {
    var body = document.getElementById('libraryTableBody');

    for (var i = 0; i < items.length; i++)
    {
      var item = items[i];
      var row = document.createElement('tr');

      row.appendChild(createCell('td', item.title));
      row.appendChild(createCell('td', item.version));
      row.appendChild(createCell('td', String(item.presets)));

      var statusCell = document.createElement('td');
      var status = document.createElement('span');
      status.className = 'status-tag';
      text(status, item.tooltipStatus);
      statusCell.appendChild(status);
      row.appendChild(statusCell);

      row.appendChild(createCell('td', item.source));
      body.appendChild(row);
    }
  }

  function renderUsage(items)
  {
    var body = document.getElementById('usageTableBody');

    for (var i = 0; i < items.length; i++)
    {
      var item = items[i];
      var row = document.createElement('tr');
      row.appendChild(createCell('td', item.metric));
      row.appendChild(createCell('td', item.value));
      row.appendChild(createCell('td', item.source));
      body.appendChild(row);
    }
  }

  function renderGroups(items)
  {
    var body = document.getElementById('groupTableBody');

    for (var i = 0; i < items.length; i++)
    {
      var item = items[i];
      var row = document.createElement('tr');
      row.appendChild(createCell('td', item.name));
      row.appendChild(createCell('td', item.access));

      var statusCell = document.createElement('td');
      var status = document.createElement('span');
      status.className = 'status-tag';
      text(status, item.status);
      statusCell.appendChild(status);
      row.appendChild(statusCell);

      row.appendChild(createCell('td', item.notes));
      body.appendChild(row);
    }
  }

  function bootstrap()
  {
    if (data == null)
    {
      throw new Error('Missing BIOMED_ADMIN_DATA');
    }

    renderSnapshot(data.snapshot || []);
    renderLibraries(data.libraries || []);
    renderUsage(data.usage || []);
    renderGroups(data.groups || []);
  }

  root.BIOMED_ADMIN_APP = {
    bootstrap: bootstrap
  };

  if (document.readyState === 'loading')
  {
    document.addEventListener('DOMContentLoaded', bootstrap);
  }
  else
  {
    bootstrap();
  }
})();
