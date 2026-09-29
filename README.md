# knollab-001 B · DESIGN.md

GitHub Pages의 루트 페이지에서 제작 방식(A~D)과 버전을 전환하며 카페 주문 연습을 체험할 수 있습니다. 이 저장소에는 B 실험의 버전 1~3이 있습니다.

- 기본 주소: `https://luckybridge.github.io/knollab-001-b-design-md/` (버전 3)
- 버전별 주소: `?version=1`, `?version=2`, `?version=3`
- 원본 직접 접근: `versions/v1/index.html`, `versions/v2/index.html`, `versions/v3/index.html`

루트의 `index.html`, `shell.css`, `shell.js`는 버전 선택 화면입니다. 체험 내용은 iframe에서 각 `versions/vN/` 원본을 직접 불러옵니다. `versions/` 아래 파일은 이 전환 화면을 위해 수정하지 않았습니다. 루트에 있던 버전 3 자산(`script.js`, `style.css`, `v3.js`, `v3.css`)도 보존했습니다.

검증: `node --test tests/shell.test.mjs`
