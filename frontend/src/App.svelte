<script>
	import { Router, Link, Route } from 'svelte-routing';
	import Home from './routes/Home.svelte';
	import Login from './routes/Login.svelte';
	import Signup from './routes/Signup.svelte';
	import Notes from './routes/Notes.svelte';
	import NotFound from './routes/NotFound.svelte';
  </script>
  
  <main>
	<Router>
	  <Route path="/" component={Home} />
	  <Route path="/login" component={Login} />
	  <Route path="/signup" component={Signup} />
	  <Route path="/notes" component={Notes} />
	  <Route path="*" component={NotFound} />
	</Router>
  </main>
  