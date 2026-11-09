# Model Card — MovieLens NCF

- Version: 1.0.0
- Training completed: True
- Dataset: MovieLens 25M
- Positive rule: rating >= 3.5
- Evaluation: chronological Leave-One-Out, 99 sampled negatives
- Metrics: HR@10 and NDCG@10
- Models: Popularity baseline and NeuMF

## Intended use
Educational movie ranking and recommendation. The output is an implicit preference score, not an explicit 1–5 rating or a guarantee of enjoyment.

## Limitations
Offline sampled-negative results do not guarantee online engagement. Collaborative filtering has cold-start limitations and can reproduce popularity bias. MovieLens may not represent a commercial streaming population.

See metrics.json for measured values. No estimated values are inserted by this notebook.
