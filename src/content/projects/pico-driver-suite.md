---
title: "Raspberry Pi Pico Driver Suite"
summary: "Low-level C++ libraries for the Raspberry Pi Pico: I2C/SPI bus implementations, an I2C device base class, and a current-sensor driver built on top."
tags: ["C++", "Embedded", "Raspberry Pi Pico"]
repo: "https://github.com/vishwam-aggarwal/vish_i2cdev"
status: shipped
featured: false
order: 10
---

A small stack of low-level libraries for driving peripherals from a Raspberry Pi Pico:

- [`vish_busio`](https://github.com/vishwam-aggarwal/vish_busio) — serial bus implementations (I2C, SPI) for the Pico.
- [`vish_i2cdev`](https://github.com/vishwam-aggarwal/vish_i2cdev) — a low-level I2C device base class built on top of `vish_busio`.
- [`vish_ina260`](https://github.com/vishwam-aggarwal/vish_ina260) — a driver for the INA260 current sensor, built on `vish_i2cdev`.

Each layer only depends on the one below it, so a new I2C sensor driver is mostly just filling in register maps on top of `vish_i2cdev`.
