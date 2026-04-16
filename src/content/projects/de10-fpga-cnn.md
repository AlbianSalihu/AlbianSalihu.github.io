---
title: 'DE10-SoC — FPGA-Accelerated CNN Inference'
description: 'End-to-end integer-only CNN inference pipeline on Intel DE10-SoC (ARM + FPGA). Custom hardware datapath in Verilog, hardware-aware post-training quantization, and Python-driven verification.'
draft: true
images: []
video: ''
link: ''
github: 'https://github.com/AlbianSalihu/de1-soc-fpga-accelerated-video-pipeline'
tags: ['FPGA', 'Verilog', 'Quartus', 'Python', 'ML', 'Computer Vision', 'Embedded', 'Edge AI']
featured: true
date: '2025 – Present'
---

## Overview

A personal project building a fully integer-only neural network inference accelerator on the **Intel DE10-SoC** — an FPGA development board combining an ARM Cortex-A9 (HPS) and an Intel Cyclone V FPGA.

The goal: run a compact CNN on FPGA fabric using a custom hardware datapath, where every layer executes in deterministic integer arithmetic — no floating point on the FPGA. This enables low-latency, low-power edge inference for real-time video or sensor processing applications.

The architecture is built around hardware-aware quantization following the approach from:
> Jacob et al., *Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference* (2017)

## Why This Project

Commercial ML accelerators (TPUs, NPUs) are black boxes. Building one from scratch on FPGA gives full control over the compute pipeline — every multiply-accumulate, every requantization step, every memory access is explicitly designed. This is also a direct extension of the embedded systems and FPGA skills developed during the CHESS CubeSat and camera interface projects, applied to modern ML workloads.

## System Architecture

```
Python training + quantization
        ↓
  Integer parameters (.npz / .bin)
        ↓
  FPGA datapath (Cyclone V)     ←→   ARM HPS (control + I/O)
  • Conv / MAC blocks
  • Requantization units
  • Pooling
  • Activation (ReLU)
        ↓
  Verification harness (Python)
  • Stimuli generation
  • RTL simulation via ModelSim
  • Output comparison against Python reference
```

## ML Pipeline — PyTorch

### Model: AlexNet64Gray

A custom AlexNet variant stripped of BatchNorm and adapted for 64×64 grayscale input:

```
Input: 1×64×64
Conv → ReLU → MaxPool
Conv → ReLU → MaxPool
Conv → ReLU
Conv → ReLU
Conv → ReLU → MaxPool
Flatten
Linear → ReLU
Linear → ReLU
Linear (logits, 10 classes)
```

**Why no BatchNorm**: BatchNorm introduces scale and bias parameters that complicate integer quantization and would require additional FPGA logic per layer. Removing it keeps the integer export clean.

**Dataset**: MNIST resized to 64×64 grayscale — large enough to stress the hardware pipeline, simple enough to keep training tractable.

### Post-Training Quantization (PTQ)

The quantization workflow follows a strict integer-arithmetic-only model:

| Step | Script | Output |
|---|---|---|
| Train float model | `train.py` | `best.pth` |
| Calibrate activation scales | `find_scales.py` | `act_scales_sy.json` |
| Quantize weights (per-channel) | `quantize_weights.py` | `fpga_qparams.npz` |
| Verify integer inference | `test_quantized_model.py` | accuracy match vs float |

**Per-channel weight quantization**: each output channel of a convolution layer gets its own quantization scale. This maximizes dynamic range utilization per filter compared to per-tensor quantization.

**Activation calibration**: post-ReLU activations are hooked during a calibration pass over the training set. The 99.9th percentile of observed values sets the activation scale — avoiding clipping at the expense of a small accuracy drop vs. float.

**Requantization**: after each integer MAC accumulation (int32), the result is rescaled back to int8 for the next layer using pre-computed fixed-point scale factors. This is the core of integer-only inference — no floating point at any layer boundary.

### FPGA Parameter Export

All parameters exported to binary format for FPGA loading:
- `int8` weights (per-channel quantized)
- `int32` biases
- Fixed-point requantization multipliers and shifts
- Layer metadata (dimensions, strides, padding)

## FPGA Datapath — Verilog (WIP)

The hardware implementation targets the Cyclone V FPGA fabric on the DE10-SoC. Planned blocks:

| Module | Function |
|---|---|
| `conv_mac` | Streaming convolution with int8 MACs accumulating to int32 |
| `requant` | Fixed-point rescale from int32 → int8 after each layer |
| `maxpool` | Sliding window max pooling |
| `relu` | Clamp to zero (trivial in hardware) |
| `fc_mac` | Fully connected layer MAC |

The datapath is designed as a **streaming pipeline**: data flows layer by layer through dedicated blocks, with no full-frame buffering between layers. This minimizes on-chip memory requirements and keeps latency deterministic.

The ARM HPS side handles: weight loading from DDR, DMA transfers to FPGA, result readback, and top-level control.

## Verification

A Python-driven verification harness validates each FPGA block against a trusted integer reference model:

1. **Python reference**: full integer inference in Python (integer accumulation, requantization) — bit-exact against the FPGA intent
2. **Stimuli generation**: test vectors generated from calibrated inputs
3. **RTL simulation**: stimuli fed into ModelSim/Questa; outputs logged
4. **Comparison**: output tensors compared to Python reference; any mismatch flagged

This co-simulation approach catches quantization edge cases and integer overflow conditions before synthesis.

## Technical Stack

| Area | Details |
|---|---|
| FPGA | Intel DE10-SoC (Cyclone V + ARM Cortex-A9) |
| HDL | Verilog |
| Toolchain | Intel Quartus Prime |
| ML framework | PyTorch |
| Quantization | Custom PTQ (post-training, per-channel) |
| Verification | Python + ModelSim co-simulation |
| Export format | NumPy `.npz`, binary `.bin` |

## Status

The ML pipeline (training → quantization → integer export → Python verification) is complete and validated. The FPGA hardware datapath is currently under development — convolution MAC block in progress.
