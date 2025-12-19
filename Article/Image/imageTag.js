
function buildImageTag(publicUrl, text) {
  const escapedText = text.replace(/"/g, "&quot;");
  return `
<div class="separator" style="clear: both; text-align: center;">
  <a href="${publicUrl.replace("&sz=w1200", "")}" style="margin-left: 1em; margin-right: 1em;">
    <img alt="${escapedText}" border="0" data-original-height="630" data-original-width="1200" src="${publicUrl}" title="${escapedText}" />
  </a>
</div>`;
}

export default buildImageTag;

