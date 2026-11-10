<?php

namespace App\Services;

use App\Models\Book;
use Illuminate\Database\Eloquent\Collection;

class BookService
{
    public function listAll(): Collection
    {
        $books = Book::with('genre:id,name')->get();
        
        return $books;
    }

    public function create(array $data): Book
    {   
        if (($data['status'] ?? 'to_read') !== 'finished') {
            $data['rating'] = null;
        }

        $book = Book::create($data);

        return $book;
    }

    public function findById(int $id): Book
    {
        $book = Book::with('genre:id,name')->findOrFail($id);

        return $book;
    }

    public function update(int $id, array $data): Book
    {
        $book = Book::findOrFail($id);
        $book->fill($data);

        if ($book->status !== 'finished') {
            $book->rating = null;
        }

        $book->save();

        return $book;
    }

    public function delete(int $id): void
    {
        $book = Book::findOrFail($id);
        $book->delete();
    }
}