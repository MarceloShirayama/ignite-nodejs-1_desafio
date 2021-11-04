const request = require('supertest');
const { validate } = require('uuid');

const app = require('../');

describe('Todos', () => {
  let userFake
  let todoFake
  
  beforeEach(() => {
    userFake = {
      name: 'any_name',
      username: 'valid_username'
    }
    todoFake = {
      title: 'test todo',
      deadline: new Date()
    }
  },
  afterEach(async () => {
    await request(app)
      .delete('/users')
      .send()
  })

  )
  it("should be able to list all user's todo", async () => {
    await request(app)
      .post('/users')
      .send(userFake);

    const todoResponse = await request(app)
      .post('/todos')
      .send(todoFake)
      .set('username', userFake.username);

    const response = await request(app)
      .get('/todos')
      .set('username', userFake.username);

    expect(response.body).toEqual(
      expect.arrayContaining([
        todoResponse.body
      ]),
    )
  });

  it('should be able to create a new todo', async () => {
    await request(app)
      .post('/users')
      .send(userFake);

    const response = await request(app)
      .post('/todos')
      .send(todoFake)
      .set('username', userFake.username)
      .expect(201);

    expect(response.body).toMatchObject({
      title: 'test todo',
      deadline: response.body.deadline,
      done: false
    });
    expect(validate(response.body.id)).toBe(true);
    expect(response.body.created_at).toBeTruthy();
  });

  it('should be able to update a todo', async () => {
    await request(app)
      .post('/users')
      .send(userFake);

    const todoResponse = await request(app)
      .post('/todos')
      .send(todoFake)
      .set('username', userFake.username);

    const response = await request(app)
      .put(`/todos/${todoResponse.body.id}`)
      .send({
        title: 'update title',
        deadline: todoFake.deadline
      })
      .set('username', userFake.username);

    expect(response.body).toMatchObject({
      title: 'update title',
      deadline: (todoFake.deadline).toISOString(),
      done: false
    });
  });

  it('should not be able to update a non existing todo', async () => {
    await request(app)
      .post('/users')
      .send({
        name: 'John Doe',
        username: 'user8'
      });

    const response = await request(app)
      .put('/todos/invalid-todo-id')
      .send(todoFake)
      .set('username', userFake.username)
      .expect(404);

    expect(response.body.error).toBeTruthy();
  });

  it('should be able to mark a todo as done', async () => {
    await request(app)
      .post('/users')
      .send(userFake);

    const todoResponse = await request(app)
      .post('/todos')
      .send(todoFake)
      .set('username', userFake.username);

    const response = await request(app)
      .patch(`/todos/${todoResponse.body.id}/done`)
      .set('username', userFake.username);

    expect(response.body).toMatchObject({
      ...todoResponse.body,
      done: true
    });
  });

  it('should not be able to mark a non existing todo as done', async () => {
    await request(app)
      .post('/users')
      .send(userFake);

    const response = await request(app)
      .patch('/todos/invalid-todo-id/done')
      .set('username', userFake.username)
      .expect(404);

    expect(response.body.error).toBeTruthy();
  });

  it('should be able to delete a todo', async () => {
    await request(app)
      .post('/users')
      .send(userFake);

    const todoResponse = await request(app)
      .post('/todos')
      .send(todoFake)
      .set('username', userFake.username);

    await request(app)
      .delete(`/todos/${todoResponse.body.id}`)
      .set('username', userFake.username)
      .expect(204);

    const listResponse = await request(app)
      .get('/todos')
      .set('username', userFake.username);
    console.log('listResponse', listResponse.body);

    expect(listResponse.body).toEqual([]);
  });

  it('should not be able to delete a non existing todo', async () => {
    const userResponse = await request(app)
      .post('/users')
      .send(userFake);

    const response = await request(app)
      .delete('/todos/invalid-todo-id')
      .set('username', userResponse.body.username)
      .expect(404);

    expect(response.body.error).toBeTruthy();
  });
});
