const fs = require("fs");
const Book = require("../models/Book");

exports.createBook = (req, res, next) => {
  let bookObject;

  try {
    bookObject = JSON.parse(req.body.book);
  } catch (error) {
    return res.status(400).json({ message: "Le format du livre est invalide." });
  }

  if (isNaN(bookObject.ratings[0].grade) || bookObject.ratings[0].grade < 0 || bookObject.ratings[0].grade > 5) {
    return res.status(403).json({ message: "La note doit être comprise entre 0 et 5." });
  }
  
  if (isNaN(bookObject.averageRating) || bookObject.averageRating < 0 || bookObject.averageRating > 5) {
    return res.status(403).json({ message: "La note moyenne doit être entre 1 & 5." });
  }

  delete bookObject._id;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  book
    .save()
    .then(() => res.status(201).json({ message: "Livre enregistré !" }))
    .catch((error) => {
      console.error(error);
      res.status(400).json({ error })
    });
};

exports.modifyBook = (req, res, next) => {
  let bookObject;
  
  try {
    bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        }
      : { ...req.body };
  } catch (error) {
    return res.status(400).json({ message: "Le format du livre est invalide." });
  }

  delete bookObject.rating;
  delete bookObject.averageRating;

  delete bookObject.userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: "Non autorisé" });
      }
      Book.updateOne(
        { _id: req.params.id },
        { ...bookObject, _id: req.params.id }
      )
        .then(() => res.status(200).json({ message: "Livre modifié !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: "Non autorisé" });
      }
      const filename = book.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Livre supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }
      res.status(200).json(book);
    })
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.createRating = (req, res, next) => {
  const bookId = req.params.id;
  const userId = req.auth.userId;
  const grade = parseInt(req.body.rating, 10);

  if (isNaN(grade) || grade < 0 || grade > 5) {
    return res.status(403).json({ message: "La note doit être comprise entre 0 et 5." });
  }

  Book.findOne({ _id: bookId })
    .then((book) => {
     
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }
      
      // Si l'utilisateur n'a jamais mis de note, alors
      // existingRating === undefined
      const existingRating = book.ratings.find((r) => r.userId === userId);

      if (existingRating) {
        return res.status(400).json({ message: "L'utilisateur a déjà noté ce livre." });
      }
    
      book.ratings.push({ userId, grade });

      const totalRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);

      book.averageRating = (totalRatings / book.ratings.length).toFixed(2);
      
      book.save()
        .then(() => res.status(200).json(book))
        .catch((error) => res.status(400).json({ msg: error }));
    })

    .catch((error) => res.status(500).json({ msg: error }));
};

exports.getBestRatingBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      console.error(error);
      res.status(400).json({ error });
    });
};
