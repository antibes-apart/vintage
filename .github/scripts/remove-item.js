const fs = require('fs');
const path = require('path');

module.exports = async ({github, context, core}) => {
  const body = context.payload.issue.body;

  function getField(name) {
    const regex = new RegExp(`### ${name}\\s*\\n\\s*([\\s\\S]*?)(?=\\n### |$)`, 'i');
    const match = body.match(regex);
    return match ? match[1].trim() : '';
  }

  const folder = getField('Item Folder Name');
  if (!folder) {
    core.setFailed('Folder name is required.');
    return;
  }

  const sanitized = folder.replace(/[^a-z0-9-]/gi, '').toLowerCase();
  const itemDir = path.join('items', sanitized);

  if (!fs.existsSync(itemDir)) {
    core.setFailed(`Item folder "items/${sanitized}" not found.`);
    return;
  }

  // Read title before deleting
  let title = sanitized;
  const infoPath = path.join(itemDir, 'info.json');
  if (fs.existsSync(infoPath)) {
    try {
      const info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
      title = info.title || sanitized;
    } catch (e) { /* ignore parse errors */ }
  }

  // Delete folder recursively
  fs.rmSync(itemDir, {recursive: true, force: true});

  core.exportVariable('ITEM_TITLE', title);
};
