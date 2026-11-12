"""Low-poly football player (modeling only).

Usage:
    python build_player.py [--render front.png] [--export player.glb]

Blender is Z-up; the character faces -Y in Blender, which the glTF exporter
converts to Y-up / +Z forward. Units are metres, origin at the feet.
"""
import argparse
import math
import sys
from contextlib import contextmanager

import bpy  # must be imported before bmesh/mathutils
import bmesh
import numpy as np
from mathutils import Matrix, Vector

SKIN = (0.78, 0.53, 0.40, 1.0)
COLORS = {
    "head": SKIN,
    "neck": SKIN,
    "arms": SKIN,
    "hands": SKIN,
    "legs": SKIN,
    "hair": (0.045, 0.028, 0.018, 1.0),
    "eyebrows": (0.045, 0.028, 0.018, 1.0),
    "eyes": (0.90, 0.90, 0.88, 1.0),
    "pupils": (0.03, 0.02, 0.015, 1.0),
    "mouth": (0.52, 0.27, 0.24, 1.0),
    "shirt": (0.75, 0.04, 0.05, 1.0),
    "shorts": (0.90, 0.90, 0.90, 1.0),
    "socks": (0.75, 0.04, 0.05, 1.0),
    "boots": (0.03, 0.03, 0.035, 1.0),
    "boot_soles": (0.85, 0.85, 0.85, 1.0),
}

ARM_ANGLE = math.radians(38)          # from vertical (A-pose)
SHOULDER = Vector((0.165, 0.0, 1.44))
WRIST_T = 0.56
TOE_OUT = math.radians(7)
FOOT_SCALE = 0.95

# head stations: (z, half width, y front, y back)
HEAD_P = 0.88
HEAD = (
    (1.562, 0.020, -0.078, -0.050),
    (1.577, 0.038, -0.091, -0.020),
    (1.600, 0.054, -0.096, 0.030),
    (1.630, 0.064, -0.097, 0.062),
    (1.665, 0.071, -0.098, 0.085),
    (1.700, 0.075, -0.097, 0.096),
    (1.735, 0.076, -0.096, 0.100),
    (1.765, 0.068, -0.084, 0.092),
    (1.785, 0.045, -0.050, 0.062),
    (1.793, 0.012, -0.012, 0.020),
)


# ---------------------------------------------------------------- helpers
def sp(v, p):
    return math.copysign(abs(v) ** p, v)


def ring(c, u, v, n):
    c, u, v = Vector(c), Vector(u), Vector(v)
    return [c + math.cos(2 * math.pi * j / n) * u + math.sin(2 * math.pi * j / n) * v
            for j in range(n)]


def ering(z, rx, yf, yb, n, p=1.0, x0=0.0):
    """Horizontal ring spanning y front..back (superellipse exponent p)."""
    cy, ry = (yf + yb) / 2, (yb - yf) / 2
    pts = []
    for j in range(n):
        t = 2 * math.pi * j / n
        pts.append(Vector((x0 + rx * sp(math.cos(t), p), cy + ry * sp(math.sin(t), p), z)))
    return pts


def vring(x, y, z, rx, ry, n):
    return ering(z, rx, y - ry, y + ry, n, x0=x)


def grid(bm, rings, skip=(), cap0=False, cap1=False):
    rows = [[bm.verts.new(p) for p in r] for r in rings]
    n = len(rows[0])
    for i in range(len(rows) - 1):
        a, b = rows[i], rows[i + 1]
        for j in range(n):
            if (i, j) in skip:
                continue
            k = (j + 1) % n
            bm.faces.new((a[j], a[k], b[k], b[j]))
    if cap0:
        bm.faces.new(rows[0])
    if cap1:
        bm.faces.new(rows[-1])
    return rows


def bridge(bm, loop, pts):
    new = [bm.verts.new(p) for p in pts]
    n = len(loop)
    for i in range(n):
        k = (i + 1) % n
        bm.faces.new((loop[i], loop[k], new[k], new[i]))
    return new


def tube(bm, pts, radii, ref, n, flat=1.0):
    rings = []
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        a1 = (ref - t * ref.dot(t)).normalized()
        a2 = t.cross(a1)
        rings.append(ring(p, a1 * radii[i] * flat, a2 * radii[i], n))
    grid(bm, rings, cap0=True, cap1=True)


@contextmanager
def island(bm, wfn=None):
    """Faces created inside the block get consistent outward normals."""
    n0, v0 = len(bm.faces), len(bm.verts)
    yield
    if wfn:
        setw(bm, list(bm.verts)[v0:], wfn)
    bm.faces.ensure_lookup_table()
    faces = bm.faces[n0:]
    bmesh.ops.recalc_face_normals(bm, faces=faces)
    verts = {v for f in faces for v in f.verts}
    c = sum((v.co for v in verts), Vector()) / len(verts)
    vol = 0.0
    for f in faces:
        vs = [l.vert.co - c for l in f.loops]
        for i in range(1, len(vs) - 1):
            vol += vs[0].dot(vs[i].cross(vs[i + 1]))
    if vol < 0:
        for f in faces:
            f.normal_flip()


# ------------------------------------------------------------ rig weights
BONES = ["hips", "spine", "chest", "neck", "head",
         "upper_arm.L", "forearm.L", "hand.L", "upper_arm.R", "forearm.R", "hand.R",
         "thigh.L", "shin.L", "foot.L", "thigh.R", "shin.R", "foot.R"]
ELBOW_T = 0.31


def sfx(side):
    return ".L" if side > 0 else ".R"       # character faces -Y, so its left is +X


def new_bm():
    bm = bmesh.new()
    bm.verts.layers.deform.verify()
    return bm


def setw(bm, verts, fn):
    dl = bm.verts.layers.deform.verify()
    for v in verts:
        w = {k: x for k, x in fn(v.co).items() if x > 1e-4}
        total = sum(w.values())
        v[dl].clear()
        for k, x in w.items():
            v[dl][BONES.index(k)] = x / total


def ramp(x, a, b):
    return min(1.0, max(0.0, (x - a) / (b - a)))


def one(bone):
    return lambda co: {bone: 1.0}


def w_torso(co):
    a, b = ramp(co.z, 1.00, 1.12), ramp(co.z, 1.20, 1.32)
    return {"hips": 1 - a, "spine": a * (1 - b), "chest": a * b}


def w_neck(co):
    c, h = 1 - ramp(co.z, 1.47, 1.59), ramp(co.z, 1.53, 1.64)
    return {"chest": c, "head": h, "neck": max(0.0, 1 - c - h)}


def w_arm(side):
    s, d, _ = arm_frame(side)

    def fn(co):
        a = ramp((co - s).dot(d), ELBOW_T - 0.04, ELBOW_T + 0.04)
        return {"upper_arm" + sfx(side): 1 - a, "forearm" + sfx(side): a}
    return fn


def w_palm(side):
    s, d, _ = arm_frame(side)
    return lambda co: ({"forearm" + sfx(side): 1.0} if (co - s).dot(d) < WRIST_T + 0.005
                       else {"hand" + sfx(side): 1.0})


def w_leg(side):
    def fn(co):
        a = ramp(co.z, 0.45, 0.55)
        return {"thigh" + sfx(side): a, "shin" + sfx(side): 1 - a}
    return fn


def w_sock(side):
    def fn(co):
        f = 1 - ramp(co.z, 0.06, 0.16)
        return {"foot" + sfx(side): f, "shin" + sfx(side): 1 - f}
    return fn


def leg_x(side, z):
    return side * (0.115 - 0.02 * min(z, 0.85) / 0.85)


def arm_frame(side):
    d = Vector((side * math.sin(ARM_ANGLE), 0, -math.cos(ARM_ANGLE)))
    u = Vector((side * math.cos(ARM_ANGLE), 0, math.sin(ARM_ANGLE)))
    s = Vector((side * SHOULDER.x, SHOULDER.y, SHOULDER.z))
    return s, d, u


def arm_ring(side, t, ru, rv, n):
    s, d, u = arm_frame(side)
    return ring(s + d * t, u * ru, (0, rv, 0), n)


def arm_pts(side, phis, tfn, ru, rv):
    s, d, u = arm_frame(side)
    return [s + d * tfn(p) + u * (ru * math.cos(p)) + Vector((0, rv * math.sin(p), 0))
            for p in phis]


