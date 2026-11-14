import type { AIResponse, ChatRequest } from '@/types';
import { mockComponents } from '@/data/mockComponents';
import { sleep } from '@/utils/format';
import { identificationToMarkdown } from '@/utils/markdown';
import type { ChatService } from '../types';

const topics: { match: RegExp; text: string }[] = [
  {
    match: /resistor/i,
    text: `## How a Resistor Works

A resistor **limits the flow of electric current**. Its resistance, measured in ohms (Ω), sets how much current flows for a given voltage.

### Ohm's Law
- \`V = I × R\`
- A 5 V supply across a 220Ω resistor allows about 23 mA.

### Why It Matters
- Protects LEDs and GPIO pins from too much current.
- Builds voltage dividers to scale sensor signals.
- Pulls inputs to a known state.

### Try This
1. Wire an LED in series with a 220Ω resistor.
2. Swap in 1 kΩ and compare the brightness.`,
  },
  {
    match: /capacitor/i,
    text: `## Capacitors, Explained

A capacitor **stores energy in an electric field** between two plates, and releases it when the circuit needs it.

### What They Do
- Smooth power-supply ripple.
- Block DC while passing AC signals.
- Set timing with a resistor (RC time constant \`τ = R × C\`).

### Types You'll Meet
- **Ceramic:** tiny, non-polarized, great for decoupling.
- **Electrolytic:** large values, polarized, watch the stripe.

### Safety
- Never exceed the voltage rating, and match polarity on electrolytics.`,
  },
  {
    match: /esp32|esp-32/i,
    text: `## What You Can Build with an ESP32

The ESP32 is a low-cost microcontroller with **built-in Wi-Fi and Bluetooth**.

### Beginner Projects
1. Wi-Fi weather station with a DHT22 sensor.
2. Automatic plant watering with a soil moisture sensor and relay.
3. Bluetooth-controlled LED strip.

### Intermediate Projects
1. Web dashboard with MQTT sensor data.
2. Camera-based door monitor with an ESP32-CAM.
3. Smart plug controlled from your phone.

### Good to Know
- GPIO pins are **3.3 V**. Do not feed them 5 V signals.
- Use a level shifter or voltage divider for 5 V sensors.`,
  },
  {
    match: /\bled\b|diode/i,
    text: `## LEDs and Diodes

A diode lets current flow in **one direction only**. An LED is a diode that also emits light.

### Key Points
- Longer leg is the anode (+); the flat side of the casing marks the cathode (−).
- Always use a series resistor with an LED.
- Typical forward voltage: red about 2 V, blue/white about 3 V.

### Quick Calculation
\`R = (Vsupply − Vf) / I\`. For 5 V, red LED, 15 mA: about 200Ω, so a 220Ω resistor is a good pick.`,
  },
  {
    match: /transistor|mosfet|bjt/i,
    text: `## Transistors as Switches

A transistor lets a **small signal control a larger current**. That makes it the bridge between a microcontroller pin and a motor, relay or LED strip.

### Common Types
- **BJT (2N2222):** controlled by base current.
- **MOSFET (IRLZ44N):** controlled by gate voltage, very efficient.

### Wiring Tip
Add a flyback diode across inductive loads like motors and relays to protect the transistor.`,
  },
];

const fallback = (q: string): string =>
  `## Happy to help

You asked: "${q.slice(0, 120)}"

I'm running in **mock mode**, so this is a sample answer rather than a real model response. Once your Qwen backend is connected, I'll answer this properly.

### Things You Can Try Now
- Attach a photo of a component and ask me to identify it.
- Ask about resistors, capacitors, LEDs, transistors or the ESP32.
- Hold the microphone button and ask by voice.`;

let imageCounter = 0;

export const mockChatService: ChatService = {
  async sendMessage(req: ChatRequest): Promise<AIResponse> {
    await sleep(1200 + Math.random() * 800);

    if (req.image) {
      const lower = req.message.toLowerCase();
      let key: keyof typeof mockComponents;
      if (lower.includes('capacitor')) key = 'capacitor';
      else if (/\bled\b/.test(lower)) key = 'led';
      else if (lower.includes('resistor')) key = 'resistor';
      else key = (['resistor', 'led', 'capacitor'] as const)[imageCounter++ % 3];
      const identification = mockComponents[key];
      return { text: identificationToMarkdown(identification), identification, mock: true };
    }

    const hit = topics.find((t) => t.match.test(req.message));
    return { text: hit ? hit.text : fallback(req.message), mock: true };
  },

  async fetchHistory() {
    return [];
  },
};
