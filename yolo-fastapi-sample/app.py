"""
BlueWaste YOLO Analyzer
HuggingFace Space — Gradio SDK + ZeroGPU

Two-layer waste analysis pipeline:
  Layer 1: yolov8n.pt  (COCO) — spam filter (is there any object at all?)
  Layer 2: weights/best.pt — custom waste classifier
           Classes: plastic, glass, metal, paper, organic, other

API endpoints (Gradio named):
  POST /api/predict   → fn_index=0  → analyze(image)
  POST /api/predict   → fn_index=1  → predict(image)
  POST /api/predict   → fn_index=2  → detect(image)

Or via named call API:
  POST /call/analyze  →  { "data": ["data:image/jpeg;base64,..."] }
  POST /call/predict  →  { "data": ["data:image/jpeg;base64,..."] }
  POST /call/detect   →  { "data": ["data:image/jpeg;base64,..."] }
"""

import os
import cv2
import base64
import numpy as np
import gradio as gr
import spaces
from PIL import Image, ImageOps
from threading import Lock
from typing import Optional, Any

# ── Model paths ───────────────────────────────────────────────────────────────
MODEL_NAME = "yolov8n.pt"
CUSTOM_MODEL_PATH = os.getenv("CUSTOM_MODEL_PATH", "weights/best.pt")
DETECT_MODEL_PATH = os.getenv("DETECT_MODEL_PATH", "weights/best.pt")

# ── Analysis thresholds ───────────────────────────────────────────────────────
ANALYZE_YOLO_MIN_CONF      = float(os.getenv("ANALYZE_YOLO_MIN_CONF", "0.15"))
CUSTOM_CONF_THRESHOLD      = float(os.getenv("CUSTOM_CONF",           "0.20"))
DETECT_CONF_THRESHOLD      = float(os.getenv("DETECT_CONF",           "0.25"))
SEVERITY_CRITICAL          = 0.90
SEVERITY_HIGH              = 0.70
SEVERITY_MODERATE          = 0.50

# ── COCO /predict thresholds (Layer-1 model reused for /predict) ──────────────
WASTE_CONFIDENCE_THRESHOLD         = 0.20
WASTE_FALLBACK_CONFIDENCE_THRESHOLD = 0.08
LOW_CONFIDENCE_FALLBACK_THRESHOLD  = 0.18
WASTE_NMS_IOU_THRESHOLD            = 0.55
MIN_NORMALIZED_BOX_AREA            = 0.0015
DIRTY_MIN_WASTE_COUNT              = 1

_DEFAULT_WASTE_CLASSES = {
    "bottle", "cup", "wine glass", "bowl",
    "plastic", "glass", "metal", "paper", "organic", "other",
}
_waste_classes_env = os.getenv("WASTE_CLASSES", "").strip()
WASTE_CLASSES = (
    {item.strip().lower() for item in _waste_classes_env.split(",") if item.strip()}
    if _waste_classes_env else _DEFAULT_WASTE_CLASSES
)

# ── Model singletons ──────────────────────────────────────────────────────────
_yolo_model:   Optional[Any] = None
_custom_model: Optional[Any] = None
_yolo_lock   = Lock()
_custom_lock = Lock()


def _get_yolo_model() -> Any:
    global _yolo_model
    if _yolo_model is None:
        with _yolo_lock:
            if _yolo_model is None:
                from ultralytics import YOLO
                _yolo_model = YOLO(MODEL_NAME)
    return _yolo_model


def _get_custom_model() -> Any:
    global _custom_model
    if _custom_model is None:
        with _custom_lock:
            if _custom_model is None:
                if not os.path.isfile(CUSTOM_MODEL_PATH):
                    raise FileNotFoundError(
                        f"Custom waste model not found at '{CUSTOM_MODEL_PATH}'. "
                        "Ensure weights/best.pt is present in the Space repo."
                    )
                from ultralytics import YOLO
                _custom_model = YOLO(CUSTOM_MODEL_PATH)
    return _custom_model


# ── Image helpers ─────────────────────────────────────────────────────────────