def head_y(x, z):
    """Front surface of the head at (x, z)."""
    for a, b in zip(HEAD, HEAD[1:]):
        if a[0] <= z <= b[0]:
            f = (z - a[0]) / (b[0] - a[0])
            rx, yf, yb = (a[i] + (b[i] - a[i]) * f for i in (1, 2, 3))
            break
    cy, ry = (yf + yb) / 2, (yb - yf) / 2
    c = min(abs(x) / rx, 1.0) ** (1 / HEAD_P)
    return cy - ry * math.sqrt(max(0.0, 1 - c * c)) ** HEAD_P


def decal(bm, pts, eps):
    f = bm.faces.new([bm.verts.new((x, head_y(x, z) - eps, z)) for x, z in pts])
    f.normal_update()
    if f.normal.y > 0:
        f.normal_flip()


def material(name):
    mat = bpy.data.materials.new(name)
    col = COLORS[name]
    mat.diffuse_color = col
    nt = mat.node_tree
    if nt is None:
        mat.use_nodes = True
        nt = mat.node_tree
    nt.nodes.clear()
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf.inputs["Base Color"].default_value = col
    bsdf.inputs["Roughness"].default_value = 0.8
    bsdf.inputs["Metallic"].default_value = 0.0
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def finish(name, bm, bone=None):
    if bone:
        setw(bm, list(bm.verts), one(bone))
    for f in bm.faces:
        f.smooth = True
    for e in bm.edges:
        if len(e.link_faces) == 2 and e.calc_face_angle() > math.radians(50):
            e.smooth = False
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    mesh.materials.append(material(name))
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    for b in BONES:
        obj.vertex_groups.new(name=b)
    return obj


# ------------------------------------------------------------------- head
def build_head():
    bm = new_bm()
    with island(bm, one("head")):
        grid(bm, [ering(z, rx, yf, yb, 16, HEAD_P) for z, rx, yf, yb in HEAD],
             cap0=True, cap1=True)
    # nose
    with island(bm, one("head")):
        top = bm.verts.new((0, head_y(0, 1.694) + 0.003, 1.694))
        tip = bm.verts.new((0, head_y(0, 1.650) - 0.023, 1.650))
        base = bm.verts.new((0, head_y(0, 1.638) + 0.003, 1.638))
        al = [bm.verts.new((s * 0.016, head_y(0.016, 1.645) + 0.002, 1.644)) for s in (-1, 1)]
        for a, b, c in ((top, al[0], tip), (top, tip, al[1]), (al[0], base, tip),
                        (base, al[1], tip), (top, al[1], base), (top, base, al[0])):
            bm.faces.new((a, b, c))
    # ears
    for s in (-1, 1):
        with island(bm, one("head")):
            grid(bm, [ring((s * x, cy, 1.68), (0, ry, 0), (0, 0, rz), 6) for x, cy, ry, rz in (
                (0.062, 0.008, 0.012, 0.024),
                (0.084, 0.016, 0.014, 0.027),
                (0.089, 0.019, 0.007, 0.016))], cap0=True, cap1=True)
    return finish("head", bm)


def build_hair():
    bm = new_bm()
    with island(bm, one("head")):
        grid(bm, [ering(z, rx, yf, yb, 16, 0.9) for z, rx, yf, yb in (
            (1.612, 0.040, 0.020, 0.050),
            (1.640, 0.062, -0.010, 0.074),
            (1.670, 0.0775, -0.035, 0.094),
            (1.700, 0.082, -0.045, 0.104),
            (1.735, 0.083, -0.060, 0.108),
            (1.762, 0.076, -0.098, 0.101),
            (1.787, 0.054, -0.064, 0.072),
            (1.800, 0.016, -0.018, 0.026))], cap0=True, cap1=True)
    return finish("hair", bm)


def build_eyes():
    bm = new_bm()
    for s in (-1, 1):
        cx, cz, hw, hh = s * 0.032, 1.688, 0.0135, 0.006
        decal(bm, [(cx - hw, cz), (cx - hw * 0.45, cz - hh * 0.8), (cx + hw * 0.45, cz - hh * 0.8),
                   (cx + hw, cz), (cx + hw * 0.45, cz + hh), (cx - hw * 0.45, cz + hh)], 0.002)
    return finish("eyes", bm, "head")


def build_pupils():
    bm = new_bm()
    for s in (-1, 1):
        decal(bm, [(s * 0.032 + 0.0052 * math.cos(a), 1.688 + 0.0052 * math.sin(a))
                   for a in (math.radians(60 * i) for i in range(6))], 0.003)
    return finish("pupils", bm, "head")


def build_eyebrows():
    bm = new_bm()
    for s in (-1, 1):
        lo = [(s * 0.012, 1.7035), (s * 0.030, 1.7075), (s * 0.048, 1.7040)]
        hi = [(s * 0.048, 1.7085), (s * 0.030, 1.7140), (s * 0.012, 1.7095)]
        decal(bm, lo + hi, 0.003)
    return finish("eyebrows", bm, "head")


def build_mouth():
    bm = new_bm()
    z = 1.614
    decal(bm, [(-0.022, z), (-0.009, z - 0.005), (0.009, z - 0.005),
               (0.022, z), (0.009, z + 0.0045), (-0.009, z + 0.0045)], 0.002)
    return finish("mouth", bm, "head")


# ------------------------------------------------------------------- skin
def build_neck():
    bm = new_bm()
    with island(bm, w_neck):
        grid(bm, [vring(0, y, z, rx, ry, 12) for z, y, rx, ry in (
            (1.470, 0.012, 0.064, 0.066),
            (1.530, 0.008, 0.058, 0.061),
            (1.600, 0.002, 0.056, 0.060),
            (1.640, 0.000, 0.052, 0.056))], cap0=True, cap1=True)
    return finish("neck", bm)


def build_arms():
    bm = new_bm()
    for s in (-1, 1):
        with island(bm, w_arm(s)):
            grid(bm, [arm_ring(s, t, ru, rv, 10) for t, ru, rv in (
                (0.160, 0.044, 0.047),
                (0.220, 0.045, 0.047),
                (0.280, 0.039, 0.041),
                (0.310, 0.037, 0.039),
                (0.350, 0.041, 0.040),
                (0.420, 0.037, 0.037),
                (0.500, 0.029, 0.031),
                (0.560, 0.024, 0.028))], cap0=True, cap1=True)
    return finish("arms", bm)


def build_hands():
    bm = new_bm()
    front = Vector((0, -1, 0))
    for s in (-1, 1):
        sh, d, u = arm_frame(s)
        w = sh + d * WRIST_T
        # palm
        with island(bm, w_palm(s)):
            # first ring matches the arm's wrist ring exactly (no seam)
            grid(bm, [ring(w + d * a, u * th, front * wd, 10) for a, th, wd in (
                (0.000, 0.024, 0.028),
                (0.022, 0.019, 0.034),
                (0.052, 0.014, 0.041),
                (0.085, 0.012, 0.042),
                (0.098, 0.010, 0.039))], cap0=True, cap1=True)
        # fingers: index, middle, ring, little
        for off, length, r, spread in ((0.030, 0.070, 0.0085, 0.06),
                                       (0.010, 0.078, 0.0088, 0.02),
                                       (-0.010, 0.072, 0.0085, -0.03),
                                       (-0.029, 0.056, 0.0075, -0.09)):
            dirs = [(d * math.cos(a) - u * math.sin(a) + front * spread).normalized()
                    for a in (math.radians(12), math.radians(32))]
            p0 = w + d * 0.090 + front * off
            p1 = p0 + dirs[0] * length * 0.5
            p2 = p1 + dirs[1] * length * 0.5
            with island(bm, one("hand" + sfx(s))):
                tube(bm, [p0, p1, p2], [r, r * 0.92, r * 0.7], u, 6, flat=0.85)
        # thumb
        p0 = w + d * 0.032 + front * 0.014 - u * 0.002
        p1 = p0 + (d * 0.70 + front * 0.68 - u * 0.12).normalized() * 0.034
        p2 = p1 + (d * 0.86 + front * 0.45 - u * 0.14).normalized() * 0.030
        p3 = p2 + (d * 0.95 + front * 0.25 - u * 0.14).normalized() * 0.024
        with island(bm, one("hand" + sfx(s))):
            tube(bm, [p0, p1, p2, p3], [0.0110, 0.0105, 0.0090, 0.0065], u, 6)
    return finish("hands", bm)


