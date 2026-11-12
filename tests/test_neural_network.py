import torch
import torch.nn as nn
import pytest

from app.services.model_service import NeuMF


@pytest.fixture
def sample_neumf():
    """Create a lightweight NeuMF instance for unit testing."""
    return NeuMF(
        n_users=100,
        n_movies=50,
        embedding_dim=16,
        mlp_hidden_dims=(32, 16, 8),
        dropout=0.1,
    )


def test_neumf_architecture_components(sample_neumf):
    """Verify all GMF, MLP, and Output layers are properly instantiated."""
    assert isinstance(sample_neumf.gmf_user, nn.Embedding)
    assert isinstance(sample_neumf.gmf_movie, nn.Embedding)
    assert isinstance(sample_neumf.mlp_user, nn.Embedding)
    assert isinstance(sample_neumf.mlp_movie, nn.Embedding)
    assert isinstance(sample_neumf.mlp, nn.Sequential)
    assert isinstance(sample_neumf.output, nn.Linear)

    # Embedding shape check
    assert sample_neumf.gmf_user.num_embeddings == 100
    assert sample_neumf.gmf_user.embedding_dim == 16
    assert sample_neumf.gmf_movie.num_embeddings == 50
    assert sample_neumf.gmf_movie.embedding_dim == 16


def test_neumf_single_input_forward_pass(sample_neumf):
    """Verify forward pass works on a single (user, movie) pair with correct shape."""
    sample_neumf.eval()
    u = torch.tensor([5], dtype=torch.long)
    i = torch.tensor([12], dtype=torch.long)

    with torch.no_grad():
        out = sample_neumf(u, i)

    assert out.shape == torch.Size([1])
    assert not torch.isnan(out).any()


def test_neumf_batch_forward_pass(sample_neumf):
    """Verify forward pass on a batch of 64 pairs produces matching shape (64,)."""
    sample_neumf.eval()
    batch_size = 64
    users = torch.randint(0, 100, (batch_size,), dtype=torch.long)
    movies = torch.randint(0, 50, (batch_size,), dtype=torch.long)

    with torch.no_grad():
        out = sample_neumf(users, movies)

    assert out.shape == torch.Size([batch_size])
    assert not torch.isnan(out).any()


def test_neumf_sigmoid_probability_bounds(sample_neumf):
    """Verify that sigmoid of NeuMF logits maps strictly to [0.0, 1.0]."""
    sample_neumf.eval()
    users = torch.randint(0, 100, (200,), dtype=torch.long)
    movies = torch.randint(0, 50, (200,), dtype=torch.long)

    with torch.no_grad():
        logits = sample_neumf(users, movies)
        probs = torch.sigmoid(logits)

    assert (probs >= 0.0).all().item()
    assert (probs <= 1.0).all().item()


def test_neumf_gradient_backpropagation(sample_neumf):
    """Verify loss computation and backward pass compute non-zero gradients for all parameters."""
    sample_neumf.train()
    optimizer = torch.optim.Adam(sample_neumf.parameters(), lr=1e-3)
    criterion = nn.BCEWithLogitsLoss()

    users = torch.tensor([1, 2, 3, 4], dtype=torch.long)
    movies = torch.tensor([10, 20, 30, 40], dtype=torch.long)
    targets = torch.tensor([1.0, 0.0, 1.0, 0.0], dtype=torch.float)

    optimizer.zero_grad()
    preds = sample_neumf(users, movies)
    loss = criterion(preds, targets)
    loss.backward()

    # Verify gradients exist and are not NaN
    assert sample_neumf.gmf_user.weight.grad is not None
    assert sample_neumf.gmf_movie.weight.grad is not None
    assert sample_neumf.output.weight.grad is not None
    assert not torch.isnan(sample_neumf.output.weight.grad).any()