def _pil_to_bgr(image: Image.Image) -> np.ndarray:
    """EXIF-corrected PIL → OpenCV BGR."""
    image = ImageOps.exif_transpose(image).convert("RGB")
    return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)


def _normalize_box(x1, y1, x2, y2, w, h) -> dict:
    return {
        "x": float(x1 / w),
        "y": float(y1 / h),
        "width": float(max(0.0, x2 - x1) / w),
        "height": float(max(0.0, y2 - y1) / h),
        "normalized": True,
    }


def _confidence_color(conf: float):
    if conf >= 0.6: return (46, 204, 113)   # green
    if conf >= 0.3: return (0, 215, 255)    # amber
    return (64, 64, 255)                    # red


def _encode_annotated(frame: np.ndarray, detections: list) -> Optional[str]:
    annotated = frame.copy()
    h, w = annotated.shape[:2]
    fs = max(0.45, min(w, h) / 900.0)
    th = max(1, int(round(min(w, h) / 450)))
    for d in detections:
        bbox = d["bbox"]
        x1 = int(round(bbox["x"] * w));  y1 = int(round(bbox["y"] * h))
        x2 = int(round((bbox["x"] + bbox["width"]) * w))
        y2 = int(round((bbox["y"] + bbox["height"]) * h))
        color = _confidence_color(d["confidence"])
        label = f"{d['class']} {d['confidence']*100:.1f}%"
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, th)
        (tw, txh), bl = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, fs, th)
        ty1 = max(0, y1 - txh - bl - 6); ty2 = min(h - 1, y1)
        tx2 = min(w - 1, x1 + tw + 8)
        cv2.rectangle(annotated, (x1, ty1), (tx2, ty2), color, -1)
        cv2.putText(annotated, label, (x1 + 4, max(txh + 2, y1 - bl - 4)),
                    cv2.FONT_HERSHEY_SIMPLEX, fs, (0, 0, 0), th, cv2.LINE_AA)
    ok, enc = cv2.imencode(".jpg", annotated, [int(cv2.IMWRITE_JPEG_QUALITY), 82])
    return base64.b64encode(enc.tobytes()).decode("ascii") if ok else None


def _get_waste_class_ids(model) -> Optional[list]:
    names = model.names
    label_map = {idx: label for idx, label in enumerate(names)} if isinstance(names, list) else names
    ids = [int(k) for k, v in label_map.items() if str(v).strip().lower() in WASTE_CLASSES]
    return ids if ids else None


def _run_detections(model, frame, w, h, class_ids, conf_thr) -> list:
    kwargs = dict(source=frame, conf=conf_thr, iou=WASTE_NMS_IOU_THRESHOLD, verbose=False)
    if class_ids is not None:
        kwargs["classes"] = class_ids
    results = model.predict(**kwargs)
    detections = []
    if not results: return detections
    r = results[0]
    for box in r.boxes:
        cls_idx = int(box.cls.item())
        cname = (r.names[cls_idx] if isinstance(r.names, list) else r.names.get(cls_idx, str(cls_idx)))
        conf  = float(box.conf.item())
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        bbox = _normalize_box(x1, y1, x2, y2, w, h)
        if bbox["width"] * bbox["height"] < MIN_NORMALIZED_BOX_AREA:
            continue
        detections.append({"class": cname, "confidence": conf, "bbox": bbox, "is_waste": True})
    return detections


def _enhance_low_light(frame: np.ndarray) -> np.ndarray:
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return cv2.cvtColor(cv2.merge((clahe.apply(l), a, b)), cv2.COLOR_LAB2BGR)


# ═════════════════════════════════════════════════════════════════════════════
# ZeroGPU inference functions
# ═════════════════════════════════════════════════════════════════════════════

