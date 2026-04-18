---
title: 'Master Thesis — Multi-Hardness Silicone 3D Printer'
description: 'Sensor integration and closed-loop feedback enabling accurate multi-hardness silicone 3D printing for custom medical prosthetic liners — industry thesis at Swiss MotionTech / EPFL.'
image: 'motiontech-logo.png'
logoMode: true
images: []
video: ''
link: ''
github: ''
tags: ['Control Systems', 'Laser Sensing', 'Python', 'Medical', '3D Printing', 'Slicing Software']
featured: true
date: 'Feb – Sept 2024'
role: 'R&D Engineer Intern'
team: 'Solo'
context: 'Industry Thesis — Swiss MotionTech / EPFL'
outcome: 'Closed-loop sensor feedback system enabling reliable multi-hardness silicone 3D printing for custom medical prosthetic liners'
---

## Overview

Master's thesis conducted at **Swiss Motion Technologies SA**, supervised by Prof. Alexandre Schmid (EPFL).

Swiss MotionTech manufactures custom silicone prosthetic liners for amputees using an additive manufacturing process. The thesis addressed an unsolved accuracy problem in **multi-hardness silicone printing**: spatially varying hardness zones were drifting from their intended anatomical positions due to cumulative layer errors, making the prosthetic clinically inaccurate.

The work is conducted under a confidentiality agreement. Implementation details are not disclosed.

## What Was Built

A **sensor-integrated closed-loop feedback system** that detects layer-level height errors in real time and corrects the silicone extrusion output dynamically — enabling reliable, patient-specific multi-hardness printing.

Key contributions:

- **Sensor evaluation**: benchmarked multiple sensing technologies (laser triangulation, confocal, time-of-flight, structured light, camera) through literature review and physical testing to select the most suitable approach for the constrained geometry
- **Sensor integration**: developed the measurement model and integrated the selected sensor into the printer's hardware and software stack
- **Slicing software integration** (Python): extended the company's internal slicing software to embed measurement checkpoints, incorporate real-time sensor feedback, and dynamically adjust volumetric extrusion output per layer
- **Closed-loop controller**: state-machine architecture that pauses, measures, computes deviation, adjusts output setpoints, and resumes — cycling through each print layer
- **Printer communication**: designed and implemented a custom protocol between the control software and the printer's microcontroller

## Supervisors

Prof. Alexandre Schmid (EPFL), Swiss Motion Technologies SA
