---
title: 'Quadruped Locomotion — CPG & Deep Reinforcement Learning'
description: 'Implemented and compared bio-inspired Central Pattern Generator control against Deep Reinforcement Learning for quadruped locomotion on a 12.45 kg simulated robot at EPFL BioRob.'
image: 'epfl-legged-robots/legged.png'
images: []
video: ''
link: ''
github: 'https://github.com/AlbianSalihu/LeggedRobotics'
report: '/epfl-legged-robots/LR_Project_2_Group09.pdf'
tags: ['Robotics', 'Python', 'Reinforcement Learning', 'Control Systems', 'Simulation', 'Bio-inspired', 'PyBullet', 'PPO', 'SAC']
featured: false
date: 'Nov 2022 – Jan 2023'
---

<script>
(function () {
  const FR = {
    'Overview': 'Vue d\'ensemble',
    'Part 1 — Central Pattern Generator': 'Partie 1 — Générateurs de Patterns Centraux',
    'Oscillator Architecture': 'Architecture des Oscillateurs',
    'Gait Design': 'Conception des Allures',
    'Combined PD Control Law': 'Loi de Contrôle PD Combinée',
    'CPG Videos': 'Vidéos CPG',
    'Part 2 — Deep Reinforcement Learning': 'Partie 2 — Apprentissage par Renforcement Profond',
    'Method': 'Méthode',
    'Algorithm Comparison': 'Comparaison des Algorithmes',
    'DRL Results': 'Résultats DRL',
    'DRL Demo': 'Démo DRL',
    'Conclusion': 'Conclusion',
    'Bloopers': 'Bloopers',
  };
  const EN = {};

  function applyHeadings(lang) {
    document.querySelectorAll('.project-body h2, .project-body h3').forEach(function (h) {
      if (!h.getAttribute('data-en')) {
        h.setAttribute('data-en', h.textContent.trim());
      }
      const en = h.getAttribute('data-en');
      const translated = (lang === 'fr' && FR[en]) ? FR[en] : en;
      h.textContent = translated;
      // Sync the TOC sidebar link
      const tocLink = document.querySelector('.toc-link[data-heading="' + h.id + '"]');
      if (tocLink) tocLink.textContent = translated;
    });
  }

  document.addEventListener('astro:page-load', function () {
    applyHeadings(localStorage.getItem('lang') || 'en');
  });
  document.addEventListener('langchange', function (e) {
    applyHeadings(e.detail);
  });
})();
</script>

## Overview

<div class="lang-en">

Course project for *Legged Robots* at EPFL (BioRob lab, Prof. Auke Ijspeert), completed as part of a two-person team. The project implements and compares two fundamentally different control strategies for a simulated quadruped robot (12.45 kg, PyBullet):

1. **Central Pattern Generator (CPG)** — a bio-inspired approach mimicking the spinal neural oscillator circuits found in vertebrates
2. **Deep Reinforcement Learning (DRL)** — a CPG-augmented Markov Decision Process policy trained end-to-end

The central question: can a trained DRL policy match the performance and efficiency of a carefully engineered bio-inspired controller, and what are the trade-offs?

</div>
<div class="lang-fr">

Projet de cours pour *Legged Robots* à l'EPFL (laboratoire BioRob, Prof. Auke Ijspeert), réalisé en binôme. Le projet implémente et compare deux stratégies de contrôle fondamentalement différentes pour un robot quadrupède simulé (12,45 kg, PyBullet) :

1. **Générateur de Patterns Centraux (CPG)** — approche bio-inspirée reproduisant les circuits d'oscillateurs neuronaux spinaux des vertébrés
2. **Apprentissage par Renforcement Profond (DRL)** — politique basée sur un Processus de Décision Markovien, augmentée par un CPG, entraînée de bout en bout

La question centrale : une politique DRL entraînée peut-elle égaler les performances d'un contrôleur bio-inspiré soigneusement conçu, et quels sont les compromis ?

</div>

## Part 1 — Central Pattern Generator

### Oscillator Architecture

<div class="lang-en">

The CPG is modelled as a **network of 4 coupled non-linear oscillators**, one per leg. Each oscillator *i* is described by an amplitude *r* and phase *θ*, governed by:

