# Publishing the 3D match as a claude.ai artifact

The artifact host serves only text types, so `.glb` and `.bin` files are sent as JSON (`{"b64": "..."}`).
`page.html` sets `window.MATCH3D` to those JSON paths; `viewer.js` decodes them.

```
python3 - <<'PY'
import base64, json, os
os.makedirs('/tmp/pub', exist_ok=True)
for src, dst in (('match3d/assets/player.glb', 'player.glb.json'), ('match3d/assets/ball.glb', 'ball.glb.json'), ('match3d/data/match.bin', 'match.bin.json')):
    json.dump({'b64': base64.b64encode(open(src, 'rb').read()).decode()}, open('/tmp/pub/' + dst, 'w'))
PY
```

Then publish `match3d/publish/page.html` with these files (served path: source):
`viewer.js`, `vendor/three.module.min.js`, `vendor/addons/loaders/GLTFLoader.js`,
`vendor/addons/utils/BufferGeometryUtils.js`, `vendor/addons/utils/SkeletonUtils.js` (all from `match3d/`),
`data/match.json` (from `match3d/data/`), `assets/player.glb.json`, `assets/ball.glb.json`,
`data/match.bin.json` (from `/tmp/pub`).

Existing artifact: https://claude.ai/artifact/3nbJ4BTM8UtaRMyBBwAbGy (pass it as `url` to update it in place).
