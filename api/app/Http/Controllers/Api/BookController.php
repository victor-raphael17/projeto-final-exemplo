<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BookService;
use App\Http\Requests\StoreBookRequest;
use App\Http\Requests\UpdateBookRequest;
use App\Http\Resources\BookResource;

class BookController extends Controller
{
    public function __construct(
        private BookService $bookService
    ) {}

    public function index()
    {
        $books = $this->bookService->listAll();

        return BookResource::collection($books);
    }

    public function store(StoreBookRequest $request)
    {
        $book = $this->bookService->create($request->validated());

        return response()->json($book, 201);
    }

    public function show(int $id)
    {
        $book = $this->bookService->findById($id);

        return new BookResource($book);
    }

    public function update(UpdateBookRequest $request, int $id)
    {
        $book = $this->bookService->update($id, $request->validated());

        return response()->json($book);
    }

    public function destroy(int $id)
    {
        $this->bookService->delete($id);

        return response()->noContent();
    }
}