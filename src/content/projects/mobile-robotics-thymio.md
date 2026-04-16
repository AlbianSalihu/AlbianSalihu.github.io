---
title: 'ThymiAir — Autonomous Mobile Robot Navigation'
description: 'Fully autonomous Thymio robot navigating a physical arena: computer vision pipeline, visibility graph + Dijkstra path planning, Extended Kalman Filter for pose estimation, and reactive obstacle avoidance. EPFL MICRO-452.'
image: 'mobile-robotics/testimg2.jpg'
images: []
video: ''
link: ''
github: 'https://github.com/AlbianSalihu/Thymiair'
tags: ['Python', 'Robotics', 'Computer Vision', 'Kalman Filter', 'Path Planning', 'OpenCV', 'Thymio', 'Mobile Robotics']
featured: false
date: 'Fall 2022'
---

<script>
(function () {
  var FR = {
    'Overview': 'Vue d\'ensemble',
    'System Architecture': 'Architecture du système',
    'Vision': 'Vision',
    'Global Navigation': 'Navigation globale',
    'Extended Kalman Filter': 'Filtre de Kalman étendu',
    'Motion Control & FSM': 'Contrôle & Machine à états',
    'Results & Assessment': 'Résultats & Bilan',
    'Technical Stack': 'Stack technique',
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

Group project for the EPFL *Mobile Robotics* course (MICRO-452), developed as part of a four-person team.

A **Thymio robot** navigates a physical arena autonomously from a start position to a goal, avoiding obstacles, using an overhead camera. The system integrates four independent modules built from scratch in Python: computer vision, global path planning, state estimation, and motion control. My primary ownership was the navigation module — obstacle inflation, visibility graph, and Dijkstra — with contributions across vision, state estimation, and system integration.

</div>
<div class="lang-fr">

Projet de groupe pour le cours *Mobile Robotics* de l'EPFL (MICRO-452), réalisé en équipe de quatre personnes.

Un robot **Thymio** navigue de manière autonome dans une arène physique depuis une position de départ jusqu'à un objectif, en évitant les obstacles, grâce à une caméra en surplomb. Le système intègre quatre modules indépendants construits depuis zéro en Python : vision par ordinateur, planification de chemin globale, estimation d'état et contrôle du mouvement. J'ai eu la responsabilité principale du module de navigation — inflation des obstacles, graphe de visibilité et Dijkstra — avec des contributions à la vision, l'estimation d'état et l'intégration système.

</div>

---

## System Architecture

<div class="lang-en">

The robot operates through a finite state machine with three states: **IDLE → Global → Local**.

- **Global**: camera snapshot → vision → path planning → shortest path computed once
- **Local**: follow waypoints using Kalman-filtered pose estimate; proximity sensors trigger avoidance
- **Avoidance**: spin away from obstacle, return to Global for replanning

</div>
<div class="lang-fr">

Le robot fonctionne via une machine à états finis à trois états : **IDLE → Global → Local**.

- **Global** : capture caméra → vision → planification → chemin le plus court calculé une fois
- **Local** : suivre les waypoints en utilisant l'estimée de pose filtrée par Kalman ; les capteurs de proximité déclenchent l'évitement
- **Évitement** : tourner pour s'écarter de l'obstacle, retour en Global pour replanifier

</div>

---

## Vision

<div class="lang-en">

The vision module detects three things from a single overhead camera frame: obstacles (rectangles), goal (triangle), and the Thymio itself (two colored dots).

**Pipeline:**
1. Convert RGB frame to **HSV** colorspace — saturation is the most stable discriminator between colored objects and the background
2. Apply saturation threshold → binary mask
3. Median blur + morphological erode/dilate to remove noise and consolidate regions
4. `cv2.findContours` (Suzuki et al. 1985 topological analysis)
5. `cv2.approxPolyDP` with 4% arc-length tolerance to simplify each contour to a polygon
6. Classify by **corner count + area**:
   - Obstacles: 4 corners, area 10k–50k px
   - Goal: 3 corners (triangle), area 10k–70k px
   - Thymio: two circular dots (≥5 corners each), large dot 5k–18k px, small dot 800–5k px, inter-dot distance < 200 px

**Thymio orientation:** vector from large dot center to small dot center → `arctan2` → heading angle in radians.

The vision module went through **15 iterations** (`vision_09.py` → `vision_15.py`) before reaching a version reliable enough to run on the physical robot. The main challenge was distinguishing Thymio's dots from background objects under variable lighting.

<img src="/astro-darkness/mobile-robotics/testimg2.jpg" alt="Raw arena image" style="max-width:80%;display:block;margin:0 auto;" />

<img src="/astro-darkness/mobile-robotics/vis.HSV_image.png" alt="HSV-filtered image" style="max-width:80%;display:block;margin:0 auto;" />

<img src="/astro-darkness/mobile-robotics/vis.binary_image.png" alt="Binary image after morphological processing" style="max-width:80%;display:block;margin:0 auto;" />

<img src="/astro-darkness/mobile-robotics/vis.all_markers.png" alt="Detected obstacles, goal, and Thymio overlaid" style="max-width:80%;display:block;margin:0 auto;" />

</div>
<div class="lang-fr">

Le module de vision détecte trois choses depuis une seule image de caméra en surplomb : les obstacles (rectangles), l'objectif (triangle) et le Thymio lui-même (deux points colorés).

**Pipeline :**
1. Conversion RGB → **HSV** — la saturation est le discriminant le plus stable entre les objets colorés et le fond
2. Seuillage de saturation → masque binaire
3. Flou médian + érosion/dilatation morphologique pour réduire le bruit et consolider les régions
4. `cv2.findContours` (algorithme topologique de Suzuki et al. 1985)
5. `cv2.approxPolyDP` avec 4% de tolérance sur la longueur d'arc pour simplifier chaque contour en polygone
6. Classification par **nombre de coins + aire** :
   - Obstacles : 4 coins, aire 10k–50k px
   - Objectif : 3 coins (triangle), aire 10k–70k px
   - Thymio : deux points circulaires (≥5 coins chacun), grand point 5k–18k px, petit point 800–5k px, distance inter-points < 200 px

**Orientation du Thymio :** vecteur du centre du grand point vers le centre du petit point → `arctan2` → angle de cap en radians.

Le module de vision a traversé **15 itérations** (`vision_09.py` → `vision_15.py`) avant d'atteindre une version suffisamment fiable pour fonctionner sur le robot physique. Le principal défi était de distinguer les points du Thymio des objets de fond sous un éclairage variable.

<img src="/astro-darkness/mobile-robotics/testimg2.jpg" alt="Image brute de l'arène" style="max-width:80%;display:block;margin:0 auto;" />

<img src="/astro-darkness/mobile-robotics/vis.HSV_image.png" alt="Image filtrée en HSV" style="max-width:80%;display:block;margin:0 auto;" />

<img src="/astro-darkness/mobile-robotics/vis.binary_image.png" alt="Image binaire après traitement morphologique" style="max-width:80%;display:block;margin:0 auto;" />

<img src="/astro-darkness/mobile-robotics/vis.all_markers.png" alt="Obstacles, objectif et Thymio détectés superposés" style="max-width:80%;display:block;margin:0 auto;" />

</div>

---

## Global Navigation

<div class="lang-en">

**Step 1 — Obstacle inflation:** each obstacle is expanded outward from its centroid by `THYMIO_SIZE = 140 px` (robot radius). The inflated corners define the visibility graph nodes; the actual filled area used for collision checking is slightly smaller (140 − 12 = 128 px margin) to allow the robot to pass parallel to an obstacle wall.

**Step 2 — Visibility graph:** for every pair of nodes (obstacle corners + start + goal), check if the straight line between them passes through any black pixel — pixel-by-pixel along a unit vector. If no black pixel exists between two points, they are connected with weight = Euclidean distance.

**Step 3 — Dijkstra:** standard single-source shortest path over the visibility graph. Called once at startup (or after obstacle avoidance triggers a replan).

**Step 4 — Path output:** reversed list of waypoint coordinates in image-pixel space, passed to the motion controller.

<img src="/astro-darkness/mobile-robotics/augmented.jpg" alt="Inflated obstacles — binary image used for visibility checking" style="max-width:80%;display:block;margin:0 auto;" />

<img src="/astro-darkness/mobile-robotics/visibility.jpg" alt="Visibility graph — blue lines connect mutually visible nodes" style="max-width:80%;display:block;margin:0 auto;" />

<img src="/astro-darkness/mobile-robotics/path.jpg" alt="Shortest path computed by Dijkstra" style="max-width:80%;display:block;margin:0 auto;" />

</div>
<div class="lang-fr">

**Étape 1 — Inflation des obstacles :** chaque obstacle est étendu vers l'extérieur depuis son centroïde de `THYMIO_SIZE = 140 px` (rayon du robot). Les coins gonflés définissent les nœuds du graphe de visibilité ; la zone remplie utilisée pour la vérification des collisions est légèrement plus petite (140 − 12 = 128 px) pour permettre au robot de passer parallèlement à une paroi d'obstacle.

**Étape 2 — Graphe de visibilité :** pour chaque paire de nœuds (coins d'obstacles + départ + objectif), vérification si la ligne droite entre eux traverse un pixel noir — pixel par pixel le long d'un vecteur unitaire. Si aucun pixel noir n'existe entre deux points, ils sont connectés avec un poids = distance euclidienne.

**Étape 3 — Dijkstra :** plus court chemin à source unique standard sur le graphe de visibilité. Appelé une fois au démarrage (ou après qu'un évitement d'obstacle déclenche une replanification).

**Étape 4 — Sortie de chemin :** liste inversée de coordonnées de waypoints en espace pixel-image, transmise au contrôleur de mouvement.

<img src="/astro-darkness/mobile-robotics/augmented.jpg" alt="Obstacles gonflés — image binaire utilisée pour la vérification de visibilité" style="max-width:80%;display:block;margin:0 auto;" />

<img src="/astro-darkness/mobile-robotics/visibility.jpg" alt="Graphe de visibilité — les lignes bleues connectent les nœuds mutuellement visibles" style="max-width:80%;display:block;margin:0 auto;" />

<img src="/astro-darkness/mobile-robotics/path.jpg" alt="Chemin le plus court calculé par Dijkstra" style="max-width:80%;display:block;margin:0 auto;" />

</div>

---

## Extended Kalman Filter

<div class="lang-en">

The Thymio's pose (x, y, θ) is estimated at each timestep by fusing odometry with camera measurements using an Extended Kalman Filter.

**Motion model** (nonlinear unicycle, linearized around current state):

The state transition and its Jacobian A:

$$\vec{x}_{k+1} = A \cdot \vec{x}_k + B \cdot \vec{u}$$

where:
- $\Delta s = \text{conv} \cdot (v_L + v_R) \cdot T_s / 2$ — forward displacement
- $\Delta\theta = \text{conv} \cdot (v_R - v_L) \cdot T_s / b$ — angular change ($b = 100$ mm wheelbase)
- $T_s = 0.1$ s sampling period, speed conversion factor = $0.4 \times 84/50$

A and B are derived by linearizing the nonlinear unicycle equations at the current estimate.

**Noise tuning:**
- Process noise Q: $q_{px} = q_{py} = q_\theta = 2$ (odometry is untrustworthy)
- Measurement noise R: $r_{px} = r_{py} = r_\theta = 0.1$ (camera is trusted ~20× more than odometry)

**Update step:** only executed when the camera detection flag = 1 (Thymio successfully found). When the camera is occluded, the filter runs in predict-only mode using odometry alone — the robot stays on course but uncertainty grows until the camera recovers.

The H matrix is the identity (the camera directly observes the full state x, y, θ), which simplifies the update equations considerably.

</div>
<div class="lang-fr">

La pose du Thymio (x, y, θ) est estimée à chaque pas de temps en fusionnant l'odométrie avec les mesures caméra grâce à un filtre de Kalman étendu.

**Modèle de mouvement** (modèle unicycle non linéaire, linéarisé autour de l'état courant) :

La transition d'état et son Jacobien A :

$$\vec{x}_{k+1} = A \cdot \vec{x}_k + B \cdot \vec{u}$$

où :
- $\Delta s = \text{conv} \cdot (v_L + v_R) \cdot T_s / 2$ — déplacement vers l'avant
- $\Delta\theta = \text{conv} \cdot (v_R - v_L) \cdot T_s / b$ — variation angulaire ($b = 100$ mm voie)
- $T_s = 0.1$ s période d'échantillonnage, facteur de conversion = $0.4 \times 84/50$

A et B sont dérivés en linéarisant les équations unicycle non linéaires à l'estimée courante.

**Réglage du bruit :**
- Bruit de processus Q : $q_{px} = q_{py} = q_\theta = 2$ (l'odométrie n'est pas fiable)
- Bruit de mesure R : $r_{px} = r_{py} = r_\theta = 0.1$ (la caméra est ~20× plus fiable que l'odométrie)

**Étape de mise à jour :** exécutée uniquement quand le flag de détection caméra = 1. Quand la caméra est occultée, le filtre fonctionne en mode prédiction seule par odométrie — le robot maintient sa trajectoire mais l'incertitude croît jusqu'au retour de la caméra.

La matrice H est l'identité (la caméra observe directement l'état complet x, y, θ), ce qui simplifie considérablement les équations de mise à jour.

</div>

---

## Motion Control & FSM

<div class="lang-en">

The controller follows a **turn-then-go** strategy for each waypoint:

1. **`compute_angle`**: compute `arctan2(target − current_pos) − current_heading` to get the required rotation
2. **`turn`**: spin in place (motors ±60 units) while the Kalman-estimated heading hasn't reached the target angle
3. **`go_to_position`**: drive straight (motors +60/+60) while Kalman-estimated distance to waypoint > threshold; Kalman filter runs every loop iteration

**Local obstacle avoidance**: while driving, proximity sensors are polled. If any front sensor exceeds threshold 2000:
- Left-side trigger → spin right (`motor_right = −60`)
- Right-side trigger → spin left (`motor_left = −60`)
- After clearing the obstacle: break out of the waypoint loop, drive straight briefly, then return to **Global** state for a full replan

**Async architecture**: the entire control loop uses Python `async/await` via `tdmclient`, which handles Thymio communication without blocking the main loop.

**Known limitation**: the turn-then-go approach is jerky — a smooth pursuit controller (e.g. pure pursuit or PID on heading error) would be cleaner and faster. The local avoidance is also reactive and simple: it spins away by a fixed amount without estimating the obstacle size or shape.

</div>
<div class="lang-fr">

Le contrôleur suit une stratégie **tourner-puis-avancer** pour chaque waypoint :

1. **`compute_angle`** : calcul de `arctan2(cible − pos_courante) − cap_courant` pour obtenir la rotation requise
2. **`turn`** : rotation sur place (moteurs ±60 unités) tant que le cap estimé par Kalman n'a pas atteint l'angle cible
3. **`go_to_position`** : avancer en ligne droite (moteurs +60/+60) tant que la distance estimée par Kalman au waypoint est > seuil ; le filtre de Kalman tourne à chaque itération de boucle

**Évitement local d'obstacles** : pendant la conduite, les capteurs de proximité sont interrogés. Si un capteur avant dépasse le seuil 2000 :
- Déclenchement côté gauche → virer à droite (`motor_right = −60`)
- Déclenchement côté droit → virer à gauche (`motor_left = −60`)
- Après dégagement de l'obstacle : sortir de la boucle de waypoint, avancer brièvement, puis retourner à l'état **Global** pour replanifier

**Architecture async** : toute la boucle de contrôle utilise Python `async/await` via `tdmclient`, qui gère la communication avec le Thymio sans bloquer la boucle principale.

**Limitation connue** : l'approche tourner-puis-avancer est saccadée — un contrôleur de poursuite lisse (ex. pure pursuit ou PID sur l'erreur de cap) serait plus propre et plus rapide. L'évitement local est aussi réactif et simple : il tourne pour s'écarter d'une distance fixe sans estimer la taille ou la forme de l'obstacle.

</div>

---

## Results & Assessment

<div class="lang-en">

The robot successfully navigated the arena from start to goal in the demo, including:
- Detecting all obstacles, goal, and its own position from vision alone
- Computing and following the globally optimal path around obstacles
- Maintaining position estimates when the camera was briefly occluded (odometry fallback)
- Detecting and recovering from an unexpected obstacle placed mid-run

**What worked well:**
- The vision pipeline, despite needing 15 iterations, ended up robust under the demo lighting conditions
- The EKF correctly trusted the camera far more than odometry — position estimates stayed tight when camera was available
- The full pipeline (vision → planning → estimation → control) worked end-to-end on real hardware

**Limitations:**
- Turn-then-go control is jerky; no heading PID
- Local avoidance is pure reactive: fixed spin distance, no obstacle size estimation, no local map
- `vid` (camera handle) is a global variable referenced from inside control functions — a design smell
- Some thresholds (area bounds, proximity threshold 2000) are empirically tuned to the specific demo setup and would need retuning in a different environment
- Dijkstra is O(V²) — fast enough here (few nodes), but A\* would be more scalable
- No dead reckoning during turns (Kalman update runs, but the angle convergence check uses the raw estimated state directly)

</div>
<div class="lang-fr">

Le robot a réussi à naviguer dans l'arène du départ à l'objectif lors de la démo, notamment :
- Détecter tous les obstacles, l'objectif et sa propre position uniquement par vision
- Calculer et suivre le chemin optimal global autour des obstacles
- Maintenir les estimées de position quand la caméra était brièvement occultée (repli sur odométrie)
- Détecter et se remettre d'un obstacle inattendu placé en cours de route

**Ce qui a bien fonctionné :**
- Le pipeline de vision, malgré 15 itérations nécessaires, s'est avéré robuste dans les conditions d'éclairage de la démo
- Le FKE a correctement fait confiance à la caméra bien plus qu'à l'odométrie — les estimées restaient précises quand la caméra était disponible
- L'ensemble du pipeline (vision → planification → estimation → contrôle) a fonctionné de bout en bout sur matériel réel

**Limitations :**
- Le contrôle tourner-puis-avancer est saccadé ; pas de PID sur le cap
- L'évitement local est purement réactif : distance de rotation fixe, pas d'estimation de taille d'obstacle, pas de carte locale
- `vid` (accès caméra) est une variable globale référencée depuis l'intérieur des fonctions de contrôle — une odeur de code
- Certains seuils (bornes d'aire, seuil de proximité 2000) sont réglés empiriquement pour le setup de démo et nécessiteraient un réglage dans un autre environnement
- Dijkstra est en O(V²) — assez rapide ici (peu de nœuds), mais A\* serait plus scalable
- Pas de dead reckoning pendant les rotations (la mise à jour Kalman tourne, mais la vérification de convergence angulaire utilise directement l'état estimé brut)

</div>

---

## Technical Stack

<div class="lang-en">

| Area | Details |
|---|---|
| Robot | Thymio II (differential drive) |
| Language | Python 3 (async/await) |
| Computer vision | OpenCV (`cv2.findContours`, `approxPolyDP`, HSV filtering) |
| Path planning | Visibility graph + Dijkstra (from scratch) |
| State estimation | Extended Kalman Filter (from scratch, linearized unicycle model) |
| Robot interface | `tdmclient` (Thymio Device Manager async client) |
| Course | EPFL Mobile Robotics — MICRO-452, Fall 2022 |

</div>
<div class="lang-fr">

| Domaine | Détails |
|---|---|
| Robot | Thymio II (traction différentielle) |
| Langage | Python 3 (async/await) |
| Vision par ordinateur | OpenCV (`cv2.findContours`, `approxPolyDP`, filtrage HSV) |
| Planification de chemin | Graphe de visibilité + Dijkstra (from scratch) |
| Estimation d'état | Filtre de Kalman étendu (from scratch, modèle unicycle linéarisé) |
| Interface robot | `tdmclient` (client async Thymio Device Manager) |
| Cours | EPFL Mobile Robotics — MICRO-452, automne 2022 |

</div>
