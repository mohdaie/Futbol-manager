"""Fits motion capture to the player's rig.

Source: the Carnegie Mellon University Graphics Lab Motion Capture Database (mocap.cs.cmu.edu), whose data
"may be copied, modified, or redistributed without permission". Recordings are ASF (skeleton) and AMC (motion).

    python3 scripts/blender/mocap_retarget.py <folder with .asf/.amc> scripts/blender/mocap.json

The folder is filled by downloading http://mocap.cs.cmu.edu/subjects/NN/NN.asf and NN_TT.amc for the takes
named in TAKES below. The output holds, per clip and frame, the rotation of each of our 17 bones (relative to
its parent, in armature axes: the same thing body_pose() returns) and the pelvis offset; build_player.py uses
it in place of the hand-keyed clip of the same name.

How a take is fitted: forward kinematics gives every captured bone's rotation from its rest pose; axes are
converted (capture: y up, z forward; ours: z up, -y forward) and the motion is turned to face our forward;
each of our bones takes the rotation of its counterpart, corrected for the two rest poses (the capture rests
in a T, we rest with the arms down); the pelvis path is scaled by leg length. A gait is cut to one stride from
left-foot strike to left-foot strike, its end eased into its start, and kept on the spot.
"""
import json
import math
import os
import sys

import bpy  # noqa: F401  (mathutils comes with it)
from mathutils import Matrix, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_player as bp  # noqa: E402

UNIT = (1.0 / 0.45) * 0.0254            # ASF length units (inches scaled by 0.45) to metres
TO_OURS = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))
SRC_FPS, FPS = 120.0, 60.0
# clip: (subject, take, kind, options)
TAKES = {
    "Walk": ("35", "01", "gait", {}),
    "Jog": ("35", "17", "gait", {}),
    "Stride": ("16", "45", "gait", {}),      # a steady run; the library has no flat-out sprint
    "Shoot": ("10", "01", "kick", {"before": 26, "frames": 79}),
}
PAIRS = {"hips": "root", "spine": "lowerback", "chest": "thorax", "neck": "lowerneck", "head": "head"}
for _side, _k in ((1, "l"), (-1, "r")):
    _x = bp.sfx(_side)
    PAIRS.update({"upper_arm" + _x: _k + "humerus", "forearm" + _x: _k + "radius", "hand" + _x: _k + "wrist",
                  "thigh" + _x: _k + "femur", "shin" + _x: _k + "tibia", "foot" + _x: _k + "foot"})
TRUNK = {"hips", "spine", "chest", "neck", "head"}


def euler(rx, ry, rz):
    return (Matrix.Rotation(math.radians(rz), 3, "Z") @ Matrix.Rotation(math.radians(ry), 3, "Y")
            @ Matrix.Rotation(math.radians(rx), 3, "X"))


def read_asf(path):
    bones, parent, section, cur = {}, {}, "", None
    for raw in open(path):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith(":"):
            section = line.split()[0]
            continue
        w = line.split()
        if section == ":bonedata":
            if w[0] == "begin":
                cur = {"dof": []}
            elif w[0] == "end":
                bones[cur["name"]] = cur
            elif w[0] == "name":
                cur["name"] = w[1]
            elif w[0] == "direction":
                cur["dir"] = Vector(map(float, w[1:4]))
            elif w[0] == "length":
                cur["len"] = float(w[1])
            elif w[0] == "axis":
                cur["C"] = euler(*map(float, w[1:4]))
            elif w[0] == "dof":
                cur["dof"] = w[1:]
        elif section == ":hierarchy" and w[0] not in ("begin", "end"):
            for child in w[1:]:
                parent[child] = w[0]
    return bones, parent


def read_amc(path):
    frames, cur = [], None
    for raw in open(path):
        w = raw.split()
        if not w or w[0][0] in "#:":
            continue
        if len(w) == 1 and w[0].isdigit():
            cur = {}
            frames.append(cur)
        elif cur is not None:
            cur[w[0]] = list(map(float, w[1:]))
    return frames