def build_legs():
    bm = new_bm()
    for s in (-1, 1):
        with island(bm, w_leg(s)):
            grid(bm, [vring(leg_x(s, z), y, z, rx, ry, 12) for z, y, rx, ry in (
                (0.420, 0.004, 0.041, 0.044),
                (0.465, 0.000, 0.044, 0.047),
                (0.500, -0.008, 0.056, 0.060),
                (0.550, -0.004, 0.062, 0.066),
                (0.620, -0.002, 0.074, 0.080),
                (0.665, 0.000, 0.075, 0.081))], cap0=True, cap1=True)
    return finish("legs", bm)


# -------------------------------------------------------------------- kit
def build_shirt():
    bm = new_bm()
    n = 16
    spec = (
        (0.975, 0.150, 0.100, 0.000),   # hem, turned in
        (0.955, 0.172, 0.129, 0.004),
        (1.040, 0.160, 0.112, 0.000),
        (1.190, 0.170, 0.116, -0.002),
        (1.320, 0.181, 0.125, -0.004),  # armpit      (row 4)
        (1.370, 0.184, 0.125, -0.004),
        (1.415, 0.182, 0.118, -0.002),
        (1.455, 0.170, 0.104, 0.002),   # shoulder    (row 7)
        (1.495, 0.125, 0.090, 0.006),
        (1.522, 0.074, 0.076, 0.009),
        (1.538, 0.067, 0.070, 0.010),   # collar
        (1.530, 0.060, 0.064, 0.010),   # collar, turned in
    )
    rings = [vring(0, cy, z, rx, ry, n) for z, rx, ry, cy in spec]
    for r in rings[9:]:                 # collar dips at the front
        for j, p in enumerate(r):
            p.z -= 0.014 * max(0.0, -math.sin(2 * math.pi * j / n)) ** 2
    lo, hi = 4, 7
    sides = ((1, 0, n - 1, 1), (-1, n // 2, n // 2 + 1, n // 2 - 1))  # side, centre, front, back col
    skip = {(r, c % n) for r in range(lo, hi) for _, jc, _, _ in sides for c in (jc - 1, jc)}
    with island(bm):
        rows = grid(bm, rings, skip=skip)
        setw(bm, [v for r in rows for v in r], w_torso)
        phis = [math.radians(216 - 36 * i) for i in range(10)]
        for s, jc, fc, bc in sides:
            for r in range(lo + 1, hi):
                bm.verts.remove(rows[r][jc])
            loop = [rows[lo][fc], rows[lo][jc], rows[lo][bc]]
            loop += [rows[r][bc] for r in range(lo + 1, hi)]
            loop += [rows[hi][bc], rows[hi][jc], rows[hi][fc]]
            loop += [rows[r][fc] for r in range(hi - 1, lo, -1)]
            for i, (tfn, ru, rv) in enumerate(((lambda p: 0.07 - 0.04 * math.cos(p), 0.050, 0.058),
                                (lambda p: 0.14, 0.056, 0.060),
                                (lambda p: 0.22, 0.055, 0.058),
                                (lambda p: 0.212, 0.046, 0.048))):
                loop = bridge(bm, loop, arm_pts(s, phis, tfn, ru, rv))
                setw(bm, loop, (lambda co: {"chest": 0.5, "upper_arm" + sfx(s): 0.5})
                     if i == 0 else one("upper_arm" + sfx(s)))
    return finish("shirt", bm)


def build_shorts():
    bm = new_bm()
    n = 16
    with island(bm):
        rows = grid(bm, [vring(0, cy, z, rx, ry, n) for z, cy, rx, ry in (
            (0.800, 0.006, 0.178, 0.120),
            (0.880, 0.012, 0.176, 0.126),
            (0.960, 0.006, 0.166, 0.116),
            (1.025, 0.000, 0.150, 0.104))])
        r0 = rows[0]
        crotch = bm.verts.new((0, 0, 0.772))
        setw(bm, [v for r in rows for v in r] + [crotch], one("hips"))
        for s in (-1, 1):
            if s > 0:
                loop = [crotch] + [r0[j % n] for j in range(12, 21)]
                angs = [math.radians(180 + 36 * i) for i in range(10)]
            else:
                loop = [crotch] + [r0[j] for j in range(4, 13)]
                angs = [math.radians(36 * i) for i in range(10)]
            for i, (z, rx, ry) in enumerate(((0.740, 0.092, 0.102),
                              (0.680, 0.091, 0.099),
                              (0.620, 0.090, 0.096),
                              (0.632, 0.076, 0.082))):   # hem, turned in
                cx = leg_x(s, z)
                loop = bridge(bm, loop, [Vector((cx + rx * math.cos(a), ry * math.sin(a), z))
                                         for a in angs])
                setw(bm, loop, (lambda co: {"hips": 0.25, "thigh" + sfx(s): 0.75})
                     if i == 0 else one("thigh" + sfx(s)))
    return finish("shorts", bm)


def build_socks():
    bm = new_bm()
    for s in (-1, 1):
        with island(bm, w_sock(s)):
            grid(bm, [vring(leg_x(s, z), y, z, rx, ry, 12) for z, y, rx, ry in (
                (0.060, 0.012, 0.036, 0.042),
                (0.110, 0.012, 0.035, 0.041),
                (0.180, 0.012, 0.040, 0.046),
                (0.300, 0.016, 0.057, 0.062),
                (0.380, 0.010, 0.055, 0.058),
                (0.440, 0.004, 0.052, 0.055),
                (0.470, 0.000, 0.053, 0.057),
                (0.466, 0.000, 0.046, 0.050))], cap0=True)
    return finish("socks", bm)


# boot stations: (y along foot, half width, top height, inward shift, base z)
BOOT = (
    (0.088, 0.012, 0.055, 0.000, 0.028),
    (0.078, 0.026, 0.078, 0.000, 0.016),
    (0.050, 0.036, 0.088, 0.000, 0.016),
    (0.010, 0.041, 0.086, 0.000, 0.016),
    (-0.035, 0.044, 0.074, 0.000, 0.016),
    (-0.080, 0.047, 0.058, 0.000, 0.016),
    (-0.130, 0.050, 0.044, 0.003, 0.016),
    (-0.175, 0.045, 0.036, 0.006, 0.016),
    (-0.200, 0.032, 0.030, 0.008, 0.016),
    (-0.212, 0.014, 0.026, 0.009, 0.018),
)


def foot_tf(side, lx, ly, z):
    ly *= FOOT_SCALE
    ca, sa = math.cos(TOE_OUT), math.sin(TOE_OUT)
    return Vector((leg_x(side, 0.09) + lx * ca - side * ly * sa,
                   0.012 + side * lx * sa + ly * ca, z))


def boot_ring(side, y, w, h, shift, b, n=12):
    pts = []
    for j in range(n):
        t = 2 * math.pi * j / n
        g = (max(math.sin(t), -0.6) + 0.6) / 1.6
        pts.append(foot_tf(side, -side * shift + w * math.cos(t), y, b + (h - b) * g))
    return pts


def build_boots():
    bm = new_bm()
    for s in (-1, 1):
        with island(bm, one("foot" + sfx(s))):
            grid(bm, [boot_ring(s, *st) for st in BOOT], cap0=True, cap1=True)
    return finish("boots", bm)


def build_boot_soles():
    bm = new_bm()
    for s in (-1, 1):
        with island(bm, one("foot" + sfx(s))):
            grid(bm, [boot_ring(s, y, w + 0.003, 0.024, shift, 0.011)
                      for y, w, _, shift, _ in BOOT], cap0=True, cap1=True)
        for lx, ly in ((0.026, -0.168), (-0.030, -0.160), (0.034, -0.110), (-0.034, -0.105),
                       (0.022, 0.058), (-0.022, 0.058), (0.026, 0.018), (-0.026, 0.018)):
            with island(bm, one("foot" + sfx(s))):
                c0, c1 = foot_tf(s, lx, ly, 0.0), foot_tf(s, lx, ly, 0.014)
                grid(bm, [ring(c0, (0.006, 0, 0), (0, 0.006, 0), 6),
                          ring(c1, (0.009, 0, 0), (0, 0.009, 0), 6)], cap0=True, cap1=True)
    return finish("boot_soles", bm)


# ------------------------------------------------------------ render/export
def render_view(path, angle=0.0, cx=0.0, cz=0.9, scale=2.0, res=(800, 1000), samples=48):
    scene = bpy.context.scene
    a = math.radians(angle)
    cam_data = bpy.data.cameras.new("tmp_cam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = scale
    cam = bpy.data.objects.new("tmp_cam", cam_data)
    cam.location = (5 * math.sin(a) + cx * math.cos(a), -5 * math.cos(a) + cx * math.sin(a), cz)
    cam.rotation_euler = (math.radians(90), 0, a)
    sun_data = bpy.data.lights.new("tmp_sun", "SUN")
    sun_data.energy = 3.0
    sun = bpy.data.objects.new("tmp_sun", sun_data)
    sun.rotation_euler = (math.radians(60), 0, a + math.radians(-30))
    scene.collection.objects.link(cam)
    scene.collection.objects.link(sun)

    world = bpy.data.worlds.new("tmp_world")
    nt = world.node_tree
    if nt is None:
        world.use_nodes = True
        nt = world.node_tree
    nt.nodes.clear()
    bg = nt.nodes.new("ShaderNodeBackground")
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg.inputs["Color"].default_value = (0.55, 0.57, 0.6, 1)
    bg.inputs["Strength"].default_value = 1.0
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    scene.world = world

    scene.camera = cam
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = False
    scene.view_settings.view_transform = "Standard"
    scene.render.resolution_x, scene.render.resolution_y = res
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)

    # temporary check-render helpers are not part of the model
    scene.world = None
    bpy.data.objects.remove(cam)
    bpy.data.objects.remove(sun)
    bpy.data.cameras.remove(cam_data)
    bpy.data.lights.remove(sun_data)
    bpy.data.worlds.remove(world)


def export_glb(path, objs, arm, actions):
    """One glTF animation per clip: each action sits on its own NLA track."""
    set_action(arm, None)
    for name, (act, count) in actions.items():
        tr = arm.animation_data.nla_tracks.new()
        tr.name = name
        tr.strips.new(name, 1, act).name = name
    for pb in arm.pose.bones:                       # export from the rest pose
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.location = (0, 0, 0)
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs + [arm]:
        o.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB",
                              use_selection=True, export_yup=True,
                              export_apply=False, export_skins=True,
                              export_animations=True, export_animation_mode="ACTIONS",
                              export_frame_range=False, export_force_sampling=True,
                              export_optimize_animation_size=True)


# -------------------------------------------------------------------- rig
def joints():
    """name -> (head, tail, parent), parents first."""
    j = {
        "hips": ((0, 0, 0.95), (0, 0, 1.08), None),
        "spine": ((0, 0, 1.08), (0, 0, 1.25), "hips"),
        "chest": ((0, 0, 1.25), (0, 0, 1.48), "spine"),
        "neck": ((0, 0.008, 1.48), (0, 0, 1.60), "chest"),
        "head": ((0, 0, 1.60), (0, 0, 1.80), "neck"),
    }
    for side in (1, -1):
        x = sfx(side)
        s, d, _ = arm_frame(side)
        j["upper_arm" + x] = (s, s + d * ELBOW_T, "chest")
        j["forearm" + x] = (s + d * ELBOW_T, s + d * WRIST_T, "upper_arm" + x)
        j["hand" + x] = (s + d * WRIST_T, s + d * (WRIST_T + 0.10), "forearm" + x)
        knee = (leg_x(side, 0.50), -0.004, 0.50)
        ankle = (leg_x(side, 0.09), 0.012, 0.08)
        j["thigh" + x] = ((side * 0.095, 0, 0.90), knee, "hips")
        j["shin" + x] = (knee, ankle, "thigh" + x)
        j["foot" + x] = (ankle, (ankle[0], -0.14, 0.02), "shin" + x)
    return j


def build_rig(objs):
    data = bpy.data.armatures.new("player_rig")
    arm = bpy.data.objects.new("player_rig", data)
    bpy.context.scene.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="EDIT")
    for name, (head, tail, parent) in joints().items():
        eb = data.edit_bones.new(name)
        eb.head, eb.tail = head, tail
        if parent:
            eb.parent = data.edit_bones[parent]
    bpy.ops.object.mode_set(mode="OBJECT")
    for o in objs:
        o.parent = arm
        o.modifiers.new("Armature", "ARMATURE").object = arm
    return arm