@spaces.GPU
def _analyze_gpu(image: Image.Image) -> dict:
    """
    Layer 1: yolov8n spam filter.
    Layer 2: best.pt custom waste classifier.
    Returns a dict matching the original AnalyzeResponse JSON schema.
    """
    frame = _pil_to_bgr(image)

    # ── Layer 1 ───────────────────────────────────────────────────────────────
    yolo = _get_yolo_model()
    y_res = yolo.predict(source=frame, conf=ANALYZE_YOLO_MIN_CONF, verbose=False)
    layer1_passed = len(y_res[0].boxes) > 0

    if not layer1_passed:
        return {
            "severity": "SPAM", "has_waste": False, "confidence": 0.0,
            "labels": [], "all_labels": [], "layer1_passed": False,
            "spam_reason": "No objects detected in the image. Photo may be blurry, empty, or too dark.",
            "message": "No objects detected — image flagged as spam.",
        }

    # ── Layer 2 ───────────────────────────────────────────────────────────────
    custom = _get_custom_model()
    c_res  = custom.predict(source=frame, conf=CUSTOM_CONF_THRESHOLD, iou=0.45, verbose=False)

    labels: list[dict] = []
    seen: set[str] = set()
    for box in c_res[0].boxes:
        cls_idx = int(box.cls.item())
        names   = c_res[0].names
        cname   = names[cls_idx] if isinstance(names, list) else names.get(cls_idx, str(cls_idx))
        conf    = float(box.conf.item())
        if cname not in seen:
            seen.add(cname)
            labels.append({"label": cname.lower(), "confidence": round(conf, 4)})

    labels = sorted(labels, key=lambda l: l["confidence"], reverse=True)

    if not labels:
        return {
            "severity": "SPAM", "has_waste": False, "confidence": 0.0,
            "labels": [], "all_labels": [], "layer1_passed": True,
            "spam_reason": "No waste-related objects were detected by the waste model.",
            "message": "No waste labels detected — image flagged as spam.",
        }

    top_conf = labels[0]["confidence"]
    if   top_conf >= SEVERITY_CRITICAL: severity, msg = "CRITICAL", "Critical waste detected — immediate cleanup required! 🔴"
    elif top_conf >= SEVERITY_HIGH:     severity, msg = "HIGH",     "High-severity waste detected — schedule cleanup within 24 hours. 🟠"
    elif top_conf >= SEVERITY_MODERATE: severity, msg = "MODERATE", "Moderate waste detected — queued for cleanup. 🟡"
    else:                               severity, msg = "SPAM",     "Low confidence — report flagged for admin review. ⚪"

    return {
        "severity":     severity,
        "has_waste":    True,
        "confidence":   round(top_conf, 4),
        "labels":       labels,
        "all_labels":   labels,
        "layer1_passed": True,
        "spam_reason":  "Waste detected but confidence is too low." if severity == "SPAM" else None,
        "message":      msg,
    }


@spaces.GPU
def _predict_gpu(image: Image.Image, include_annotated: bool = False) -> dict:
    """COCO-based waste detection with optional annotated image."""
    frame = _pil_to_bgr(image)
    h, w  = frame.shape[:2]
    model = _get_yolo_model()
    class_ids = _get_waste_class_ids(model)

    primary = _run_detections(model, frame, w, h, class_ids, WASTE_CONFIDENCE_THRESHOLD)
    top_primary = max((d["confidence"] for d in primary), default=None)
    should_fallback = top_primary is None or top_primary < LOW_CONFIDENCE_FALLBACK_THRESHOLD

    detections = primary
    if should_fallback:
        fb_frame = _enhance_low_light(frame)
        fallback  = _run_detections(model, fb_frame, w, h, class_ids, WASTE_FALLBACK_CONFIDENCE_THRESHOLD)
        # merge
        merged = list(primary)
        for cand in sorted(fallback, key=lambda d: d["confidence"], reverse=True):
            if not any(d["class"] == cand["class"] for d in merged):
                merged.append(cand)
        detections = sorted(merged, key=lambda d: d["confidence"], reverse=True)

    top_conf  = max((d["confidence"] for d in detections), default=None)
    waste_cnt = len(detections)
    status    = "DIRTY" if waste_cnt >= DIRTY_MIN_WASTE_COUNT else "CLEAN"
    labels    = list(dict.fromkeys(d["class"].lower() for d in detections))
    is_uncertain = top_conf is None or top_conf < LOW_CONFIDENCE_FALLBACK_THRESHOLD

    annotated_b64 = _encode_annotated(frame, detections) if include_annotated else None

    return {
        "detections": detections,
        "labels":     labels,
        "count":      len(detections),
        "waste_count": waste_cnt,
        "status":     status,
        "top_confidence": top_conf,
        "annotated_image_base64": annotated_b64,
        "annotated_image_mime": "image/jpeg" if annotated_b64 else None,
        "decision": {
            "is_uncertain": is_uncertain,
            "reason": "low_confidence" if is_uncertain else None,
            "retake_recommended": is_uncertain,
        },
    }


