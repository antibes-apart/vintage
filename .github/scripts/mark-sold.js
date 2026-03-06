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

  // Sanitize folder name
  const sanitized = folder.replace(/[^a-z0-9-]/gi, '').toLowerCase();
  const infoPath = path.join('items', sanitized, 'info.json');

  if (!fs.existsSync(infoPath)) {
    core.setFailed(`Item folder "items/${sanitized}" not found.`);
    return;
  }

  const info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
  info.sold = true;
  fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));

  core.exportVariable('ITEM_FOLDER', sanitized);
  core.exportVariable('ITEM_TITLE', info.title || sanitized);
};
