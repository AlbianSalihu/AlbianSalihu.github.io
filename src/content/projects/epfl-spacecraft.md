---
title: 'CHESS CubeSat — FPGA Filament Controller'
description: 'FPGA-based filament controller for the CubeSatTOF mass spectrometer on the ESA-supported CHESS CubeSat. Open-loop FSM + discrete PID in VHDL on Xilinx Kria K26, with AXI4-Lite CPU interface.'
image: 'epfl-spacecraft/ChessCubesat.png'
imageBg: '#ffffff'
imagePosition: 'top'
images: []
video: ''
link: ''
github: 'https://github.com/AlbianSalihu/CHESSCubeSat'
report: '/epfl-spacecraft/filament_controller_report.pdf'
tags: ['FPGA', 'VHDL', 'Xilinx', 'Vivado', 'Space', 'AXI', 'PID', 'Embedded', 'Control Systems']
featured: true
date: 'Sep – Dec 2023'
role: 'FPGA Engineer'
team: 'Solo'
context: 'EPFL Semester Project — ESA-supported CHESS mission'
outcome: 'Functional open-loop FSM + discrete PID filament controller verified on Xilinx Kria K26 with AXI4-Lite CPU interface'
---

<script>
(function () {
  var FR = {
    'Mission Context': 'Contexte de la mission',
    'The Instrument': 'L\'instrument',
    'The Challenge': 'Le défi',
    'What I Built': 'Ce que j\'ai construit',
    'Open-Loop Controller': 'Contrôleur en boucle ouverte',
    'Closed-Loop PID Controller': 'Contrôleur PID en boucle fermée',
    'AXI4-Lite CPU–FPGA Interface': 'Interface CPU–FPGA AXI4-Lite',
    'State Machine Architecture': 'Architecture de la machine à états',
    'Verification & Results': 'Vérification & Résultats',
    'Technical Stack': 'Stack technique',
    'Supervisors': 'Encadrants',
  };
  function applyHeadings(lang) {
    document.querySelectorAll('.project-body h2, .project-body h3').forEach(function (h) {
      if (!h.getAttribute('data-en')) h.setAttribute('data-en', h.textContent.trim());
      var en = h.getAttribute('data-en');
      var translated = (lang === 'fr' && FR[en]) ? FR[en] : en;
      h.textContent = translated;
      var tocLink = document.querySelector('.toc-link[data-heading="' + h.id + '"]');
      if (tocLink) tocLink.textContent = translated;
    });
  }
  document.addEventListener('astro:page-load', function () {
    applyHeadings(localStorage.getItem('lang') || 'en');
  });
  document.addEventListener('langchange', function (e) { applyHeadings(e.detail); });
})();
</script>

## Mission Context

<div class="lang-en">

The **CHESS mission** (Constellation of High-performance Exospheric Science Satellites) is an ESA-supported CubeSat constellation developed jointly by EPFL and the University of Bern. Its scientific goal: map the chemical composition and density of Earth's exosphere and upper ionosphere — a region so tenuous it has resisted direct measurement for over 40 years.

The constellation deploys multiple CubeSats in orbit, each carrying a miniaturized mass spectrometer. Together, they build a picture of atmospheric chemistry that no single satellite could achieve alone.

<img src="/epfl-spacecraft/ChessCubesat.png" alt="CHESS CubeSat constellation" style="background:#d4d4d4;" />

</div>
<div class="lang-fr">

La mission **CHESS** (Constellation of High-performance Exospheric Science Satellites) est une constellation de CubeSats soutenue par l'ESA, développée conjointement par l'EPFL et l'Université de Berne. Son objectif scientifique : cartographier la composition chimique et la densité de l'exosphère terrestre et de l'ionosphère supérieure — une région si ténue qu'elle a résisté à toute mesure directe pendant plus de 40 ans.

La constellation déploie plusieurs CubeSats en orbite, chacun embarquant un spectromètre de masse miniaturisé. Ensemble, ils reconstituent une image de la chimie atmosphérique qu'aucun satellite seul ne pourrait atteindre.

<img src="/epfl-spacecraft/ChessCubesat.png" alt="Constellation CubeSat CHESS" style="background:#d4d4d4;" />

</div>

---

## The Instrument

<div class="lang-en">

The **CubeSatTOF** is a miniaturized time-of-flight mass spectrometer designed for space. It ionizes neutral gas molecules using **thermionic emission** — heating a metallic filament until it releases electrons that collide with ambient gas atoms, producing ions whose mass-to-charge ratio can then be measured in flight.