@spaces.GPU
def _detect_gpu(image: Image.Image) -> dict:
    """Simplified waste detection (best.pt). Returns has_waste + confidence %."""
    frame = _pil_to_bgr(image)
    custom = _get_custom_model()
    results = custom.predict(source=frame, conf=DETECT_CONF_THRESHOLD, iou=0.45, verbose=False)
    top_conf = 0.0
    if results and len(results) > 0:
        for box in results[0].boxes:
            c = float(box.conf.item())
            if c > top_conf:
                top_conf = c
    has_waste = top_conf > 0.0
    return {
        "has_waste":  has_waste,
        "message":    "Waste detected!" if has_waste else "No waste detected.",
        "confidence": round(top_conf * 100.0, 2),
    }


# ═════════════════════════════════════════════════════════════════════════════
# Gradio wrappers (PIL input, dict output)
# ═════════════════════════════════════════════════════════════════════════════

def analyze_fn(image: Optional[Image.Image]) -> dict:
    if image is None:
        return {"error": "No image provided."}
    return _analyze_gpu(image)


def predict_fn(image: Optional[Image.Image]) -> dict:
    if image is None:
        return {"error": "No image provided."}
    return _predict_gpu(image, include_annotated=False)


def detect_fn(image: Optional[Image.Image]) -> dict:
    if image is None:
        return {"error": "No image provided."}
    return _detect_gpu(image)


# ═════════════════════════════════════════════════════════════════════════════
# Gradio UI
# ═════════════════════════════════════════════════════════════════════════════

with gr.Blocks(title="BlueWaste YOLO Analyzer", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # ♻️ BlueWaste YOLO Analyzer
    **Two-layer YOLOv8 waste detection pipeline powered by ZeroGPU.**

    | Layer | Model | Purpose |
    |---|---|---|
    | 1 | `yolov8n.pt` (COCO) | Spam filter — is there any object? |
    | 2 | `weights/best.pt` (custom) | Waste classification |

    **Severity scoring** — based on top detection confidence from `best.pt`:
    `≥ 90%` → CRITICAL 🔴 · `≥ 70%` → HIGH 🟠 · `≥ 50%` → MODERATE 🟡 · `< 50%` → SPAM ⚪
    """)

    with gr.Tabs():
        with gr.Tab("🔍 Analyze (main)"):
            with gr.Row():
                img1  = gr.Image(type="pil", label="Upload Waste Image")
                out1  = gr.JSON(label="Analysis Result")
            btn1 = gr.Button("Analyze", variant="primary", size="lg")
            btn1.click(fn=analyze_fn, inputs=img1, outputs=out1, api_name="analyze")

        with gr.Tab("📦 Predict (COCO)"):
            with gr.Row():
                img2  = gr.Image(type="pil", label="Upload Image")
                out2  = gr.JSON(label="Detection Result")
            btn2 = gr.Button("Predict", variant="secondary")
            btn2.click(fn=predict_fn, inputs=img2, outputs=out2, api_name="predict")

        with gr.Tab("🗑️ Detect (simplified)"):
            with gr.Row():
                img3  = gr.Image(type="pil", label="Upload Image")
                out3  = gr.JSON(label="Detection Result")
            btn3 = gr.Button("Detect", variant="secondary")
            btn3.click(fn=detect_fn, inputs=img3, outputs=out3, api_name="detect")

    gr.Markdown("""
    ---
    ### API Usage
    ```bash
    # Named call API (Gradio 4.x+)
    curl -X POST https://ishuualt-bluewaste-yolo26.hf.space/call/analyze \\
      -H "Content-Type: application/json" \\
      -d '{"data": ["data:image/jpeg;base64,<base64>"]}'
    # Then GET /call/analyze/<event_id> for result
    ```
    """)

demo.launch()
