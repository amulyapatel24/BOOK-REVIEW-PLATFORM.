const API_URL = 'http://localhost:5000/api';

// DOM Elements
const booksGrid = document.getElementById('books-grid');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');
const emptyState = document.getElementById('empty-state');
const genreFilter = document.getElementById('genre-filter');
const heroSearchInput = document.getElementById('hero-search-input');
const heroSearchBtn = document.getElementById('hero-search-btn');

const addBookModal = document.getElementById('add-book-modal');
const openAddBookModalBtn = document.getElementById('open-add-book-modal');
const addBookForm = document.getElementById('add-book-form');

const bookDetailsModal = document.getElementById('book-details-modal');
const bookDetailsContent = document.getElementById('book-details-content');

// Close Modals buttons
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        addBookModal.classList.add('hidden');
        bookDetailsModal.classList.add('hidden');
    });
});

openAddBookModalBtn.addEventListener('click', () => addBookModal.classList.remove('hidden'));

// Fetch and display books
async function fetchBooks(search = '', genre = 'All') {
    loadingIndicator.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    booksGrid.innerHTML = '';
    emptyState.classList.add('hidden');

    try {
        let url = `${API_URL}/books?`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (genre && genre !== 'All') url += `genre=${encodeURIComponent(genre)}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch books from server.');

        const books = await response.json();
        loadingIndicator.classList.add('hidden');

        if (books.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            const defaultCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';
            
            card.innerHTML = `
                <div class="book-img" style="background-image: url('${book.cover_url || defaultCover}')"></div>
                <div class="book-info">
                    <span class="book-genre">${book.genre}</span>
                    <h3 class="book-title">${escapeHTML(book.title)}</h3>
                    <p class="book-author">by ${escapeHTML(book.author)}</p>
                    <div class="card-actions">
                        <button class="btn btn-primary" onclick="viewBookDetails(${book.id})">Reviews</button>
                        <button class="btn btn-danger" onclick="deleteBook(${book.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            booksGrid.appendChild(card);
        });
    } catch (err) {
        loadingIndicator.classList.add('hidden');
        errorMessage.textContent = err.message || 'An error occurred while connecting to backend.';
        errorMessage.classList.remove('hidden');
    }
}

// Add Book Form Submission
addBookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newBook = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        genre: document.getElementById('genre').value,
        cover_url: document.getElementById('cover_url').value,
        description: document.getElementById('description').value
    };

    try {
        const res = await fetch(`${API_URL}/books`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBook)
        });
        if (!res.ok) throw new Error('Failed to add book');

        addBookForm.reset();
        addBookModal.classList.add('hidden');
        fetchBooks();
    } catch (err) {
        alert(err.message);
    }
});

// Delete Book
async function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
        const res = await fetch(`${API_URL}/books/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete book');
        fetchBooks();
    } catch (err) {
        alert(err.message);
    }
}

// View Book Details and Reviews
window.viewBookDetails = async function(id) {
    try {
        const res = await fetch(`${API_URL}/books/${id}`);
        if (!res.ok) throw new Error('Failed to load book details');
        const book = await res.json();

        let reviewsHTML = book.reviews.map(r => `
            <div style="border-bottom: 1px solid var(--border); padding: 0.75rem 0;">
                <strong>${escapeHTML(r.reviewer_name)}</strong> - <span style="color: #f59e0b;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                <p style="margin-top: 0.25rem; font-size: 0.95rem;">${escapeHTML(r.comment)}</p>
            </div>
        `).join('') || '<p style="color: var(--text-muted);">No reviews yet. Be the first!</p>';

        bookDetailsContent.innerHTML = `
            <h2>${escapeHTML(book.title)}</h2>
            <p style="color: var(--text-muted); margin-bottom: 1rem;">Author: ${escapeHTML(book.author)} | Genre: ${book.genre}</p>
            <p style="margin-bottom: 1.5rem;">${escapeHTML(book.description || 'No description provided.')}</p>
            
            <h3 style="margin-bottom: 0.5rem;">Reviews</h3>
            <div style="max-height: 200px; overflow-y: auto; margin-bottom: 1.5rem;">
                ${reviewsHTML}
            </div>

            <form id="add-review-form" onsubmit="submitReview(event, ${book.id})">
                <h4>Add Your Review</h4>
                <div class="form-group" style="margin-top: 0.5rem;">
                    <input type="text" id="reviewer_name" placeholder="Your Name" required>
                </div>
                <div class="form-group">
                    <select id="rating" required>
                        <option value="5">5 Stars - Excellent</option>
                        <option value="4">4 Stars - Good</option>
                        <option value="3">3 Stars - Average</option>
                        <option value="2">2 Stars - Fair</option>
                        <option value="1">1 Star - Poor</option>
                    </select>
                </div>
                <div class="form-group">
                    <textarea id="comment" placeholder="Write your review here..." rows="2" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Submit Review</button>
            </form>
        `;
        bookDetailsModal.classList.remove('hidden');
    } catch (err) {
        alert(err.message);
    }
};

// Submit Review Handler
window.submitReview = async function(e, bookId) {
    e.preventDefault();
    const reviewData = {
        reviewer_name: document.getElementById('reviewer_name').value,
        rating: document.getElementById('rating').value,
        comment: document.getElementById('comment').value
    };

    try {
        const res = await fetch(`${API_URL}/books/${bookId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });
        if (!res.ok) throw new Error('Failed to submit review');
        viewBookDetails(bookId);
    } catch (err) {
        alert(err.message);
    }
};

// Event Listeners for search & filters
heroSearchBtn.addEventListener('click', () => {
    fetchBooks(heroSearchInput.value, genreFilter.value);
});
heroSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchBooks(heroSearchInput.value, genreFilter.value);
});
genreFilter.addEventListener('change', () => {
    fetchBooks(heroSearchInput.value, genreFilter.value);
});

function escapeHTML(str) {
    return str ? str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    ) : '';
}

// Initial Load
fetchBooks();