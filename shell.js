const VALID_VERSIONS = new Set(['1', '2', '3']);

export function normalizeVersion(value) {
  return VALID_VERSIONS.has(value) ? value : '3';
}

export function versionPath(version) {
  return `versions/v${normalizeVersion(version)}/index.html`;
}

export function experimentUrl(slug, version) {
  const selectedVersion = slug === 'd-design-figma-mcp-actively' ? '1' : normalizeVersion(version);
  return `https://luckybridge.github.io/knollab-001-${slug}/?version=${selectedVersion}`;
}

if (typeof document !== 'undefined') {
  const version = normalizeVersion(new URLSearchParams(window.location.search).get('version'));
  const preview = document.getElementById('versionPreview');
  const label = document.getElementById('previewLabel');

  preview.src = versionPath(version);
  preview.title = `실험 B 버전 ${version} 카페 주문 연습 체험`;
  label.textContent = `실험 B · 버전 ${version} 체험 중`;

  document.querySelectorAll('[data-version]').forEach((link) => {
    if (link.dataset.version === version) link.setAttribute('aria-current', 'page');
  });

  document.querySelectorAll('[data-experiment]').forEach((link) => {
    const { experiment } = link.dataset;
    link.href = experiment === 'b-design-md' ? `?version=${version}` : experimentUrl(experiment, version);
  });
}