- **Amplitude**: ṙᵢ = −α(μ − rᵢ²)rᵢ — converges to √μ via a limit cycle
- **Phase**: θ̇ᵢ = ωᵢ + Σⱼ rⱼ wᵢⱼ sin(θⱼ − θᵢ − φᵢⱼ)

where α controls convergence speed, wᵢⱼ is coupling strength, and φᵢⱼ is the desired inter-leg phase offset.

The natural frequency ωᵢ splits into two regimes:
- **Swing** (0 ≤ θ ≤ π): foot lifted and advancing — ω_swing = 10π rad/s
- **Stance** (π < θ ≤ 2π): foot grounded, pushing — ω_stance = 4π rad/s

CPG states are mapped to Cartesian foot targets in the leg xz-plane via:
- x_foot = −d_step · r · cos(θ)
- z_foot = −h + g_c · sin(θ) if sin(θ) > 0, else −h + g_p · sin(θ)

The CPG amplitude *r* converges quickly to the limit cycle (√μ = 1) for all four legs:

<img src="/astro-darkness/epfl-legged-robots/Figure_question1b.png" alt="CPG amplitude convergence for all 4 legs over 2 seconds" style="max-width:100%;display:block;margin:0 auto;" />

The full CPG state evolution (r, θ, ṙ, θ̇) over a 2-second run:

<img src="/astro-darkness/epfl-legged-robots/Figure_question1.png" alt="CPG states r, theta, r-dot, theta-dot for all 4 legs" style="max-width:100%;display:block;margin:0 auto;" />

</div>
<div class="lang-fr">

Le CPG est modélisé comme un **réseau de 4 oscillateurs non linéaires couplés**, un par patte. Chaque oscillateur *i* est décrit par une amplitude *r* et une phase *θ* :

- **Amplitude** : ṙᵢ = −α(μ − rᵢ²)rᵢ — converge vers √μ via un cycle limite
- **Phase** : θ̇ᵢ = ωᵢ + Σⱼ rⱼ wᵢⱼ sin(θⱼ − θᵢ − φᵢⱼ)

où α contrôle la vitesse de convergence, wᵢⱼ est le couplage entre oscillateurs, et φᵢⱼ est le déphasage désiré entre les pattes.

La fréquence naturelle ωᵢ se divise en deux régimes :
- **Oscillation** (0 ≤ θ ≤ π) : pied levé en avancement — ω_swing = 10π rad/s
- **Appui** (π < θ ≤ 2π) : pied au sol en poussée — ω_stance = 4π rad/s

Les états du CPG sont convertis en positions cartésiennes cibles dans le plan xz de la patte :
- x_foot = −d_step · r · cos(θ)
- z_foot = −h + g_c · sin(θ) si sin(θ) > 0, sinon −h + g_p · sin(θ)

L'amplitude *r* du CPG converge rapidement vers le cycle limite (√μ = 1) pour les quatre pattes :

<img src="/astro-darkness/epfl-legged-robots/Figure_question1b.png" alt="Convergence de l'amplitude CPG pour les 4 pattes sur 2 secondes" style="max-width:100%;display:block;margin:0 auto;" />

Évolution complète des états CPG (r, θ, ṙ, θ̇) sur 2 secondes :

<img src="/astro-darkness/epfl-legged-robots/Figure_question1.png" alt="États CPG r, theta, r-dot, theta-dot pour les 4 pattes" style="max-width:100%;display:block;margin:0 auto;" />

</div>

### Gait Design

<div class="lang-en">

Four gaits are implemented by choosing different inter-leg phase offset matrices φ:

<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.75rem;margin:1rem 0;">
<div style="text-align:center;"><img src="/astro-darkness/epfl-legged-robots/trot_gait.png" alt="Trot footfall sequence" style="max-width:100%;background:#fff;" /><em style="font-size:0.8rem;">Trot</em></div>
<div style="text-align:center;"><img src="/astro-darkness/epfl-legged-robots/walk_gait.png" alt="Walk footfall sequence" style="max-width:100%;background:#fff;" /><em style="font-size:0.8rem;">Walk</em></div>
<div style="text-align:center;"><img src="/astro-darkness/epfl-legged-robots/bound_gait.png" alt="Bound footfall sequence" style="max-width:100%;background:#fff;" /><em style="font-size:0.8rem;">Bound</em></div>
<div style="text-align:center;"><img src="/astro-darkness/epfl-legged-robots/pace_gait.png" alt="Pace footfall sequence" style="max-width:100%;background:#fff;" /><em style="font-size:0.8rem;">Pace</em></div>
</div>

