#!/usr/bin/env python3
"""检测像素风农场背景图里的田地格子中心坐标（田埂线中点法，🔴 正中心）

原理：AI 生成的背景图田地有浅黄棕"田埂"分隔带（RGB ~220,160,50，与深棕田土
~126,90,21 明显区分）。检测水平/垂直田埂线的位置，格子中心 = 相邻两条田埂线的中点。
比"数字中心法"准：数字标在格子左上角，用数字中心会整体偏左上 33-44px。

用法: python3 detect_garden_cells.py <背景图目录> [输出目录]
输出: 每张图一个 JSON {image, size, cells:[{day,row,cx,cy}]}
"""
import sys, os, json
from PIL import Image
import numpy as np


def detect_cells(path):
    """田埂线中点法：返回 (W, H, [(row, cx, cy), ...]) 全部网格中心（5行×7列=35个）"""
    im = Image.open(path).convert("RGB")
    W, H = im.size
    a = np.asarray(im).astype(int)
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    # 田埂（亮黄棕）
    ridge = (r > 170) & (g > 110) & (b > 25) & (r > g + 30) & (g > b + 60)
    # 深棕田土（确认格子存在用）
    brown = (r > 95) & (r < 185) & (g > 60) & (g < 145) & (b > 10) & (b < 75) & (r > g + 15) & (g > b + 20)
    # 田地区域裁剪（各季节田地都在此范围内）
    x0, x1, y0, y1 = 100, 900, 430, 1110
    sub = ridge[y0:y1, x0:x1]

    def peak_lines(proj, thresh_frac, min_gap=25):
        lines = []
        n = len(proj)
        thresh = proj.max() * thresh_frac if proj.max() > 0 else 0
        for i in range(1, n - 1):
            if proj[i] > thresh and proj[i] >= proj[i - 1] and proj[i] >= proj[i + 1]:
                lines.append(i)
        merged = []
        for i in lines:
            if merged and i - merged[-1][-1] < min_gap:
                merged[-1].append(i)
            else:
                merged.append([i])
        return [int(np.mean(g)) for g in merged]

    row_r = sub.sum(axis=1) / (x1 - x0)
    h_lines = peak_lines(row_r, 0.25)
    col_r = sub.sum(axis=0) / (y1 - y0)
    v_lines = peak_lines(col_r, 0.15)

    h_all = [y0 + l for l in h_lines]
    v_all = [x0 + l for l in v_lines]
    # 格子中心 = 相邻田埂线中点（全部候选）
    cells = []
    for ri in range(len(h_all) - 1):
        cy = (h_all[ri] + h_all[ri + 1]) // 2
        for ci in range(len(v_all) - 1):
            cx = (v_all[ci] + v_all[ci + 1]) // 2
            # 确认该格有棕色田土（阶梯状田地末行只有部分格子）
            by0, by1 = max(0, cy - 30), min(H, cy + 30)
            bx0, bx1 = max(0, cx - 30), min(W, cx + 30)
            has_soil = brown[by0:by1, bx0:bx1].sum() > 100
            if has_soil:
                cells.append((ri + 1, cx, cy))
    return W, H, cells


# 标准模板（田埂线中点法实测坐标：行 y=523/645/769/893/1015，列 x=195/307/415/520/625/731/836）
TEMPLATE = [
    (1, 195, 523), (1, 307, 523), (1, 415, 523), (1, 520, 523), (1, 625, 523), (1, 731, 523), (1, 836, 523),
    (2, 195, 645), (2, 307, 645), (2, 415, 645), (2, 520, 645), (2, 625, 645), (2, 731, 645), (2, 836, 645),
    (3, 195, 769), (3, 307, 769), (3, 415, 769), (3, 520, 769), (3, 625, 769), (3, 731, 769), (3, 836, 769),
    (4, 195, 893), (4, 307, 893), (4, 415, 893), (4, 520, 893), (4, 625, 893), (4, 731, 893), (4, 836, 893),
    (5, 195, 1015), (5, 307, 1015), (5, 415, 1015),
]


def template_correct(path, day):
    """自由检测失败时（装饰物干扰聚类），用标准模板在每格附近确认数字/棕色土块"""
    im = Image.open(path).convert("RGB")
    W, H = im.size
    a = np.asarray(im).astype(int)
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    brown = (r > g + 10) & (g > b)
    bright = (r > 150) & (g > 140) & (b > 100)
    cells = []
    for row, cx, cy in TEMPLATE[:day]:  # 只取该月天数对应的格数
        y0, y1 = max(0, cy - 30), min(H, cy + 30)
        x0, x1 = max(0, cx - 30), min(W, cx + 30)
        b_win = brown[y0:y1, x0:x1].sum()
        w_win = bright[y0:y1, x0:x1].sum()
        if b_win > 100 or w_win > 30:
            cells.append((row, cx, cy))
    return W, H, cells


def main():
    src_dir = sys.argv[1] if len(sys.argv) > 1 else "/home/zjq/english-app/assets-src/farm-bg"
    out_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.join(src_dir, "maps")
    os.makedirs(out_dir, exist_ok=True)
    total_ok = 0
    total = 0
    for fname in sorted(os.listdir(src_dir)):
        if not fname.startswith("bg_") or not fname.endswith(".png"):
            continue
        total += 1
        # 期望天数从文件名取
        day = int(fname.replace(".png", "").split("_")[-1])
        path = os.path.join(src_dir, fname)
        W, H, cells = detect_cells(path)
        method = "auto"
        if len(cells) != day:
            # 自由检测失败 -> 模板校正（装饰物干扰）
            W, H, cells = template_correct(path, day)
            method = "template"
        ok = len(cells) == day
        total_ok += ok
        result = {
            "image": fname,
            "size": [W, H],
            "method": method,
            "cells": [{"day": i + 1, "row": r, "cx": round(cx), "cy": round(cy)}
                      for i, (r, cx, cy) in enumerate(cells)],
        }
        out = os.path.join(out_dir, fname.replace(".png", ".json"))
        with open(out, "w") as f:
            json.dump(result, f, ensure_ascii=False, indent=1)
        print(f"{fname}: {len(cells)}格 (期望{day}) [{method}] {'OK' if ok else 'MISMATCH'} -> {out}")
    print(f"\n完成 {total_ok}/{total}")


if __name__ == "__main__":
    main()
