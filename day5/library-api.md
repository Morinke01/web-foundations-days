# Library Books API

The API uses the `/books` resource. Request and response bodies use JSON, and each request is stateless.

## Endpoints

- **GET `/books`** — List books. Success status: `200 OK`.
- **GET `/books/{id}`** — Get one book by its ID. Success status: `200 OK`.
- **POST `/books`** — Create a book. Success status: `201 Created`.

  Example request body:

  ```json
  {
    "title": "The Left Hand of Darkness",
    "author": "Ursula K. Le Guin",
    "publishedYear": 1969
  }
  ```

- **PUT `/books/{id}`** — Replace all editable fields of a book. Success status: `200 OK`.

  Example request body:

  ```json
  {
    "title": "The Left Hand of Darkness",
    "author": "Ursula K. Le Guin",
    "publishedYear": 1969
  }
  ```

- **PATCH `/books/{id}`** — Update one or more fields of a book. Success status: `200 OK`.

  Example request body:

  ```json
  {
    "title": "A Wizard of Earthsea"
  }
  ```

- **DELETE `/books/{id}`** — Delete a book by its ID. Success status: `204 No Content`.
- **GET `/books?author=Ursula%20K.%20Le%20Guin`** — List books by the given author using the `author` query parameter. Success status: `200 OK`.

## Error responses

- **`400 Bad Request`** — The request data is invalid, such as creating a book without a title.
- **`404 Not Found`** — The requested book ID does not exist, or the requested endpoint is unknown.
