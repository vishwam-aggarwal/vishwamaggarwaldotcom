---
title: "AS5047P SSI Bridge"
summary: "A firmware bridge for reading the AS5047P magnetic encoder over its SSI interface."
tags: ["C", "Embedded", "Sensors"]
repo: "https://github.com/vishwam-aggarwal/AS5047P-SSI-Bridge"
status: shipped
featured: false
order: 13
---

A firmware bridge for the AS5047P magnetic rotary encoder, talking to it over its SSI (Synchronous Serial Interface) rather than SPI — useful where the encoder needs to sit on a bus alongside devices that don't share SPI's timing assumptions.
