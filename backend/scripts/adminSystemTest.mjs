import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';

const app = createApp();

const assertStatus = (res, status, label) => {
  if (res.status !== status) {
    throw new Error(`${label} failed. Expected ${status}, got ${res.status}. Body: ${JSON.stringify(res.body)}`);
  }
};

const assertTruthy = (value, label) => {
  if (!value) throw new Error(`${label} failed`);
};

const run = async () => {
  process.env.JWT_SECRET = 'admin-system-test-secret';
  process.env.JWT_EXPIRES_IN = '7d';
  process.env.JWT_ISSUER = 'graven-metal-api';
  process.env.JWT_AUDIENCE = 'graven-metal-client';
  process.env.NODE_ENV = 'test';

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  try {
    await mongoose.connect(uri);

    await User.create({
      name: 'Super Admin',
      email: 'super@graven.test',
      password: 'Password123',
      role: 'super_admin',
    });
    await User.create({
      name: 'Admin User',
      email: 'admin@graven.test',
      password: 'Password123',
      role: 'admin',
    });
    await User.create({
      name: 'Editor User',
      email: 'editor@graven.test',
      password: 'Password123',
      role: 'editor',
    });
    await User.create({
      name: 'Limited Editor',
      email: 'limited@graven.test',
      password: 'Password123',
      role: 'editor',
      permissions: ['manage_products'],
    });
    await User.create({
      name: 'Normal User',
      email: 'user@graven.test',
      password: 'Password123',
      role: 'user',
    });

    const superLogin = await request(app)
      .post('/api/auth/login/super-admin')
      .send({ email: 'super@graven.test', password: 'Password123' });
    assertStatus(superLogin, 200, 'super-admin login');
    const superToken = superLogin.body?.token;
    assertTruthy(superToken, 'super-admin token');

    const adminLogin = await request(app)
      .post('/api/auth/login/admin')
      .send({ email: 'admin@graven.test', password: 'Password123' });
    assertStatus(adminLogin, 200, 'admin login');
    const adminToken = adminLogin.body?.token;
    assertTruthy(adminToken, 'admin token');

    const editorLogin = await request(app)
      .post('/api/auth/login/admin')
      .send({ email: 'editor@graven.test', password: 'Password123' });
    assertStatus(editorLogin, 200, 'editor login via admin portal');
    const editorToken = editorLogin.body?.token;
    assertTruthy(editorToken, 'editor token');

    const userLogin = await request(app)
      .post('/api/auth/login/admin')
      .send({ email: 'user@graven.test', password: 'Password123' });
    assertStatus(userLogin, 401, 'normal user blocked from admin portal');

    const noTokenAdmins = await request(app).get('/api/super-admin/admins');
    assertStatus(noTokenAdmins, 401, 'super-admin route blocked without token');

    const adminOnSuperRoute = await request(app)
      .get('/api/super-admin/admins')
      .set('Authorization', `Bearer ${adminToken}`);
    assertStatus(adminOnSuperRoute, 403, 'admin blocked from super-admin routes');

    const superAdminsList = await request(app)
      .get('/api/super-admin/admins')
      .set('Authorization', `Bearer ${superToken}`);
    assertStatus(superAdminsList, 200, 'super-admin route access');

    const categoryCreate = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Gold', slug: 'gold' });
    assertStatus(categoryCreate, 201, 'category create by admin');
    const categoryId = categoryCreate.body?._id;
    assertTruthy(categoryId, 'category id');

    const productCreate = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Gold Bar',
        slug: 'gold-bar',
        description: '24K gold bar',
        category: categoryId,
        price: 6000,
        stockQty: 20,
      });
    assertStatus(productCreate, 201, 'product create by admin');
    const productId = productCreate.body?._id;
    assertTruthy(productId, 'product id');

    const productUpdate = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 6100, stockQty: 25 });
    assertStatus(productUpdate, 200, 'product update by admin');

    const editorCategoryCreate = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({ name: 'Silver', slug: 'silver' });
    assertStatus(editorCategoryCreate, 201, 'category create by editor with permission');

    const limitedLogin = await request(app)
      .post('/api/auth/login/admin')
      .send({ email: 'limited@graven.test', password: 'Password123' });
    assertStatus(limitedLogin, 200, 'limited editor login');
    const limitedToken = limitedLogin.body?.token;

    const limitedCategory = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${limitedToken}`)
      .send({ name: 'Platinum', slug: 'platinum' });
    assertStatus(limitedCategory, 201, 'limited editor allowed by role defaults');

    const limitedContacts = await request(app)
      .get('/api/contacts')
      .set('Authorization', `Bearer ${limitedToken}`);
    assertStatus(limitedContacts, 403, 'limited editor blocked from contacts');

    const analytics = await request(app)
      .get('/api/super-admin/analytics')
      .set('Authorization', `Bearer ${superToken}`);
    assertStatus(analytics, 200, 'analytics access');
    assertTruthy(analytics.body?.totals?.products >= 1, 'analytics totals');

    const createdAdmin = await request(app)
      .post('/api/super-admin/admins')
      .set('Authorization', `Bearer ${superToken}`)
      .send({
        name: 'New Admin',
        email: 'new-admin@graven.test',
        password: 'Password123',
        role: 'admin',
      });
    assertStatus(createdAdmin, 201, 'create admin');
    const createdAdminId = createdAdmin.body?.id;
    assertTruthy(createdAdminId, 'created admin id');

    const roleChangeCandidate = await request(app)
      .post('/api/super-admin/admins')
      .set('Authorization', `Bearer ${superToken}`)
      .send({
        name: 'Role Change Candidate',
        email: 'role-change@graven.test',
        password: 'Password123',
        role: 'admin',
      });
    assertStatus(roleChangeCandidate, 201, 'create role change candidate');
    const roleChangeCandidateId = roleChangeCandidate.body?.id;
    assertTruthy(roleChangeCandidateId, 'role change candidate id');

    const initialRoleLogin = await request(app)
      .post('/api/auth/login/admin')
      .send({ email: 'role-change@graven.test', password: 'Password123' });
    assertStatus(initialRoleLogin, 200, 'role change candidate initial login');
    const initialRoleToken = initialRoleLogin.body?.token;
    assertTruthy(initialRoleToken, 'initial role token');
    assertTruthy(initialRoleLogin.body?.user?.role === 'admin', 'initial role is admin');

    const roleUpdate = await request(app)
      .patch(`/api/super-admin/users/${roleChangeCandidateId}`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ role: 'developer' });
    assertStatus(roleUpdate, 200, 'role update to developer');
    assertTruthy(roleUpdate.body?.role === 'developer', 'updated role response is developer');

    const revokedOldRoleSession = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${initialRoleToken}`);
    assertStatus(revokedOldRoleSession, 401, 'old role session revoked after role update');

    const updatedRoleLogin = await request(app)
      .post('/api/auth/login/admin')
      .send({ email: 'role-change@graven.test', password: 'Password123' });
    assertStatus(updatedRoleLogin, 200, 'role change candidate relogin');
    assertTruthy(updatedRoleLogin.body?.user?.role === 'developer', 'updated role is developer after relogin');

    const assignPerms = await request(app)
      .patch(`/api/super-admin/admins/${createdAdminId}/permissions`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ permissions: ['manage_products'], role: 'editor' });
    assertStatus(assignPerms, 200, 'assign permissions');

    const deleteAdmin = await request(app)
      .delete(`/api/super-admin/admins/${createdAdminId}`)
      .set('Authorization', `Bearer ${superToken}`);
    assertStatus(deleteAdmin, 200, 'delete admin');

    const productDelete = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assertStatus(productDelete, 200, 'product delete by admin');

    const categoryDelete = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assertStatus(categoryDelete, 200, 'category delete by admin');

    console.log('ADMIN SYSTEM TEST PASSED: login, route protection, CRUD, permissions, dashboard analytics all verified.');
  } finally {
    await mongoose.disconnect();
    await mongod.stop();
  }
};

run().catch((error) => {
  console.error('ADMIN SYSTEM TEST FAILED:', error.message);
  if (error?.stack) console.error(error.stack);
  process.exit(1);
});