def solve(bones, parent, frame):
    """Rotation of every captured bone from its rest pose, and where each bone starts and ends (metres)."""
    r = frame["root"]
    G, start, end = {"root": euler(*r[3:6])}, {}, {"root": Vector(r[0:3]) * UNIT}
    order = [b for b in parent if b != "root"]
    for name in order:                                    # the hierarchy lists parents first
        b, p = bones[name], parent[name]
        a = dict(zip(b["dof"], frame.get(name, [])))
        local = b["C"] @ euler(a.get("rx", 0), a.get("ry", 0), a.get("rz", 0)) @ b["C"].inverted()
        G[name] = G[p] @ local
        start[name] = end[p]
        end[name] = start[name] + G[name] @ b["dir"] * b["len"] * UNIT
    return G, start, end


def mirrored(G, start, end, root):
    flip = Matrix(((-1, 0, 0), (0, 1, 0), (0, 0, 1)))
    swap = lambda n: ("r" + n[1:]) if n[0] == "l" and n != "lowerback" and n != "lowerneck" else ("l" + n[1:]) if n[0] == "r" and n != "root" else n
    return ({swap(n): flip @ m @ flip for n, m in G.items()}, {swap(n): flip @ v for n, v in start.items()},
            {swap(n): flip @ v for n, v in end.items()}, flip @ root)


def fitted(bones, G, heading, fix):
    """Our pose from the captured rotations: bone -> rotation relative to its parent, armature axes."""
    D = {ours: heading @ TO_OURS @ G[theirs] @ TO_OURS.transposed() @ fix[ours] for ours, theirs in PAIRS.items()}
    return {name: (D[par].inverted() @ D[name] if par else D[name]) for name, (_h, _t, par) in bp.joints().items()}, D


def slerp(a, b, u):
    return a.to_quaternion().slerp(b.to_quaternion(), u).to_matrix()


