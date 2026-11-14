import {
  Activity, BatteryCharging, ChevronsRight, CircuitBoard, Cpu, GitBranch, Lightbulb, Orbit, Radar, ToggleRight,
} from 'lucide-react-native';
import type { ComponentType } from 'react';

export interface ComponentCategory {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  tint: string;
  examples: string[];
  overview: string;
  howItWorks: string[];
  commonUses: string[];
  tips: string[];
  askPrompt: string;
}

export const categories: ComponentCategory[] = [
  {
    id: 'resistors', title: 'Resistors', icon: Activity, tint: '#F59E0B',
    description: 'Limit current and divide voltage.',
    examples: ['Carbon film', 'Metal film', 'Potentiometer', 'Thermistor'],
    overview: 'Resistors oppose current flow. They are the most common component in any circuit.',
    howItWorks: ['Resistance is measured in ohms (Ω).', 'Ohm’s law: V = I × R.', 'Colour bands encode the value and tolerance.'],
    commonUses: ['LED current limiting', 'Voltage dividers', 'Pull-up and pull-down resistors'],
    tips: ['Check the power rating, usually 1/4 W.', 'Use 220Ω to 330Ω for LEDs on 3.3 V to 5 V.'],
    askPrompt: 'Explain how a resistor works',
  },
  {
    id: 'capacitors', title: 'Capacitors', icon: BatteryCharging, tint: '#38BDF8',
    description: 'Store charge and smooth voltage.',
    examples: ['Ceramic', 'Electrolytic', 'Tantalum', 'Film'],
    overview: 'Capacitors store energy in an electric field and release it quickly.',
    howItWorks: ['Capacitance is measured in farads (F), commonly µF and nF.', 'They block DC and pass changing signals.', 'With a resistor they form an RC timer.'],
    commonUses: ['Power-supply decoupling', 'Filtering noise', 'Timing circuits'],
    tips: ['Match polarity on electrolytics.', 'Never exceed the voltage rating.'],
    askPrompt: 'Teach me about capacitors',
  },
  {
    id: 'diodes', title: 'Diodes', icon: ChevronsRight, tint: '#A78BFA',
    description: 'Let current flow one way only.',
    examples: ['1N4148', '1N4007', 'Schottky', 'Zener'],
    overview: 'Diodes conduct in one direction, protecting circuits and converting AC to DC.',
    howItWorks: ['Forward voltage is about 0.7 V for silicon, less for Schottky.', 'Zener diodes regulate voltage in reverse breakdown.'],
    commonUses: ['Rectification', 'Reverse-polarity protection', 'Flyback protection for relays and motors'],
    tips: ['The stripe marks the cathode.', 'Use a Schottky for low voltage drop.'],
    askPrompt: 'How do diodes work and where do I use them?',
  },
  {
    id: 'transistors', title: 'Transistors', icon: GitBranch, tint: '#34D399',
    description: 'Switch and amplify signals.',
    examples: ['2N2222 (BJT)', 'BC547', 'IRLZ44N (MOSFET)', '2N7000'],
    overview: 'A transistor lets a small signal control a larger current.',
    howItWorks: ['BJTs are controlled by base current.', 'MOSFETs are controlled by gate voltage.', 'Used as switches or amplifiers.'],
    commonUses: ['Driving motors, relays and LED strips', 'Amplifiers', 'Logic circuits'],
    tips: ['Choose a logic-level MOSFET for 3.3 V microcontrollers.', 'Add a flyback diode for inductive loads.'],
    askPrompt: 'How do transistors work as switches?',
  },
  {
    id: 'integrated-circuits', title: 'Integrated Circuits', icon: Cpu, tint: '#F472B6',
    description: 'Complete circuits in one chip.',
    examples: ['555 timer', 'LM358 op-amp', '74HC595', 'L293D'],
    overview: 'ICs pack many components into a single package to perform a function.',
    howItWorks: ['Pin 1 is marked with a dot or notch.', 'Datasheets list pinouts and limits.'],
    commonUses: ['Timers', 'Amplifiers', 'Shift registers and motor drivers'],
    tips: ['Always read the datasheet.', 'Add a 100 nF decoupling capacitor close to the supply pins.'],
    askPrompt: 'Explain what an integrated circuit is and show common examples',
  },
  {
    id: 'sensors', title: 'Sensors', icon: Radar, tint: '#22D3EE',
    description: 'Measure the physical world.',
    examples: ['DHT22', 'HC-SR04', 'LDR', 'Soil moisture'],
    overview: 'Sensors convert temperature, light, distance and more into electrical signals.',
    howItWorks: ['Analog sensors output a varying voltage.', 'Digital sensors speak I²C, SPI or one-wire protocols.'],
    commonUses: ['Weather stations', 'Obstacle detection', 'Plant monitoring'],
    tips: ['Check the supply voltage matches your board.', 'Calibrate against a known reference.'],
    askPrompt: 'What sensors are good for beginner ESP32 projects?',
  },
  {
    id: 'microcontrollers', title: 'Microcontrollers', icon: CircuitBoard, tint: '#60A5FA',
    description: 'Tiny programmable computers.',
    examples: ['Arduino Uno', 'ESP32', 'Raspberry Pi Pico', 'ATtiny85'],
    overview: 'Microcontrollers run your code and control inputs and outputs.',
    howItWorks: ['GPIO pins read or drive signals.', 'ADCs read analog voltages; PWM simulates analog outputs.'],
    commonUses: ['IoT devices', 'Robotics', 'Home automation'],
    tips: ['ESP32 GPIO is 3.3 V only.', 'Power motors from a separate supply.'],
    askPrompt: 'What can I build with an ESP32?',
  },
  {
    id: 'leds', title: 'LEDs', icon: Lightbulb, tint: '#FBBF24',
    description: 'Efficient light from a diode.',
    examples: ['5 mm red', 'RGB', 'WS2812B', '7-segment display'],
    overview: 'LEDs emit light when current passes through them, and need current limiting.',
    howItWorks: ['The longer leg is the anode (+).', 'Forward voltage depends on colour.', 'PWM controls brightness.'],
    commonUses: ['Indicators', 'Displays', 'Lighting effects'],
    tips: ['Always use a series resistor.', 'Addressable LEDs need a 5 V supply and a data line.'],
    askPrompt: 'How do I wire an LED safely to an ESP32?',
  },
  {
    id: 'inductors', title: 'Inductors', icon: Orbit, tint: '#FB923C',
    description: 'Store energy in a magnetic field.',
    examples: ['Air-core coil', 'Ferrite choke', 'Power inductor'],
    overview: 'Inductors resist changes in current and are essential in power conversion.',
    howItWorks: ['Inductance is measured in henries (H).', 'They store energy in a magnetic field.'],
    commonUses: ['Buck and boost converters', 'Filters', 'Radio circuits'],
    tips: ['Check the saturation current rating.', 'Keep them away from sensitive analog traces.'],
    askPrompt: 'Explain inductors in simple terms',
  },
  {
    id: 'relays', title: 'Relays', icon: ToggleRight, tint: '#EF4444',
    description: 'Switch high power with a small signal.',
    examples: ['5 V relay module', 'Solid-state relay', 'Reed relay'],
    overview: 'A relay is an electrically operated switch that isolates a control circuit from a load.',
    howItWorks: ['A coil closes a mechanical contact.', 'Modules include a transistor driver and flyback diode.'],
    commonUses: ['Switching lamps and pumps', 'Home automation', 'Isolating control from mains'],
    tips: ['Mains voltage is dangerous. Use enclosed, rated modules.', 'Check the contact current rating.'],
    askPrompt: 'How do I control a relay with an ESP32?',
  },
];

export const getCategory = (id: string) => categories.find((c) => c.id === id);
