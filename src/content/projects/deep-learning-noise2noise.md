---
title: 'Deep Learning — Noise2Noise Image Denoising'
description: 'Two-part EPFL deep learning project: FFT-augmented U-Net for image denoising using PyTorch (PSNR 25.43), then the same model rebuilt entirely from scratch with custom convolution, upsampling, and ADAM — no autograd.'
image: 'deep-learning/prediction_test.PNG'
images: []
video: ''
link: ''
github: 'https://github.com/AlbianSalihu/Noise2Noise'
tags: ['Deep Learning', 'Python', 'PyTorch', 'CNN', 'U-Net', 'Image Processing', 'Noise2Noise']
featured: false
date: 'May 2022'
---

<script>
(function () {
  var FR = {
    'Overview': 'Vue d\'ensemble',
    'Mini-Project 1 — PyTorch Noise2Noise': 'Mini-Projet 1 — Noise2Noise avec PyTorch',
    'Architecture': 'Architecture',
    'Parameter Search': 'Recherche de paramètres',
    'Results': 'Résultats',
    'Mini-Project 2 — From Scratch': 'Mini-Projet 2 — Depuis zéro',
    'Custom Convolution': 'Convolution personnalisée',
    'Other Custom Modules': 'Autres modules personnalisés',
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

Two-part project for the EPFL *Deep Learning* course (Prof. François Fleuret), developed as part of a two-person team. Both miniprojects were fully collaborative — architecture design, hyperparameter search, and the from-scratch framework implementation were joint throughout.

The task: implement a **Noise2Noise** denoising model — a model that learns to reconstruct clean images from pairs of independently noisy inputs, *without ever seeing a clean image during training* (Lehtinen et al., 2018).

- **Mini-Project 1**: implement the model using standard PyTorch, explore architecture choices, and run a systematic parameter search.
- **Mini-Project 2**: re-implement the same model **from scratch** — every operation (convolution, upsampling, optimizer) hand-coded with manual backpropagation, no `torch.autograd`.

</div>
<div class="lang-fr">

Projet en deux parties pour le cours *Deep Learning* de l'EPFL (Prof. François Fleuret), réalisé en binôme. Les deux mini-projets ont été entièrement collaboratifs — conception de l'architecture, recherche d'hyperparamètres et implémentation from scratch ont été menés conjointement tout au long du projet.

La tâche : implémenter un modèle **Noise2Noise** — un modèle qui apprend à reconstruire des images propres à partir de paires d'entrées indépendamment bruitées, *sans jamais voir une image propre durant l'entraînement* (Lehtinen et al., 2018).

- **Mini-Projet 1** : implémenter le modèle avec PyTorch standard, explorer les choix d'architecture et effectuer une recherche systématique de paramètres.
- **Mini-Projet 2** : réimplémenter le même modèle **depuis zéro** — chaque opération (convolution, upsampling, optimiseur) codée manuellement avec rétropropagation manuelle, sans `torch.autograd`.

</div>

---

## Mini-Project 1 — PyTorch Noise2Noise

### Architecture

<div class="lang-en">

An FFT-augmented U-Net style encoder-decoder. The key design choice: at each downsampling step, the feature map is also **split into high and low frequency components using FFT** and concatenated back in, giving the network multi-scale spectral information at each level.

| Layer | Output channels | Operation |
|---|---|---|
| INPUT | 3 | — |
| FFT₀ | 6 | Frequency split of input |
| Concat₀ | 9 | INPUT + FFT₀ |
| Enc_conv₀, Enc_conv₁ | 27 | Conv 3×3, Padding 1×1 |
| Pool₁ + FFT₁ | 27 + 54 | MaxPool 2×2 + frequency split |
| Concat₁ | 81 | Pool₁ + FFT₁ |
| Enc_conv₂, Enc_conv₃ | 27 | Conv 3×3, Padding 1×1 |
| Pool₃ | 27 | MaxPool 2×2 |
| Dec_conv₄ | 27 | Conv 3×3 |
| UpSampling₄ + Concat₂ | 135 | Upsample 2×2 + skip concat |
| Dec_conv₃, Dec_conv₂ | 27 | Conv 3×3 |
| UpSampling₂ + Concat₃ | 135 | Upsample 2×2 + skip concat |
| Dec_conv₁, Dec_conv₀ | 3 | Conv 3×3 → output |

<img src="/astro-darkness/deep-learning/Model.png" alt="U-Net model architecture diagram" style="background:#ffffff;max-width:100%;display:block;margin:0 auto;" data-lightbox />

</div>
<div class="lang-fr">

Un encodeur-décodeur de style U-Net augmenté par FFT. Le choix de conception clé : à chaque étape de sous-échantillonnage, la feature map est également **décomposée en composantes haute et basse fréquence par FFT** et concaténée, donnant au réseau une information spectrale multi-échelle à chaque niveau.

| Couche | Canaux de sortie | Opération |
|---|---|---|
| INPUT | 3 | — |
| FFT₀ | 6 | Décomposition fréquentielle de l'entrée |
| Concat₀ | 9 | INPUT + FFT₀ |
| Enc_conv₀, Enc_conv₁ | 27 | Conv 3×3, Padding 1×1 |
| Pool₁ + FFT₁ | 27 + 54 | MaxPool 2×2 + décomposition fréquentielle |
| Concat₁ | 81 | Pool₁ + FFT₁ |
| Enc_conv₂, Enc_conv₃ | 27 | Conv 3×3, Padding 1×1 |
| Pool₃ | 27 | MaxPool 2×2 |
| Dec_conv₄ | 27 | Conv 3×3 |
| UpSampling₄ + Concat₂ | 135 | Upsample 2×2 + skip concat |
| Dec_conv₃, Dec_conv₂ | 27 | Conv 3×3 |
| UpSampling₂ + Concat₃ | 135 | Upsample 2×2 + skip concat |
| Dec_conv₁, Dec_conv₀ | 3 | Conv 3×3 → sortie |

<img src="/astro-darkness/deep-learning/Model.png" alt="Diagramme de l'architecture U-Net" style="background:#ffffff;max-width:100%;display:block;margin:0 auto;" />

</div>

### Parameter Search

<div class="lang-en">

A structured 3-run search over the model's key hyperparameters:

- **Run 1 — Channel sizes**: trained once per combination of channel sizes (Chan1, Chan2, Chan3) — 125 training runs total. Best: Chan1 = Chan2 = Chan3 = 9 (channel width 27).
- **Run 2 — FFT count**: searched over `add_fft_1` and `add_fft_2` with values [0, 3, 5, 7]. Best: `add_fft_1 = 7`, `add_fft_2 = 3`.
- **Run 3 — Learning rate**: coarse search to find the range, then fine search with smaller increments. Best: `lr = 2.1e-3`.

The validation set (80% of the held-out data) was used exclusively for parameter search. The remaining 20% was kept untouched as the final test set — avoiding any data leakage between tuning and evaluation.

<img src="/astro-darkness/deep-learning/SplitDataset.png" alt="Dataset split strategy" style="background:#ffffff;max-width:60%;display:block;margin:0 auto;" />

</div>
<div class="lang-fr">

Une recherche structurée en 3 runs sur les hyperparamètres clés du modèle :

- **Run 1 — Tailles des canaux** : un entraînement par combinaison de tailles de canaux (Chan1, Chan2, Chan3) — 125 entraînements au total. Meilleur : Chan1 = Chan2 = Chan3 = 9 (largeur de canal 27).
- **Run 2 — Nombre de FFT** : recherche sur `add_fft_1` et `add_fft_2` avec les valeurs [0, 3, 5, 7]. Meilleur : `add_fft_1 = 7`, `add_fft_2 = 3`.
- **Run 3 — Taux d'apprentissage** : recherche grossière pour trouver la plage, puis fine avec des incréments plus petits. Meilleur : `lr = 2.1e-3`.

L'ensemble de validation (80% des données retenues) a été utilisé exclusivement pour la recherche de paramètres. Les 20% restants ont été conservés intacts comme jeu de test final — évitant toute fuite de données entre le réglage et l'évaluation.

<img src="/astro-darkness/deep-learning/SplitDataset.png" alt="Stratégie de découpage du jeu de données" style="background:#ffffff;max-width:60%;display:block;margin:0 auto;" />

</div>

### Results

<div class="lang-en">

**PSNR = 25.4350** on the final test set.

Optimizer: ADAM. Loss: MSE (pixel-level minimization). The model successfully reconstructs clean images from noisy inputs without access to any clean training data.

<img src="/astro-darkness/deep-learning/prediction_validation.PNG" alt="Validation set predictions: noisy input / denoised output / clean target" style="max-width:90%;display:block;margin:0 auto;" />

<img src="/astro-darkness/deep-learning/prediction_test.PNG" alt="Test set predictions: noisy input / denoised output / clean target" style="max-width:90%;display:block;margin:0 auto;" />

*Left: noisy input — Middle: model prediction — Right: clean target*

</div>
<div class="lang-fr">

**PSNR = 25,4350** sur le jeu de test final.

Optimiseur : ADAM. Perte : MSE (minimisation pixel à pixel). Le modèle reconstruit avec succès des images propres à partir d'entrées bruitées, sans jamais accéder à des données d'entraînement propres.

<img src="/astro-darkness/deep-learning/prediction_validation.PNG" alt="Prédictions sur le jeu de validation : entrée bruitée / sortie débruitée / cible propre" style="max-width:90%;display:block;margin:0 auto;" />

<img src="/astro-darkness/deep-learning/prediction_test.PNG" alt="Prédictions sur le jeu de test : entrée bruitée / sortie débruitée / cible propre" style="max-width:90%;display:block;margin:0 auto;" />

*Gauche : entrée bruitée — Milieu : prédiction du modèle — Droite : cible propre*

</div>

---

## Mini-Project 2 — From Scratch

<div class="lang-en">

A **different, simpler architecture** trained on the same Noise2Noise objective — no `torch.nn`, no `torch.autograd`. Every operation hand-coded with manual backpropagation.

The model is a flat 6-layer CNN (3 → 9 → 9 → 3 channels): three Conv2d layers interleaved with ReLU activations and a Sigmoid output. No encoder-decoder, no FFT, no skip connections. The constraint here was time: with a hand-coded backward pass this architecture was the most that could be trained to convergence within the allowed budget.

</div>
<div class="lang-fr">

Une **architecture différente, plus simple**, entraînée sur le même objectif Noise2Noise — pas de `torch.nn`, pas de `torch.autograd`. Chaque opération codée à la main avec rétropropagation manuelle.

Le modèle est un CNN plat à 6 couches (3 → 9 → 9 → 3 canaux) : trois couches Conv2d entrelacées avec des activations ReLU et une sortie Sigmoid. Pas d'encodeur-décodeur, pas de FFT, pas de skip connections. La contrainte était le temps : avec une passe arrière codée manuellement, cette architecture était la plus complexe pouvant converger dans le budget alloué.

</div>

### Custom Convolution

<div class="lang-en">

The hardest part. Both forward and backward passes derived from first principles:

- **Forward**: standard sliding-window multiply-accumulate
- **Gradient w.r.t. input**: convolution of the upstream gradient with the kernel rotated 180°, dilated by stride, padded by `kernel_size / 2`
- **Gradient w.r.t. kernel**: convolution of the input with the upstream gradient dilated by stride

<img src="/astro-darkness/deep-learning/Convolution.png" alt="Convolution forward and backward pass diagrams" style="background:#ffffff;max-width:90%;display:block;margin:0 auto;" />

</div>
<div class="lang-fr">

La partie la plus difficile. Les passes avant et arrière dérivées depuis les premiers principes :

- **Forward** : multiply-accumulate par fenêtre glissante standard
- **Gradient par rapport à l'entrée** : convolution du gradient amont avec le noyau tourné à 180°, dilaté par le stride, paddé de `kernel_size / 2`
- **Gradient par rapport au noyau** : convolution de l'entrée avec le gradient amont dilaté par le stride

<img src="/astro-darkness/deep-learning/Convolution.png" alt="Diagrammes des passes forward et backward de la convolution" style="background:#ffffff;max-width:90%;display:block;margin:0 auto;" />

</div>

### Other Custom Modules

<div class="lang-en">

- **NearestUpsampling**: forward via `torch.repeat_interleave`; backward by convolving the gradient with a kernel of 1 (summing the gradients from duplicated pixels)
- **Sigmoid**: clipped input to `[-64, 64]` before `exp()` to prevent `inf`/`nan` in the backward pass
- **ADAM optimizer**: implemented from the standard update equations

</div>
<div class="lang-fr">

- **NearestUpsampling** : forward via `torch.repeat_interleave` ; backward en convoluant le gradient avec un noyau de 1 (sommation des gradients des pixels dupliqués)
- **Sigmoid** : entrée clippée dans `[-64, 64]` avant `exp()` pour éviter les `inf`/`nan` dans la passe arrière
- **Optimiseur ADAM** : implémenté depuis les équations de mise à jour standard

</div>

### Results

<div class="lang-en">

**PSNR = 20.4185** after 4 epochs.

The gap vs Mini-Project 1 (25.43 → 20.42) reflects the difference between optimized PyTorch CUDA kernels and a hand-coded implementation — not a flaw in the approach, but an expected cost of the exercise.

<img src="/astro-darkness/deep-learning/prediction_val_2.png" alt="Validation set predictions — from-scratch model" style="max-width:90%;display:block;margin:0 auto;" />

<img src="/astro-darkness/deep-learning/prediction_test_2.png" alt="Test set predictions — from-scratch model" style="max-width:90%;display:block;margin:0 auto;" />

*Left: noisy input — Middle: model prediction — Right: clean target*

</div>
<div class="lang-fr">

**PSNR = 20,4185** après 4 epochs.

L'écart avec le Mini-Projet 1 (25,43 → 20,42) reflète la différence entre les noyaux CUDA optimisés de PyTorch et une implémentation codée à la main — non pas une faille dans l'approche, mais un coût attendu de l'exercice.

<img src="/astro-darkness/deep-learning/prediction_val_2.png" alt="Prédictions sur le jeu de validation — modèle from scratch" style="max-width:90%;display:block;margin:0 auto;" />

<img src="/astro-darkness/deep-learning/prediction_test_2.png" alt="Prédictions sur le jeu de test — modèle from scratch" style="max-width:90%;display:block;margin:0 auto;" />

*Gauche : entrée bruitée — Milieu : prédiction du modèle — Droite : cible propre*

</div>

---

## Technical Stack

<div class="lang-en">

| Area | Details |
|---|---|
| Framework | PyTorch (Mini-Project 1) / pure Python + tensor ops (Mini-Project 2) |
| Architecture | Mini-Project 1: FFT-augmented U-Net (encoder-decoder, skip connections) / Mini-Project 2: flat 3-layer CNN (3→9→9→3) |
| Loss | MSE |
| Optimizer | ADAM |
| Metric | PSNR |
| Parameter search | 125 training runs (channel sizes) + FFT count + learning rate |
| Course | EPFL Deep Learning (Prof. François Fleuret), May 2022 |

</div>
<div class="lang-fr">

| Domaine | Détails |
|---|---|
| Framework | PyTorch (Mini-Projet 1) / Python pur + opérations tenseurs (Mini-Projet 2) |
| Architecture | Mini-Projet 1 : U-Net augmenté FFT (encodeur-décodeur, skip connections) / Mini-Projet 2 : CNN plat 3 couches (3→9→9→3) |
| Perte | MSE |
| Optimiseur | ADAM |
| Métrique | PSNR |
| Recherche de paramètres | 125 entraînements (tailles de canaux) + nombre de FFT + taux d'apprentissage |
| Cours | EPFL Deep Learning (Prof. François Fleuret), mai 2022 |

</div>
