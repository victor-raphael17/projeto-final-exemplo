<?php

namespace App\Services;

use App\Models\Genre;
use Illuminate\Database\Eloquent\Collection;

class GenreService
{
    public function listAll(): Collection
    {
        $genres = Genre::all();

        return $genres;
    }

    public function create(array $data): Genre
    {
        $genre = Genre::create($data);

        return $genre;
    }

    public function findById(int $id): Genre
    {
        $genre = Genre::findOrFail($id);

        return $genre;
    }

    public function update(int $id, array $data): Genre
    {
        $genre = Genre::findOrFail($id);
        $genre->update($data);

        return $genre;
    }

    public function delete(int $id): void
    {
        $genre = Genre::findOrFail($id);
        $genre->delete();
    }
}