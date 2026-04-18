---
title: 'FPGA Audio Effect Device — Custom DMA & Dual-Processor DSP'
description: 'Custom DMA and IRQ Sender IP cores in VHDL on Intel DE1-SoC. Dual Nios II processors communicate via hardware interrupt. 48 kHz audio pipeline: microphone → SDRAM → FFT → low-pass → IFFT → speaker.'
image: 'lab4-audio/general_architecture_connectic.JPG'
images: []
video: ''
link: ''
github: 'https://github.com/AlbianSalihu/FPGA-Audio-Effect'
tags: ['FPGA', 'VHDL', 'Embedded Systems', 'Intel DE1-SoC', 'Nios II', 'Avalon Bus', 'DSP', 'C', 'Signal Processing']
featured: false
date: 'June 2023'
role: 'Co-designer'
team: '2-person team'
context: 'EPFL Embedded Systems Course'
outcome: 'Custom DMA and IRQ Sender IP cores in VHDL synthesized and verified; 48 kHz audio effect pipeline running end-to-end on Intel DE1-SoC'
---

<script>
(function () {
  var FR = {
    'Overview': 'Vue d\'ensemble',
    'System Architecture': 'Architecture du système',
    'Custom DMA': 'DMA Personnalisé',
    'FSM Design': 'Conception de la FSM',
    'Register Map': 'Registres',
    'Custom IRQ Sender': 'IRQ Sender Personnalisé',
    'Audio IP': 'IP Audio',
    'Software Pipeline': 'Pipeline Logiciel',
    'CPU0 — Record': 'CPU0 — Enregistrement',
    'CPU1 — Process': 'CPU1 — Traitement',
    'Signal Processing': 'Traitement du Signal',
    'Profiling': 'Profilage',
    'Results & Assessment': 'Résultats & Bilan',
    'Technical Stack': 'Stack Technique',
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

## Overview

<div class="lang-en">

Mini-project for the EPFL *Embedded Systems* course (June 2023), completed as part of a two-person team. Both the hardware design and firmware were developed jointly throughout.

The goal: build a **quasi-real-time audio effect device** on the Intel DE1-SoC FPGA board. A microphone captures audio, it gets processed through an FFT-based low-pass filter, and the result plays back through the speaker — all coordinated across two independent processors over custom hardware IP.

<img src="/lab4-audio/goal.JPG" alt="System goal: microphone → FFT → low-pass filter → IFFT → speaker" style="max-width:80%;display:block;margin:0 auto;" />

The project was not just about writing signal processing code. The core challenge was **designing the hardware infrastructure** that makes it possible: a custom DMA controller, a custom interrupt-based mailbox, and a dual-processor system wired together over Intel's Avalon interconnect — all implemented from scratch in VHDL.

</div>
<div class="lang-fr">

Mini-projet pour le cours *Systèmes Embarqués* de l'EPFL (juin 2023), réalisé en binôme. La conception matérielle et le firmware ont été développés conjointement tout au long du projet.

L'objectif : construire un **dispositif d'effet audio en temps quasi-réel** sur la carte FPGA Intel DE1-SoC. Un microphone capture l'audio, celui-ci est traité par un filtre passe-bas basé sur la FFT, puis le résultat est rejoué par le haut-parleur — le tout coordonné entre deux processeurs indépendants via des IP matérielles personnalisées.

<img src="/lab4-audio/goal.JPG" alt="Objectif : microphone → FFT → filtre passe-bas → IFFT → haut-parleur" style="max-width:80%;display:block;margin:0 auto;" />

Le projet ne consistait pas seulement à écrire du code de traitement du signal. Le défi principal était de **concevoir l'infrastructure matérielle** : un contrôleur DMA personnalisé, une boîte aux lettres matérielle par interruption, et un système bi-processeur câblé sur l'interconnexion Avalon d'Intel — le tout implémenté de zéro en VHDL.

</div>

---

## System Architecture

<div class="lang-en">

The system runs on the Intel DE1-SoC with a WM8731 audio CODEC at 48 kHz (clocked by a 12.288 MHz PLL). Three Avalon buses connect the components:

- **Bus 0** (CPU0 domain): Nios II Processor 0, On-chip Memory 0, customIRQSender, IP Timer 0
- **Bus 1** (CPU1 domain): Nios II Processor 1, On-chip Memory 1, Custom DMA 0, Custom DMA 1, IP Audio Ctrl, IP Timer 1
- **Bus 2** (shared peripherals): IP Audio, IP PIO (8-bit switches), SDRAM Controller

<img src="/lab4-audio/general_architecture_avalon.JPG" alt="Full Avalon bus hierarchy: three buses, two Nios II processors, custom IPs, SDRAM, audio CODEC" style="max-width:90%;display:block;margin:0 auto;" data-lightbox />

The two processors have their own memory spaces and Avalon buses, isolated except for the shared Bus 2. Inter-processor communication happens entirely through the custom hardware IPs — no shared memory flag polling.

<img src="/lab4-audio/general_architecture_connectic.JPG" alt="Connectivity block diagram: CPU0, CPU1, Custom IRQ Sender, Custom DMA 0/1, SDRAM, Audio IP" style="max-width:75%;display:block;margin:0 auto;" />

</div>
<div class="lang-fr">

Le système fonctionne sur l'Intel DE1-SoC avec un CODEC audio WM8731 à 48 kHz (cadencé par une PLL à 12,288 MHz). Trois bus Avalon interconnectent les composants :

- **Bus 0** (domaine CPU0) : Processeur Nios II 0, Mémoire on-chip 0, customIRQSender, IP Timer 0
- **Bus 1** (domaine CPU1) : Processeur Nios II 1, Mémoire on-chip 1, Custom DMA 0, Custom DMA 1, IP Audio Ctrl, IP Timer 1
- **Bus 2** (périphériques partagés) : IP Audio, IP PIO (switchs 8 bits), Contrôleur SDRAM

<img src="/lab4-audio/general_architecture_avalon.JPG" alt="Hiérarchie complète des bus Avalon : trois bus, deux processeurs Nios II, IPs personnalisées, SDRAM, CODEC audio" style="max-width:90%;display:block;margin:0 auto;" data-lightbox />

Les deux processeurs ont leurs propres espaces mémoire et bus Avalon, isolés sauf pour le Bus 2 partagé. La communication inter-processeur se fait entièrement via les IPs matérielles personnalisées — sans polling de flags en mémoire partagée.

<img src="/lab4-audio/general_architecture_connectic.JPG" alt="Diagramme de connectivité : CPU0, CPU1, Custom IRQ Sender, Custom DMA 0/1, SDRAM, IP Audio" style="max-width:75%;display:block;margin:0 auto;" />

</div>

---

## Custom DMA

<div class="lang-en">

The custom DMA is the technical centrepiece of this project. Two instances are used: **DMA 0** transfers a 1024-sample chunk from SDRAM to on-chip memory (for processing), and **DMA 1** writes the processed chunk back from on-chip memory to SDRAM.

Each DMA is a dual-role component:
- **Avalon Master**: drives the memory bus autonomously to read/write data
- **Avalon Slave**: exposes a register interface for CPU1 to configure and start transfers

<img src="/lab4-audio/blockDiagramDMA.JPG" alt="Custom DMA block diagram: Avalon Slave config port (8 registers) and Avalon Master memory bus" style="background:#d4d4d4;max-width:65%;display:block;margin:0 auto;" />

</div>
<div class="lang-fr">

Le DMA personnalisé est la pièce technique centrale de ce projet. Deux instances sont utilisées : **DMA 0** transfère un bloc de 1024 échantillons de la SDRAM vers la mémoire on-chip (pour traitement), et **DMA 1** réécrit le bloc traité de la mémoire on-chip vers la SDRAM.

Chaque DMA joue un double rôle :
- **Maître Avalon** : pilote le bus mémoire de manière autonome pour lire/écrire les données
- **Esclave Avalon** : expose une interface de registres pour que CPU1 configure et déclenche les transferts

<img src="/lab4-audio/blockDiagramDMA.JPG" alt="Diagramme du DMA : port esclave Avalon (8 registres) et bus maître Avalon" style="background:#d4d4d4;max-width:65%;display:block;margin:0 auto;" />

</div>

### Register Map

<div class="lang-en">

| # | Register | Description |
|---|---|---|
| 0 | `RegAddStartSrc` | Source start address in memory |
| 1 | `RegAddStartDst` | Destination start address in memory |
| 2 | `RegLgtTable` | Number of elements to transfer |
| 3 | `RegNbByte` | Size of each element in bytes |
| 4 | `Start` | Write 1 to begin transfer |
| 5 | `Finish` | Set by FSM when transfer is complete |
| 6 | `StopMaster` | Emergency stop |
| 7 | `AckIRQ` | Write to acknowledge the completion IRQ |

CPU1 programs registers 0–3, asserts `Start`, then proceeds asynchronously. The DMA fires an IRQ when the transfer finishes, allowing CPU1 to chain the next operation without polling.

</div>
<div class="lang-fr">

| # | Registre | Description |
|---|---|---|
| 0 | `RegAddStartSrc` | Adresse source en mémoire |
| 1 | `RegAddStartDst` | Adresse destination en mémoire |
| 2 | `RegLgtTable` | Nombre d'éléments à transférer |
| 3 | `RegNbByte` | Taille de chaque élément en octets |
| 4 | `Start` | Écrire 1 pour démarrer le transfert |
| 5 | `Finish` | Mis par la FSM quand le transfert est terminé |
| 6 | `StopMaster` | Arrêt d'urgence |
| 7 | `AckIRQ` | Acquitter l'IRQ de fin de transfert |

CPU1 programme les registres 0–3, active `Start`, puis continue de manière asynchrone. Le DMA émet une IRQ à la fin du transfert, permettant à CPU1 d'enchaîner sans polling.

</div>

### FSM Design

<div class="lang-en">

The transfer is orchestrated by a 7-state FSM running in hardware:

```
Idle → LdParam → RdAcc → WaitRd → WriteValue → WrEnd → EndTable
                   ↑___________________________|
```

- **Idle**: waits for `Start = 1`
- **LdParam**: latches source address, destination address, length, and byte-width from registers
- **RdAcc**: asserts `avm_Rd` on the Avalon Master port to request the next data word from the source address
- **WaitRd**: stalls until `avm_WaitRequest` is deasserted (back-pressure from Avalon fabric)
- **WriteValue**: asserts `avm_Wr` with the latched data to write to the destination address
- **WrEnd**: waits for the write to be acknowledged
- **EndTable**: if more elements remain, loops back to `RdAcc` with incremented addresses; otherwise sets `Finish`, asserts `IRQ`, and returns to `Idle`

The DMA handles Avalon back-pressure natively via `WaitRequest` — it will stall mid-transfer if the SDRAM controller is busy, with no intervention needed from the CPU.

</div>
<div class="lang-fr">

Le transfert est orchestré par une FSM à 7 états s'exécutant dans le matériel :

```
Idle → LdParam → RdAcc → WaitRd → WriteValue → WrEnd → EndTable
                   ↑___________________________|
```

- **Idle** : attend que `Start = 1`
- **LdParam** : verrouille l'adresse source, destination, longueur et largeur en octets depuis les registres
- **RdAcc** : active `avm_Rd` sur le port Maître Avalon pour demander le prochain mot depuis l'adresse source
- **WaitRd** : attend que `avm_WaitRequest` soit désactivé (contre-pression du fabric Avalon)
- **WriteValue** : active `avm_Wr` avec la donnée verrouillée vers l'adresse destination
- **WrEnd** : attend l'acquittement de l'écriture
- **EndTable** : si des éléments restent, reboucle vers `RdAcc` avec les adresses incrémentées ; sinon active `Finish`, émet `IRQ` et retourne à `Idle`

Le DMA gère nativement la contre-pression Avalon via `WaitRequest` — il se met en pause si le contrôleur SDRAM est occupé, sans intervention du CPU.

</div>

---

## Custom IRQ Sender

<div class="lang-en">

The `customIRQSender` is a lightweight hardware mailbox: CPU0 needs to tell CPU1 *where in SDRAM the recorded audio is*, and do so via a hardware interrupt rather than a shared memory flag.

It exposes two registers over its Avalon Slave interface:

| # | Register | Description |
|---|---|---|
| 0 | `RegMessage` | 32-bit payload (used to pass the SDRAM base address) |
| 1 | `RegAckIRQ` | Write to deassert the IRQ and clear the message |

**How it works**: CPU0 writes the SDRAM address into register 0. The component immediately raises the `IRQ` line. CPU1's interrupt handler reads the address from register 0, then writes to register 1 to acknowledge and lower the IRQ.

<img src="/lab4-audio/blockDiagramIRQSender.JPG" alt="Custom IRQ Sender block diagram: RegMessage + RegAckIRQ, IRQ output line" style="background:#d4d4d4;max-width:55%;display:block;margin:0 auto;" />

This eliminates the need for CPU1 to poll any shared memory location — the interrupt fires the moment CPU0 has finished recording.

</div>
<div class="lang-fr">

Le `customIRQSender` est une boîte aux lettres matérielle légère : CPU0 doit indiquer à CPU1 *où se trouvent les données audio enregistrées dans la SDRAM*, via une interruption matérielle plutôt qu'un flag en mémoire partagée.

Il expose deux registres via son interface Esclave Avalon :

| # | Registre | Description |
|---|---|---|
| 0 | `RegMessage` | Charge utile 32 bits (adresse de base SDRAM) |
| 1 | `RegAckIRQ` | Écrire pour désactiver l'IRQ et effacer le message |

**Fonctionnement** : CPU0 écrit l'adresse SDRAM dans le registre 0. Le composant lève immédiatement la ligne `IRQ`. Le gestionnaire d'interruption de CPU1 lit l'adresse depuis le registre 0, puis écrit dans le registre 1 pour acquitter et abaisser l'IRQ.

<img src="/lab4-audio/blockDiagramIRQSender.JPG" alt="Diagramme du IRQ Sender : RegMessage + RegAckIRQ, ligne IRQ de sortie" style="background:#d4d4d4;max-width:55%;display:block;margin:0 auto;" />

Cela élimine le besoin pour CPU1 de surveiller un emplacement mémoire partagé — l'interruption se déclenche dès que CPU0 a terminé l'enregistrement.

</div>

---

## Audio IP

<div class="lang-en">

The WM8731 CODEC is accessed through Intel's Audio IP core, which sits on the shared Avalon bus. Internally it has four FIFOs and a serializer/deserializer pair for I²S communication with the CODEC:

<img src="/lab4-audio/explanation_audioIP.JPG" alt="Audio IP internal structure: Left/Right FIFOs, Deserializer (ADC input), Serializer (DAC output), Avalon Slave port" style="background:#d4d4d4;max-width:85%;display:block;margin:0 auto;" />

CPU0 reads microphone samples from the **Right FIFO** (ADC side) one at a time in a polling loop, writing each 16-bit sample directly to SDRAM. CPU1 writes processed samples into the **Left + Right FIFOs** (DAC side) for playback.

The CODEC runs at 48 kHz — 10 seconds of recording = 480,000 samples = 960 KB in SDRAM.

</div>
<div class="lang-fr">

Le CODEC WM8731 est accessible via le cœur IP Audio d'Intel, situé sur le bus Avalon partagé. En interne, il comporte quatre FIFOs et une paire sérialiseur/désérialiseur pour la communication I²S avec le CODEC :

<img src="/lab4-audio/explanation_audioIP.JPG" alt="Structure interne de l'IP Audio : FIFOs Gauche/Droite, Désérialiseur (entrée ADC), Sérialiseur (sortie DAC), port Esclave Avalon" style="background:#d4d4d4;max-width:85%;display:block;margin:0 auto;" />

CPU0 lit les échantillons du microphone depuis la **FIFO Droite** (côté ADC) un par un dans une boucle de polling, en écrivant chaque échantillon 16 bits directement en SDRAM. CPU1 écrit les échantillons traités dans les **FIFOs Gauche + Droite** (côté DAC) pour la lecture.

Le CODEC fonctionne à 48 kHz — 10 secondes d'enregistrement = 480 000 échantillons = 960 Ko en SDRAM.

</div>

---

## Software Pipeline

<div class="lang-en">

The two processors run completely independent firmware. Their combined flow is:

<img src="/lab4-audio/softME.drawio.png" alt="CPU0 and CPU1 software flowcharts: record → IRQ → DMA read → FFT → filter → IFFT → DMA write → playback" style="background:#d4d4d4;max-width:70%;display:block;margin:0 auto;" data-lightbox />

</div>
<div class="lang-fr">

Les deux processeurs exécutent des firmwares complètement indépendants. Leur flux combiné est :

<img src="/lab4-audio/softME.drawio.png" alt="Organigrammes CPU0 et CPU1 : enregistrement → IRQ → lecture DMA → FFT → filtre → IFFT → écriture DMA → lecture audio" style="background:#d4d4d4;max-width:70%;display:block;margin:0 auto;" data-lightbox />

</div>

### CPU0 — Record

<div class="lang-en">

CPU0's job is simple and single-shot:

1. Register an ISR on **PIO interrupt** (hardware switch on the DE1-SoC)
2. When the switch is flipped, set `start_recording = 1`
3. Poll the audio FIFO: for each available right-channel sample, write it to `sdramData[count]`
4. Once `count` reaches `MAX_SEND_DATA` (480,000 samples), write the SDRAM base address into the `customIRQSender` register and break

CPU0 never touches the SDRAM directly beyond sequential writes — no cache coherency issues on the record path.

</div>
<div class="lang-fr">

La tâche de CPU0 est simple et unique :

1. Enregistrer un ISR sur l'**interruption PIO** (switch matériel sur le DE1-SoC)
2. Quand le switch est activé, mettre `start_recording = 1`
3. Surveiller la FIFO audio : pour chaque échantillon disponible (canal droit), l'écrire dans `sdramData[count]`
4. Une fois `count` atteignant `MAX_SEND_DATA` (480 000 échantillons), écrire l'adresse de base SDRAM dans le registre `customIRQSender` et terminer

CPU0 n'accède à la SDRAM que par des écritures séquentielles — pas de problèmes de cohérence de cache sur le chemin d'enregistrement.

</div>

### CPU1 — Process

<div class="lang-en">

CPU1 registers three ISRs at startup: one for `customIRQSender`, one for each DMA. The main loop is fully interrupt-driven:

1. **`isr_irqSender`**: fires when CPU0 sends the SDRAM address. Latches the address, sets `flag = 1`.
2. Main loop detects `flag`: starts the pipeline with `start_recieve = 1`.
3. **DMA 0 triggered**: reads 1024 samples from `&sdramData[count]` → `data1[]` (on-chip). Fires IRQ when done.
4. **`isr_DMA_recieve`**: sets `start_send = 1`.
5. Main loop detects `start_send`: runs KissFFT forward, zeroes bins above 20 kHz, runs KissFFT inverse, normalises by dividing by `SIZE_FFT`.
6. **DMA 1 triggered**: writes processed `data1[]` back to `&sdramData[count]`. Fires IRQ when done.
7. **`isr_DMA_send`**: increments `count` by 1024, sets `start_recieve = 1` → next chunk begins.
8. After all chunks: waits for second switch press, then plays back the full SDRAM buffer through the audio FIFO.

</div>
<div class="lang-fr">

CPU1 enregistre trois ISRs au démarrage : un pour `customIRQSender`, un pour chaque DMA. La boucle principale est entièrement pilotée par interruptions :

1. **`isr_irqSender`** : se déclenche quand CPU0 envoie l'adresse SDRAM. Mémorise l'adresse, met `flag = 1`.
2. La boucle principale détecte `flag` : démarre le pipeline avec `start_recieve = 1`.
3. **DMA 0 déclenché** : lit 1024 échantillons depuis `&sdramData[count]` → `data1[]` (on-chip). Émet une IRQ à la fin.
4. **`isr_DMA_recieve`** : met `start_send = 1`.
5. La boucle principale détecte `start_send` : exécute KissFFT forward, met à zéro les bins au-dessus de 20 kHz, exécute KissFFT inverse, normalise en divisant par `SIZE_FFT`.
6. **DMA 1 déclenché** : réécrit `data1[]` traité vers `&sdramData[count]`. Émet une IRQ à la fin.
7. **`isr_DMA_send`** : incrémente `count` de 1024, met `start_recieve = 1` → le bloc suivant commence.
8. Après tous les blocs : attend une seconde pression sur le switch, puis lit le buffer SDRAM complet via la FIFO audio.

</div>

---

## Signal Processing

<div class="lang-en">

The filter operates in the frequency domain on 1024-sample blocks:

<img src="/lab4-audio/low_pass.png" alt="Low-pass filter in frequency domain: magnitude vs frequency, bins above cutoff zeroed" style="background:#ffffff;max-width:45%;display:block;margin:0 auto;" />

**Forward FFT** → **zero bins where `freq ≥ 20 kHz`** → **Inverse FFT** → **normalise by 1/N**

The frequency of each bin is computed as `freq = (i × 48000/2) / 1024`. With 48 kHz sampling, the Nyquist limit is 24 kHz — so the filter as configured (cutoff at 20 kHz) removes the top ~4 kHz band of the spectrum, leaving human voice and most music intact.

The FFT library used is **KissFFT** (`kiss_fftr` / `kiss_fftri` for real-valued signals). A custom **Cooley-Tukey FFT and IFFT** was also implemented from scratch in C (recursive, `complex double`, conjugate-based IFFT) and validated, but KissFFT was selected for the final pipeline due to its lower memory footprint on the Nios II.

</div>
<div class="lang-fr">

Le filtre opère dans le domaine fréquentiel sur des blocs de 1024 échantillons :

<img src="/lab4-audio/low_pass.png" alt="Filtre passe-bas dans le domaine fréquentiel : magnitude vs fréquence, bins au-dessus de la coupure mis à zéro" style="background:#ffffff;max-width:45%;display:block;margin:0 auto;" />

**FFT directe** → **mise à zéro des bins où `freq ≥ 20 kHz`** → **FFT inverse** → **normalisation par 1/N**

La fréquence de chaque bin est calculée comme `freq = (i × 48000/2) / 1024`. Avec un échantillonnage à 48 kHz, la limite de Nyquist est à 24 kHz — le filtre (coupure à 20 kHz) supprime donc la bande des ~4 kHz supérieurs, laissant la voix humaine et la majorité de la musique intacts.

La bibliothèque FFT utilisée est **KissFFT** (`kiss_fftr` / `kiss_fftri` pour les signaux réels). Une **FFT et IFFT de Cooley-Tukey** personnalisée a également été implémentée depuis zéro en C (récursive, `complex double`, IFFT par conjugaison) et validée, mais KissFFT a été retenu pour le pipeline final en raison de son empreinte mémoire plus faible sur le Nios II.

</div>

### Profiling

<div class="lang-en">

CPU profiling confirmed where time was being spent:

<img src="/lab4-audio/CPU0_profiling.JPG" alt="CPU0 profiling: 49% time in alt_up_audio_read_fifo, 33% in alt_up_audio_read_fifo_avail — audio FIFO polling dominates" style="max-width:70%;display:block;margin:0 auto;" />

<img src="/lab4-audio/CPU1_profiling.JPG" alt="CPU1 profiling: 20% in main loop, 19% in KissFFT subfunctions, 11% in alt_up_audio_write_fifo_space — DMA and FFT well-distributed" style="max-width:70%;display:block;margin:0 auto;" />

**CPU0**: ~82% of time spent in audio FIFO polling (`read_fifo` + `read_fifo_avail`). Expected — recording is entirely I/O-bound.

**CPU1**: time split across the main loop, KissFFT internals, and playback FIFO writes. The DMA transfers run in hardware in parallel, so their wall-clock cost is hidden from the CPU profile.

</div>
<div class="lang-fr">

Le profilage CPU a confirmé où le temps était dépensé :

<img src="/lab4-audio/CPU0_profiling.JPG" alt="Profilage CPU0 : 49% dans alt_up_audio_read_fifo, 33% dans alt_up_audio_read_fifo_avail — polling de la FIFO audio dominant" style="max-width:70%;display:block;margin:0 auto;" />

<img src="/lab4-audio/CPU1_profiling.JPG" alt="Profilage CPU1 : 20% dans la boucle principale, 19% dans les sous-fonctions KissFFT, 11% dans alt_up_audio_write_fifo_space" style="max-width:70%;display:block;margin:0 auto;" />

**CPU0** : ~82% du temps en polling de la FIFO audio (`read_fifo` + `read_fifo_avail`). Attendu — l'enregistrement est entièrement limité par les entrées/sorties.

**CPU1** : temps réparti entre la boucle principale, les internes de KissFFT et les écritures de la FIFO de lecture. Les transferts DMA s'exécutent en parallèle dans le matériel, donc leur coût réel est masqué dans le profilage CPU.

</div>

---

## Results & Assessment

<div class="lang-en">

**What worked:**

- The custom DMA transferred data correctly between SDRAM and on-chip memory in both directions, with proper Avalon back-pressure handling and IRQ signalling.
- The custom IRQ Sender successfully passed the SDRAM base address from CPU0 to CPU1 via hardware interrupt — zero polling, clean handoff.
- The full pipeline ran on hardware: record 10 s of audio, process all 480 k samples through FFT/filter/IFFT, play back the result.
- The custom Cooley-Tukey FFT/IFFT was independently validated against KissFFT output.

**Limitations:**

- **Not real-time**: the design is record-all → process → playback. Overlap between recording and processing would require double-buffering and more careful DMA chaining.
- **Trivial filter effect**: the cutoff at 20 kHz sits just below the Nyquist limit. The perceptual difference is minimal. A more interesting filter (e.g. 1–2 kHz to produce a telephone effect, or a notch filter) would have made the effect audible.
- **Blank spots in playback**: some 1024-sample windows came back corrupted — suspected cause is cache coherency between CPU1's on-chip writes and DMA reads. The Nios II data cache was not explicitly flushed before DMA transfers (`alt_dcache_flush` was available but not consistently applied).
- **Sequential design**: the pipeline processes one chunk completely before starting the next, rather than pipelining DMA 0 read, processing, and DMA 1 write in overlap.

</div>
<div class="lang-fr">

**Ce qui a fonctionné :**

- Le DMA personnalisé a transféré correctement les données entre la SDRAM et la mémoire on-chip dans les deux sens, avec gestion native de la contre-pression Avalon et signalisation IRQ.
- Le Custom IRQ Sender a transmis avec succès l'adresse de base SDRAM de CPU0 à CPU1 via interruption matérielle — zéro polling, transfert propre.
- Le pipeline complet a fonctionné sur le matériel : enregistrer 10 s d'audio, traiter les 480 k échantillons par FFT/filtre/IFFT, lire le résultat.
- La FFT/IFFT de Cooley-Tukey personnalisée a été validée indépendamment par rapport à la sortie de KissFFT.

**Limitations :**

- **Pas en temps réel** : la conception est enregistrer-tout → traiter → lire. Un chevauchement entre l'enregistrement et le traitement nécessiterait un double buffering et un enchaînement DMA plus soigné.
- **Effet de filtre trivial** : la coupure à 20 kHz est juste en dessous de la limite de Nyquist. La différence perceptible est minimale. Un filtre plus intéressant (ex. 1–2 kHz pour un effet téléphone, ou un filtre coupe-bande) aurait rendu l'effet audible.
- **Blancs dans la lecture** : certaines fenêtres de 1024 échantillons revenaient corrompues — cause supposée : cohérence de cache entre les écritures on-chip de CPU1 et les lectures DMA. Le cache de données du Nios II n'était pas explicitement vidé avant les transferts DMA (`alt_dcache_flush` était disponible mais pas systématiquement appliqué).
- **Conception séquentielle** : le pipeline traite un bloc complètement avant de commencer le suivant, sans chevauchement lecture DMA 0 / traitement / écriture DMA 1.

</div>

---

## Technical Stack

<div class="lang-en">

| Area | Details |
|---|---|
| Board | Intel DE1-SoC (Cyclone V FPGA + ARM HPS) |
| Processors | Dual Nios II (soft-core, one per Avalon bus domain) |
| FPGA language | VHDL |
| Bus protocol | Avalon (Master + Slave interfaces) |
| Audio CODEC | WM8731 at 48 kHz (I²S, 12.288 MHz PLL) |
| Custom IPs | Custom DMA (×2), Custom IRQ Sender (×1) |
| Software | C (Nios II HAL) |
| FFT library | KissFFT (real-valued, 1024-point) |
| Custom FFT | Cooley-Tukey recursive FFT/IFFT in C (validated) |
| IDE | Intel Quartus + Eclipse (Nios II EDS) |
| Course | EPFL Embedded Systems, June 2023 |
| Team | Two-person team |

</div>
<div class="lang-fr">

| Domaine | Détails |
|---|---|
| Carte | Intel DE1-SoC (FPGA Cyclone V + ARM HPS) |
| Processeurs | Dual Nios II (soft-core, un par domaine de bus Avalon) |
| Langage FPGA | VHDL |
| Protocole de bus | Avalon (interfaces Maître + Esclave) |
| CODEC audio | WM8731 à 48 kHz (I²S, PLL 12,288 MHz) |
| IPs personnalisées | DMA personnalisé (×2), IRQ Sender personnalisé (×1) |
| Logiciel | C (HAL Nios II) |
| Bibliothèque FFT | KissFFT (signal réel, 1024 points) |
| FFT personnalisée | Cooley-Tukey récursif FFT/IFFT en C (validé) |
| IDE | Intel Quartus + Eclipse (Nios II EDS) |
| Cours | EPFL Systèmes Embarqués, juin 2023 |
| Équipe | Équipe de deux personnes |

</div>
