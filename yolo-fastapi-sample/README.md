---
title: BlueWaste YOLO Analyzer
emoji: 🗑️
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
tags:
  - yolo
  - yolov8
  - waste-detection
  - fastapi
  - object-detection
  - garbage-classification
license: mit
short_description: YOLOv8 waste detection API for BlueWaste smart waste management
---

# BlueWaste YOLO Analyzer

A FastAPI service that analyzes waste images using a two-layer YOLOv8 pipeline.

## Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check — confirms models are loaded |
| `/analyze` | POST | **Main endpoint** — 2-layer waste analysis with severity scoring |
| `/predict` | POST | Full COCO YOLOv8 detection with decision output |
| `/predict-annotated` | POST | Same as `/predict` but returns an annotated image (base64) |
| `/detect` | POST | Simplified detection using custom waste model |

## `/analyze` Pipeline

**Layer 1** — `yolov8n.pt` (COCO): Spam filter — checks if any visible object exists in the image.

**Layer 2** — `weights/best.pt` (custom-trained): Classifies waste with 6 classes:
`plastic`, `glass`, `metal`, `paper`, `organic`, `other`

**Severity scoring** based on top detection confidence:

| Confidence | Severity |
|---|---|
| ≥ 90% | CRITICAL 🔴 |
| ≥ 70% | HIGH 🟠 |
| ≥ 50% | MODERATE 🟡 |
| < 50% | SPAM ⚪ |

## Usage

```bash
curl -X POST "https://ishuualt-bluewaste-yolo26.hf.space/analyze" \
  -F "image=@your_image.jpg"
```