The instrument is built around three stacked boards: a **power board** (filament drive and high-voltage analog), a **sensor board** (particle detector), and a **digital board** (Xilinx Kria K26 SoC — ARM processor + FPGA fabric).

The filament subsystem is the most critical and fragile part of the instrument. Too little power and no ionization occurs; too much and the filament burns out — destroying the instrument. Precise, deterministic control is non-negotiable.

<img src="/epfl-spacecraft/CubesatTOF.JPG" alt="CubeSatTOF mass spectrometer" style="max-width:55%;display:block;margin:0 auto 1.5rem auto;" />

</div>
<div class="lang-fr">

Le **CubeSatTOF** est un spectromètre de masse à temps de vol miniaturisé conçu pour l'espace. Il ionise des molécules de gaz neutres par **émission thermo-ionique** — en chauffant un filament métallique jusqu'à ce qu'il libère des électrons qui entrent en collision avec les atomes de gaz ambiant, produisant des ions dont le rapport masse/charge est ensuite mesuré en vol.

L'instrument est construit autour de trois cartes empilées : une **carte de puissance** (alimentation du filament et analogique haute tension), une **carte capteur** (détecteur de particules), et une **carte numérique** (Xilinx Kria K26 SoC — processeur ARM + logique FPGA).

Le sous-système filament est la partie la plus critique et la plus fragile de l'instrument. Trop peu de puissance : aucune ionisation. Trop : le filament fond — détruisant l'instrument. Un contrôle précis et déterministe est impératif.

<img src="/epfl-spacecraft/CubesatTOF.JPG" alt="Spectromètre de masse CubeSatTOF" style="max-width:55%;display:block;margin:0 auto 1.5rem auto;" />

</div>

---

## The Challenge

<div class="lang-en">

The FPGA drives the filament via two phase-shifted square wave signals — **FIL_SYNC** and **FIL_PHASE** — output at 0/+3.3 V and converted by the analog power board to ±12 V. The phase offset between SYNC and PHASE directly sets how much energy is delivered to the filament, and therefore the **emission current (Iem)**.

The controller must handle two distinct operating modes:
1. **Open-loop**: user-defined phase offset, fixed output — for calibration and manual operation
2. **Closed-loop**: automatic regulation of Iem to a target value using PID feedback — for autonomous in-orbit operation

The additional complexity: the filament plant has **two distinct time-constant dynamics** — fast transient current spikes and slow steady-state drift. A two-stage PID (one per dynamic) was studied as a candidate architecture but ultimately a single discrete PID was implemented, as the emission current is relatively stable and the simpler architecture was sufficient for this stage of the project.

</div>
<div class="lang-fr">

Le FPGA pilote le filament via deux signaux carrés déphasés — **FIL_SYNC** et **FIL_PHASE** — émis à 0/+3,3 V et convertis par la carte de puissance analogique en ±12 V. Le déphasage entre SYNC et PHASE détermine directement la quantité d'énergie délivrée au filament, et donc le **courant d'émission (Iem)**.

Le contrôleur doit gérer deux modes opératoires distincts :
1. **Boucle ouverte** : déphasage défini par l'utilisateur, sortie fixe — pour la calibration et l'opération manuelle
2. **Boucle fermée** : régulation automatique de Iem vers une valeur cible par retour PID — pour l'opération autonome en orbite

La complexité supplémentaire : la dynamique du filament présente **deux constantes de temps distinctes** — des pics de courant transitoires rapides et une dérive lente en régime permanent. Un PID à deux étages (un par dynamique) a été étudié comme architecture candidate, mais un PID discret simple a finalement été implémenté — le courant d'émission étant relativement stable, l'architecture plus simple s'est avérée suffisante pour ce stade du projet.

</div>

---

## What I Built

<div class="lang-en">

A complete **FPGA filament controller** in VHDL, integrated into the Xilinx Kria K26 SoC platform, designed to the specifications of the CubeSatTOF instrument.

<img src="/epfl-spacecraft/trimmedfilinterface.JPG" alt="Filament interface on the power board" style="max-width:50%;display:block;margin:0 auto;" />

</div>
<div class="lang-fr">

Un **contrôleur de filament FPGA** complet en VHDL, intégré dans la plateforme Xilinx Kria K26 SoC, conçu selon les spécifications de l'instrument CubeSatTOF.

