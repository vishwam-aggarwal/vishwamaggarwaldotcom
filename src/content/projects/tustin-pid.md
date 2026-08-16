---
title: "TustinPID"
summary: "A PID library for Arduino using the Tustin (bilinear/trapezoidal) discretization method, with anti-windup via integrator clamping."
tags: ["C++", "Control Theory", "Arduino"]
repo: "https://github.com/vishwam-aggarwal/TustinPID"
status: shipped
featured: false
order: 11
---

A discrete-time PID controller for Arduino, implemented via Tustin's method (the bilinear/trapezoidal transform) rather than a naive forward-Euler discretization — closer tracking of the continuous-time design at the same sample rate.

Includes anti-windup: the integrator clamps (shuts down) once the output saturates, so the controller doesn't wind up an error term it can't act on.
