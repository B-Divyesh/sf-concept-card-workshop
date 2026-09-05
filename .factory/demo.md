# Demo sandbox

Open `/demo` or select **Try it with sample data** from the landing screen.
It starts a four-card trail-conditions exercise with one scenario, evidence,
decision, and consequence card.

Demo data is stored only under `demo:ccw:workshop:v1`. Real work is stored
under `ccw:workshop:v1`; demo mode never reads or writes that key. The persistent
banner identifies demo mode, provides **Reset demo**, and **Start for real**
returns to the real workspace without copying demo cards.

The service worker caches the shell after the first visit. The offline claim is
tested only from `/demo` in a fresh browser context.