| Gait | Leg coordination | v_avg (fast) | CoT (fast) |
|---|---|---|---|
| Trot | Diagonal pairs in phase | 0.612 m/s | 0.543 |
| Lateral walk | Sequential lateral | 1.434 m/s | 0.756 |
| Bound | Front/rear pairs in phase | 0.626 m/s | 0.842 |
| Pace | Ipsilateral pairs in phase | 1.376 m/s | 0.459 |

The Pace gait achieves the lowest Cost of Transport (CoT = 0.459). The Bound gait is the least energy efficient (CoT = 0.842).

</div>
<div class="lang-fr">

Quatre allures sont implémentées en choisissant différentes matrices de déphasage φ entre les pattes :

<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.75rem;margin:1rem 0;">
<div style="text-align:center;"><img src="/astro-darkness/epfl-legged-robots/trot_gait.png" alt="Séquence de pas Trot" style="max-width:100%;background:#fff;" /><em style="font-size:0.8rem;">Trot</em></div>
<div style="text-align:center;"><img src="/astro-darkness/epfl-legged-robots/walk_gait.png" alt="Séquence de pas Marche" style="max-width:100%;background:#fff;" /><em style="font-size:0.8rem;">Marche</em></div>
<div style="text-align:center;"><img src="/astro-darkness/epfl-legged-robots/bound_gait.png" alt="Séquence de pas Bond" style="max-width:100%;background:#fff;" /><em style="font-size:0.8rem;">Bond</em></div>
<div style="text-align:center;"><img src="/astro-darkness/epfl-legged-robots/pace_gait.png" alt="Séquence de pas Pace" style="max-width:100%;background:#fff;" /><em style="font-size:0.8rem;">Pace</em></div>
</div>

| Allure | Coordination des pattes | v_moy (rapide) | CoT (rapide) |
|---|---|---|---|
| Trot | Paires diagonales en phase | 0,612 m/s | 0,543 |
| Marche latérale | Séquentiel latéral | 1,434 m/s | 0,756 |
| Bond | Paires avant/arrière en phase | 0,626 m/s | 0,842 |
| Pas (Pace) | Paires ipsilatérales en phase | 1,376 m/s | 0,459 |

L'allure Pace atteint le Coût de Transport le plus bas (CoT = 0,459). Le Bond est le moins efficace énergétiquement (CoT = 0,842).

</div>

### Combined PD Control Law

<div class="lang-en">

A **combined Joint + Cartesian PD controller** drives the legs:

τ_total = τ_joint + τ_cartesian

**Key finding**: Joint PD alone leads to instability. Cartesian PD alone also fails. Only the combined controller with tuned gains produces stable locomotion. Optimised gains (trot gait):

| Controller | Kp_joint | Kd_joint | Kp_cartesian | Kd_cartesian |
|---|---|---|---|---|
| Joint + Cartesian PD | 100 | 1 | 1500 | 20 |
| Joint PD only | 200 | 2 | — | — |
| Cartesian PD only | — | — | 5000 | 80 |

Desired vs actual foot position with the optimised combined controller (trot, 2 s):

<img src="/astro-darkness/epfl-legged-robots/Figure_question2_opt_cart+joint.png" alt="Desired vs actual foot position — joint + Cartesian PD, optimised gains" style="max-width:100%;display:block;margin:0 auto;" />

</div>
<div class="lang-fr">

Un **contrôleur PD combiné Articulaire + Cartésien** pilote les pattes :

τ_total = τ_articulaire + τ_cartésien

**Résultat clé** : le PD articulaire seul mène à l'instabilité. Le PD cartésien seul échoue également. Seul le contrôleur combiné avec des gains ajustés produit une locomotion stable. Gains optimisés (allure trot) :

