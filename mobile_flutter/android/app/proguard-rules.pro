# TensorFlow Lite 2.11 optionally references the GPU delegate options class.
# BlueWaste uses the CPU interpreter and can safely omit this optional class.
-dontwarn org.tensorflow.lite.gpu.GpuDelegateFactory$Options
