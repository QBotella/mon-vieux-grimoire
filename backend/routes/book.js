const express = require("express");
const router = express.Router();

const auth = require('../middleware/auth')

const bookCtrl = require("../controllers/book");

router.get("/:id", bookCtrl.getOneBook);
router.get("/", bookCtrl.getAllBook);
router.get('/bestrating');
router.post("/", auth, bookCtrl.createBook);
router.put("/:id", auth, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, );

module.exports = router;