<img src="/epfl-spacecraft/trimmedfilinterface.JPG" alt="Interface du filament sur la carte de puissance" style="max-width:50%;display:block;margin:0 auto;" />

</div>

### Open-Loop Controller

<div class="lang-en">

Generates FIL_SYNC and FIL_PHASE at the correct frequency with a user-configurable phase offset. The offset is encoded as a register value: `x = (angle × 3333) / 360`. Fully verified in simulation across 0°, 45°, 90°, and 180° phase configurations, then validated on physical hardware.

<img src="/epfl-spacecraft/phasesyncout.png" alt="Phase and sync output signals — simulation" style="background:#d4d4d4;max-width:50%;display:block;margin:0 auto;" />

</div>
<div class="lang-fr">

Génère FIL_SYNC et FIL_PHASE à la fréquence correcte avec un déphasage configurable par l'utilisateur. Le déphasage est encodé comme valeur de registre : `x = (angle × 3333) / 360`. Entièrement vérifié en simulation pour des configurations à 0°, 45°, 90° et 180°, puis validé sur matériel physique.

<img src="/epfl-spacecraft/phasesyncout.png" alt="Signaux de sortie phase et sync — simulation" style="background:#d4d4d4;max-width:50%;display:block;margin:0 auto;" />

</div>

### Closed-Loop PID Controller

<div class="lang-en">

A discrete **PID controller** running in FPGA fabric — no OS jitter, no scheduling latency. The update rate is configurable via `regPIDFreq`. The control law adjusts the phase shift each cycle to drive Iem toward the setpoint:

```
U[k] = Kp·e[k] + Ki·Ts·Σe[k] + Kd·(e[k]−e[k−1])/Ts
```

An **anti-windup** stage clamps the output to [0°, 180°], preventing integrator saturation. Individual terms can be disabled by writing 0 to their gain register — enabling P-only or PI configurations without code changes.

A two-stage PID (fast/slow dynamics) was studied as a candidate architecture and equations were derived, but not implemented — the single PID is sufficient for the current stage of the project.

<img src="/epfl-spacecraft/pid.drawio.png" alt="PID state machine" style="max-width:15%;display:block;margin:0 auto;" />

</div>
<div class="lang-fr">

Un **contrôleur PID discret** s'exécutant dans le fabric FPGA — sans gigue système, sans latence d'ordonnancement. Le taux de mise à jour est configurable via `regPIDFreq`. La loi de commande ajuste le déphasage à chaque cycle pour amener Iem vers la consigne :

```
U[k] = Kp·e[k] + Ki·Ts·Σe[k] + Kd·(e[k]−e[k−1])/Ts
```

Un étage **anti-windup** borne la sortie à [0°, 180°], empêchant la saturation de l'intégrateur. Les termes individuels peuvent être désactivés en écrivant 0 dans leur registre de gain — permettant des configurations P seul ou PI sans modification du code.

Un PID à deux étages (dynamiques rapide/lente) a été étudié comme architecture candidate avec des équations dérivées, mais non implémenté — le PID simple est suffisant pour ce stade du projet.

<img src="/epfl-spacecraft/pid.drawio.png" alt="Machine à états PID" style="max-width:15%;display:block;margin:0 auto;" />

</div>

### AXI4-Lite CPU–FPGA Interface

<div class="lang-en">

A custom AXI4-Lite slave peripheral (`Filament_Controller_v1_0_S00_AXI`) bridges the FPGA logic and the ARM Cortex-A53 processor on the Kria K26 SoC. 32-bit data bus, 6-bit address bus, 11 control registers:

| Register | Purpose |
|---|---|
| `regDesIem` | Target emission current setpoint |
| `regStart` / `regStop` | Start/stop the controller |
| `regFreq` | Filament drive frequency |
| `regPhaseShift` | Open-loop phase offset |
| `regMode` | Open-loop / closed-loop selection |
| `regKp`, `regKi`, `regKd` | PID gains |
| `regPIDFreq` | PID update rate |
| `regVoltageOffset` | DAC offset voltage (SPI) |

The ARM CPU can update setpoints and read back state at runtime — enabling adaptive software control layered on top of the FPGA's deterministic hardware loop.

<img src="/epfl-spacecraft/fpgasystem.JPG" alt="FPGA system integration on Kria K26" style="max-width:70%;display:block;margin:0 auto;" />

</div>
<div class="lang-fr">

