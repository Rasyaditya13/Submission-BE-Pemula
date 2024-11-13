const Hapi = require("@hapi/hapi");
const { nanoid } = require("nanoid");
const server = Hapi.server({
  port: 9000,
  host: "localhost",
});

const books = [];

//tambah buku
server.route({
  method: "POST",
  path: "/add-book",
  handler: (request, h) => {
    const {
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    } = request.payload;

    if (!name) {
      return h
        .response({
          status: "fail",
          message: "Gagal menambahkan buku. Mohon isi nama buku",
        })
        .code(400);
    }

    if (readPage > pageCount) {
      return h
        .response({
          status: "fail",
          message:
            "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
        })
        .code(400);
    }

    const timeStamp = new Date().toISOString();
    const finished = pageCount === readPage;
    const addedBook = {
      id: nanoid(16),
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished,
      insertedAt: timeStamp,
      updatedAt: timeStamp,
    };

    books.push(addedBook);

    return h
      .response({
        status: "success",
        message: "Buku berhasil ditambahkan",
        data: {
          bookId: addedBook.id,
        },
      })
      .code(201);
  },
});

//lihat buku
server.route({
  method: "GET",
  path: "/book",
  handler: (request, h) => {
    const { name, reading, finished } = request.query;

    let filterBook = books;

    if (name) {
      filterBook = filterBook.filter((book) =>
        book.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (reading !== undefined) {
      filterBook = filterBook.filter(
        (book) => book.reading === !!Number(reading)
      );
    }

    if (finished !== undefined) {
      const isFinished = finished === "1";
      filterBook = filterBook.filter(
        (book) => book.finished === isFinished
      );
    }

    return h
      .response({
        status: "success",
        data: {
          books: filterBook.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      })
      .code(200);
  },
});

//lihat detail buku
server.route({
  method: "GET",
  path: "/book/{id}",
  handler: (request, h) => {
    const { id } = request.params;
    const selectedBook = books.find((book) => book.id === id);
    if (selectedBook !== undefined) {
      return {
        status: "success",
        data: {
          book: selectedBook,
        },
      };
    }

    return h
      .response({
        status: "fail",
        message: "Buku tidak ditemukan",
      })
      .code(404);
  },
});

//edit buku
server.route({
  method: "PUT",
  path: "/book/{id}",
  handler: (request, h) => {
    const { id } = request.params;
    const {
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    } = request.payload;
    const timeStamp = new Date().toISOString();
    const selectedBook = books.find((book) => book.id === id);
    if (selectedBook !== undefined) {
      selectedBook.name = name;
      selectedBook.year = year;
      selectedBook.author = author;
      selectedBook.summary = summary;
      selectedBook.publisher = publisher;
      selectedBook.pageCount = pageCount;
      selectedBook.readPage = readPage;
      selectedBook.reading = reading;
      selectedBook.updatedAt = timeStamp;
      return h
        .response({
          status: "success",
          message: "Buku berhasil diperbarui",
        })
        .code(200);
    }
    return h
      .response({
        status: "fail",
        message: "Gagal memperbarui buku. Id tidak ditemukan",
      })
      .code(404);
  },
});

//hapus buku
server.route({
  method: "DELETE",
  path: "/book/{id}",
  handler: (request, h) => {
    const { id } = request.params;
    const selectedBook = books.find((book) => book.id === id);
    if (selectedBook !== undefined) {
      books.splice(books.indexOf(selectedBook), 1);
      return h
        .response({
          status: "success",
          message: "Buku berhasil dihapus",
        })
        .code(200);
    }
    return h
      .response({
        status: "fail",
        message: "Buku gagal dihapus. Id tidak ditemukan",
      })
      .code(404);
  },
});

async function start() {
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
}

start();