| Contrôleur | Kp_joint | Kd_joint | Kp_cartesian | Kd_cartesian |
|---|---|---|---|---|
| Joint + Cartésien PD | 100 | 1 | 1500 | 20 |
| Joint PD uniquement | 200 | 2 | — | — |
| Cartésien PD uniquement | — | — | 5000 | 80 |

Position du pied désirée vs réelle avec le contrôleur combiné optimisé (trot, 2 s) :

<img src="/astro-darkness/epfl-legged-robots/Figure_question2_opt_cart+joint.png" alt="Position du pied désirée vs réelle — PD articulaire + cartésien, gains optimisés" style="max-width:100%;display:block;margin:0 auto;" />

</div>

### CPG Videos

<div class="lang-en">**Trot:**</div><div class="lang-fr">**Trot :**</div>
<div class="video-grid">
<video src="/epfl-legged-robots/TROT_HIGH_0,612ms.MP4" controls></video>
<video src="/epfl-legged-robots/TROT_LOW_0,345ms.MP4" controls></video>
</div>
<span class="video-label">Fast — 0.612 m/s &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Slow — 0.345 m/s</span>

<div class="lang-en">**Walk:**</div><div class="lang-fr">**Marche :**</div>
<div class="video-grid">
<video src="/epfl-legged-robots/WALK_HIGH_1,434ms.MP4" controls></video>
<video src="/epfl-legged-robots/WALK_LOW_0,278ms.MP4" controls></video>
</div>
<span class="video-label">Fast — 1.434 m/s &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Slow — 0.278 m/s</span>

<div class="lang-en">**Bound:**</div><div class="lang-fr">**Bond :**</div>
<div class="video-grid">
<video src="/epfl-legged-robots/BOUND_HIGH_0,626ms.MP4" controls></video>
<video src="/epfl-legged-robots/BOUND_LOW_0,345ms.MP4" controls></video>
</div>
<span class="video-label">Fast — 0.626 m/s &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Slow — 0.345 m/s</span>

<div class="lang-en">**Pace:**</div><div class="lang-fr">**Pas (Pace) :**</div>
<div class="video-grid">
<video src="/epfl-legged-robots/PACE_HIGH_1,376ms.MP4" controls></video>
<video src="/epfl-legged-robots/PACE_LOW_0,341ms.MP4" controls></video>
</div>
<span class="video-label">Fast — 1.376 m/s &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Slow — 0.341 m/s</span>

## Part 2 — Deep Reinforcement Learning

### Method

<div class="lang-en">

The DRL policy uses a **CPG-RL action space**: the network modulates CPG amplitude and phase parameters directly, which are mapped through inverse kinematics to joint targets tracked by Joint PD. This hybrid approach inherits the structured motion priors of the CPG.

**Policy**: two-layer MLP, 256 neurons each. **Observation space**: motor angles & velocities, base orientation (quaternion), base linear/angular velocity, CPG amplitude & phase.

**Reward function** — 10 weighted terms:

| Term | Weight | Purpose |
|---|---|---|
| vel_tracking | +0.05 | Track desired forward velocity |
| yaw penalty | −0.2 | Penalise lateral heading drift |
| drift penalty | −0.01 | Penalise lateral position drift |
| energy penalty | −0.01 | Minimise consumed energy |
| orientation penalty | −0.1 | Keep base level |
| lin_vel penalty | −0.1 | Penalise vertical oscillation |
| ang_vel penalty | −0.05 | Penalise rearing/rolling |
| joint motion penalty | −0.001 | Smooth limb movement |
| roll penalty | −0.2 | Limit roll oscillations |
| torque penalty | −0.00002 | Prevent unrealistic torques |

</div>
<div class="lang-fr">

La politique DRL utilise un **espace d'action CPG-RL** : le réseau module directement les paramètres d'amplitude et de phase du CPG, qui sont convertis via la cinématique inverse en cibles articulaires suivies par un contrôleur PD. Cette approche hybride hérite des propriétés structurées du CPG.

**Politique** : MLP à deux couches, 256 neurones chacune. **Espace d'observation** : angles et vitesses moteurs, orientation de la base (quaternion), vitesses linéaire et angulaire, amplitude et phase du CPG.