Un périphérique esclave AXI4-Lite personnalisé (`Filament_Controller_v1_0_S00_AXI`) fait le pont entre la logique FPGA et le processeur ARM Cortex-A53 du Kria K26 SoC. Bus de données 32 bits, bus d'adresse 6 bits, 11 registres de contrôle :

| Registre | Rôle |
|---|---|
| `regDesIem` | Consigne du courant d'émission cible |
| `regStart` / `regStop` | Démarrage/arrêt du contrôleur |
| `regFreq` | Fréquence de pilotage du filament |
| `regPhaseShift` | Déphasage en boucle ouverte |
| `regMode` | Sélection boucle ouverte / fermée |
| `regKp`, `regKi`, `regKd` | Gains PID |
| `regPIDFreq` | Fréquence de mise à jour du PID |
| `regVoltageOffset` | Tension d'offset DAC (SPI) |

Le processeur ARM peut mettre à jour les consignes et lire l'état en temps réel — permettant un contrôle logiciel adaptatif superposé à la boucle matérielle déterministe du FPGA.

<img src="/epfl-spacecraft/fpgasystem.JPG" alt="Intégration du système FPGA sur Kria K26" style="max-width:70%;display:block;margin:0 auto;" />

</div>

### State Machine Architecture

<div class="lang-en">

The controller logic is structured as a VHDL state machine: `IDLE → Start → Counter → Phase/Sync generation states`, with closed-loop PID computation overlaid on the phase generation path. The state machine guarantees cycle-accurate timing of the filament drive signals regardless of CPU activity.

<img src="/epfl-spacecraft/final_state_machine.drawio.png" alt="Controller state machine diagram" style="background:#ffffff;max-width:100%;display:block;margin:0 auto;" />

</div>
<div class="lang-fr">

La logique de contrôle est structurée comme une machine à états VHDL : `IDLE → Start → Counter → états de génération Phase/Sync`, avec le calcul PID en boucle fermée superposé au chemin de génération de phase. La machine à états garantit un timing cycle-précis des signaux de pilotage du filament, indépendamment de l'activité du CPU.

<img src="/epfl-spacecraft/final_state_machine.drawio.png" alt="Diagramme de la machine à états du contrôleur" style="background:#ffffff;max-width:100%;display:block;margin:0 auto;" />

</div>

---

## Verification & Results

<div class="lang-en">

**Simulation:** Full testbench built in Xilinx Vivado. The open-loop controller verified across all phase configurations (0°, 45°, 90°, 180°). The controller performed flawlessly in simulation — all phase shifts executed accurately under all tested conditions. Closed-loop simulation testing was not feasible without a filament response model.

<img src="/epfl-spacecraft/simulation_setup.jpg" alt="Simulation setup in Vivado" style="max-width:80%;display:block;margin:0 auto 1.5rem auto;" />

<img src="/epfl-spacecraft/0degreesres.png" alt="0° phase shift — simulation result" style="max-width:100%;display:block;margin:0 auto 1.5rem auto;" />

<img src="/epfl-spacecraft/45degres.png" alt="45° phase shift — simulation result" style="max-width:100%;display:block;margin:0 auto 1.5rem auto;" />

<img src="/epfl-spacecraft/180degreeres.png" alt="180° phase shift — simulation result" style="max-width:100%;display:block;margin:0 auto 1.5rem auto;" />

**Hardware:** Open-loop controller deployed and validated on the physical CubeSatTOF hardware stack (Kria K26 + power board + sensor board + digital board). Confirmed on oscilloscope at a 90° phase shift configuration. A minor frequency deviation was observed due to integer rounding in the phase calculation — correctable by selecting a clock frequency that yields an integer result (e.g. 300 MHz).

<img src="/epfl-spacecraft/filamentmounted.png" alt="Filament mounted — hardware test setup" style="max-width:60%;display:block;margin:0 auto 1.5rem auto;" />

<img src="/epfl-spacecraft/OpenTest.png" alt="Open-loop hardware test — oscilloscope result" style="max-width:100%;display:block;margin:0 auto 1.5rem auto;" />

**Outcome:**
- Open-loop controller: verified in simulation and on physical hardware
- Closed-loop PID: designed and implemented in VHDL (hardware test blocked by non-functional test board)
- Complete AXI4-Lite register API: runtime reconfigurability from ARM software
- Contributes to an ESA-supported multi-organization space mission (EPFL + University of Bern)
- Lays the groundwork for hardware-in-the-loop testing of the full CubeSatTOF instrument chain

