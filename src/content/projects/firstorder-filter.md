---
title: "First-Order Filter"
summary: "A first-order Butterworth (IIR) filter for Arduino, discretized with the bilinear method."
tags: ["C++", "Signal Processing", "Arduino"]
repo: "https://github.com/vishwam-aggarwal/firstorder-filter"
status: shipped
featured: false
order: 12
---

A first-order Butterworth low-pass filter implemented as an IIR filter on Arduino, using the bilinear (Tustin) transform to go from the continuous-time design to a discrete-time implementation — the same discretization approach used in [TustinPID](/projects/tustin-pid/).

Useful for cleaning up noisy sensor readings (encoders, current sensors) before they hit a control loop.
