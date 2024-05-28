<script>
  import { Link, navigate } from 'svelte-routing';

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
</script>

<main class="container mt-5">
  <h1>Home</h1>
  <nav>
    <Link class="btn btn-primary m-2" to="/login">Go to Login</Link>
    <Link class="btn btn-primary m-2" to="/signup">Go to Signup</Link>
    <Link class="btn btn-primary m-2" to="/notes">Go to Notes</Link>
  </nav>
  <button class="btn btn-danger mt-3" on:click={logout}>Logout</button>
</main>
