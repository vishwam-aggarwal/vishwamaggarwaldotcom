---
title: "Hobby Servo Motor Accuracy: The 3.8° You're Leaving on the Table"
description: "Hobby servo motors aren't as accurate as their datasheet suggests. Here's what 2,300+ measurements say about the error, and the tool I built to correct it."
pubDate: 2026-08-16
tags: ["Robotics", "Embedded", "Control Theory"]
draft: false
---

Every hobby-servo tutorial starts the same way: pulse width in, angle out, straight line between two points. Send it 1000µs, get 0°. Send it 2000µs, get 90°. Everything in between is assumed to fall exactly on the line connecting those two points. It's in the datasheets, it's in every beginner library, and it's wrong — not by a rounding error, but by degrees.

I measured it. On one analog hobby servo, across 2,305 valid samples spanning its full mechanical range, the real pulse-to-angle curve bows away from that straight line by up to **3.8°**, averaging about 1.1° of error across the whole range. That's not noise — it's a real, repeatable nonlinearity baked into how these things are built.

<div class="chart-figure">
  <p class="chart-title">Measured servo response vs. the naive 2-point linear model</p>
  <svg viewBox="0 0 680 360" role="img" aria-label="Line chart comparing a servo's measured angle against pulse width to a straight two-point linear estimate, across 2,305 measured points. The measured curve bows away from the straight line by up to 3.8 degrees near the middle of the range.">
    <g stroke="var(--border)" stroke-width="1">
      <line x1="60" y1="320" x2="660" y2="320" />
      <line x1="60" y1="292.7" x2="660" y2="292.7" />
      <line x1="60" y1="224.5" x2="660" y2="224.5" />
      <line x1="60" y1="156.4" x2="660" y2="156.4" />
      <line x1="60" y1="88.2" x2="660" y2="88.2" />
      <line x1="60" y1="20" x2="660" y2="20" />
    </g>
    <g font-family="var(--font-mono)" font-size="11" fill="var(--text-faint)" text-anchor="end">
      <text x="52" y="323.5">-20&#176;</text>
      <text x="52" y="296.2">0&#176;</text>
      <text x="52" y="228">50&#176;</text>
      <text x="52" y="159.9">100&#176;</text>
      <text x="52" y="91.7">150&#176;</text>
      <text x="52" y="24">200&#176;</text>
    </g>
    <g font-family="var(--font-mono)" font-size="11" fill="var(--text-faint)" text-anchor="middle">
      <text x="60" y="340">300</text>
      <text x="210" y="340">900</text>
      <text x="360" y="340">1500</text>
      <text x="510" y="340">2100</text>
      <text x="660" y="340">2700</text>
    </g>
    <text x="360" y="357" font-size="11" fill="var(--text-faint)" text-anchor="middle">Pulse width (&#181;s)</text>
    <text x="16" y="170" font-size="11" fill="var(--text-faint)" text-anchor="middle" transform="rotate(-90 16 170)">Measured angle (&#176;)</text>
    <path d="M 67.2,317.9 L 647.5,29.1" fill="none" stroke="var(--series-2)" stroke-width="2" stroke-dasharray="6 4" stroke-linecap="round"/>
    <path d="M 67.2,317.9 L 72.2,317.1 L 77.2,314.4 L 82.2,311.9 L 87.2,308.9 L 92.2,306.5 L 97.2,303.9 L 102.2,301.0 L 107.2,297.9 L 112.2,295.2 L 117.2,293.0 L 122.2,290.3 L 127.2,287.6 L 132.2,285.1 L 137.2,282.4 L 142.2,279.5 L 147.2,277.3 L 152.2,274.4 L 157.2,272.4 L 162.2,269.5 L 167.2,266.4 L 172.2,264.2 L 177.2,262.2 L 182.2,258.3 L 187.2,256.4 L 192.2,253.8 L 197.2,251.3 L 202.2,249.0 L 207.2,246.2 L 212.2,243.8 L 217.2,241.2 L 222.3,238.6 L 227.2,235.8 L 232.2,233.0 L 237.2,230.0 L 242.2,227.8 L 247.2,225.1 L 252.2,222.5 L 257.2,219.9 L 262.2,216.5 L 267.2,214.2 L 272.2,211.5 L 277.2,209.0 L 282.2,206.3 L 287.2,203.7 L 292.2,201.4 L 297.2,198.2 L 302.2,196.6 L 307.2,194.1 L 312.2,191.7 L 317.2,189.3 L 322.2,186.9 L 327.2,184.5 L 332.2,182.0 L 337.2,179.7 L 342.2,177.6 L 347.2,175.0 L 352.2,172.9 L 361.5,169.6 L 366.5,167.2 L 371.5,164.5 L 376.5,162.6 L 381.5,160.9 L 386.5,158.0 L 391.5,155.9 L 396.5,153.5 L 401.5,150.8 L 406.5,148.3 L 411.5,146.0 L 416.5,143.3 L 421.5,141.0 L 426.5,138.5 L 431.5,136.4 L 436.5,133.6 L 441.5,131.2 L 446.5,129.3 L 451.5,126.6 L 456.5,123.3 L 461.5,121.7 L 466.5,119.1 L 471.5,116.7 L 476.5,114.4 L 481.5,111.8 L 486.5,109.4 L 491.5,106.6 L 496.5,104.1 L 501.5,101.9 L 506.5,99.6 L 511.5,96.9 L 516.5,94.7 L 521.5,92.6 L 526.5,89.9 L 531.5,87.7 L 536.5,85.0 L 541.5,82.6 L 546.5,80.1 L 551.5,77.4 L 556.5,74.8 L 561.5,72.1 L 566.5,69.9 L 571.5,67.3 L 576.5,64.5 L 581.5,61.8 L 586.5,59.9 L 591.5,57.3 L 596.5,54.5 L 601.5,51.9 L 606.5,49.8 L 611.5,47.0 L 616.5,44.4 L 621.5,41.9 L 626.5,38.6 L 631.5,36.1 L 636.5,33.4 L 641.5,31.7 L 646.5,29.1 L 647.5,29.1"
      fill="none" stroke="var(--series-1)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="297.2" y1="198.2" x2="240" y2="120" stroke="var(--text-faint)" stroke-width="1"/>
    <circle cx="297.2" cy="198.2" r="7" fill="var(--bg-raised)" />
    <circle cx="297.2" cy="198.2" r="3.5" fill="var(--series-1)" />
    <text x="236" y="110" font-size="11" fill="var(--text)" font-weight="600" text-anchor="end">3.8&#176; max deviation</text>
    <text x="236" y="123" font-size="10.5" fill="var(--text-faint)" text-anchor="end">vs. the straight-line estimate</text>
  </svg>
  <div class="chart-legend">
    <span><span class="swatch" style="background: var(--series-1);"></span>Measured (AS5600 ground truth)</span>
    <span><span class="swatch" style="background: var(--series-2);"></span>2-point linear model</span>
  </div>
  <p class="chart-caption">2,305 valid samples, one analog hobby servo, 329–2,650&#181;s / &minus;18.5&#176;–193.4&#176; stroke. Mean deviation from the linear model: 1.08&#176;.</p>
</div>

## Why this happens

Nothing about a hobby servo is built to be linear — it's built to be cheap and good enough for a control surface a human eye trims with a knob anyway. Inside, a potentiometer (or, in cheaper units, whatever position sense the internal feedback loop uses) has its own tolerances and its own nonlinear response. The pulse-to-angle relationship that produces was never designed to be a straight line, and nothing in the servo corrects for it. None of this shows up in a datasheet, because a datasheet gives you two points and a promise that everything between them is a straight line. It isn't.

For a human trimming a control surface by eye, that's invisible. For a robot doing closed-loop positioning or chaining several joints together, it isn't: an arm with three joints doesn't add up three single-digit-degree errors, it *compounds* them through the kinematic chain, and a controller that assumes linearity is silently wrong at every angle except the two it happened to be calibrated against.

There's a second, different effect worth naming up front so it doesn't get confused with the first: gear backlash, which makes the servo's actual position depend on which direction it last moved *from*, not just where you told it to go. Nonlinearity and backlash are separate problems with separate fixes. This article is mostly about the first one — a static error that a calibration table can genuinely correct. Backlash gets its own section, with a very different conclusion, near the end.

## Turning measurement into a tool

Measuring one servo by hand — jogging pulses, reading a protractor, logging numbers — is exactly the kind of slow, error-prone process that shouldn't need to happen more than once. So I built [Servo Calibrator](/projects/servo-calibrator/): a self-contained browser app that talks to an Arduino over [Web Serial](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API), with an AS5600 magnetic encoder on the servo's output shaft as ground truth instead of a protractor.

One button — **Calibrate** — does the entire characterization:

1. **Stall-scan outward from center, both directions**, to find the servo's *real* mechanical limits — not the datasheet's claimed range, its actual one. This uses a sliding-window net-delta check rather than a single-step one, because a mechanism visibly slows before it fully stops; a naive check false-triggers on that creep and finds the wrong endpoint.
2. **Sweep the full range twice, once per direction**, and average the two sweeps into one table. A single one-direction sweep would carry its own small directional bias, so averaging up-sweep and down-sweep data gives the best single estimate of the servo's actual nonlinear curve. It does **not** eliminate backlash — a lookup table can only store one pulse value per angle, and backlash means the true value genuinely depends on which direction you're arriving from. More on that trade-off later.
3. **Build a 20-point lookup table** — `{pulseUs, angleCentideg}` pairs — that a driver interpolates between at runtime instead of trusting the 2-point line.

Because the same rig is already wired up, the same page doubles as a small live trajectory visualizer once calibration finishes — command a step, a repeating trapezoidal square wave, or a trajectory-free sine wave, and watch three rolling charts (position, velocity, error) plot the setpoint against the AS5600's measured actual. A live toggle switches the model driving the servo between the plain linear formula and the just-built table *mid-move*, so the accuracy difference isn't a number you take on faith — you watch it happen.

Across the servos I've tested this against, the 20-point table cuts mean positioning error **2–6×** relative to the linear formula, for about 80 bytes of flash. That's a very cheap accuracy win for something that costs one automated pass per servo.

## What broke when I pointed it at a second servo

The tool was built and tuned against one analog servo. The first real run against a different, digital one broke immediately — a good reminder that "works on my hardware" and "works" are different claims.

The low-limit stall scan drove straight to the hard safety floor without ever detecting a stall. Not a bug: this servo's real range (or its own internal pulse clamp) genuinely sat outside the bounds tuned for the first one. Widening the floor/ceiling constants fixed that part cleanly — but three real firmware bugs followed, each found by instrumenting and reading actual data rather than guessing:

- **A blind delay before the first angle sample**, sized for the first servo's speed, that a faster digital servo could complete its entire commanded move inside — so the very first tracked sample was already wrong. Fixed by never delaying blind before angle tracking actually starts.
- **The servo could sit at a commanded pulse with zero measurable movement, then snap most of the way there in one step** — long enough that even a generous settle-detection window returned before real motion started, corrupting 18 of 20 table points to exactly zero. Fixed by never sending one large pulse jump at all: every move, including the ones that used to be instantaneous, now ramps through the same small steps the sweep already used successfully.
- **A single bad encoder reading could permanently corrupt the running angle accumulator** — one glitched sample silently poisoning every measurement after it, for the rest of the sweep. Fixed with a plausibility check that rejects an implausible single-step jump outright rather than trusting it, which only became safe to add once the fix above guaranteed every real step actually was small.

None of these would have surfaced without a second, different piece of hardware to test against — which is its own small lesson: a calibration tool that's only ever been calibrated *once* hasn't proven very much about itself.

## What calibration doesn't fix: living with backlash

The table above corrects a static error: for a given pulse width, what angle does this servo actually produce. Backlash isn't static — the same pulse can produce two different angles depending on whether the servo is approaching from below or above, because of real mechanical slop in the gear train. A lookup table has no way to represent that; it stores one angle per pulse, not one per (pulse, approach-direction) pair. **This is not something Servo Calibrator fixes, and it can't be — you cannot calibrate away backlash with a static table.**

So does it matter enough to worry about at all? I measured that too, separately: 140 trials, 7 target pulse widths, 10 trials each, alternating which side the move approached from. Then the same test again with a simple compensation *scheme* — deliberately undershoot the target and re-approach from one consistent direction every time, rather than trusting whichever direction the previous move happened to leave the horn in — to see whether an operational workaround, rather than a calibration fix, was worth building.

<div class="chart-figure">
  <p class="chart-title">Positioning spread with and without directional compensation</p>
  <svg viewBox="0 0 680 360" role="img" aria-label="Grouped bar chart of positioning spread (max minus min angle across 10 trials) at seven target pulse widths, comparing uncompensated direct approach against a compensated undershoot-and-reapproach scheme. At 600 microseconds, compensation reduces spread from 1.08 degrees to effectively zero; the effect shrinks toward the middle of the range, and is a slight regression at 1800 microseconds.">
    <g stroke="var(--border)" stroke-width="1">
      <line x1="60" y1="320" x2="660" y2="320" />
      <line x1="60" y1="245" x2="660" y2="245" />
      <line x1="60" y1="170" x2="660" y2="170" />
      <line x1="60" y1="95" x2="660" y2="95" />
      <line x1="60" y1="20" x2="660" y2="20" />
    </g>
    <g font-family="var(--font-mono)" font-size="11" fill="var(--text-faint)" text-anchor="end">
      <text x="52" y="323.5">0.0&#176;</text>
      <text x="52" y="248.5">0.3&#176;</text>
      <text x="52" y="173.5">0.6&#176;</text>
      <text x="52" y="98.5">0.9&#176;</text>
      <text x="52" y="24">1.2&#176;</text>
    </g>
    <text x="16" y="170" font-size="11" fill="var(--text-faint)" text-anchor="middle" transform="rotate(-90 16 170)">Spread across 10 trials (&#176;, max&minus;min)</text>
    <g font-family="var(--font-mono)" font-size="11" fill="var(--text-faint)" text-anchor="middle">
      <text x="102.9" y="340">600</text>
      <text x="188.6" y="340">900</text>
      <text x="274.3" y="340">1200</text>
      <text x="360.0" y="340">1500</text>
      <text x="445.7" y="340">1800</text>
      <text x="531.4" y="340">2100</text>
      <text x="617.1" y="340">2400</text>
    </g>
    <text x="360" y="357" font-size="11" fill="var(--text-faint)" text-anchor="middle">Target pulse width (&#181;s)</text>
    <rect x="73.9" y="49.0" width="26" height="271.0" rx="3" fill="var(--series-2)" />
    <rect x="105.9" y="317.5" width="26" height="2.5" rx="1" fill="var(--series-1)" />
    <rect x="159.6" y="100.2" width="26" height="219.8" rx="3" fill="var(--series-2)" />
    <rect x="191.6" y="276.2" width="26" height="43.8" rx="3" fill="var(--series-1)" />
    <rect x="245.3" y="188.2" width="26" height="131.8" rx="3" fill="var(--series-2)" />
    <rect x="277.3" y="210.2" width="26" height="109.8" rx="3" fill="var(--series-1)" />
    <rect x="331.0" y="254.0" width="26" height="66.0" rx="3" fill="var(--series-2)" />
    <rect x="363.0" y="254.0" width="26" height="66.0" rx="3" fill="var(--series-1)" />
    <rect x="416.7" y="254.0" width="26" height="66.0" rx="3" fill="var(--series-2)" />
    <rect x="448.7" y="232.0" width="26" height="88.0" rx="3" fill="var(--series-1)" />
    <rect x="502.4" y="246.8" width="26" height="73.2" rx="3" fill="var(--series-2)" />
    <rect x="534.4" y="254.0" width="26" height="66.0" rx="3" fill="var(--series-1)" />
    <rect x="588.1" y="144.2" width="26" height="175.8" rx="3" fill="var(--series-2)" />
    <rect x="620.1" y="159.0" width="26" height="161.0" rx="3" fill="var(--series-1)" />
    <text x="86.9" y="42" font-size="10.5" fill="var(--text)" font-weight="600" text-anchor="middle">1.08&#176;</text>
    <text x="118.9" y="311" font-size="10.5" fill="var(--text)" font-weight="600" text-anchor="middle">&#8776;0&#176;</text>
  </svg>
  <div class="chart-legend">
    <span><span class="swatch" style="background: var(--series-2);"></span>Uncompensated (direct approach)</span>
    <span><span class="swatch" style="background: var(--series-1);"></span>Compensated (undershoot + reapproach)</span>
  </div>
  <p class="chart-caption">140 trials total, 10 per target per condition, one analog hobby servo. Spread = max&minus;min achieved angle across the 10 trials at that target.</p>
  <details class="chart-data">
    <summary>View underlying data</summary>
    <table>
      <thead>
        <tr><th>Target (&#181;s)</th><th>Uncomp. spread</th><th>Comp. spread</th><th>Uncomp. &sigma;</th><th>Comp. &sigma;</th></tr>
      </thead>
      <tbody>
        <tr><td>600</td><td>1.08&#176;</td><td>0.00&#176;</td><td>0.427</td><td>0.000</td></tr>
        <tr><td>900</td><td>0.88&#176;</td><td>0.17&#176;</td><td>0.321</td><td>0.087</td></tr>
        <tr><td>1200</td><td>0.53&#176;</td><td>0.44&#176;</td><td>0.217</td><td>0.158</td></tr>
        <tr><td>1500</td><td>0.26&#176;</td><td>0.26&#176;</td><td>0.079</td><td>0.083</td></tr>
        <tr><td>1800</td><td>0.26&#176;</td><td>0.35&#176;</td><td>0.110</td><td>0.098</td></tr>
        <tr><td>2100</td><td>0.29&#176;</td><td>0.26&#176;</td><td>0.096</td><td>0.100</td></tr>
        <tr><td>2400</td><td>0.70&#176;</td><td>0.64&#176;</td><td>0.258</td><td>0.177</td></tr>
      </tbody>
    </table>
  </details>
</div>

The result is a mixed bag, not a clean win — which is itself the useful finding. Compensation helps a lot right at the low end of this servo's range (600µs: spread drops from **1.08°** to **0.00°** across all 10 trials) and does close to nothing in the middle, where backlash was already small to begin with (1500µs: 0.26° either way). At 1800µs it's actually slightly worse compensated (0.35° vs. 0.26°) — a reminder that a workaround tuned for one part of the range doesn't automatically generalize to the rest of it.

**Servo Calibrator doesn't implement this compensation, on purpose.** Building direction-aware behavior into the calibration layer means tracking approach history and never trusting a single most-recent-position read at face value — real added complexity, for a benefit that's concentrated at the mechanical extremes and inconsistent everywhere else. These are cheap hobby servos, not precision actuators. The honest engineering call was to measure backlash, document that it exists and roughly how large it is, and leave it there rather than build around it. If a specific application needs tighter repeatability at a specific target, the fix is the same one tested here — always approach that target from a consistent direction — applied deliberately at the application layer, not baked into every calibration.

## The boundary this tool draws on purpose

Servo Calibrator deliberately stops at characterization. It doesn't ask about horn position, direction, or a logical zero — it always works in the servo's own physical frame. Turning a measured table into an actual motor driver (with the mounting offset your specific installation needs) is left to the [Universal Interface Stack](/projects/universal-interface-stack/), the hardware-agnostic control stack this tool feeds into. That's a deliberate split: *how a servo actually behaves* is a property of the part, measured once; *how it's mounted in your robot* is a property of your build, and conflating the two just makes the calibration tool less reusable across projects.

If you're driving hobby servo motors for anything more precise than a human trimming a control surface by eye — a robot arm, a gimbal, anything doing closed-loop positioning — measuring the real curve isn't a nice-to-have. It's a few minutes of automated characterization against a couple hundred bytes of flash, for an accuracy improvement you can watch happen live on a chart. Backlash, you live with.
