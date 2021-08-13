const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
const newId = nextId()


// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res, next) {
  res.json({ data: dishes })
}

function create(req, res, next) {
  const {name, description, price, image_url} = res.locals
  const newDish = {
    id: newId,
    name: name,
    description: description,
    price: price,
    image_url: image_url
  }
  dishes.push(newDish)
  res.status(201).send({data: newDish})
}

function read(req, res, next) {
  const foundDish = res.locals.foundDish
  res.json({data: foundDish})
}

function update(req, res, next) {
  const foundDish = res.locals.foundDish
  const {data} = req.body
  const newDish = {
    id: foundDish.id,
    name: data.name ? data.name : foundDish.name,
    description: data.description ? data.description : foundDish.description,
    image_url: data.image_url ? data.image_url : foundDish.image_url,
    price: data.price ? data.price : foundDish.price
  }
  
  dishes[data.id] = newDish
  res.json({data: newDish})
}

function validator(req, res, next) {
  const {foundDish} = res.locals
  const { data: {name, description, price, image_url} = {} } = req.body
  
  if (!name || name.length === 0) return next({status: 400, message: "name"})
  if (!description || description.length === 0) return next({status: 400, message: "description"})
  if (!price || price <= 0 || !Number.isInteger(price)) return next({status: 400, message: "price"})
  if (!image_url || image_url.length === 0) return next({status: 400, message: "image_url"})
  
  res.locals = {
    name: name,
    description: description, 
    price: price,
    image_url: image_url,
    foundDish: foundDish
  }
  
  next()
}

function dishExists(req, res, next) {
  const {dishId} = req.params
  const foundDish = dishes.find((dish) => dish.id === dishId)
  if (!foundDish) return next({status: 404, message: `Dish id does not exist: ${dishId}`})
  res.locals.foundDish = foundDish
  next()
}

function matchChecker(req, res, next) {
  const {data: {id} = {}} = req.body
  const {dishId} = req.params
  if (id && id !== dishId) return next({status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`})
  next()
}


module.exports = {
  list,
  create: [validator, create],
  read: [dishExists, read],
  update: [dishExists, matchChecker, validator, update],
}