</div>
<div class="lang-fr">

**Simulation :** Banc de test complet sous Xilinx Vivado. Le contrôleur en boucle ouverte a été vérifié pour toutes les configurations de déphasage (0°, 45°, 90°, 180°). Le contrôleur a fonctionné parfaitement en simulation — tous les déphasages exécutés avec précision dans toutes les conditions testées. La simulation en boucle fermée n'était pas faisable sans modèle de réponse du filament.

<img src="/epfl-spacecraft/simulation_setup.jpg" alt="Configuration du banc de test Vivado" style="max-width:80%;display:block;margin:0 auto 1.5rem auto;" />

<img src="/epfl-spacecraft/0degreesres.png" alt="Résultat simulation — déphasage 0°" style="max-width:100%;display:block;margin:0 auto 1.5rem auto;" />

<img src="/epfl-spacecraft/45degres.png" alt="Résultat simulation — déphasage 45°" style="max-width:100%;display:block;margin:0 auto 1.5rem auto;" />

<img src="/epfl-spacecraft/180degreeres.png" alt="Résultat simulation — déphasage 180°" style="max-width:100%;display:block;margin:0 auto 1.5rem auto;" />

**Matériel :** Le contrôleur en boucle ouverte a été déployé et validé sur le stack matériel physique CubeSatTOF (Kria K26 + carte de puissance + carte capteur + carte numérique). Confirmé à l'oscilloscope dans une configuration à 90° de déphasage. Un léger écart de fréquence a été observé, dû à des erreurs d'arrondi entier dans le calcul de phase — corrigeable en choisissant une fréquence d'horloge produisant un résultat entier (ex. 300 MHz).

<img src="/epfl-spacecraft/filamentmounted.png" alt="Filament monté — setup de test matériel" style="max-width:60%;display:block;margin:0 auto 1.5rem auto;" />

<img src="/epfl-spacecraft/OpenTest.png" alt="Test matériel en boucle ouverte — résultat oscilloscope" style="max-width:100%;display:block;margin:0 auto 1.5rem auto;" />

**Résultats :**
- Contrôleur en boucle ouverte : vérifié en simulation et sur matériel physique
- PID en boucle fermée : conçu et implémenté en VHDL (test matériel bloqué par défaillance de la carte de test)
- API de registres AXI4-Lite complète : reconfigurabilité en temps réel depuis le logiciel ARM
- Contribue à une mission spatiale multi-organisations soutenue par l'ESA (EPFL + Université de Berne)
- Pose les bases pour les tests hardware-in-the-loop de la chaîne complète CubeSatTOF

</div>

---

## Technical Stack

<div class="lang-en">

| Area | Details |
|---|---|
| FPGA Platform | Xilinx Kria K26 SoM (Zynq UltraScale+) |
| HDL | VHDL |
| Toolchain | Xilinx Vivado 2023.2 |
| Bus Protocol | AXI4-Lite (CPU ↔ FPGA) |
| Peripheral Interfaces | SPI (DAC voltage offset, ADC emission current) |
| Control Architecture | Discrete PID with anti-windup + open-loop FSM |
| Instrument Hardware | CubeSatTOF power board, sensor board, digital board |
| Verification | Vivado testbench simulation + oscilloscope hardware validation |

</div>
<div class="lang-fr">

| Domaine | Détails |
|---|---|
| Plateforme FPGA | Xilinx Kria K26 SoM (Zynq UltraScale+) |
| HDL | VHDL |
| Chaîne d'outils | Xilinx Vivado 2023.2 |
| Protocole de bus | AXI4-Lite (CPU ↔ FPGA) |
| Interfaces périphériques | SPI (offset tension DAC, courant émission ADC) |
| Architecture de contrôle | PID discret avec anti-windup + FSM en boucle ouverte |
| Matériel instrument | Carte de puissance, carte capteur, carte numérique CubeSatTOF |
| Vérification | Simulation testbench Vivado + validation matérielle oscilloscope |

</div>

---

## Supervisors

<div class="lang-en">

Prof. Alexandre Schmid (EPFL), Prof. Peter Wurz (University of Bern), Dr. Rico Fausch, Scott Trimble

</div>
<div class="lang-fr">

Prof. Alexandre Schmid (EPFL), Prof. Peter Wurz (Université de Berne), Dr. Rico Fausch, Scott Trimble

</div>
