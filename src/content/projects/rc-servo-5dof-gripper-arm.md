---
title: "RC Servo 5DOF Gripper Arm"
summary: "Integration firmware for a modular 5-degree-of-freedom robot arm, built entirely on top of the Universal Interface Stack."
tags: ["C++", "Robotics", "Firmware"]
status: active
featured: true
order: 2
---

An application-layer project that proves out the Universal Interface Stack on real hardware: a 5-degree-of-freedom robot arm with an RC servo gripper, driven by firmware built on `Universal-Motor-Interface`, `Universal-Trajectory-Interface`, and `Universal-Tool-Interface`.

Rather than writing arm-specific control code, this project is mostly wiring: composing the existing interface layers into a working arm, and using it as the real-world stress test for the abstractions underneath.

*Repo is currently private while the stack is under active development.*
