"""Low-poly football (size 5, classic 32-panel layout). Modeling only.

Usage:
    python build_ball.py [--render front.png] [--export ball.glb]

Size 5 per the Laws of the Game: circumference 68-70 cm. This ball is 69 cm
(radius 0.1098 m). Units are metres, origin at the ball's centre.
"""
import argparse
import itertools
import math
import sys

import bpy  # must be imported before bmesh/mathutils
import bmesh
from mathutils import Vector

RADIUS = 0.69 / (2 * math.pi)
SEAM_GAP = 0.94        # panels shrink toward their centre to open the seams
SEAM_DEPTH = 0.988     # panel rims and seam sphere sit slightly below the surface

COLORS = {
    "ball_pentagons": (0.03, 0.03, 0.035, 1.0),
    "ball_hexagons": (0.90, 0.90, 0.90, 1.0),
    "ball_seams": (0.12, 0.12, 0.13, 1.0),
}


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
    bsdf.inputs["Roughness"].default_value = 0.6
    bsdf.inputs["Metallic"].default_value = 0.0
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def finish(name, bm):
    for f in bm.faces:
        f.normal_update()
        if f.normal.dot(f.calc_center_median()) < 0:
            f.normal_flip()
        f.smooth = True
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    mesh.materials.append(material(name))
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def icosahedron():
    p = (1 + math.sqrt(5)) / 2
    verts = []
    for a, b in itertools.product((-1, 1), (-p, p)):
        verts += [Vector((0, a, b)), Vector((a, b, 0)), Vector((b, 0, a))]
    # turn the ball so one pentagon faces forward (-Y)
    q = verts[0].rotation_difference(Vector((0, -1, 0)))
    verts = [q @ v for v in verts]
    near = lambda i, j: abs((verts[i] - verts[j]).length - 2) < 1e-4
    faces = [t for t in itertools.combinations(range(12), 3)
             if near(t[0], t[1]) and near(t[1], t[2]) and near(t[0], t[2])]
    return verts, faces, near


def panels():
    """Corner loops of the 12 pentagons and 20 hexagons of a truncated icosahedron."""
    verts, faces, near = icosahedron()
    cut = lambda a, b: verts[a] + (verts[b] - verts[a]) / 3
    pentagons = []
    for a in range(12):
        nbrs = [b for b in range(12) if b != a and near(a, b)]
        axis = verts[a].normalized()
        ref = (verts[nbrs[0]] - verts[a])
        ref = (ref - axis * ref.dot(axis)).normalized()
        side = axis.cross(ref)

        def ang(b):
            d = verts[b] - verts[a]
            return math.atan2(d.dot(side), d.dot(ref))
        pentagons.append([cut(a, b) for b in sorted(nbrs, key=ang)])
    hexagons = [[cut(a, b), cut(b, a), cut(b, c), cut(c, b), cut(c, a), cut(a, c)]
                for a, b, c in faces]
    return pentagons, hexagons


def add_panel(bm, corners):
    """Fan-subdivided panel: domed in the middle, rim pulled down into the seam."""
    centre = sum(corners, Vector()) / len(corners)
    cache = {}

    def vert(p, rim):
        key = tuple(round(c, 6) for c in p)
        if key not in cache:
            q = centre + (p - centre) * SEAM_GAP
            cache[key] = bm.verts.new(q.normalized() * RADIUS * (SEAM_DEPTH if rim else 1.0))
        return cache[key]

    n = len(corners)
    c = vert(centre, False)
    for i in range(n):
        a, b = corners[i], corners[(i + 1) % n]
        va, vb, vm = vert(a, True), vert(b, True), vert((a + b) / 2, True)
        ia, ib = vert((centre + a) / 2, False), vert((centre + b) / 2, False)
        for tri in ((c, ia, ib), (ia, va, vm), (ia, vm, ib), (ib, vm, vb)):
            bm.faces.new(tri)


def build_ball():
    pentagons, hexagons = panels()
    objs = []
    for name, group in (("ball_pentagons", pentagons), ("ball_hexagons", hexagons)):
        bm = bmesh.new()
        for corners in group:
            add_panel(bm, corners)
        objs.append(finish(name, bm))
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=2, radius=RADIUS * SEAM_DEPTH * 0.995)
    objs.append(finish("ball_seams", bm))
    return objs


# ------------------------------------------------------------ render/export
def render_view(path, angle=0.0, elev=0.0, scale=0.32):
    scene = bpy.context.scene
    a, e = math.radians(angle), math.radians(elev)
    cam_data = bpy.data.cameras.new("tmp_cam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = scale
    cam = bpy.data.objects.new("tmp_cam", cam_data)
    cam.location = (5 * math.sin(a) * math.cos(e), -5 * math.cos(a) * math.cos(e), 5 * math.sin(e))
    cam.rotation_euler = (math.radians(90) - e, 0, a)
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
    scene.cycles.samples = 48
    scene.cycles.use_denoising = False
    scene.view_settings.view_transform = "Standard"
    scene.render.resolution_x = 800
    scene.render.resolution_y = 800
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


def export_glb(path, objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB",
                              use_selection=True, export_yup=True,
                              export_apply=True)


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser()
    ap.add_argument("--render")
    ap.add_argument("--export")
    ap.add_argument("--view", action="append", default=[],
                    help="extra check view: path,angle,elev")
    args = ap.parse_args(argv)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0

    objs = build_ball()
    bpy.context.view_layer.update()
    tris, rs = 0, []
    for o in objs:
        o.data.calc_loop_triangles()
        t = len(o.data.loop_triangles)
        tris += t
        rs += [v.co.length for v in o.data.vertices]
        print(f"{o.name:15s} tris={t:4d}")
    print(f"TOTAL tris={tris}  diameter={2 * max(rs):.4f} m  "
          f"circumference={2 * math.pi * max(rs):.4f} m")

    if args.render:
        render_view(args.render)
    for v in args.view:
        path, *nums = v.split(",")
        render_view(path, *map(float, nums))
    if args.export:
        export_glb(args.export, objs)


if __name__ == "__main__":
    main()
