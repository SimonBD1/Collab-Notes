<script>
  import { navigate } from 'svelte-routing';
  let email = '';
  let password = '';
  let errorMessage = '';

  const signup = async () => {
    if (!email || !password) {
      errorMessage = 'Please fill in all fields';
      return;
    }

    if (password.length < 6) {
      errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        navigate('/login');
      } else {
        const errorData = await response.json();
        errorMessage = errorData.error || 'Signup failed';
      }
    } catch (error) {
      errorMessage = 'Failed to connect to the server';
      console.error('Error:', error);
    }
  };
</script>

<main class="container mt-5">
  <h1>Signup</h1>
  {#if errorMessage}
    <div class="alert alert-danger">{errorMessage}</div>
  {/if}
  <div class="mb-3">
    <label for="email" class="form-label">Email</label>
    <input type="email" id="email" bind:value={email} class="form-control" placeholder="Email" />
  </div>
  <div class="mb-3">
    <label for="password" class="form-label">Password</label>
    <input type="password" id="password" bind:value={password} class="form-control" placeholder="Password" />
  </div>
  <button class="btn btn-primary" on:click={signup}>Signup</button>
</main>
