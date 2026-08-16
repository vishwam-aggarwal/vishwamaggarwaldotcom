---
title: "Universal Interface Stack"
summary: "A hardware-agnostic C++ control stack for robots — motors, encoders, trajectories, tools, and motion planning, all swappable without touching application code."
tags: ["C++", "Robotics", "Embedded", "Systems Design"]
status: active
featured: true
order: 1
---

The Universal Interface Stack is a family of composable C++ interfaces for robot control, built so that swapping hardware — an ODrive over CAN today, an RC servo tomorrow, a simulated motor for testing — never means rewriting the application logic on top of it.

It's split into layers that compose:

- **Universal-Motor-Interface** — hardware-agnostic motor control, with driver implementations for ODrive CAN, RC servos, and simulated motors.
- **Universal-Encoder-Interface** — rotary position sensing (AS5600 magnetic encoder, potentiometer, simulated), composable with the motor and trajectory layers.
- **Universal-Trajectory-Interface** — trajectory generation sitting on top of motor + encoder.
- **Universal-Tool-Interface** — platform-agnostic control for end-effectors (grippers and beyond), composing a motor driver to actuate movement.
- **Universal-Motion-Interface** / **Universal-Robot-Interface** — higher-level motion and whole-robot abstractions that tie the lower layers together.

The goal is portability across Arduino-compatible boards, embedded systems, and simulation — write a controller once, run it on real hardware or in simulation without modification.

*Repos are currently private while the stack is under active development.*
