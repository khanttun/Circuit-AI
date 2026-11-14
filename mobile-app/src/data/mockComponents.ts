import type { ComponentIdentification } from '@/types';

export const mockComponents: Record<'resistor' | 'led' | 'capacitor', ComponentIdentification> = {
  resistor: {
    name: '220Ω Resistor',
    type: 'Fixed-value carbon-film resistor',
    confidence: 0.94,
    summary: 'This appears to be a fixed-value resistor. The red-red-brown bands point to 220Ω.',
    mainFunction: 'A resistor limits the electrical current flowing through a circuit.',
    howItWorks:
      'It opposes current flow in proportion to its resistance (Ohm’s law: V = I × R). Energy that is not passed on is released as a small amount of heat.',
    commonApplications: ['LED current limiting', 'Voltage divider circuits', 'Pull-up and pull-down circuits'],
    compatiblePlatforms: ['Arduino', 'ESP32', 'Raspberry Pi circuits'],
    suggestedProjects: [
      { title: 'LED brightness control', difficulty: 'Beginner', description: 'Compare how different resistor values change LED brightness.' },
      { title: 'ESP32 traffic light', difficulty: 'Beginner', description: 'Three LEDs and three resistors driven by GPIO pins.' },
      { title: 'Basic voltage divider experiment', difficulty: 'Intermediate', description: 'Measure the output and read it with an ADC pin.' },
    ],
    safetyNotes: [
      'Check the power rating (usually 1/4 W) before using it with higher currents.',
      'Resistors can get hot when dissipating power. Do not touch them while powered.',
    ],
  },
  led: {
    name: '5 mm Red LED',
    type: 'Light-emitting diode (through-hole)',
    confidence: 0.91,
    summary: 'This looks like a standard 5 mm through-hole LED. The longer leg is the anode (+).',
    mainFunction: 'An LED emits light when current flows through it in the forward direction.',
    howItWorks:
      'A semiconductor junction releases energy as photons when electrons recombine with holes. It needs a series resistor because its current rises sharply once the forward voltage (about 2 V for red) is reached.',
    commonApplications: ['Status indicators', 'Signalling and displays', 'Optical sensing with photodiodes'],
    compatiblePlatforms: ['Arduino', 'ESP32', 'Raspberry Pi circuits'],
    suggestedProjects: [
      { title: 'Blinking LED', difficulty: 'Beginner', description: 'The classic first sketch on any microcontroller.' },
      { title: 'PWM mood light', difficulty: 'Intermediate', description: 'Fade LEDs smoothly with pulse-width modulation.' },
      { title: 'Knight Rider scanner', difficulty: 'Intermediate', description: 'Sweep a row of LEDs back and forth.' },
    ],
    safetyNotes: [
      'Always use a series resistor (for example 220Ω at 3.3 V to 5 V).',
      'Observe polarity. Reversed LEDs will not light and can be damaged by higher voltages.',
    ],
  },
  capacitor: {
    name: '100µF Electrolytic Capacitor',
    type: 'Polarized aluminium electrolytic capacitor',
    confidence: 0.89,
    summary: 'This is a polarized electrolytic capacitor. The stripe on the sleeve marks the negative lead.',
    mainFunction: 'A capacitor stores and releases electrical energy, smoothing voltage changes.',
    howItWorks:
      'Two conductive plates are separated by an insulating layer. Voltage across them stores charge, so the capacitor resists sudden voltage changes, filtering ripple and noise.',
    commonApplications: ['Power-supply smoothing', 'Decoupling near ICs', 'Timing circuits with resistors'],
    compatiblePlatforms: ['Arduino', 'ESP32', 'Raspberry Pi circuits'],
    suggestedProjects: [
      { title: 'Supply decoupling for an ESP32', difficulty: 'Beginner', description: 'Reduce brown-outs when Wi-Fi bursts draw current.' },
      { title: 'RC LED fade', difficulty: 'Beginner', description: 'Watch a capacitor charge and discharge through an LED.' },
      { title: '555 timer blinker', difficulty: 'Intermediate', description: 'Set the blink rate with a resistor and capacitor.' },
    ],
    safetyNotes: [
      'Never connect it backwards or above its rated voltage. It can vent or burst.',
      'Large capacitors can hold charge after power is removed. Discharge before handling.',
    ],
  },
};
