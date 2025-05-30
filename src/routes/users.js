const Router = require('koa-router');
const router = new Router({ prefix: '/api/users' });

// Mock data for demonstration
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date() },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date() }
];

// GET /api/users - Get all users
router.get('/', async (ctx) => {
  ctx.body = {
    success: true,
    data: users,
    count: users.length
  };
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const user = users.find(u => u.id === id);
  
  if (!user) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      error: 'User not found'
    };
    return;
  }
  
  ctx.body = {
    success: true,
    data: user
  };
});

// POST /api/users - Create new user
router.post('/', async (ctx) => {
  const { name, email } = ctx.request.body;
  
  if (!name || !email) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: 'Name and email are required'
    };
    return;
  }
  
  const newUser = {
    id: users.length + 1,
    name,
    email,
    createdAt: new Date()
  };
  
  users.push(newUser);
  
  ctx.status = 201;
  ctx.body = {
    success: true,
    data: newUser,
    message: 'User created successfully'
  };
});

// PUT /api/users/:id - Update user
router.put('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const { name, email } = ctx.request.body;
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      error: 'User not found'
    };
    return;
  }
  
  if (name) users[userIndex].name = name;
  if (email) users[userIndex].email = email;
  users[userIndex].updatedAt = new Date();
  
  ctx.body = {
    success: true,
    data: users[userIndex],
    message: 'User updated successfully'
  };
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (ctx) => {
  const id = parseInt(ctx.params.id);
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      error: 'User not found'
    };
    return;
  }
  
  const deletedUser = users.splice(userIndex, 1)[0];
  
  ctx.body = {
    success: true,
    data: deletedUser,
    message: 'User deleted successfully'
  };
});

module.exports = router;
