---
title: 'Wasteflow — Controls & Systems Integration'
description: 'Real-time conveyor control systems bridging an AI vision layer with physical actuation in industrial waste-sorting facilities.'
image: 'wasteflow-logo.svg'
imageBg: '#ffffff'
logoMode: true
images: []
video: ''
link: ''
github: ''
tags: ['PLC', 'Python', 'Embedded', 'Industrial', 'Electrical Design', 'VFD', 'Robotics', 'Computer Vision']
featured: true
date: 'Sept 2024 – Present'
---

<script>
(function () {
  var FR = {
    'Overview': 'Vue d\'ensemble',
    'Conveyor Speed Control (POC)': 'Contrôle de vitesse des convoyeurs (POC)',
    'Alarm System Integration': 'Intégration du système d\'alarmes',
    'Robotic Arm for Hazardous Object Extraction': 'Bras robotique pour l\'extraction d\'objets dangereux',
    'Other Contributions': 'Autres contributions',
    'Stack': 'Stack technique',
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

[Wasteflow](https://wasteflow.ch) builds an AI-powered waste sorting system operating inside industrial recycling facilities. A computer vision pipeline classifies waste items in real time as they travel along conveyor belts — detecting material categories (paper, cardboard, plastics, wood, and more) as well as dangerous objects.

I work as a **Robotics and System Integration Engineer**, contributing across several independent projects. Details of ongoing work are not disclosed.

</div>
<div class="lang-fr">

[Wasteflow](https://wasteflow.ch) développe un système de tri des déchets assisté par IA, opérant dans des centres de tri industriels. Un pipeline de vision par ordinateur classifie les déchets en temps réel sur des convoyeurs — détectant les catégories de matériaux (papier, carton, plastiques, bois, etc.) ainsi que les objets dangereux.

J'occupe le poste d'**Ingénieur Robotique et Intégration Systèmes**, contribuant à plusieurs projets indépendants. Les détails des travaux en cours sont confidentiels.

</div>

---

## Conveyor Speed Control (POC)

<div class="lang-en">

The core project. Wasteflow's AI layer produces real-time waste quality metrics from the conveyor feed. The problem: translating those metrics into physical conveyor actuation to optimize sorting purity and throughput.

**What I built:**
- A **rule-based control algorithm** running on an industrial Linux PC, driving conveyor speed in response to AI quality outputs
- Full integration with a **Siemens PLC** for hardware I/O and a **VFD** for motor speed regulation
- A complete **lab conveyor testbed** built from scratch: electrical panel wiring (PLC, VFDs, power distribution, safety circuits), mechanical assembly, and end-to-end validation setup
- On-site installation and mechanical assembly at live facilities

**Outcome:** The system has been running daily at an industrial facility with measurable improvement in sorting output quality. Currently transitioning from POC to production evaluation.

</div>
<div class="lang-fr">

Le projet principal. La couche IA de Wasteflow produit des métriques de qualité des déchets en temps réel depuis le flux du convoyeur. Le problème : traduire ces métriques en actionnement physique du convoyeur pour optimiser la pureté de tri et le débit.

**Ce que j'ai construit :**
- Un **algorithme de contrôle à base de règles** tournant sur un PC industriel Linux, pilotant la vitesse du convoyeur en réponse aux sorties qualité de l'IA
- Intégration complète avec un **automate Siemens** pour les E/S matérielles et un **variateur de fréquence (VFD)** pour la régulation de vitesse des moteurs
- Un **banc d'essai convoyeur** complet construit de zéro : câblage du tableau électrique (automate, VFDs, distribution d'alimentation, circuits de sécurité), assemblage mécanique et validation bout en bout
- Installation sur site et assemblage mécanique dans des installations actives

**Résultat :** Le système tourne quotidiennement dans une installation industrielle avec une amélioration mesurable de la qualité de tri. Actuellement en transition du POC vers l'évaluation en production.

</div>

---

## Alarm System Integration

<div class="lang-en">

Integrated facility alarm towers with Wasteflow's backend system. Involved direct client communication to understand operational requirements and translate them into technical specifications — then coordinating between the backend team and the alarm hardware to implement them.

</div>
<div class="lang-fr">

Intégration des bornes d'alarme des installations avec le système backend de Wasteflow. Ce projet implique une communication directe avec les clients pour comprendre leurs besoins opérationnels et les traduire en spécifications techniques — puis la coordination entre l'équipe backend et le matériel d'alarme pour les implémenter.

</div>

---

## Robotic Arm for Hazardous Object Extraction

<div class="lang-en">

A separate R&D project in collaboration with [AICA](https://aica.tech) (industrial robotics software). The goal: automatically extract dangerous objects detected on the conveyor using a robotic arm.

**My contribution:**
- Integrated the arm into the detection pipeline: receiving object positions from the vision system, triggering conveyor stops, and managing safe resume sequences
- Used AICA's framework for arm control; focus was on the conveyor-arm synchronization logic

This project was a standalone exploration — not yet deployed.

<a href="https://www.linkedin.com/feed/update/urn:li:activity:7384485343238213632/" target="_blank" rel="noopener noreferrer" class="project-btn">Watch Demo</a>

</div>
<div class="lang-fr">

Un projet R&D distinct en collaboration avec [AICA](https://aica.tech) (logiciel de robotique industrielle). L'objectif : extraire automatiquement les objets dangereux détectés sur le convoyeur à l'aide d'un bras robotique.

**Ma contribution :**
- Intégration du bras dans le pipeline de détection : réception des positions d'objets depuis le système de vision, déclenchement des arrêts du convoyeur, et gestion des séquences de reprise sécurisée
- Utilisation du framework AICA pour le contrôle du bras ; focus sur la logique de synchronisation convoyeur-bras

Ce projet était une exploration autonome — non encore déployé.

<a href="https://www.linkedin.com/feed/update/urn:li:activity:7384485343238213632/" target="_blank" rel="noopener noreferrer" class="project-btn">Voir la démo</a>

</div>

---

## Other Contributions

<div class="lang-en">

- **Hardware evaluation**: assessing industrial cameras and embedded computing options for deployment in facility environments
- **CAD & mechanical**: designed parts and assemblies used in lab and facility setups
- **On-site operations**: participated in equipment installation, mounting, and commissioning at live facilities
- **Cross-functional support**: as a startup, roles overlap — contributing wherever needed across engineering, operations, and client-facing work

</div>
<div class="lang-fr">

- **Évaluation matérielle** : évaluation de caméras industrielles et d'options de calcul embarqué pour le déploiement en environnement industriel
- **CAO & mécanique** : conception de pièces et assemblages utilisés en laboratoire et sur site
- **Opérations sur site** : participation à l'installation, au montage et à la mise en service des équipements dans les installations actives
- **Support transversal** : dans une startup, les rôles se chevauchent — contribution selon les besoins en ingénierie, opérations et relation client

</div>

---

## Stack

<div class="lang-en">

| Area | Details |
|---|---|
| Control logic | Python, Siemens PLC |
| Motor control | Variable Frequency Drives (VFD) |
| Embedded platform | Industrial Linux PC |
| Robotics | AICA framework |
| Electrical | Panel wiring, PLC I/O, power distribution |
| Mechanical | CAD, conveyor assembly, facility installation |

</div>
<div class="lang-fr">

| Domaine | Détails |
|---|---|
| Logique de contrôle | Python, Automate Siemens |
| Contrôle moteur | Variateurs de fréquence (VFD) |
| Plateforme embarquée | PC industriel Linux |
| Robotique | Framework AICA |
| Électrique | Câblage tableau, E/S automate, distribution d'alimentation |
| Mécanique | CAO, assemblage convoyeur, installation sur site |

</div>