**Fonction de récompense** — 10 termes pondérés :

| Terme | Poids | Objectif |
|---|---|---|
| vel_tracking | +0,05 | Suivre la vitesse d'avancement désirée |
| pénalité lacet | −0,2 | Pénaliser la dérive angulaire latérale |
| pénalité dérive | −0,01 | Pénaliser la dérive latérale en position |
| pénalité énergie | −0,01 | Minimiser l'énergie consommée |
| pénalité orientation | −0,1 | Maintenir la base horizontale |
| pénalité vit. linéaire | −0,1 | Pénaliser les oscillations verticales |
| pénalité vit. angulaire | −0,05 | Pénaliser le cabrage ou le roulis |
| pénalité mouvement | −0,001 | Fluidifier le mouvement des membres |
| pénalité roulis | −0,2 | Limiter les oscillations en roulis |
| pénalité couple | −0,00002 | Éviter des couples irréalistes |

</div>

### Algorithm Comparison

<div class="lang-en">

**PPO** preferred over SAC: converges in ~200k steps (episode length), ~400k steps (reward). CPG-RL action space significantly outperforms pure PD or Cartesian PD spaces.

Action space ranking: **CPG-RL >> Cartesian PD >> Joint PD**

</div>
<div class="lang-fr">

**PPO** préféré à SAC : converge en ~200k étapes (longueur d'épisode), ~400k étapes (récompense). L'espace d'action CPG-RL surpasse nettement les espaces PD articulaire et PD cartésien purs.

Classement des espaces d'action : **CPG-RL >> PD Cartésien >> PD Articulaire**

</div>

### DRL Results

<div class="lang-en">

| Policy | v_avg (m/s) | CoT |
|---|---|---|
| Fast gait (PPO) | 0.944 | 0.300 |
| Slow gait (PPO) | 0.491 | 0.447 |

The fast PPO policy achieves **CoT = 0.300** — lower than any CPG gait.

Training convergence of the best CPG-RL policy (PPO):

<img src="/astro-darkness/epfl-legged-robots/EPISODE_LENGTH_BEST_CPG.png" alt="Episode length convergence — CPG-RL PPO policy" style="max-width:100%;display:block;margin:0 auto;" />

<img src="/astro-darkness/epfl-legged-robots/REWARD_best_cpg.png" alt="Reward convergence — CPG-RL PPO policy" style="max-width:100%;display:block;margin:0 auto;" />

The episode length hits the maximum (1000 steps) after ~200k timesteps; the reward converges after ~400k. The variance is low — indicating a stable policy.

Robot base position over 10 seconds for the fast policy (v_avg = 0.944 m/s). X increases steadily; Y and Z remain near-flat:

<img src="/astro-darkness/epfl-legged-robots/fig_base_position_1ms.jpeg" alt="Robot base position progression — fast CPG-RL policy" style="max-width:100%;display:block;margin:0 auto;" />

Leg contact pattern and CPG state evolution during fast locomotion:

<img src="/astro-darkness/epfl-legged-robots/fig_pressure_data.jpeg" alt="Leg contact boolean — CPG-RL policy" style="max-width:100%;display:block;margin:0 auto;" />

<img src="/astro-darkness/epfl-legged-robots/fig_theta_rl.jpeg" alt="CPG phase progression — CPG-RL policy" style="max-width:100%;display:block;margin:0 auto;" />

<img src="/astro-darkness/epfl-legged-robots/fig_r_rl.jpeg" alt="CPG amplitude progression — CPG-RL policy" style="max-width:100%;display:block;margin:0 auto;" />

</div>
<div class="lang-fr">

| Politique | v_moy (m/s) | CoT |
|---|---|---|
| Allure rapide (PPO) | 0,944 | 0,300 |
| Allure lente (PPO) | 0,491 | 0,447 |

La politique PPO rapide atteint **CoT = 0,300** — inférieur à toutes les allures CPG.

Convergence de l'entraînement de la meilleure politique CPG-RL (PPO) :

<img src="/astro-darkness/epfl-legged-robots/EPISODE_LENGTH_BEST_CPG.png" alt="Convergence de la longueur d'épisode — politique CPG-RL PPO" style="max-width:100%;display:block;margin:0 auto;" />

<img src="/astro-darkness/epfl-legged-robots/REWARD_best_cpg.png" alt="Convergence de la récompense — politique CPG-RL PPO" style="max-width:100%;display:block;margin:0 auto;" />

La longueur d'épisode atteint le maximum (1000 étapes) après ~200k pas de temps ; la récompense converge après ~400k. La faible variance indique une politique stable.

Position de la base du robot sur 10 secondes pour la politique rapide (v_moy = 0,944 m/s). X croît régulièrement ; Y et Z restent quasi-plats :

<img src="/astro-darkness/epfl-legged-robots/fig_base_position_1ms.jpeg" alt="Progression de la position de la base — politique CPG-RL rapide" style="max-width:100%;display:block;margin:0 auto;" />

Contact des pattes et évolution des états CPG en locomotion rapide :

<img src="/astro-darkness/epfl-legged-robots/fig_pressure_data.jpeg" alt="Contact des pattes — politique CPG-RL" style="max-width:100%;display:block;margin:0 auto;" />

<img src="/astro-darkness/epfl-legged-robots/fig_theta_rl.jpeg" alt="Évolution de la phase CPG — politique CPG-RL" style="max-width:100%;display:block;margin:0 auto;" />

<img src="/astro-darkness/epfl-legged-robots/fig_r_rl.jpeg" alt="Évolution de l'amplitude CPG — politique CPG-RL" style="max-width:100%;display:block;margin:0 auto;" />

</div>

### DRL Demo

<div class="lang-en">**PPO — fast & slow:**</div><div class="lang-fr">**PPO — rapide & lente :**</div>
<div class="video-grid">
<video src="/epfl-legged-robots/RL_CPG_PPO_FAST_1ms.MP4" controls></video>
<video src="/epfl-legged-robots/RL_CPG_PPO_SLOW_0.5ms.mp4" controls></video>
</div>
<span class="video-label">PPO fast — 0.944 m/s &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; PPO slow — 0.491 m/s</span>

<div class="lang-en">**SAC policy:**</div><div class="lang-fr">**Politique SAC :**</div>

<video src="/epfl-legged-robots/RL_SAC_BEST_1ms.mp4" controls></video>

## Conclusion

<div class="lang-en">

Both approaches achieve stable quadruped locomotion with distinct trade-offs:

- **CPG**: interpretable, designer-controlled gaits. Requires domain knowledge (oscillator design, gain tuning, IK). Best CoT: Pace at 0.459.
- **DRL (CPG-RL)**: emergent gait from reward shaping, best CoT = 0.300. Requires training time and careful reward engineering. Less interpretable.

The CPG-RL hybrid was the key insight — raw joint/Cartesian PD action spaces fail to converge. Sim-to-real transfer remains an open challenge.

</div>
<div class="lang-fr">

Les deux approches permettent une locomotion quadrupède stable avec des compromis distincts :

- **CPG** : allures interprétables et contrôlées par le concepteur. Nécessite une expertise (conception des oscillateurs, réglage des gains, cinématique inverse). Meilleur CoT : Pace à 0,459.
- **DRL (CPG-RL)** : allure émergente issue du façonnage de récompense, meilleur CoT = 0,300. Nécessite du temps d'entraînement et un ingénierie fine de la récompense. Moins interprétable.

L'hybride CPG-RL est l'insight clé — les espaces d'action PD articulaire et cartésien purs ne convergent pas. Le transfert simulation-réel reste un défi ouvert.

</div>

## Bloopers

<div class="video-grid">
<video src="/epfl-legged-robots/BLOOPERS_PD.MP4" controls></video>
<video src="/epfl-legged-robots/RL_CARTESIAN_PD_PPO_BLOOPER.mp4" controls></video>
</div>
<div class="lang-en"><span class="video-label">PD controller during gain tuning &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Cartesian PD action space DRL</span></div>
<div class="lang-fr"><span class="video-label">Contrôleur PD pendant le réglage des gains &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; DRL avec espace d'action PD Cartésien</span></div>
