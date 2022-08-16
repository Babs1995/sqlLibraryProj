const express = require ('express');
const router = express.Router(); 
const Book = require('../models').Book;

// var app = express()

function asyncHandler(cb) {
    return async (req, res, next) => {
      try {
        await cb(req, res, next);
      } catch (error) {
        // Forward error to the global error handler
        next(error);
      }
    };
  }
// get / - Home route should redirect to the /books route
router.get("/", async function (req, res) {
    res.redirect("/books");
  });
// get /books - Shows the full list of books
router.get(
    "/books",
    asyncHandler(async (req, res) => {
      const books = await Book.findAll();
      res.render("index", { 
          books: books, 
          title: "Books" 
        });
    })
  );
// get /books/new - Shows the create new book form
router.get(
    "/books/new",
    asyncHandler(async (req, res) => {
      res.render("new-book", { 
          book: {}, 
          title: "New Book" 
        });
    })
  );
// post /books/new - Posts a new book to the database
router.post(
    "/books/new",
    asyncHandler(async (req, res, next) => {
      let book;
      try {
        book = await Book.create(req.body);
        res.redirect("/books/");
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          book = await Book.build(req.body);
          res.render("new-book", { 
              book: book.dataValues, 
              errors: error.errors 
            });
        } else {
            next(error);
        }
      }
    })
  );
// get /books/:id - Shows book detail form
router.get("/books/:id", asyncHandler(async(req,res) => {
    const book = await Book.findByPk(req.params.id);
    if(book){
    res.render("update-book", {book});
    }else {
      res.render("page-not-found");
    }
  }));
// post /books/:id - Updates book info in the database
router.post(
    "/books/:id",
    asyncHandler(async (req, res, next) => {
      let book;
      try {
        book = await Book.findByPk(req.params.id);
        if (book) {
          await book.update(req.body);
          res.redirect("/books/${book.id}");
        } else {
          res.render("page-not-found");
        }
      } catch (error) {
        if (error.name === "SequelizeValidationError") {
          book = await Book.build(req.body);
          book.id = req.params.id;
          res.render("update-book", { 
            book, 
            errors: error.errors 
        });
        } else {
            next(error);
        }
      }
    })
  );
// post /books/:id/delete - Deletes a book
router.post(
    "/books/:id/delete",
    asyncHandler(async (req, res) => {
      const book = await Book.findByPk(req.params.id);
      await book.destroy();
      res.redirect("/books/");
    })
  );
  module.exports = router;