def build(folder, clip, subject, take, kind, opt):
    bones, parent = read_asf(os.path.join(folder, subject + ".asf"))
    raw = read_amc(os.path.join(folder, f"{subject}_{take}.amc"))
    sol = [solve(bones, parent, f) for f in raw]
    ours = bp.joints()
    # rest-pose correction: our bone's rest direction turned onto the captured bone's rest direction
    fix = {}
    for name, theirs in PAIRS.items():
        head, tail, _ = ours[name]
        mine = (Vector(tail) - Vector(head)).normalized()
        fix[name] = Matrix.Identity(3) if name in TRUNK else mine.rotation_difference((TO_OURS @ bones[theirs]["dir"]).normalized()).to_matrix()
    leg = (bones["lfemur"]["len"] + bones["ltibia"]["len"]) * UNIT
    scale = (bp.THIGH + bp.SHIN) / leg
    root = [TO_OURS @ s[2]["root"] for s in sol]
    ankle = lambda s, k: TO_OURS @ s[2][k + "tibia"]
    toe = lambda s, k: TO_OURS @ s[2][k + "toes"]
    n = len(sol)

    if kind == "kick":
        speed = lambda k, i: (toe(sol[i + 2], k) - toe(sol[i - 2], k)).length
        best = max(((speed(k, i), i, k) for k in "lr" for i in range(2, n - 2)))
        hit, foot = best[1], best[2]
        first = hit - int(opt["before"] * SRC_FPS / FPS)
        idx = [min(n - 1, max(0, first + int(j * SRC_FPS / FPS))) for j in range(opt["frames"])]
        travel = root[hit] - root[idx[0]]
        mirror = foot == "l"                           # our clips are right-footed
    else:
        travel = root[-1] - root[0]
        mirror = False
    if mirror:
        sol = [mirrored(G, st, en, TO_OURS.transposed() @ r)[:3] for (G, st, en), r in zip(sol, root)]
        root = [TO_OURS @ s[2]["root"] for s in sol]
        travel = Vector((-travel.x, travel.y, travel.z))
    heading = Matrix.Rotation(math.atan2(travel.x, -travel.y), 3, "Z")   # turn the direction of travel onto -y
    root = [heading @ r for r in root]

    if kind == "gait":
        # one stride: left-foot strike to left-foot strike (the left ankle furthest ahead of the pelvis)
        def strikes(k):
            ahead = [-(heading @ ankle(s, k)).y + r.y for s, r in zip(sol, root)]
            return ahead, [i for i in range(3, n - 3) if ahead[i] == max(ahead[i - 3:i + 4])]
        left, peaks = strikes("l")
        if len(peaks) < 2:                             # a short take: measure the stride on the right foot instead
            _, peaks = strikes("r")
        if len(peaks) < 2:
            raise ValueError(f"{subject}_{take}: no full stride in {n} frames")
        mid = min(range(len(peaks) - 1), key=lambda j: abs((peaks[j] + peaks[j + 1]) / 2 - n / 2))
        a, b = peaks[mid], peaks[mid + 1]
        seconds = (b - a) / SRC_FPS
        count = max(8, round(seconds * FPS))
        pick = [a + (b - a) * j / count for j in range(count)]
        stride = (root[b] - root[a]).length * scale
    else:
        pick, count, seconds, stride, a, b = idx, len(idx), len(idx) / FPS, 0.0, idx[0], idx[-1]

    def at(x):
        i = min(n - 2, int(x))
        u = x - i
        p0, _ = fitted(bones, sol[i][0], heading, fix)
        p1, _ = fitted(bones, sol[i + 1][0], heading, fix)
        return {k: slerp(p0[k], p1[k], u) for k in p0}, root[i].lerp(root[i + 1], u) * scale

    poses, locs = [], []
    for x in pick:
        pose, pos = at(float(x))
        poses.append(pose)
        locs.append(pos)
    if kind == "gait":
        last_pose, last_pos = at(float(b))
        drift = last_pos - locs[0]
        for j in range(count):
            w = j / count
            for k in poses[j]:                         # ease the end of the stride into its start
                poses[j][k] = slerp(Matrix.Identity(3), poses[0][k] @ last_pose[k].inverted(), w) @ poses[j][k]
            locs[j] = locs[j] - drift * w              # on the spot: no travel, and the same height at both ends
        # the stride starts on the left-foot strike, wherever that fell in the stretch that was cut out
        first = max(range(count), key=lambda j: left[min(n - 1, round(pick[j]))])
        poses, locs = poses[first:] + poses[:first], locs[first:] + locs[:first]
        centre = sum(locs, Vector()) / count
        locs = [Vector((p.x - centre.x, p.y - centre.y, p.z)) for p in locs]
    else:
        locs = [Vector((p.x - locs[0].x, p.y - locs[0].y, p.z)) for p in locs]

    # height: the lower ankle of the stride sits at our ankle height (the captured subject's boots are not ours)
    def ankles(pose, pos):
        out = []
        for side in (1, -1):
            x = bp.sfx(side)
            hips = pose["hips"]
            thigh = hips @ pose["thigh" + x]
            shin = thigh @ pose["shin" + x]
            th, tt, _ = ours["thigh" + x]
            sh, st2, _ = ours["shin" + x]
            hip = pos + hips @ (Vector(th) - Vector((0, 0, 0.95)))
            knee = hip + thigh @ (Vector(tt) - Vector(th))
            out.append((knee + shin @ (Vector(st2) - Vector(sh))).z)
        return min(out)
    low = min(ankles(p, q) for p, q in zip(poses, locs))
    locs = [Vector((p.x, p.y, p.z - low + bp.ANKLE_UP)) - Vector((0, 0, 0.95)) + Vector((0, 0, 0)) for p in locs]
    print(f"{clip:6s} {subject}_{take}: {count} frames, {seconds:.2f} s"
          + (f", stride {stride:.2f} m, {stride / seconds:.2f} m/s" if kind == "gait" else f", struck with the {'left (mirrored)' if mirror else 'right'} foot"))
    return {"frames": count, "seconds": round(seconds, 4), "speed": round(stride / seconds, 3) if stride else 0,
            "source": f"CMU mocap {subject}_{take}",
            "poses": [{k: [round(v, 5) for row in m for v in row] for k, m in p.items()} for p in poses],
            "locs": [[round(v, 5) for v in p] for p in locs]}


if __name__ == "__main__":
    folder, out = sys.argv[1], sys.argv[2]
    data = {}
    for clip, spec in TAKES.items():
        if len(sys.argv) > 3 and clip not in sys.argv[3:]:
            continue
        data[clip] = build(folder, clip, *spec)
    json.dump(data, open(out, "w"), separators=(",", ":"))
    print("wrote", out, os.path.getsize(out) // 1024, "KB")
