# 月历农场背景图素材（v0.33 确认版）

## 文件
- bg_<season>_<days>.png × 16（1152×2048 竖版，星露谷风格空土地背景）
  - season: spring / summer / autumn / winter
  - days: 31（5行末行3格）/ 30（5行末行2格）/ 29（5行末行1格）/ 28（4行全满）
- 参考图_concept_v3.png —— 用户确认的概念图（特写版+周围留白），所有背景图基于它 img2img 生成

## 用途
正式版（v0.34 第六 tab「月历花园」）：按"当月季节+当月天数"匹配背景图
（如 2026-02 平年 → bg_winter_28；08 月 → bg_summer_31）

## 注意事项
- 每张图 ~2.8MB，16 张共 45MB —— 只放 assets-src 不进 APK；
  App 内用压缩版（如 WebP/缩放）或正式版再决定打包策略
- 30 天版曾经 AI 画成 31 格（autumn_30），检查时必须数末行格数：
  31→3格 / 30→2格 / 29→1格 / 28→4行满
- 作物素材：www/assets/crops.png（LPC Crops 17 种×3 帧，CC-BY-SA 需署名）
- 装饰素材：www/assets/decor/*.png（12 月度限定 + 6 通用 + bench，AI 生成抠图）
- 地形小格：www/assets/grass_*.png（4 季，v0.33 月历版用的，v0.34 可能弃用）
