const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res, next) {
  res.json({data: orders})
}

function create(req, res, next) {
  const {deliverTo, mobileNumber, status, dishes} = res.locals
  
  const newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: [dishes]
  }
  
  orders.push(newOrder)
  
  res.status(201).json({data: newOrder})
}

function read(req, res, next) {
  const {foundOrder} = res.locals
  res.json({data: foundOrder})
}

function update(req, res, next) {
  const foundOrder = res.locals.foundOrder
  const {data} = req.body
  const newOrder = {
    id: foundOrder.id,
    deliverTo: data.deliverTo ? data.deliverTo : foundOrder.deliverTo,
    mobileNumber: data.mobileNumber ? data.mobileNumber : foundOrder.mobileNumber,
    status: data.status ? data.status : foundOrder.status,
    dishes: data.dishes ? data.dishes : foundOrder.dishes
  }
  
  orders[data.id] = newOrder
  res.json({data: newOrder})
}

function destroy(req, res, next) {
  const {foundOrder} = res.locals
  const index = orders.findIndex((order) => order.id === foundOrder.id);
  orders.splice(index, 1)
  res.status(204).send()
}

function validator(req, res, next) {
  const {data: {deliverTo, mobileNumber, status, dishes}} = req.body
  const {foundOrder} = res.locals
  
  if (!deliverTo || deliverTo.length === 0) return next({status: 400, message: "deliverTo"})
  if (!mobileNumber || mobileNumber.length === 0) return next({status: 400, message: "mobileNumber"})
  if (!dishes || dishes.length === 0 || !Array.isArray(dishes)) return next({status: 400, message: "dishes"})
  dishes.forEach((dish, index) => {
    if (!dish.quantity || dish.quantity === 0 || !Number.isInteger(dish.quantity)) return next({status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`})
  })
  
  res.locals = {
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status, 
    dishes: dishes,
    foundOrder: foundOrder
  }
  
  next()
}

function orderExists(req, res, next) {
  const {orderId} = req.params
  const foundOrder = orders.find((order) => order.id === orderId)
  if (!foundOrder) return next({status: 404, message: `Order ${orderId} not found`})
  res.locals.foundOrder = foundOrder
  next()
}

function updateChecker(req, res, next) {
  const {orderId} = req.params
  const {data: {id, status}} = req.body

  if (id && orderId !== id) next({status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`})
  if(!status) next({status: 400, message: "Order must have a status of pending, preparing, out-for-delivery, delivered"})
  if (status !== "pending" && status !== "preparing" && status !== "out-for-delivery" && status !== "delivered") next({status: 400, message: "Order must have a status of pending, preparing, out-for-delivery, delivered"})
  if(status === "delivered") next({status: 400, message: "A delivered order cannot be changed"})
  
  next()
}

function deleteValidator(req, res, next) {
  const {foundOrder} = res.locals
  
  if (foundOrder.status !== "pending") next({status: 400, message: "An order cannot be deleted unless it is pending"})
  
  next()
}

module.exports = {
  list,
  create: [validator, create],
  read: [orderExists, read],
  update: [orderExists, validator, updateChecker, update],
  delete: [orderExists, deleteValidator, destroy]
}