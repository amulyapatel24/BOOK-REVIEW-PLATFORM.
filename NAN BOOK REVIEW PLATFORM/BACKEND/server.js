const express = require('express');
const cors = require('cors');
require('dotenv').config();
const supabase = require('./supabase');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- BOOKS ROUTES ---

// Get all books with optional search & filter
app.get('/api/books', async (req, res) => {
  try {
    const { search, genre } = req.query;
    let query = supabase.from('books').select('*').order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    if (genre && genre !== 'All') {
      query = query.eq('genre', genre);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single book by ID with its reviews
app.get('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (bookError) throw bookError;
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const { data: reviews, error: reviewError } = await supabase
      .from('reviews')
      .select('*')
      .eq('book_id', id)
      .order('created_at', { ascending: false });

    if (reviewError) throw reviewError;

    res.json({ ...book, reviews: reviews || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new book
app.post('/api/books', async (req, res) => {
  try {
    const { title, author, genre, description, cover_url } = req.body;
    if (!title || !author || !genre) {
      return res.status(400).json({ error: 'Title, author, and genre are required.' });
    }

    const { data, error } = await supabase
      .from('books')
      .insert([{ title, author, genre, description, cover_url }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a book
app.delete('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REVIEWS ROUTES ---

// Add a review to a book
app.post('/api/books/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewer_name, rating, comment } = req.body;

    if (!reviewer_name || !rating || !comment) {
      return res.status(400).json({ error: 'All review fields are required.' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([{ book_id: id, reviewer_name, rating: parseInt(rating), comment }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});