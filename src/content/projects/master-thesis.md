---
title: 'Master Thesis — Multi-Hardness Silicone 3D Printer'
description: 'Sensor integration and closed-loop feedback enabling accurate multi-hardness silicone 3D printing for custom medical prosthetic liners — industry thesis at Swiss MotionTech / EPFL.'
image: 'motiontech-logo.png'
logoMode: true
images: []
video: ''
link: ''
github: ''
tags: ['Control Systems', 'Laser Sensing', 'Python', 'Medical', '3D Printing', 'Slicing Software']
featured: true
date: 'Feb – Sept 2024'
role: 'R&D Engineer Intern'
context: 'Industry Thesis — Swiss MotionTech / EPFL'
outcome: 'Closed-loop sensor feedback system enabling reliable multi-hardness silicone 3D printing for custom medical prosthetic liners'
---

<script>
(function () {
  var FR = {
    'Overview': 'Vue d\'ensemble',
    'What Was Built': 'Ce qui a été construit',
    'Supervisors': 'Encadrement',
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

Master's thesis conducted at **Swiss Motion Technologies SA**, supervised by Prof. Alexandre Schmid (EPFL).

Swiss MotionTech manufactures custom silicone prosthetic liners for amputees using an additive manufacturing process. The thesis addressed an unsolved accuracy problem in **multi-hardness silicone printing**: spatially varying hardness zones were drifting from their intended anatomical positions due to cumulative layer errors, making the prosthetic clinically inaccurate.

The work is conducted under a confidentiality agreement. Implementation details are not disclosed.

</div>
<div class="lang-fr">

Thèse de master réalisée chez **Swiss Motion Technologies SA**, sous la supervision du Prof. Alexandre Schmid (EPFL).

Swiss MotionTech fabrique des liners prothétiques en silicone personnalisés pour les amputés via un procédé de fabrication additive. La thèse a abordé un problème de précision non résolu dans l'**impression silicone multi-dureté** : les zones de dureté variable dérivaient de leurs positions anatomiques cibles en raison d'erreurs cumulatives de couche, rendant la prothèse cliniquement inexacte.

Ce travail est réalisé sous accord de confidentialité. Les détails d'implémentation ne sont pas divulgués.

</div>

## What Was Built

<div class="lang-en">

A **sensor-integrated closed-loop feedback system** that detects layer-level height errors in real time and corrects the silicone extrusion output dynamically — enabling reliable, patient-specific multi-hardness printing.

Key contributions:

- **Sensor evaluation**: benchmarked multiple sensing technologies (laser triangulation, confocal, time-of-flight, structured light, camera) through literature review and physical testing to select the most suitable approach for the constrained geometry
- **Sensor integration**: developed the measurement model and integrated the selected sensor into the printer's hardware and software stack
- **Slicing software integration** (Python): extended the company's internal slicing software to embed measurement checkpoints, incorporate real-time sensor feedback, and dynamically adjust volumetric extrusion output per layer
- **Closed-loop controller**: state-machine architecture that pauses, measures, computes deviation, adjusts output setpoints, and resumes — cycling through each print layer
- **Printer communication**: designed and implemented a custom protocol between the control software and the printer's microcontroller

</div>
<div class="lang-fr">

Un **système de retour en boucle fermée avec capteur intégré** qui détecte les erreurs de hauteur couche par couche en temps réel et corrige dynamiquement la sortie d'extrusion du silicone — permettant une impression multi-dureté fiable et personnalisée.

Contributions clés :

- **Évaluation des capteurs** : comparaison de plusieurs technologies de mesure (triangulation laser, confocale, temps de vol, lumière structurée, caméra) par revue de littérature et tests physiques, afin de sélectionner l'approche la plus adaptée à la géométrie contrainte
- **Intégration du capteur** : développement du modèle de mesure et intégration du capteur sélectionné dans le stack matériel et logiciel de l'imprimante
- **Intégration dans le logiciel de découpe** (Python) : extension du logiciel de découpe interne de l'entreprise pour intégrer des points de mesure, incorporer le retour capteur en temps réel, et ajuster dynamiquement le volume d'extrusion par couche
- **Contrôleur en boucle fermée** : architecture à machine d'états qui s'arrête, mesure, calcule la déviation, ajuste les consignes, et reprend — en itérant couche par couche
- **Communication avec l'imprimante** : conception et implémentation d'un protocole personnalisé entre le logiciel de contrôle et le microcontrôleur de l'imprimante

</div>

## Supervisors

<div class="lang-en">

Prof. Alexandre Schmid (EPFL), Swiss Motion Technologies SA

</div>
<div class="lang-fr">

Prof. Alexandre Schmid (EPFL), Swiss Motion Technologies SA

</div>
