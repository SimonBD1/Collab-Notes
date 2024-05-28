<script>
  import { onMount } from 'svelte';
  import io from 'socket.io-client';
  import { navigate } from 'svelte-routing';
  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  let notes = [];
  let newNoteContent = '';
  let errorMessage = '';
  let searchQuery = '';

  const connectSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const socket = io('http://localhost:3000', {
      auth: {
        token
      }
    });

    socket.on('connect_error', (err) => {
      if (err.message === 'Authentication error') {
        localStorage.removeItem('token');
        navigate('/login');
      }
    });

    socket.on('note updated', (note) => {
      const index = notes.findIndex(n => n.id === note.id);
      if (index !== -1) {
        notes[index] = note;
      } else {
        notes.push(note);
      }
    });

    socket.on('note deleted', (id) => {
      notes = notes.filter(note => note.id !== id);
    });

    return socket;
  };

  const socket = connectSocket();

  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:3000/notes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        notes = await response.json();
        console.log('Notes:', notes);
      } else {
        errorMessage = 'Failed to fetch notes';
        console.error('Failed to fetch notes:', response.statusText);
      }
    } catch (error) {
      errorMessage = 'An error occurred while fetching notes';
      console.error('Error fetching notes:', error);
    }
  };

  const searchNotes = async () => {
    const response = await fetch(`http://localhost:3000/notes/search?query=${searchQuery}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) {
      notes = await response.json();
    } else {
      errorMessage = 'Failed to search notes';
      console.error('Failed to search notes:', response.statusText);
    }
  };

  const addNote = async () => {
    if (!newNoteContent) {
      errorMessage = 'Please enter some content for the note';
      return;
    }

    const response = await fetch('http://localhost:3000/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ content: newNoteContent })
    });
    if (response.ok) {
      newNoteContent = '';
      await fetchNotes();
    } else {
      errorMessage = 'Failed to add note';
      console.error('Failed to add note:', response.statusText);
    }
  };

  const deleteNote = async (id) => {
    const response = await fetch(`http://localhost:3000/notes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      errorMessage = 'Failed to delete note';
      console.error('Failed to delete note:', response.statusText);
    }
  };

  const editNote = async (id, content) => {
    const response = await fetch(`http://localhost:3000/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ content })
    });
    if (!response.ok) {
      errorMessage = 'Failed to edit note';
      console.error('Failed to edit note:', response.statusText);
    }
  };

  onMount(fetchNotes);
</script>

<main class="container mt-5">
  <button class="btn btn-danger mt-3" on:click={logout}>Logout</button>
  <h1>Notes</h1>
  {#if errorMessage}
    <div class="alert alert-danger">{errorMessage}</div>
  {/if}
  <div class="input-group mb-3">
    <input type="text" bind:value={searchQuery} class="form-control" placeholder="Search notes" />
    <button class="btn btn-primary" on:click={searchNotes}>Search</button>
  </div>
  <div class="input-group mb-3">
    <input type="text" bind:value={newNoteContent} class="form-control" placeholder="New note" />
    <button class="btn btn-primary" on:click={addNote}>Add Note</button>
  </div>
  <ul class="list-group">
    {#each notes as note (note.id)}
      <li class="list-group-item">
        {#if note.isEditing}
          <div class="input-group">
            <input type="text" bind:value={note.content} class="form-control" />
            <button class="btn btn-success" on:click={() => { note.isEditing = false; editNote(note.id, note.content); }}>Save</button>
            <button class="btn btn-secondary" on:click={() => { note.isEditing = false; fetchNotes(); }}>Cancel</button>
          </div>
        {:else}
          <div class="d-flex justify-content-between">
            <span>{note.content}</span>
            <div>
              <button class="btn btn-warning me-2" on:click={() => { note.isEditing = true; }}>Edit</button>
              <button class="btn btn-danger" on:click={() => deleteNote(note.id)}>Delete</button>
            </div>
          </div>
        {/if}
      </li>
    {/each}
  </ul>
</main>
