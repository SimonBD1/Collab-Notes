<script>
  import { navigate } from 'svelte-routing';
  import * as yup from 'yup';

  let email = '';
  let password = '';
  let errorMessage = '';

  const schema = yup.object().shape({
    email: yup.string().email('Invalid email address').required('Email is required'),
    password: yup.string().required('Password is required')
  });

  const login = async () => {
    try {
      await schema.validate({ email, password }, { abortEarly: false });
      errorMessage = '';

      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('token', token);
        navigate('/notes');
      } else {
        const errorData = await response.json();
        errorMessage = errorData.error || 'Invalid credentials';
      }
    } catch (err) {
      errorMessage = err.errors.join(', ');
    }
  };
</script>

<main class="container mt-5">
  <h1>Login</h1>
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
  <button class="btn btn-primary" on:click={login}>Login</button>
</main>
