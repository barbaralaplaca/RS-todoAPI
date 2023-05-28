const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const findUser = users.find(user => user.username === username);

  if (!findUser) {
    return response.status(400).send({ error: 'User not found' })
  } 
    request.user = findUser;
    return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const findUser = users.find(user => user.username === username);

   if (findUser) {
    return response.status(400).send({ error: 'User already exists' })
  } 

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(newUser)

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const todo = {
    id: uuidv4(),
    title: request.body.title,
    done: false,
    deadline: request.body.deadline,
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);
  if (!todo) {
    return response.status(404).send({ error: 'Todo do not exist' })
  }
  todo.title = request.body.title;
  todo.deadline = request.body.deadline;

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);
  if (!todo) {
    return response.status(404).send({ error: 'Todo do not exist' })
  }
  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);
  if (todoIndex === -1) {
    return response.status(404).send({ error: "Todo do not exist" })
  }

  user.todos.splice(todoIndex, 1)

  return response.status(204).json(user);
});

module.exports = app;