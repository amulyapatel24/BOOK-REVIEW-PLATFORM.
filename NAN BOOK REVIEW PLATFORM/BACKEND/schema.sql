-- Create books table
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    description TEXT,
    cover_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    reviewer_name VARCHAR(100) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write access (suitable for beginner educational project)
CREATE POLICY "Enable public read access for books" ON books FOR SELECT USING (true);
CREATE POLICY "Enable public insert access for books" ON books FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable public update access for books" ON books FOR UPDATE USING (true);
CREATE POLICY "Enable public delete access for books" ON books FOR DELETE USING (true);

CREATE POLICY "Enable public read access for reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Enable public insert access for reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable public delete access for reviews" ON reviews FOR DELETE USING (true);