---
title: 'EPFL Robot Competition 2023 — Duplo Brick Collector'
description: 'Fully autonomous robot for the annual EPFL robotics competition. Custom YOLOv5-S detector trained on 8500 synthetic images, Nav2 navigation, Google Cartographer SLAM — primarily in C++ on ROS 2.'
image: 'epfl-robot-competition/robot_real_c.jpg'
imagePosition: 'top'
images: []
video: ''
link: ''
github: 'https://github.com/AlbianSalihu/BudgetRoomba'
tags: ['Robotics', 'ROS 2', 'C++', 'Autonomous Navigation', 'Computer Vision', 'SLAM', 'Embedded', 'Competition']
featured: true
date: 'Feb – Jun 2023'
report: '/epfl-robot-competition/BudgetRoomba_report.pdf'
role: 'Electronics Lead & Software Contributor'
team: 'Team of 4'
context: 'EPFL Annual Robotics Competition'
outcome: '7 bricks collected, 4 successful drop-offs, zero obstacle collisions'
---

<script>
(function () {
  var FR = {
    'Overview': 'Vue d\'ensemble',
    'Competition Setup': 'Format de la compétition',
    'Mechanical Design': 'Conception Mécanique',
    'Three Generations': 'Trois générations',
    'Electronics': 'Électronique',
    'Software Architecture': 'Architecture Logicielle',
    'Localization': 'Localisation',
    'Navigation — Nav2': 'Navigation — Nav2',
    'Brick Detection — YOLOv5 on Coral TPU': 'Détection de briques — YOLOv5 sur Coral TPU',
    'Brick Management': 'Gestion des briques',
    'Competition Strategy': 'Stratégie de compétition',
    'Main State Machine': 'Machine d\'état principale',
    'Simulation': 'Simulation',
    'Power Consumption': 'Consommation électrique',
    'Results': 'Résultats',
    'Discussion': 'Discussion',
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

Team project for the annual EPFL Robotics Competition, organized by Prof. Auke Ijspeert's BioRob lab. The challenge: build a **fully autonomous robot** — named *Budget Roomba* — that navigates a 9×9 m arena, detects Duplo brick constructions, collects them, and deposits them in scoring zones, with no human intervention during the 10-minute run.

Our core philosophy: **robustness over ambition.** Rather than chasing high-risk high-value zones, the robot was optimized for consistent, reliable collection in the accessible zone — banking points every cycle regardless of what happened next.

</div>
<div class="lang-fr">

Projet d'équipe pour la compétition annuelle de robotique de l'EPFL, organisée par le laboratoire BioRob du Prof. Auke Ijspeert. Le défi : construire un robot **entièrement autonome** — baptisé *Budget Roomba* — capable de naviguer dans une arène de 9×9 m, détecter des constructions en briques Duplo, les collecter et les déposer dans des zones de score, sans aucune intervention humaine pendant les 10 minutes de course.

Notre philosophie centrale : **la robustesse avant l'ambition.** Plutôt que de viser des zones à haut risque et haute valeur, le robot a été optimisé pour une collecte fiable et cohérente dans la zone accessible, accumulant des points à chaque cycle.

</div>

## Competition Setup

<div class="lang-en">

The arena features four zones of increasing difficulty and point multiplier:

| Zone | Toys | Points/brick | Access |
|---|---|---|---|
| Zone 1 | 15 | 10 | Open floor, easiest |
| Zone 2 | 6 | 20 | Carpet — harder to navigate |
| Zone 3 | 6 | 40 | Behind a door requiring a button press |
| Zone 4 | 6 | 40 | Behind a ramp (B2) or steps (B3) |

Two collection points: **100%** zone (full points) and **50%** zone (half points). The robot must navigate, localize, detect Duplo constructions, collect them, release them in the correct area, and avoid all obstacles — minimum gap between obstacles is **500 mm**. The arena has 4 corner LED beacons (red, green, pink, blue) and is surrounded by walls.

</div>
<div class="lang-fr">

L'arène comporte quatre zones de difficulté croissante et de multiplicateur de points :

| Zone | Briques | Points/brique | Accès |
|---|---|---|---|
| Zone 1 | 15 | 10 | Sol plat, la plus simple |
| Zone 2 | 6 | 20 | Tapis — plus difficile à naviguer |
| Zone 3 | 6 | 40 | Derrière une porte nécessitant un bouton |
| Zone 4 | 6 | 40 | Derrière une rampe (B2) ou des marches (B3) |

Deux zones de dépôt : **100%** (points complets) et **50%** (moitié des points). Le robot doit naviguer, se localiser, détecter les constructions Duplo, les collecter, les déposer dans la bonne zone et éviter tous les obstacles. La distance minimale entre les obstacles est de **500 mm**. L'arène comporte 4 balises LED aux coins (rouge, vert, rose, bleu) et est entourée de murs.

</div>

<img src="/epfl-robot-competition/arena.png" alt="Arena layout with zones and collection points" />

### Competition Strategy

<div class="lang-en">

Our strategy follows a **greedy paradigm**: the robot searches, detects a construction, immediately collects it and drops it off — then restarts. Each drop-off is an independent transaction; a failure at any step loses only that one cycle, not accumulated points.

We deliberately targeted Zone 1 only (with Zone 2 as an optional extension if the dragging worked well enough), and explicitly excluded Zone 3 (door button required) and Zone 4 (ramp/steps). This was the right call for robustness: the obstacle avoidance margin was designed tightly (robot width 415 mm vs 500 mm minimum gap), and any additional complexity could break the whole run.

</div>
<div class="lang-fr">

Notre stratégie suit un **paradigme glouton** : le robot cherche, détecte une construction, la collecte immédiatement et la dépose — puis recommence. Chaque dépôt est une transaction indépendante ; un échec à n'importe quelle étape ne fait perdre qu'un cycle, pas les points accumulés.

Nous avons délibérément ciblé uniquement la Zone 1 (avec la Zone 2 comme extension optionnelle si le traînage fonctionnait suffisamment bien), en excluant explicitement la Zone 3 (bouton de porte requis) et la Zone 4 (rampe/marches). Ce choix était judicieux pour la robustesse : la marge d'évitement d'obstacles était conçue serrée (largeur du robot 415 mm vs 500 mm minimum), et toute complexité supplémentaire aurait pu compromettre la course entière.

</div>

## Mechanical Design

### Three Generations

<div class="lang-en">

The robot went through **three full mechanical iterations** driven by constraints discovered during testing.

**Gen 1 — Proof of concept**
MDF box (300×200×200 mm), motors mounted externally with 3D-printed parts. A servo-lifted heist door enabled backwards driving to unload bricks. Total width: **467 mm** — dangerously close to the 500 mm obstacle gap limit.

**Gen 2 — Width reduction**
Switched to a **HTD M5 belt drive** (475 mm belt, 9 mm wide, ball bearings, custom steel axle) to move motors inside the hull. The belt assembly mounts with 20 mm long slots for easy tensioning. Width reduced to **415 mm**. The heist door was dropped — nav software was used instead to avoid reversing with collected bricks.

**Gen 3 — Final**
Hull reduced to 300×200×150 mm after discovering the Lidar was mounted too high to detect the lower-than-announced arena walls. This also reduced ground clearance. MDF sidewalls replaced with **Plexiglas** (MDF was too soft; motor mounts slipped under load). A protective plate was added between the motors and collection space to prevent brick snagging. A **bumper was added behind each wheel** to prevent bricks from catching on the wheels when reversing. Funnel-shaped side panels with flexible **"claw" tips** guide bricks passively into the collection zone.

</div>
<div class="lang-fr">

Le robot a traversé **trois itérations mécaniques complètes**, guidées par les contraintes découvertes lors des tests.

**Gén. 1 — Preuve de concept**
Boîte en MDF (300×200×200 mm), moteurs montés à l'extérieur avec des pièces imprimées en 3D. Une porte relevée par servo permettait le recul pour décharger les briques. Largeur totale : **467 mm** — trop proche de la limite de 500 mm.

**Gén. 2 — Réduction de largeur**
Passage à une **courroie HTD M5** (475 mm, 9 mm de large, roulements à billes, axe acier sur mesure) pour placer les moteurs à l'intérieur du châssis. Largeur réduite à **415 mm**. La porte est abandonnée — le logiciel de navigation évite de reculer avec des briques collectées.

**Gén. 3 — Version finale**
Châssis réduit à 300×200×150 mm après découverte que le Lidar était trop haut pour détecter les murs annoncés. La garde au sol est également réduite. Les panneaux latéraux MDF sont remplacés par du **Plexiglas** (le MDF était trop mou). Une plaque de protection est ajoutée entre les moteurs et l'espace de collecte. Un **pare-chocs est ajouté derrière chaque roue** pour empêcher les briques de se coincer lors des marches arrière. Des panneaux latéraux en entonnoir avec des **"griffes" flexibles** guident passivement les briques.

</div>

<img src="/epfl-robot-competition/generations.png" alt="Three robot generations: Gen 1, Gen 2, Gen 3 (final)" />

<div class="video-grid">

<img src="/epfl-robot-competition/final_assembly.png" alt="Final robot CAD assembly — front view" />
<img src="/epfl-robot-competition/backview.png" alt="Back view showing belt drive and electronics placement" />

</div>

<div class="video-grid">

<img src="/epfl-robot-competition/transmission.png" alt="Belt drive transmission — exploded view and section analysis" />
<img src="/epfl-robot-competition/funnel.png" alt="Funnel implementation with flexible claw tips" />

</div>

<div class="video-grid">

<img src="/epfl-robot-competition/robot_real_a.jpg" alt="Real robot at competition — arena view" />
<img src="/epfl-robot-competition/robot_real_b.jpg" alt="Real robot with Duplo bricks in front" />

</div>

<img src="/epfl-robot-competition/robot_real_c.jpg" alt="Real robot on competition carpet" />

## Electronics

<div class="lang-en">

| Component | Model | Notes |
|---|---|---|
| Main computer | Raspberry Pi 4 (4 GB) | Ubuntu 22.04, overclocked to 2 GHz |
| Motors | Maxon EC 32 flat 15 W | 1:60 gearbox |
| Motor controllers | Maxon ESCON 24/2 | Software PWM ramp implemented on RPi |
| Lidar | RPLIDAR A1M8 | 8000 pts/rotation at 6.67 Hz |
| IMU | MPU9150 | 200 Hz, I2C |
| Camera | RPi Camera v2.1 | 1640×1232, downsampled to 640×480 |
| AI accelerator | Google Coral USB TPU | 20× inference speedup vs CPU |
| Lighting | 12 V white LED strip | Front-mounted for uniform illumination |

The ESCON controllers were wired to the RPi's GPIO via custom motor adapters. A software ramp was implemented on the RPi side (rather than using ESCON's internal ramp) so motor speeds could be monitored precisely at every 50 ms update step. Minimum motor activation was set to 100 RPM to avoid oscillation from Hall sensor low-resolution issues.

A note on reliability: the ESCON controllers are **very fragile** — 2 were broken during the project due to wiring errors. The power board also failed at one point and fried the Raspberry Pi; since no replacement was left in stock, the referee allowed us to use a personal RPi (same specifications) for the competition.

### Power Consumption

| Component | Current (A) | Qty |
|---|---|---|
| Maxon EC 32 flat motor | 1.06 – 3.0 | ×2 |
| Google Coral USB TPU | 0.9 | ×1 |
| RPi Camera v2.1 | 0.25 | ×1 |
| RPLIDAR A1M8 | 0.35 | ×1 |
| Raspberry Pi 4 | 1.2 | ×1 |

With a 30% safety margin: **6.27 – 11.31 A** total. On the 4000 mAh LiPo battery, estimated runtime **21 – 38 minutes** — sufficient for one full competition run.

</div>
<div class="lang-fr">

| Composant | Modèle | Notes |
|---|---|---|
| Ordinateur principal | Raspberry Pi 4 (4 Go) | Ubuntu 22.04, overclocké à 2 GHz |
| Moteurs | Maxon EC 32 flat 15 W | Réducteur 1:60 |
| Contrôleurs moteur | Maxon ESCON 24/2 | Rampe PWM logicielle implémentée sur RPi |
| Lidar | RPLIDAR A1M8 | 8000 pts/rotation à 6,67 Hz |
| IMU | MPU9150 | 200 Hz, I2C |
| Caméra | RPi Camera v2.1 | 1640×1232, réduite à 640×480 |
| Accélérateur IA | Google Coral USB TPU | ×20 par rapport au CPU |
| Éclairage | Bande LED blanche 12 V | Montée à l'avant pour illumination uniforme |

Une rampe logicielle est implémentée côté RPi (plutôt qu'utiliser la rampe interne ESCON) pour surveiller précisément les vitesses moteur à chaque pas de 50 ms. L'activation moteur minimale est fixée à 100 RPM pour éviter les oscillations dues à la faible résolution des capteurs Hall.

Note de fiabilité : les contrôleurs ESCON sont **très fragiles** — 2 ont été cassés pendant le projet suite à des erreurs de câblage. La carte d'alimentation a également lâché et a grillé le Raspberry Pi ; faute de remplacement en stock, l'arbitre nous a autorisés à utiliser un RPi personnel (mêmes spécifications) pour la compétition.

### Consommation électrique

| Composant | Courant (A) | Qté |
|---|---|---|
| Moteur Maxon EC 32 flat | 1,06 – 3,0 | ×2 |
| Google Coral USB TPU | 0,9 | ×1 |
| RPi Camera v2.1 | 0,25 | ×1 |
| RPLIDAR A1M8 | 0,35 | ×1 |
| Raspberry Pi 4 | 1,2 | ×1 |

Avec une marge de 30% : **6,27 – 11,31 A** total. Sur la batterie LiPo 4000 mAh, autonomie estimée **21 – 38 minutes** — suffisant pour une course complète.

</div>

## Software Architecture

<div class="lang-en">

Written primarily in **C++** with Python for detection and dataset generation, running **ROS 2 Humble**. Six modular packages communicate over ROS topics:

| Package | Role |
|---|---|
| `br_description` | TF coordinate frame tree (base_link, nav_unitbase_link, lidar, IMU) |
| `br_drivers` | Hardware drivers: motors (PWM/GPIO via pigpio), IMU (I2C), Lidar, camera |
| `br_state_estimation` | EKF odometry (robot_localization) + Google Cartographer online SLAM |
| `br_navigation` | Nav2 stack: A* global planner + Regulated Pure Pursuit local controller |
| `br_brick_management` | Grid-map detection confidence accumulation and reachability tracking |
| `br_brain` | SEARCHING / COLLECTING state machine |

Two ROS packages (`br_simulation`, `arena_gazebo`) implement a Gazebo simulation built from the second week of the semester, enabling software development before the physical robot was ready. The simulation includes a full arena model (walls, carpet zones, corner LEDs) and robot model (Lidar, IMU, camera, differential drive). Hardware-in-the-loop tests connecting the simulation on a workstation to the physical RPi over WiFi were attempted but the network latency for Lidar and camera data made this unworkable.

</div>
<div class="lang-fr">

Principalement écrit en **C++** avec Python pour la détection et la génération de dataset, tournant sous **ROS 2 Humble**. Six paquets modulaires communiquent via des topics ROS :

| Paquet | Rôle |
|---|---|
| `br_description` | Arbre de repères TF (base_link, nav_unitbase_link, lidar, IMU) |
| `br_drivers` | Pilotes matériels : moteurs (PWM/GPIO via pigpio), IMU (I2C), Lidar, caméra |
| `br_state_estimation` | Odométrie EKF (robot_localization) + SLAM en ligne Google Cartographer |
| `br_navigation` | Stack Nav2 : planificateur global A* + contrôleur local Regulated Pure Pursuit |
| `br_brick_management` | Accumulation de confiance de détection sur grille et suivi d'accessibilité |
| `br_brain` | Machine d'état SEARCHING / COLLECTING |

Deux paquets ROS (`br_simulation`, `arena_gazebo`) implémentent une simulation Gazebo construite dès la deuxième semaine du semestre, permettant le développement logiciel avant que le robot physique soit prêt. Elle inclut une arène complète (murs, zones tapis, LEDs d'angle) et un modèle de robot (Lidar, IMU, caméra, entraînement différentiel). Des tests hardware-in-the-loop reliant la simulation sur workstation au RPi physique via WiFi ont été tentés mais la latence réseau pour les données Lidar et caméra les a rendus impraticables.

</div>

<img src="/epfl-robot-competition/simulation.png" alt="Gazebo simulation with arena and robot" />

### Localization

<div class="lang-en">

Two-layer state estimation:

**EKF Odometry** (`robot_localization`): fuses wheel speed (fed-forward as pseudo-odometry from motor commands) and IMU data in differential mode. Drifts ~1 m over a full 10-minute run — useful for short-term dead-reckoning between SLAM corrections. The robot starts with a forced 360° spin to seed the Cartographer map.

**Online SLAM** (Google Cartographer + Lidar): global accuracy ~15 cm over the full competition run. Turning rate was capped at **0.25 rad/s** — faster turns caused mapping artifacts that corrupted the state estimate. The SLAM pose is computed in a `map` frame fixed to the robot's start position, linked to the `arena` frame via a static transform.

</div>
<div class="lang-fr">

Estimation d'état en deux couches :

**Odométrie EKF** (`robot_localization`) : fusionne la vitesse des roues (générée en feed-forward à partir des commandes moteur) et les données IMU en mode différentiel. Dérive d'environ 1 m sur une course de 10 minutes — utile pour le dead-reckoning entre corrections SLAM. Le robot effectue une rotation de 360° au démarrage pour initialiser la carte Cartographer.

**SLAM en ligne** (Google Cartographer + Lidar) : précision globale ~15 cm sur toute la course. La vitesse de rotation est limitée à **0,25 rad/s** — des virages plus rapides provoquaient des artefacts de cartographie. La pose SLAM est calculée dans un repère `map` fixe, lié au repère `arena` via un transform statique.

</div>

### Navigation — Nav2

<div class="lang-en">

Two-layer Nav2 stack:

| Parameter | Global Planner | Local Controller |
|---|---|---|
| Costmap size | 9×9 m | 3×3 m rolling window |
| Resolution | 5 cm/cell | 2 cm/cell |
| Algorithm | A* | Regulated Pure Pursuit |
| Update frequency | 0.5 Hz | 5 Hz |
| Accuracy | 0.15 m | 0.1 m / 0.1 rad |
| Horizon | ∞ | 0.7 m |

Key design decisions:
- Costmaps inflated by **50 cm** to absorb worst-case localization error
- Dynamic constraints: **0.3 m/s** linear velocity, **0.25 rad/s** angular velocity
- The controller **never drives backwards** under Nav2 control — collected bricks cannot fall out
- Carpet and restricted zones are statically marked as obstacles in the costmap
- A custom minimal Behavior Tree replaces the default (the default was designed for dynamic environments and added unnecessary overhead)

</div>
<div class="lang-fr">

Stack Nav2 en deux couches :

| Paramètre | Planificateur global | Contrôleur local |
|---|---|---|
| Taille de costmap | 9×9 m | Fenêtre glissante 3×3 m |
| Résolution | 5 cm/cellule | 2 cm/cellule |
| Algorithme | A* | Regulated Pure Pursuit |
| Fréquence | 0,5 Hz | 5 Hz |
| Précision | 0,15 m | 0,1 m / 0,1 rad |
| Horizon | ∞ | 0,7 m |

Décisions de conception clés :
- Costmaps dilatées de **50 cm** pour absorber l'erreur de localisation maximale
- Contraintes dynamiques : **0,3 m/s** en translation, **0,25 rad/s** en rotation
- Le contrôleur **ne recule jamais** sous contrôle Nav2 — les briques collectées ne peuvent pas tomber
- Les zones tapis et restreintes sont marquées statiquement comme obstacles dans la costmap
- Un Behavior Tree minimal personnalisé remplace celui par défaut

</div>

### Brick Detection — YOLOv5 on Coral TPU

<div class="lang-en">

**Architecture**: YOLOv5-S compiled for the Google Coral USB TPU. Input: 320×320.

**Dataset — 8500 synthetic samples** generated with a fully procedural pipeline:
1. Duplo brick STL models created with *Doblo Factory* (OpenSCAD-based generator)
2. Brick sizes k×2 with k ∈ {2, 3, 4, 6, 8, 10}; random legal constructions assembled programmatically
3. Camera placed above bricks (bird's-eye view) with `pyrender`; bounding boxes auto-generated from camera model
4. Ground textures from Pexels; adversarial samples with color shifts, noise, and rotations

**Training**: 4 epochs on an NVIDIA GTX 1060 6 GB (~20 minutes), batch size 16, validation split 5.9%, `int8` datatype. The trained model is recompiled for the Coral TPU by the Ultralytics YOLO toolchain, which reduces input size to 320×320.

**Sliding window inference**: the 640×480 image is split into **6 overlapping 320×320 patches** (160 px stride). Bounding boxes are merged across patches with OpenCV NMS.

**Pixel-to-robot-frame mapping**: camera calibrated with a bird's-eye warp + linear-affine transform mapping pixel (u, v) → robot-frame (x, y). Accuracy: low-cm range. A black bar was added to the lower image region to mask bricks stuck in the funnel (preventing false trigger on already-collected bricks).

</div>
<div class="lang-fr">

**Architecture** : YOLOv5-S compilé pour le Google Coral USB TPU. Entrée : 320×320.

**Dataset — 8500 échantillons synthétiques** générés par un pipeline entièrement procédural :
1. Modèles STL de briques Duplo créés avec *Doblo Factory* (générateur OpenSCAD)
2. Briques k×2 avec k ∈ {2, 3, 4, 6, 8, 10} ; constructions légales aléatoires assemblées programmatiquement
3. Caméra placée au-dessus (vue zénithale) avec `pyrender` ; boîtes englobantes générées automatiquement à partir du modèle de caméra
4. Textures de sol depuis Pexels ; échantillons adversariaux avec décalages de couleur, bruit et rotations

**Entraînement** : 4 epochs sur NVIDIA GTX 1060 6 Go (~20 minutes), batch 16, validation split 5,9%, type `int8`. Le modèle entraîné est recompilé pour le Coral TPU par la toolchain YOLO Ultralytics, ce qui réduit la taille d'entrée à 320×320.

**Inférence par fenêtre glissante** : l'image 640×480 est découpée en **6 patches 320×320** chevauchants (stride 160 px). Les boîtes englobantes sont fusionnées via NMS OpenCV.

**Projection pixel → repère robot** : caméra calibrée avec un warp vue d'oiseau + transform linéaire-affine. Précision : quelques cm. Une barre noire masque la région inférieure de l'image pour ignorer les briques bloquées dans l'entonnoir.

</div>

<div class="video-grid">

<img src="/epfl-robot-competition/detection.png" alt="YOLOv5 brick detection — patch cropping and merged detections" />
<img src="/epfl-robot-competition/detection_rviz.png" alt="Brick detections visualized in RViz as 3D markers" />
</div>

### Brick Management

<div class="lang-en">

A grid map (9×9 m, 5 cm/cell, ETHZ `grid_map` library) with two layers, processed at **5 Hz**:
- **"bricks" layer**: detection confidence accumulated with a cosine kernel (zero at boundary — avoids discontinuities). Decays each update to suppress single-frame false positives. When the system is in `ACTIVE` state and a cell exceeds the threshold, a brick-detection interrupt is sent to `br_brain` and the state is set to `PASSIVE` (suppressing further detections during collection). Reset to `ACTIVE` by `br_brain` after drop-off.
- **"valid" layer**: linked to Nav2's global costmap — only detections in reachable, non-obstacle cells are registered. Prevents chasing bricks that can never be reached.

</div>
<div class="lang-fr">

Une carte grille (9×9 m, 5 cm/cellule, bibliothèque `grid_map` de l'ETHZ) avec deux couches, traitées à **5 Hz** :
- **Couche "bricks"** : confiance de détection accumulée avec un noyau cosinus (zéro en bordure — évite les discontinuités). Décroît à chaque mise à jour pour supprimer les faux positifs sur un seul frame. Lorsque le système est en état `ACTIVE` et qu'une cellule dépasse le seuil, une interruption est envoyée à `br_brain` et l'état passe à `PASSIVE` (supprimant les nouvelles détections pendant la collecte). Remis à `ACTIVE` par `br_brain` après le dépôt.
- **Couche "valid"** : liée à la costmap globale Nav2 — seules les détections dans des cellules accessibles et non-obstacles sont enregistrées. Évite de poursuivre des briques inaccessibles.

</div>

### Main State Machine

<div class="lang-en">

Two states:

**SEARCHING**: robot follows a fixed waypoint grid covering the arena. On each waypoint: if unreachable, skip. On brick detection interrupt: check path feasibility via `ComputePathThroughPoses` with a 2-point list — [detected brick position, drop-off pose (0.75 m, 0.75 m, −135°)]. If reachable → switch to COLLECTING.

**COLLECTING**: navigate to brick then to drop-off via `FollowWaypoints`. Back off 60 cm using a direct velocity command (bypassing Nav2 to allow reversing) to unload. Return to SEARCHING. Any failure at any step safely returns to SEARCHING — points already scored are never lost.

</div>
<div class="lang-fr">

Deux états :

**SEARCHING** : le robot suit une grille de waypoints couvrant l'arène. Sur chaque waypoint : si inaccessible, ignorer. Sur interruption de détection de brique : vérification de faisabilité du chemin via `ComputePathThroughPoses` avec une liste de 2 points — [position de la brique détectée, pose de dépôt (0,75 m, 0,75 m, −135°)]. Si accessible → passage en COLLECTING.

**COLLECTING** : naviguer vers la brique puis vers la zone de dépôt via `FollowWaypoints`. Reculer de 60 cm par commande de vitesse directe (contournant Nav2 pour autoriser le recul) pour décharger. Retour en SEARCHING. Tout échec à n'importe quelle étape retourne sûrement en SEARCHING — les points déjà marqués ne sont jamais perdus.

</div>

## Results

<div class="lang-en">

| Rank | Team | Score |
|---|---|---|
| 1 | Team 4 | 345 |
| 2 | Team 1 | 320 |
| 3 | Team 6 | 285 |
| **4** | **Budget Roomba (Team 2)** | **147.5** |
| 5 | Team 3 | 0 |
| 6 | Team 5 | N/A |

**7 bricks collected** including all 3 bonus bricks — **4 successful drop-off sequences**. Zero obstacle collisions throughout the run.

A slight drift in state estimation caused some bricks to land on the edge of the 50% zone rather than the 100% zone, counted at the lower multiplier by the referee. The higher-ranked teams not only accessed zones 2 and 3 but also consistently dropped bricks in the 100% zone — those two factors explain the score gap. Our Zone 1 collection rate was high and reliable throughout.

On obstacle avoidance, *Budget Roomba* actually outperformed higher-scoring teams: some Ultra-Sound sensor based robots moved the potted-plant obstacles during the run, while our robot maintained a safe margin at all times.

Prof. Ijspeert described this edition as **"the best competition ever"** in terms of points scored — prior years saw most robots collect nearly nothing. My responsibility in the team was **electronics design and integration** (ESCON wiring, power distribution, sensor interfacing, PCB schematic).

</div>
<div class="lang-fr">

| Rang | Équipe | Score |
|---|---|---|
| 1 | Équipe 4 | 345 |
| 2 | Équipe 1 | 320 |
| 3 | Équipe 6 | 285 |
| **4** | **Budget Roomba (Équipe 2)** | **147,5** |
| 5 | Équipe 3 | 0 |
| 6 | Équipe 5 | N/A |

**7 briques collectées** dont les 3 briques bonus — **4 séquences de dépôt réussies**. Zéro collision avec les obstacles pendant toute la course.

Une légère dérive de l'estimation d'état a fait atterrir certaines briques sur le bord de la zone à 50% plutôt que 100%, comptées au multiplicateur inférieur par l'arbitre. Les équipes mieux classées non seulement ont accédé aux zones 2 et 3, mais ont aussi déposé leurs briques systématiquement dans la zone à 100% — ces deux facteurs expliquent l'écart de score. Notre taux de collecte en Zone 1 était élevé et fiable tout au long de la course.

Sur l'évitement d'obstacles, *Budget Roomba* a en réalité surpassé les équipes mieux classées : certains robots à capteurs ultrasoniques ont déplacé les plantes-obstacles pendant la course, tandis que notre robot a maintenu une marge de sécurité suffisante en permanence.

Le Prof. Ijspeert a décrit cette édition comme **"la meilleure compétition jamais organisée"** en termes de points marqués — les années précédentes, la plupart des robots ne collectaient presque rien. Ma responsabilité dans l'équipe était la **conception et l'intégration électronique** (câblage ESCON, distribution d'alimentation, interfaçage des capteurs, schéma PCB).

</div>

## Discussion

<div class="lang-en">

Our expectations set in the concept phase were fully achieved — but in hindsight, they were too conservative. The robustness goal was met: the robot delivered consistent results across many test runs and during the competition itself, with zero false-positive brick collections and zero obstacle collisions. The overall simplicity of the mechanical design was a key enabler — it allowed us to have a working first prototype early, incorporate lessons from the rehearsal competition (score: 2.5, 3rd place), and rebuild the third-generation robot from scratch in just 6 days before the final event.

In a future competition, we would keep the robustness-first philosophy but raise ambitions on zone coverage. We over-engineered obstacle avoidance (both in software safety margins and robot slimness) relative to what the actual competition layout required — the obstacles were placed further apart than the rulebook minimum, and higher-scoring teams touched them without penalty.

The project was also a strong learning opportunity: it was one of the few at EPFL that required building a complete system from hardware to software from scratch, including manufacturing, embedded control, computer vision, and full-stack ROS 2 integration.

</div>
<div class="lang-fr">

Nos attentes de la phase de conception ont été pleinement atteintes — mais rétrospectivement, elles étaient trop conservatives. L'objectif de robustesse a été atteint : le robot a délivré des résultats constants lors de nombreuses courses tests et pendant la compétition, sans aucune fausse détection de brique ni collision avec les obstacles. La simplicité globale de la conception mécanique a été un facteur clé — elle nous a permis d'avoir un premier prototype fonctionnel tôt, d'intégrer les leçons de la compétition de répétition (score : 2,5, 3e place), et de reconstruire le robot de troisième génération en seulement 6 jours avant l'événement final.

Dans une future compétition, nous garderions la philosophie de robustesse prioritaire, mais augmenterions les ambitions sur la couverture des zones. Nous avons sur-optimisé l'évitement d'obstacles (en termes de marges de sécurité logicielles et de finesse du robot) par rapport à ce que le layout réel de la compétition exigeait — les obstacles étaient placés plus loin que le minimum du règlement, et les équipes mieux classées les ont touchés sans pénalité.

Le projet a également été une forte opportunité d'apprentissage : c'est l'un des rares à l'EPFL qui requiert de construire un système complet du matériel au logiciel depuis zéro, incluant la fabrication, le contrôle embarqué, la vision par ordinateur, et l'intégration ROS 2 complète.

</div>