# -------------------------------------------------------------- animation
# Every clip is described by named values per moment in time (pelvis position
# and lean, where each boot is, torso and arm angles). body_pose() turns those
# into bone rotations; the legs are solved so the boots land where asked.
FPS = 60
HIP_X, HIP_DROP = 0.095, 0.05           # hip joints: out from, and below, the pelvis pivot
THIGH, SHIN = 0.40, 0.42
THIGH_REST, SHIN_REST = 0.57, -2.18     # rest-pose tilt, degrees forward of vertical
ANKLE_UP, HEEL_BACK, TOE_FWD = 0.08, 0.074, 0.18
LEG_DEF = {"x": 0.0, "y": 0.0, "z": 0.08, "p": 0.0, "turn": 0.0, "lx": 0.0, "ly": 0.0, "lz": -0.85}
ARM_DEF = {"add": 30.0, "sw": 0.0, "el": 20.0, "back": 0.0, "tw": 15.0}


def rot(deg, axis):
    return Matrix.Rotation(math.radians(deg), 3, axis)


def spline(keys):
    """Periodic Catmull-Rom curve through (phase, value) keys."""
    ph = [k[0] for k in keys]
    val = [k[1] for k in keys]
    n = len(keys)

    def knot(i):
        return ph[i % n] + (i // n), val[i % n]

    def tangent(i):
        (p0, v0), (p1, v1) = knot(i - 1), knot(i + 1)
        return (v1 - v0) / (p1 - p0)

    def f(p):
        p %= 1.0
        if p < ph[0]:
            p += 1.0
        i = max(k for k in range(n) if ph[k] <= p)
        (pa, va), (pb, vb) = knot(i), knot(i + 1)
        h = pb - pa
        t = (p - pa) / h
        return ((2 * t**3 - 3 * t**2 + 1) * va + (t**3 - 2 * t**2 + t) * h * tangent(i)
                + (-2 * t**3 + 3 * t**2) * vb + (t**3 - t**2) * h * tangent(i + 1))
    return f


def track(times, vals):
    """Smooth curve through keys that never overshoots a held value."""
    n = len(times)

    def tangent(i):
        if i == 0 or i == n - 1:
            return 0.0
        a, b = vals[i] - vals[i - 1], vals[i + 1] - vals[i]
        return 0.0 if a * b <= 0 else (vals[i + 1] - vals[i - 1]) / (times[i + 1] - times[i - 1])

    def f(t):
        t = min(max(t, times[0]), times[-1])
        i = min(max(k for k in range(n) if times[k] <= t), n - 2)
        h = times[i + 1] - times[i]
        u = (t - times[i]) / h
        return ((2 * u**3 - 3 * u**2 + 1) * vals[i] + (u**3 - 2 * u**2 + u) * h * tangent(i)
                + (-2 * u**3 + 3 * u**2) * vals[i + 1] + (u**3 - u**2) * h * tangent(i + 1))
    return f


def body_pose(v):
    """Named values -> rotation of every bone (relative to its parent, in armature
    axes) and the pelvis offset.

    Pelvis: fwd/side (metres), hip_z (hip joint height), lean (forward), yaw
    (+ = right hip forward), roll (+ = top toward the player's left).
    Boots (l_/r_): x (sideways from under the hip), y (forward), z (ankle height),
    p (pitch, toe down +), turn (boot and knee turned out). With legs_local = 1 the
    boots follow the pelvis instead of the ground (lx, ly, lz), for time in the air.
    Arms (la_/ra_): add (30 = hanging, lower = raised sideways), sw (forward swing,
    170 = overhead), el (elbow bend), back (pulled back), tw (twist)."""
    g = v.get
    lean, yaw, roll = g("lean", 0.0), g("yaw", 0.0), g("roll", 0.0)
    ch_yaw = g("ch_yaw", 0.0)
    sp_yaw = g("sp_yaw")
    sp_yaw = -0.7 * yaw if sp_yaw is None else sp_yaw
    hd_yaw = g("hd_yaw")
    hd_yaw = -0.5 * (ch_yaw + 0.3 * yaw) if hd_yaw is None else hd_yaw
    hd = g("hd_pitch", 0.0)
    hips = rot(yaw, "Z") @ rot(roll, "Y") @ rot(lean, "X")
    pose = {
        "hips": hips,
        "spine": rot(sp_yaw, "Z") @ rot(g("sp_roll", 0.0), "Y") @ rot(g("sp_lean", 2.0), "X"),
        "chest": rot(ch_yaw, "Z") @ rot(g("ch_lean", 4.0), "X"),
        "neck": rot(hd_yaw, "Z") @ rot(hd * 0.4, "X"),
        "head": rot(hd_yaw, "Z") @ rot(hd * 0.6, "X"),
    }
    pivot = Vector((g("side", 0.0), -g("fwd", 0.0),
                    g("hip_z", 0.88) + HIP_DROP * math.cos(math.radians(lean))))
    w = min(1.0, max(0.0, g("legs_local", 0.0)))
    front = Vector((0, -1, 0))
    for side, key in ((1, "l"), (-1, "r")):
        x = sfx(side)

        def leg(k):
            return g(f"{key}_{k}", LEG_DEF[k])

        joint = pivot + hips @ Vector((side * HIP_X, 0, -HIP_DROP))
        target = Vector((side * HIP_X + leg("x"), -leg("y"), leg("z")))
        boot = rot(side * leg("turn"), "Z") @ rot(leg("p"), "X")
        if w > 0:
            local = pivot + hips @ Vector((side * HIP_X + leg("lx"), -leg("ly"), leg("lz")))
            target = target.lerp(local, w)
            boot = (boot.to_quaternion().slerp((hips @ rot(leg("p"), "X")).to_quaternion(), w)
                    .to_matrix())
        d = target - joint
        r = min(max(d.length, 0.15), (THIGH + SHIN) * 0.995)
        knee = 180 - math.degrees(math.acos((THIGH**2 + SHIN**2 - r * r) / (2 * THIGH * SHIN)))
        hip = math.degrees(math.atan2(-d.y, math.hypot(d.x, d.z))
                           + math.acos((THIGH**2 + r * r - SHIN**2) / (2 * THIGH * r)))
        out = rot(-math.degrees(math.atan2(d.x, -d.z)), "Y")      # leg swung sideways
        spin = Matrix.Rotation(math.radians(-side * leg("turn")), 3, d.normalized())
        thigh = spin @ out @ rot(-(hip - THIGH_REST), "X")
        shin = rot(knee + SHIN_REST - THIGH_REST, "X")
        pose["thigh" + x] = hips.inverted() @ thigh
        pose["shin" + x] = shin
        pose["foot" + x] = (thigh @ shin).inverted() @ boot

        def arm(k):
            return g(f"{key}a_{k}", ARM_DEF[k])

        _, d_arm, _ = arm_frame(side)
        pose["upper_arm" + x] = (rot(side * arm("back"), "Z") @ rot(-arm("sw"), "X")
                                 @ rot(side * arm("add"), "Y") @ rot(side * arm("tw"), d_arm))
        pose["forearm" + x] = rot(arm("el"), d_arm.cross(front))
        pose["hand" + x] = Matrix.Identity(3)
    return pose, pivot - Vector((0, 0, 0.95))


# ------------------------------------------------------------ gait cycles
def make_gait(stance, ref, pitches, swing, h0, amp, mid, lean=0, sp_lean=4, ch_lean=4,
              head=0, yaw=5, yaw_phase=0.8, ch=8, arm0=0, arm_amp=20, arm_phase=0.4,
              el0=30, el_amp=10, add=30, width=0.0, turn=0.0):
    """Looping stride. Phase 0 = foot strike. While a boot is on the ground it stays
    planted and slides straight under the body (ref[0] -> ref[1], metres forward of
    the hip), rolling through `pitches`; `swing` keys carry it through the air."""
    keys = []
    n = len(pitches) - 1
    for k, pitch in enumerate(pitches):
        r = ref[0] + (ref[1] - ref[0]) * k / n           # ground point under the ankle
        a = math.radians(-pitch)
        px = -HEEL_BACK if pitch < 0 else TOE_FWD        # pivot: heel, or toe
        keys.append((stance * k / n,
                     r + px - px * math.cos(a) - ANKLE_UP * math.sin(a),
                     -px * math.sin(a) + ANKLE_UP * math.cos(a), pitch))
    keys += swing
    fy, fz, fp = (spline([(k[0], k[i]) for k in keys]) for i in (1, 2, 3))

    def values(p):
        c = math.cos(2 * math.pi * (p - yaw_phase))
        v = {"hip_z": h0 - amp * math.cos(2 * math.pi * (2 * p - 2 * mid)),
             "lean": lean, "yaw": -yaw * c, "sp_yaw": yaw * c, "sp_lean": sp_lean,
             "ch_lean": ch_lean, "ch_yaw": ch * c, "hd_yaw": -0.5 * ch * c, "hd_pitch": head}
        for side, key in ((1, "l"), (-1, "r")):
            q = p if side > 0 else p + 0.5
            k = math.cos(2 * math.pi * (q - arm_phase))   # arm swings opposite its leg
            v.update({key + "_x": side * width, key + "_y": fy(q), key + "_z": fz(q),
                      key + "_p": fp(q), key + "_turn": turn,
                      key + "a_sw": arm0 + arm_amp * k, key + "a_el": el0 + el_amp * k,
                      key + "a_add": add})
        return v
    return values


# sprint: forward lean, forefoot strike, heel to backside, knee to hip height
RUN = make_gait(
    0.28, (0.22, -0.40), (5, 3, 6, 15, 32, 50),
    [(0.36, -0.36, 0.42, 85), (0.45, -0.22, 0.58, 100), (0.56, -0.08, 0.46, 75),
     (0.68, 0.24, 0.36, 30), (0.82, 0.44, 0.24, -5), (0.93, 0.32, 0.14, 0)],
    0.84, 0.03, 0.12, lean=14, sp_lean=9, ch_lean=5, head=-14, yaw=6, yaw_phase=0.75, ch=10,
    arm0=5, arm_amp=50, arm_phase=0.35, el0=90, el_amp=15)
# jog: upright, heel strike, relaxed arms
JOG = make_gait(
    0.35, (0.20, -0.40), (-10, 0, 0, 8, 25, 45),
    [(0.42, -0.30, 0.33, 70), (0.50, -0.22, 0.44, 75), (0.60, 0.00, 0.42, 50),
     (0.72, 0.22, 0.34, 20), (0.85, 0.36, 0.22, -5), (0.93, 0.32, 0.13, -10)],
    0.85, 0.035, 0.15, lean=0, sp_lean=6, ch_lean=5, head=-9, yaw=5, yaw_phase=0.8, ch=8,
    arm0=8, arm_amp=38, arm_phase=0.37, el0=85, el_amp=15)
# walk: one foot always down, heel strike, hips highest over the standing leg
WALK = make_gait(
    0.62, (0.27, -0.45), (-18, -3, 0, 0, 12, 40),
    [(0.70, -0.30, 0.20, 45), (0.80, -0.05, 0.15, 15), (0.90, 0.22, 0.13, -12),
     (0.96, 0.28, 0.115, -18)],
    0.865, -0.015, 0.31, lean=0, sp_lean=3, ch_lean=2, head=-3, yaw=4, yaw_phase=0.95, ch=5,
    arm0=0, arm_amp=18, arm_phase=0.6, el0=12, el_amp=8)
# dribble: short quick steps, low and leaning over the ball, arms out for balance
DRIBBLE = make_gait(
    0.36, (0.17, -0.33), (-10, 0, 0, 8, 25, 42),
    [(0.44, -0.26, 0.28, 60), (0.52, -0.16, 0.36, 60), (0.62, 0.02, 0.34, 40),
     (0.74, 0.20, 0.27, 15), (0.86, 0.30, 0.18, -5), (0.94, 0.27, 0.12, -8)],
    0.84, 0.03, 0.15, lean=6, sp_lean=8, ch_lean=5, head=6, yaw=5, yaw_phase=0.8, ch=8,
    arm0=5, arm_amp=25, arm_phase=0.38, el0=70, el_amp=10, add=20)
# jockey: defender backing off, crouched, wide base, toes down first, arms out
JOCKEY = make_gait(
    0.55, (-0.12, 0.14), (12, 5, 0, 0, -3, -6),
    [(0.68, 0.06, 0.14, 5), (0.80, -0.06, 0.15, 12), (0.92, -0.13, 0.12, 14)],
    0.78, 0.006, 0.27, lean=18, sp_lean=10, ch_lean=4, head=-22, yaw=3, yaw_phase=0.2, ch=3,
    arm0=15, arm_amp=6, arm_phase=0.4, el0=50, el_amp=5, add=5, width=0.10, turn=10)


def idle(t):
    """Standing ready: breathing and a slow shift of weight."""
    s = math.sin(2 * math.pi * t / 2.0)
    s2 = math.sin(2 * math.pi * t / 2.0 + 1.0)
    return {"hip_z": 0.878 + 0.003 * s, "side": 0.008 * s2, "lean": 2, "sp_lean": 3 + 0.8 * s,
            "ch_lean": 3, "hd_pitch": -2 - 0.5 * s, "l_x": 0.03, "r_x": -0.03, "l_turn": 8,
            "r_turn": 8, "la_add": 29, "ra_add": 29, "la_el": 22 + 2 * s, "ra_el": 22 + 2 * s,
            "la_sw": 2, "ra_sw": 2}


# ---------------------------------------------------------- keyed actions
def keyed(times, table):
    tracks = {k: track(times, v) for k, v in table.items()}
    return lambda t: {k: f(t) for k, f in tracks.items()}


def both(table, **cols):
    """Same column for the left and right limb: both(t, a_sw=...) -> la_sw, ra_sw."""
    for k, v in cols.items():
        table["l" + k], table["r" + k] = v, v
    return table


# ------------------------------------------------------------------ shoot
# Right-footed instep shot from a running stride: last step, plant the left
# foot beside the ball, backswing, strike, follow through, land, settle.
# Columns are key times in seconds; distances are metres forward of the start.
SHOOT_T = (0.00, 0.12, 0.22, 0.32, 0.42, 0.52, 0.66, 0.85, 1.05, 1.30)
SHOOT_IMPACT = 0.42
SHOOT = {
    "fwd":    (0.00, 0.18, 0.32, 0.42, 0.50, 0.56, 0.66, 0.85, 1.00, 1.02),   # pelvis travel
    "hip_z":  (0.85, 0.86, 0.84, 0.83, 0.87, 0.89, 0.90, 0.84, 0.86, 0.88),
    "lean":   (12, 11, 10, 8, 6, 14, 16, 12, 6, 2),
    "yaw":    (-5, -10, -15, -22, 0, 20, 28, 15, 5, 0),       # + = right hip forward
    # left (plant) foot: ankle forward, ankle height, boot pitch (toe down +)
    "l_y":    (-0.05, 0.48, 0.50, 0.50, 0.50, 0.538, 0.60, 0.55, 0.95, 1.04),
    "l_z":    (0.30, 0.18, 0.09, 0.08, 0.08, 0.137, 0.22, 0.28, 0.16, 0.08),
    "l_p":    (20, -10, -12, 0, 0, 20, 45, 50, 15, 0),
    # right (kicking) foot
    "r_y":    (-0.10, -0.006, 0.02, -0.08, 0.64, 1.16, 1.16, 1.00, 1.00, 1.00),
    "r_z":    (0.08, 0.177, 0.34, 0.60, 0.18, 0.40, 0.45, 0.08, 0.08, 0.08),
    "r_p":    (0, 40, 70, 100, 35, 15, 0, 0, 0, 0),
    # torso
    "sp_lean": (8, 6, 4, -4, 8, 14, 14, 8, 5, 2),
    "sp_roll": (0, 3, 6, 10, 12, 8, 4, 0, 0, 0),              # lean away from the kicking leg
    "ch_yaw":  (0, 4, 8, 15, 5, -10, -15, -8, -3, 0),         # + = left shoulder back
    "hd_pitch": (-5, 0, 6, 10, 12, 0, -4, -6, -4, -2),        # eyes on the ball
    # arms: adduction (30 = hanging), forward swing, elbow bend, pulled back
    "la_add": (28, 10, -10, -40, -30, 0, 15, 22, 28, 30),
    "la_sw":  (-20, -5, 10, -25, 5, 35, 30, 0, 0, 0),
    "la_el":  (70, 50, 35, 25, 30, 50, 60, 50, 30, 20),
    "la_back": (0, 5, 15, 35, 15, -10, 0, 0, 0, 0),
    "ra_add": (28, 22, 15, 5, 10, 15, 15, 22, 28, 30),
    "ra_sw":  (30, 20, 10, 20, -10, -35, -40, -10, 0, 0),
    "ra_el":  (85, 70, 60, 60, 50, 45, 45, 50, 30, 20),
    "ra_back": (0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
}



# ------------------------------------------------------------------- pass
# Right-footed side-foot pass from standing: step onto the left foot beside the
# ball, turn the right boot out, short backswing, push through, step down.
PASS_T = (0.00, 0.15, 0.30, 0.42, 0.50, 0.62, 0.80, 0.90, 1.05)
PASS_IMPACT = 0.50
PASS = {
    "fwd":    (0.00, 0.06, 0.18, 0.27, 0.32, 0.40, 0.52, 0.62, 0.69),
    "hip_z":  (0.88, 0.87, 0.86, 0.85, 0.86, 0.87, 0.86, 0.87, 0.88),
    "lean":   (2, 4, 6, 6, 5, 4, 4, 3, 2),
    "yaw":    (0, -3, -8, -14, -4, 8, 6, 2, 0),
    "l_y":    (0.00, 0.15, 0.32, 0.32, 0.32, 0.32, 0.371, 0.55, 0.68),
    "l_z":    (0.08, 0.14, 0.08, 0.08, 0.08, 0.08, 0.149, 0.14, 0.08),
    "l_p":    (0, 5, 0, 0, 0, 0, 25, 15, 0),
    "r_y":    (0.00, 0.00, 0.064, -0.02, 0.36, 0.72, 0.70, 0.70, 0.70),
    "r_z":    (0.08, 0.08, 0.159, 0.15, 0.12, 0.16, 0.08, 0.08, 0.08),
    "r_p":    (0, 0, 30, -5, -5, -5, 0, 0, 0),
    "r_turn": (0, 0, 20, 70, 75, 60, 10, 0, 0),              # boot turned out, degrees
    "sp_lean": (2, 4, 6, 8, 8, 6, 4, 3, 2),
    "sp_roll": (0, 2, 3, 5, 5, 3, 0, 0, 0),
    "ch_yaw":  (0, 2, 5, 8, 2, -6, -4, -1, 0),
    "hd_pitch": (-2, 4, 8, 10, 10, 4, 0, -2, -2),
    "la_add": (30, 24, 16, 8, 10, 16, 24, 28, 30),
    "la_sw":  (0, -5, 5, -10, 0, 10, 5, 0, 0),
    "la_el":  (20, 30, 35, 35, 35, 35, 30, 25, 20),
    "la_back": (0, 0, 5, 10, 5, 0, 0, 0, 0),
    "ra_add": (30, 26, 20, 15, 15, 18, 24, 28, 30),
    "ra_sw":  (0, 10, 8, 10, -5, -15, -8, 0, 0),
    "ra_el":  (20, 35, 40, 40, 40, 40, 30, 25, 20),
    "ra_back": (0, 0, 0, 0, 0, 0, 0, 0, 0),
}

# Lofted kick (long ball, cross, clearance, goal kick, corner, free kick): the
# shot's run-up, but leaning back, striking under the ball, leg finishing high.
LONG_KICK = dict(SHOOT)
LONG_KICK.update({
    "lean":    (10, 9, 8, 4, -3, 0, 4, 8, 5, 2),
    "sp_lean": (6, 4, 2, -6, -6, 0, 6, 6, 4, 2),
    "r_y":     (-0.10, -0.006, 0.02, -0.08, 0.66, 1.20, 1.22, 1.00, 1.00, 1.00),
    "r_z":     (0.08, 0.177, 0.34, 0.62, 0.165, 0.52, 0.52, 0.08, 0.08, 0.08),
    "r_p":     (0, 40, 70, 100, 30, 5, -5, 0, 0, 0),
    "r_turn":  (0, 0, 5, 15, 20, 15, 5, 0, 0, 0),
    "la_add":  (28, 10, -15, -48, -40, -10, 10, 22, 28, 30),
    "la_back": (0, 5, 18, 40, 25, 0, 0, 0, 0, 0),
    "hd_pitch": (-5, 0, 6, 10, 8, -4, -8, -6, -4, -2),
})

# First touch: weight onto the left leg, right boot turned out to meet the ball
# and drawn back to cushion it, then set down ready to move.
TOUCH_T = (0.00, 0.14, 0.28, 0.40, 0.60)
TOUCH = {
    "hip_z": (0.88, 0.86, 0.85, 0.85, 0.87),
    "side":  (0.00, 0.03, 0.045, 0.04, 0.01),
    "lean":  (2, 5, 6, 6, 3),
    "yaw":   (0, -4, -8, -6, 0),
    "r_x":   (0.00, -0.02, -0.03, -0.03, -0.02),
    "r_y":   (0.00, 0.12, 0.26, 0.14, 0.10),
    "r_z":   (0.08, 0.14, 0.13, 0.11, 0.08),
    "r_p":   (0, -5, -5, -3, 0),
    "r_turn": (0, 45, 70, 65, 10),
    "hd_pitch": (0, 8, 12, 10, 2),
    "la_add": (30, 18, 12, 14, 26), "la_el": (20, 35, 40, 38, 25), "la_sw": (0, 6, 8, 5, 0),
    "ra_add": (30, 20, 15, 16, 26), "ra_el": (20, 35, 40, 38, 25), "ra_sw": (0, -8, -10, -6, 0),
}

# Header: crouch, drive up with the arms, arch back at the top, snap the head
# and chest through the ball, land and absorb.
JUMP_T = (0.00, 0.18, 0.30, 0.42, 0.52, 0.62, 0.76, 0.90, 1.10)
HEADER = both({
    "fwd":   (0.00, 0.00, 0.02, 0.06, 0.10, 0.14, 0.18, 0.20, 0.20),
    "hip_z": (0.88, 0.72, 0.94, 1.16, 1.22, 1.16, 0.92, 0.76, 0.88),
    "lean":  (3, 25, 5, -10, -6, 14, 10, 20, 3),
    "l_y":   (0.00, 0.00, 0.10, 0.02, 0.06, 0.11, 0.18, 0.20, 0.20),
    "l_z":   (0.08, 0.08, 0.19, 0.36, 0.42, 0.36, 0.137, 0.08, 0.08),
    "r_y":   (0.00, 0.00, 0.10, 0.10, 0.14, 0.16, 0.18, 0.20, 0.20),
    "r_z":   (0.08, 0.08, 0.19, 0.40, 0.48, 0.38, 0.137, 0.08, 0.08),
    "sp_lean": (3, 10, 0, -12, -6, 14, 8, 8, 2),
    "hd_pitch": (0, -8, -8, -18, -5, 16, 5, 0, 0),
}, _p=(0, 0, 45, 50, 45, 40, 20, 0, 0),
   a_sw=(0, -40, 40, 75, 55, 15, 10, 20, 0),
   a_add=(30, 25, 12, 5, 8, 15, 20, 25, 30),
   a_el=(20, 40, 60, 75, 70, 55, 40, 40, 20))

# Standing tackle: lunge in low with the right boot turned to block the ball,
# then step through and stand up.
TACKLE_T = (0.00, 0.15, 0.30, 0.42, 0.60, 0.80, 1.00)
TACKLE = {
    "fwd":   (0.00, 0.05, 0.22, 0.30, 0.38, 0.50, 0.58),
    "hip_z": (0.86, 0.82, 0.74, 0.72, 0.78, 0.85, 0.88),
    "lean":  (5, 12, 20, 22, 14, 6, 2),
    "yaw":   (0, 5, 15, 18, 10, 3, 0),
    "l_y":   (0.00, 0.00, 0.03, 0.051, 0.20, 0.50, 0.60),
    "l_z":   (0.08, 0.08, 0.11, 0.149, 0.18, 0.12, 0.08),
    "l_p":   (0, 0, 12, 25, 25, 8, 0),
    "r_y":   (0.00, 0.10, 0.55, 0.62, 0.62, 0.62, 0.62),
    "r_z":   (0.08, 0.15, 0.13, 0.09, 0.08, 0.08, 0.08),
    "r_p":   (0, -5, -10, -5, 0, 0, 0),
    "r_turn": (0, 20, 50, 60, 40, 10, 0),
    "sp_lean": (4, 8, 10, 10, 8, 4, 2),
    "hd_pitch": (0, 5, 10, 10, 5, 0, -2),
    "la_add": (20, 10, 5, 5, 10, 20, 30), "la_el": (40, 45, 40, 40, 40, 30, 20),
    "la_sw": (0, 20, 30, 25, 10, 0, 0),
    "ra_add": (20, 12, 8, 8, 12, 20, 30), "ra_el": (40, 50, 55, 50, 40, 30, 20),
    "ra_sw": (0, -15, -30, -25, -10, 0, 0),
}

# Throw-in: both feet down, ball taken from behind the head, back arched,
# then the whole body whips forward.
THROW_T = (0.00, 0.25, 0.50, 0.62, 0.72, 0.95, 1.20)
THROW = both({
    "fwd":   (0.00, -0.02, -0.05, 0.00, 0.06, 0.04, 0.00),
    "hip_z": (0.88, 0.87, 0.86, 0.87, 0.86, 0.87, 0.88),
    "lean":  (2, -3, -10, -4, 8, 6, 2),
    "sp_lean": (2, -4, -12, -4, 10, 6, 2),
    "hd_pitch": (0, -5, -10, -5, 5, 0, -2),
    "l_x": (0.04,) * 7, "r_x": (-0.04,) * 7,
}, a_sw=(0, 120, 190, 150, 80, 40, 0),
   a_el=(20, 90, 115, 60, 15, 20, 20),
   a_add=(30, 36, 46, 44, 36, 30, 30))

# Keeper dive (to the keeper's left; mirror in code for the right): set stance,
# load the near leg, push off, full stretch in the air, land on the side.
DIVE_T = (0.00, 0.15, 0.30, 0.45, 0.60, 0.80, 1.10)
DIVE = both({
    "side":  (0.00, 0.10, 0.45, 1.00, 1.50, 1.72, 1.74),
    "hip_z": (0.80, 0.74, 0.82, 0.80, 0.40, 0.15, 0.15),
    "roll":  (0, 5, 35, 68, 80, 78, 78),
    "lean":  (15, 18, 10, 0, -4, 0, 0),
    "legs_local": (0, 0, 0.35, 1, 1, 1, 1),
    "l_x":   (0.12,) * 7,
    "r_x":   (-0.12, -0.08, 0.00, 0.00, 0.00, 0.00, 0.00),
    "l_lx":  (0.00, 0.00, 0.00, -0.05, -0.10, -0.12, -0.12),
    "l_ly":  (0.05, 0.05, 0.05, 0.05, 0.08, 0.10, 0.10),
    "l_lz":  (-0.85, -0.85, -0.85, -0.84, -0.80, -0.78, -0.78),
    "r_ly":  (0.05, 0.10, 0.25, 0.30, 0.28, 0.30, 0.30),
    "r_lz":  (-0.80, -0.75, -0.62, -0.60, -0.64, -0.62, -0.62),
    "sp_roll": (0, 4, 10, 12, 6, 0, 0),
    "sp_lean": (8, 8, 2, -4, -4, 0, 0),
    "hd_pitch": (-18, -15, -10, -8, -5, 0, 0),
}, a_sw=(30, 20, 95, 172, 176, 170, 150),
   a_add=(10, 10, 22, 36, 38, 36, 30),
   a_el=(70, 80, 45, 8, 5, 10, 30))

# Keeper high catch: jump off one leg with the other knee up, take the ball
# at full stretch, bring it into the chest on landing.
CATCH = both({
    "fwd":   (0.00, 0.00, 0.02, 0.06, 0.10, 0.14, 0.18, 0.20, 0.20),
    "hip_z": (0.80, 0.70, 0.94, 1.16, 1.22, 1.16, 0.92, 0.78, 0.86),
    "lean":  (15, 22, 5, -4, -4, 0, 6, 14, 6),
    "l_x":   (0.12, 0.12, 0.08, 0.05, 0.05, 0.05, 0.06, 0.08, 0.08),
    "r_x":   (-0.12, -0.12, -0.08, -0.05, -0.05, -0.05, -0.06, -0.08, -0.08),
    "l_y":   (0.00, 0.00, 0.10, 0.02, 0.06, 0.11, 0.18, 0.20, 0.20),
    "l_z":   (0.08, 0.08, 0.19, 0.36, 0.42, 0.36, 0.137, 0.08, 0.08),
    "l_p":   (0, 0, 45, 50, 45, 40, 20, 0, 0),
    "r_y":   (0.00, 0.00, 0.10, 0.28, 0.36, 0.30, 0.20, 0.20, 0.20),
    "r_z":   (0.08, 0.08, 0.19, 0.62, 0.78, 0.60, 0.137, 0.08, 0.08),
    "r_p":   (0, 0, 45, 30, 20, 20, 20, 0, 0),
    "sp_lean": (8, 10, 0, -8, -8, -2, 6, 8, 4),
    "hd_pitch": (-18, -10, -20, -30, -30, -20, -5, 5, 0),
}, a_sw=(30, -15, 110, 172, 176, 150, 90, 55, 45),
   a_add=(10, 18, 34, 42, 44, 44, 44, 46, 46),
   a_el=(70, 50, 45, 12, 8, 40, 95, 115, 115))

# Celebration: jump and punch the air, land, both arms up to the crowd (held).
CELEB_T = (0.00, 0.20, 0.35, 0.55, 0.75, 0.95, 1.20, 1.60, 2.00)
CELEB = both({
    "hip_z": (0.88, 0.72, 0.96, 1.18, 1.10, 0.80, 0.86, 0.88, 0.88),
    "lean":  (2, 22, 4, -8, -2, 14, 4, -2, -2),
    "l_x": (0.04,) * 9, "r_x": (-0.04,) * 9,
    "sp_lean": (2, 10, 0, -8, -4, 8, 0, -6, -6),
    "hd_pitch": (0, 5, -5, -18, -12, 5, -10, -16, -16),
    "ra_sw": (0, -30, 90, 175, 160, 60, 120, 150, 150),
    "ra_el": (20, 60, 90, 10, 20, 80, 50, 20, 20),
    "ra_add": (30, 25, 25, 30, 28, 25, 5, -12, -12),
    "la_sw": (0, -30, 40, 30, 20, 30, 120, 150, 150),
    "la_el": (20, 60, 90, 100, 95, 80, 50, 20, 20),
    "la_add": (30, 25, 22, 20, 22, 25, 5, -12, -12),
}, _z=(0.08, 0.08, 0.19, 0.46, 0.40, 0.11, 0.08, 0.08, 0.08),
   _p=(0, 0, 45, 40, 30, 10, 0, 0, 0))


def loop(values, frames):
    return lambda t: values(t * FPS / frames)


# name: (frames, loops?, values at time t, frame of ball contact or None)
CLIPS = {
    "Idle":       (120, True, idle, None),
    "Walk":       (60, True, loop(WALK, 60), None),
    "Jog":        (40, True, loop(JOG, 40), None),
    "Run":        (28, True, loop(RUN, 28), None),
    "Jockey":     (30, True, loop(JOCKEY, 30), None),
    "Dribble":    (34, True, loop(DRIBBLE, 34), None),
    "FirstTouch": (37, False, keyed(TOUCH_T, TOUCH), 18),
    "Pass":       (64, False, keyed(PASS_T, PASS), 31),
    "Shoot":      (79, False, keyed(SHOOT_T, SHOOT), 26),
    "LongKick":   (79, False, keyed(SHOOT_T, LONG_KICK), 26),
    "Header":     (67, False, keyed(JUMP_T, HEADER), 35),
    "Tackle":     (61, False, keyed(TACKLE_T, TACKLE), 26),
    "ThrowIn":    (73, False, keyed(THROW_T, THROW), 42),
    "KeeperDive": (67, False, keyed(DIVE_T, DIVE), 33),
    "KeeperCatch": (67, False, keyed(JUMP_T, CATCH), 32),
    "Celebrate":  (121, False, keyed(CELEB_T, CELEB), None),
}


def key_pose(arm, pose, loc, prev, frame):
    for pb in arm.pose.bones:
        rest = pb.bone.matrix_local.to_3x3()
        q = (rest.inverted() @ pose[pb.name] @ rest).to_quaternion()
        if pb.name in prev and prev[pb.name].dot(q) < 0:
            q.negate()
        prev[pb.name] = q.copy()
        pb.rotation_mode = "QUATERNION"
        pb.rotation_quaternion = q
        pb.keyframe_insert("rotation_quaternion", frame=frame)
        if pb.name == "hips":
            pb.location = rest.inverted() @ loc
            pb.keyframe_insert("location", frame=frame)


def lowest_point(objs):
    dg = bpy.context.evaluated_depsgraph_get()
    low = 9.0
    for o in objs:
        me = o.evaluated_get(dg).to_mesh()
        low = min(low, min(v.co.z for v in me.vertices))
        o.evaluated_get(dg).to_mesh_clear()
    return low


def set_action(arm, action):
    ad = arm.animation_data
    ad.action = action
    if getattr(ad, "action_slot", 1) is None and action is not None:
        ad.action_slot = action.slots[0]


def build_clips(arm, objs):
    """One action per clip. Looping clips repeat frame 1 as their last frame."""
    arm.animation_data_create()
    actions = {}
    for name, (frames, looping, values, contact) in CLIPS.items():
        set_action(arm, None)
        count = frames + 1 if looping else frames
        prev, low = {}, []
        for i in range(count):
            pose, loc = body_pose(values((i % frames if looping else i) / FPS))
            key_pose(arm, pose, loc, prev, i + 1)
            bpy.context.view_layer.update()
            low.append(lowest_point(objs))
        act = arm.animation_data.action
        act.name = name
        act.use_fake_user = True
        actions[name] = (act, count)
        print(f"{name:11s} {count:3d} frames {count / FPS:4.2f}s  "
              f"{'loop' if looping else 'once'}  contact frame {contact}  "
              f"lowest point {min(low) * 100:5.1f}..{max(low) * 100:4.1f} cm")
    return actions


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser()
    ap.add_argument("--render", help="front view of the rest pose")
    ap.add_argument("--export")
    ap.add_argument("--view", action="append", default=[],
                    help="extra check view: path,angle,cx,cz,scale[,frame,action]")
    ap.add_argument("--anim", action="append", default=[],
                    help="preview frames: action,dir,angle,cx,scale,width,height,step")
    args = ap.parse_args(argv)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene.render.fps = FPS

    objs = [build_head(), build_hair(), build_eyes(), build_pupils(), build_eyebrows(),
            build_mouth(), build_neck(), build_arms(), build_hands(), build_legs(),
            build_shirt(), build_shorts(), build_socks(), build_boots(), build_boot_soles()]

    bpy.context.view_layer.update()
    tris, zs = 0, []
    for o in objs:
        o.data.calc_loop_triangles()
        tris += len(o.data.loop_triangles)
        zs += [v.co.z for v in o.data.vertices]
    print(f"TOTAL tris={tris}  min_z={min(zs):.4f}  height={max(zs) - min(zs):.4f} m")

    arm = build_rig(objs)
    actions = build_clips(arm, objs)
    set_action(arm, actions["Idle"][0])

    arm.data.pose_position = "REST"
    if args.render:
        render_view(args.render)
    for v in args.view:
        path, *nums = v.split(",")
        if len(nums) > 5:
            set_action(arm, actions[nums.pop()][0])
        nums = list(map(float, nums))
        if len(nums) > 4:
            arm.data.pose_position = "POSE"
            scene.frame_set(int(nums.pop()))
        render_view(path, *nums)
        arm.data.pose_position = "REST"
    arm.data.pose_position = "POSE"
    for v in args.anim:
        name, folder, *nums = v.split(",")
        angle, cx, scale, w, h, step = map(float, nums)
        act, count = actions[name]
        set_action(arm, act)
        for f in range(1, count + 1, int(step)):
            scene.frame_set(f)
            render_view(f"{folder}/{f:03d}.png", angle, cx, 1.2, scale,
                        res=(int(w), int(h)), samples=12)
    set_action(arm, actions["Idle"][0])
    scene.frame_set(1)
    if args.export:
        export_glb(args.export, objs, arm, actions)


if __name__ == "__main__":
    main()
