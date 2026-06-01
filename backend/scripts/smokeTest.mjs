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
  process.env.JWT_SECRET = 'smoke-test-secret';
  process.env.JWT_EXPIRES_IN = '7d';
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
    const lqtUser = await User.create({
      name: 'LQT User',
      email: 'lqt@graven.test',
      password: 'Password123',
      role: 'lqt',
    });
    const salesUser = await User.create({
      name: 'Sales User',
      email: 'sales@graven.test',
      password: 'Password123',
      role: 'sales',
    });
    await User.create({
      name: 'Procurement User',
      email: 'procurement@graven.test',
      password: 'Password123',
      role: 'procurement',
    });
    await User.create({
      name: 'Customer User',
      email: 'customer@graven.test',
      password: 'Password123',
      phone: '+1234567899',
      company: 'Customer Co',
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

    const lqtLogin = await request(app)
      .post('/api/auth/login/admin')
      .send({ email: 'lqt@graven.test', password: 'Password123' });
    assertStatus(lqtLogin, 200, 'lqt login');
    const lqtToken = lqtLogin.body?.token;
    assertTruthy(lqtToken, 'lqt token');

    const salesLogin = await request(app)
      .post('/api/auth/login/admin')
      .send({ email: 'sales@graven.test', password: 'Password123' });
    assertStatus(salesLogin, 200, 'sales login');
    const salesToken = salesLogin.body?.token;
    assertTruthy(salesToken, 'sales token');

    const procurementLogin = await request(app)
      .post('/api/auth/login/admin')
      .send({ email: 'procurement@graven.test', password: 'Password123' });
    assertStatus(procurementLogin, 200, 'procurement login');
    const procurementToken = procurementLogin.body?.token;
    assertTruthy(procurementToken, 'procurement token');

    const customerLogin = await request(app)
      .post('/api/auth/login/customer')
      .send({ email: 'customer@graven.test', password: 'Password123' });
    assertStatus(customerLogin, 200, 'customer login');
    const customerToken = customerLogin.body?.token;
    assertTruthy(customerToken, 'customer token');

    const categoryCreate = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Gold', slug: 'gold', description: 'Gold category' });
    assertStatus(categoryCreate, 201, 'category create');
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
        price: 6054,
        stockQty: 25,
      });
    assertStatus(productCreate, 201, 'product create');
    const productId = productCreate.body?._id;
    assertTruthy(productId, 'product id');

    const blogCreate = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Gold Markets Update',
        slug: 'gold-markets-update',
        excerpt: 'Gold has shown strong movement.',
        content: 'Detailed content for market update.',
      });
    assertStatus(blogCreate, 201, 'blog create');
    const blogId = blogCreate.body?._id;
    assertTruthy(blogId, 'blog id');

    const productsList = await request(app).get('/api/products');
    assertStatus(productsList, 200, 'products list');
    assertTruthy(Array.isArray(productsList.body) && productsList.body.length >= 1, 'products list data');

    const categoriesList = await request(app).get('/api/categories');
    assertStatus(categoriesList, 200, 'categories list');

    const blogsList = await request(app).get('/api/blogs');
    assertStatus(blogsList, 200, 'blogs list');

    const quoteCreate = await request(app)
      .post('/api/quotes')
      .set('Authorization', `Bearer ${customerToken}`)
      .field('fullName', 'Client A')
      .field('email', 'customer@graven.test')
      .field('phone', '+1234567890')
      .field('metal', 'Gold')
      .field('quantity', '10 Kg')
      .field('requirement', 'Need immediate supply');
    assertStatus(quoteCreate, 201, 'quote create');
    const quoteId = quoteCreate.body?.data?._id;
    assertTruthy(quoteId, 'quote id');

    const lqtDashboard = await request(app)
      .get('/api/operations/lqt/dashboard')
      .set('Authorization', `Bearer ${lqtToken}`);
    assertStatus(lqtDashboard, 200, 'lqt dashboard api');
    assertTruthy(lqtDashboard.body?.rows?.some((row) => `${row.id}` === `${quoteId}`), 'lqt dashboard contains quote');

    const lqtMembers = await request(app)
      .get('/api/operations/lqt/members')
      .set('Authorization', `Bearer ${lqtToken}`);
    assertStatus(lqtMembers, 200, 'lqt members api');
    assertTruthy(lqtMembers.body?.data?.some((member) => `${member.id}` === `${lqtUser._id}`), 'lqt members contains lqt user');

    const websiteLeadCreate = await request(app)
      .post('/api/leads')
      .field('fullName', 'Industrial Buyer')
      .field('companyName', 'Precision Forge Industries')
      .field('designation', 'Procurement Head')
      .field('phone', '+919988776655')
      .field('email', 'buyer@precisionforge.example')
      .field('whatsappNumber', '+919988776655')
      .field('industryType', 'Manufacturing')
      .field('companyLocation', 'Pune, Maharashtra')
      .field('product', 'Copper Cathodes')
      .field('quantity', '8')
      .field('unit', 'MT')
      .field('deliveryLocation', 'Pune Plant')
      .field('requirement', 'Need LME grade copper cathodes for monthly production supply.')
      .field('purchaseTimeline', 'Immediate')
      .field('preferredContactMethod', 'WhatsApp');
    assertStatus(websiteLeadCreate, 201, 'website lead create');
    const websiteLeadId = websiteLeadCreate.body?.data?.id;
    assertTruthy(websiteLeadId, 'website lead id');
    assertTruthy(websiteLeadCreate.body?.data?.priority === 'High', 'website lead scoring');

    const lqtDashboardWithWebsiteLead = await request(app)
      .get('/api/operations/lqt/dashboard')
      .set('Authorization', `Bearer ${lqtToken}`);
    assertStatus(lqtDashboardWithWebsiteLead, 200, 'lqt dashboard website lead api');
    assertTruthy(
      lqtDashboardWithWebsiteLead.body?.rows?.some(
        (row) => `${row.id}` === `${websiteLeadId}` && row.sourceLabel === 'Website Lead'
      ),
      'lqt dashboard contains website lead'
    );

    const salesMembersForHandoff = await request(app)
      .get('/api/operations/sales/members')
      .set('Authorization', `Bearer ${lqtToken}`);
    assertStatus(salesMembersForHandoff, 200, 'lqt sales members handoff api');
    assertTruthy(
      salesMembersForHandoff.body?.data?.some((member) => `${member.id}` === `${salesUser._id}`),
      'lqt can select sales employee'
    );

    const websiteLeadAssignment = await request(app)
      .patch(`/api/leads/${websiteLeadId}`)
      .set('Authorization', `Bearer ${lqtToken}`)
      .send({
        status: 'Sales Assigned',
        leadTemperature: 'hot',
        assignedTeam: 'sales',
        assignedTo: salesUser._id.toString(),
        note: 'Buyer verified and assigned to Sales.',
      });
    assertStatus(websiteLeadAssignment, 200, 'website lead sales assignment');

    const websiteLeadQuotation = await request(app)
      .patch(`/api/leads/${websiteLeadId}`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        status: 'Follow-up',
        quotation: { amount: 6350000, currency: 'INR', status: 'sent' },
        note: 'Quotation sent to industrial buyer.',
      });
    assertStatus(websiteLeadQuotation, 200, 'website lead quotation');
    assertTruthy(websiteLeadQuotation.body?.data?.status === 'Quotation Sent', 'website lead quotation workflow status');

    const salesDashboardWithWebsiteLead = await request(app)
      .get('/api/operations/sales/dashboard')
      .set('Authorization', `Bearer ${salesToken}`);
    assertStatus(salesDashboardWithWebsiteLead, 200, 'sales dashboard website lead api');
    assertTruthy(
      salesDashboardWithWebsiteLead.body?.websiteLeadStats?.quotationsSent === 1,
      'website lead analytics quotation count'
    );

    const adminOperations = await request(app)
      .get('/api/operations/lqt/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    assertStatus(adminOperations, 403, 'normal admin operations access');

    const invalidLqtAssignment = await request(app)
      .patch(`/api/operations/lqt/quotes/${quoteId}`)
      .set('Authorization', `Bearer ${lqtToken}`)
      .send({ module: 'assigned-leads', assignedTeam: 'lqt', assignedTo: salesUser._id.toString(), note: 'Wrong team' });
    assertStatus(invalidLqtAssignment, 400, 'lqt assignment rejects sales user');

    const lqtUpdate = await request(app)
      .patch(`/api/operations/lqt/quotes/${quoteId}`)
      .set('Authorization', `Bearer ${lqtToken}`)
      .send({
        module: 'qualification',
        status: 'in_review',
        leadTemperature: 'hot',
        assignedTo: lqtUser._id.toString(),
        note: 'Qualified by LQT smoke test',
        followUp: { note: 'Call procurement head', dueAt: new Date().toISOString() },
        meeting: { note: 'Discovery meeting', scheduledAt: new Date().toISOString() },
      });
    assertStatus(lqtUpdate, 200, 'lqt quote operation update');
    assertTruthy(`${lqtUpdate.body?.data?.assignedTo}` === `${lqtUser._id}`, 'lqt quote stores assigned employee');

    const salesUpdate = await request(app)
      .patch(`/api/operations/sales/quotes/${quoteId}`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        module: 'quotation-management',
        assignedTeam: 'sales',
        assignedTo: salesUser._id.toString(),
        quotation: { amount: 750000, currency: 'INR', status: 'sent' },
        note: 'Quotation sent by sales smoke test',
      });
    assertStatus(salesUpdate, 200, 'sales quote operation update');

    const customerQuotesAfterOps = await request(app)
      .get('/api/quotes/mine')
      .set('Authorization', `Bearer ${customerToken}`);
    assertStatus(customerQuotesAfterOps, 200, 'customer quote history after operations');
    const customerQuote = customerQuotesAfterOps.body?.data?.find((row) => `${row._id || row.id}` === `${quoteId}`);
    if (!customerQuote || customerQuote.status !== 'quoted') {
      throw new Error(
        `customer website/flutter quote status reflects sales update failed. Quote: ${JSON.stringify(customerQuote)}`
      );
    }

    const procurementRecord = await request(app)
      .post('/api/operations/procurement/records')
      .set('Authorization', `Bearer ${procurementToken}`)
      .send({
        module: 'price-requests',
        title: 'Shakti Metals',
        detail: 'Copper cathode price request',
        status: 'Requested',
        nextStep: 'Await supplier quote',
        value: '12 MT',
      });
    assertStatus(procurementRecord, 201, 'procurement record create');
    const procurementRecordId = procurementRecord.body?.data?.id;
    assertTruthy(procurementRecordId, 'procurement record id');

    const procurementRecordUpdate = await request(app)
      .patch(`/api/operations/procurement/records/${procurementRecordId}`)
      .set('Authorization', `Bearer ${procurementToken}`)
      .send({ status: 'Quoted', value: '-2.4%', note: 'Vendor quote received' });
    assertStatus(procurementRecordUpdate, 200, 'procurement record update');

    const procurementDashboard = await request(app)
      .get('/api/operations/procurement/dashboard')
      .set('Authorization', `Bearer ${procurementToken}`);
    assertStatus(procurementDashboard, 200, 'procurement dashboard api');
    assertTruthy(
      procurementDashboard.body?.rows?.some((row) => `${row.id}` === `${procurementRecordId}` && row.status === 'Quoted'),
      'procurement dashboard reflects record update'
    );

    const contactCreate = await request(app)
      .post('/api/contacts')
      .send({
        fullName: 'Client B',
        email: 'clientb@test.com',
        phone: '+1234567891',
        subject: 'Bulk order',
        message: 'Please contact for bulk order.',
      });
    assertStatus(contactCreate, 201, 'contact create');
    const contactId = contactCreate.body?.data?._id;
    assertTruthy(contactId, 'contact id');

    const quotesList = await request(app)
      .get('/api/quotes')
      .set('Authorization', `Bearer ${adminToken}`);
    assertStatus(quotesList, 200, 'quotes list');

    const contactsList = await request(app)
      .get('/api/contacts')
      .set('Authorization', `Bearer ${adminToken}`);
    assertStatus(contactsList, 200, 'contacts list');

    const quoteStatus = await request(app)
      .patch(`/api/quotes/${quoteId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'in_review', note: 'Checked' });
    assertStatus(quoteStatus, 200, 'quote status update');

    const contactStatus = await request(app)
      .put(`/api/contacts/${contactId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'read' });
    assertStatus(contactStatus, 200, 'contact status update');

    const createAdmin = await request(app)
      .post('/api/super-admin/admins')
      .set('Authorization', `Bearer ${superToken}`)
      .send({
        name: 'Editor One',
        email: 'editor1@graven.test',
        password: 'Password123',
        role: 'editor',
      });
    assertStatus(createAdmin, 201, 'super admin create admin');
    const createdAdminId = createAdmin.body?.id;
    assertTruthy(createdAdminId, 'created admin id');

    const assignPermissions = await request(app)
      .patch(`/api/super-admin/admins/${createdAdminId}/permissions`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ permissions: ['manage_products', 'manage_blogs'], role: 'editor' });
    assertStatus(assignPermissions, 200, 'assign permissions');

    const analytics = await request(app)
      .get('/api/super-admin/analytics')
      .set('Authorization', `Bearer ${superToken}`);
    assertStatus(analytics, 200, 'analytics fetch');

    const settingsUpdate = await request(app)
      .patch('/api/super-admin/settings')
      .set('Authorization', `Bearer ${superToken}`)
      .send({ siteName: 'GRAVEN METAL', supportEmail: 'support@graven.test', maintenanceMode: false });
    assertStatus(settingsUpdate, 200, 'settings update');

    const seoUpdate = await request(app)
      .patch('/api/super-admin/seo')
      .set('Authorization', `Bearer ${superToken}`)
      .send({
        metaTitle: 'GRAVEN METAL',
        metaDescription: 'Premium metal trading',
        keywords: ['metal', 'gold'],
      });
    assertStatus(seoUpdate, 200, 'seo update');

    const backup = await request(app)
      .post('/api/super-admin/backup')
      .set('Authorization', `Bearer ${superToken}`);
    assertStatus(backup, 200, 'database backup');

    const productDelete = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assertStatus(productDelete, 200, 'product delete');

    const categoryDelete = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assertStatus(categoryDelete, 200, 'category delete');

    const blogDelete = await request(app)
      .delete(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assertStatus(blogDelete, 200, 'blog delete');

    const deleteAdmin = await request(app)
      .delete(`/api/super-admin/admins/${createdAdminId}`)
      .set('Authorization', `Bearer ${superToken}`);
    assertStatus(deleteAdmin, 200, 'delete created admin');

    console.log('SMOKE TEST PASSED: auth, CRUD, quote/contact, admin/super-admin flows are working.');
  } finally {
    await mongoose.disconnect();
    await mongod.stop();
  }
};

run().catch((error) => {
  console.error('SMOKE TEST FAILED:', error.message);
  if (error?.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
