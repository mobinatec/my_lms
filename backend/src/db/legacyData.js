const fs = require('fs');
const path = require('path');
const { getPool } = require('../infra/database');

function read(file, fallback = []) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
const base = path.join(__dirname, '..', 'data');
const files = {
  enrollments: path.join(base, 'enrollments.json'),
  reviews: path.join(base, 'reviews.json'),
  subscriptions: path.join(base, 'subscriptions.json'),
  orders: path.join(base, 'orders.json'),
  messages: path.join(base, 'messages.json'),
  analytics: path.join(base, 'analytics.json'),
  audit: path.join(base, 'audit-log.json'),
  contacts: path.join(base, 'submissions.json'),
  settings: path.join(base, 'site-settings.json'),
};

async function userUuid(client, legacyId) {
  if (!legacyId) return null;
  const r = await client.query('SELECT id FROM users WHERE legacy_id=$1 OR id::text=$1 LIMIT 1', [String(legacyId)]);
  return r.rows[0]?.id || null;
}

async function migrateLegacyData() {
  const client = await getPool().connect();
  try {
    await client.query('CREATE TABLE IF NOT EXISTS legacy_migration_state (key VARCHAR(120) PRIMARY KEY, completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
    const done = await client.query("SELECT 1 FROM legacy_migration_state WHERE key='json_to_postgres_v1'");
    if (done.rowCount) return;
    await client.query('BEGIN');
    const courses = await client.query("SELECT id FROM content_items WHERE content_type='courses'");
    const courseIds = new Set(courses.rows.map(x => x.id));

    for (const e of read(files.enrollments)) {
      const uid = await userUuid(client, e.userId);
      if (!uid || !courseIds.has(String(e.courseId))) continue;
      await client.query(`INSERT INTO enrollments(user_id,course_id,plan_key,status,enrolled_at) VALUES($1,$2,$3,'active',COALESCE($4::timestamptz,NOW())) ON CONFLICT(user_id,course_id) DO NOTHING`, [uid, String(e.courseId), e.plan || 'free', e.createdAt || null]);
      const en = await client.query('SELECT id FROM enrollments WHERE user_id=$1 AND course_id=$2', [uid, String(e.courseId)]);
      if (en.rowCount) await client.query(`UPDATE enrollments SET status='active',progress=$2,progress_updated_at=COALESCE($3::timestamptz,progress_updated_at) WHERE id=$1`, [en.rows[0].id, Number(e.progress)||0, e.progressUpdatedAt||null]);
    }

    for (const r of read(files.reviews)) {
      const uid = await userUuid(client, r.userId);
      const assigned = await userUuid(client, r.assignedTo);
      await client.query(`INSERT INTO reviews(id,course_id,user_id,first_name,last_name,email,mobile,rating,body,status,assigned_to,created_at,updated_at)
        VALUES(gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,COALESCE($11::timestamptz,NOW()),COALESCE($11::timestamptz,NOW()))`,
        [courseIds.has(String(r.courseId)) ? String(r.courseId) : null, uid, r.guestName || 'مهمان', r.userId ? '' : 'مهمان', r.guestEmail || null, r.guestMobile || null, Number(r.rating) || 5, r.text || '', r.status || 'pending', assigned, r.createdAt || null]);
    }

    for (const m of read(files.messages)) {
      const uid = await userUuid(client, m.userId); if (!uid) continue;
      if (!courseIds.has(String(m.courseId))) continue;
      await client.query(`INSERT INTO messages(id,user_id,course_id,text,status,created_at) VALUES($1,$2,$3,$4,$5,COALESCE($6::timestamptz,NOW())) ON CONFLICT(id) DO NOTHING`, [String(m.id), uid, String(m.courseId), m.text || '', m.status || 'unread', m.createdAt || null]);
    }

    for (const s of read(files.subscriptions)) {
      const uid = await userUuid(client, s.userId); if (!uid || !s.planKey) continue;
      const p = await client.query('SELECT id FROM plans WHERE key=$1 LIMIT 1', [s.planKey]); if (!p.rowCount) continue;
      const legacyKey = String(s.id || `${s.userId}:${s.planKey}:${s.createdAt || ''}`);
      const exists = await client.query("SELECT 1 FROM subscriptions WHERE metadata->>'legacyId'=$1 OR (user_id=$2 AND plan_id=$3 AND status=$4 AND starts_at=COALESCE($5::timestamptz,starts_at)) LIMIT 1", [legacyKey,uid,p.rows[0].id,s.status||'active',s.createdAt||null]);
      if (!exists.rowCount) await client.query(`INSERT INTO subscriptions(user_id,plan_id,status,starts_at,created_at,metadata) VALUES($1,$2,$3,COALESCE($4::timestamptz,NOW()),COALESCE($4::timestamptz,NOW()),$5::jsonb)`, [uid,p.rows[0].id,s.status||'active',s.createdAt||null,JSON.stringify({legacyId:legacyKey})]);
    }

    for (const o of read(files.orders)) {
      const uid = await userUuid(client, o.userId); if (!uid) continue;
      const exists = await client.query("SELECT 1 FROM orders WHERE metadata->>'legacyId'=$1 LIMIT 1", [String(o.id)]); if (exists.rowCount) continue;
      const order = await client.query(`INSERT INTO orders(user_id,status,total_amount,currency,metadata,created_at,updated_at) VALUES($1,$2,$3,'IRR',$4::jsonb,COALESCE($5::timestamptz,NOW()),COALESCE($5::timestamptz,NOW())) RETURNING id`, [uid,o.status||'paid',Number(o.amount)||0,JSON.stringify({legacyId:o.id,type:o.type,planKey:o.planKey,title:o.title,paymentStatus:o.paymentStatus,paymentMethod:o.paymentMethod,transactionId:o.transactionId}),o.createdAt||null]);
      if (o.transactionId) await client.query(`INSERT INTO payments(order_id,provider,reference_id,amount,status,created_at,verified_at) VALUES($1,'legacy',$2,$3,'verified',COALESCE($4::timestamptz,NOW()),COALESCE($4::timestamptz,NOW()))`,[order.rows[0].id,o.transactionId,Number(o.amount)||0,o.paidAt||o.createdAt||null]);
    }

    for (const c of read(files.contacts)) {
      await client.query(`INSERT INTO contact_submissions(id,name,phone,email,subject,message,created_at) VALUES($1,$2,$3,$4,$5,$6,COALESCE($7::timestamptz,NOW())) ON CONFLICT(id) DO NOTHING`, [String(c.id),c.name||'',c.phone||'',c.email||null,c.subject||'درخواست عمومی',c.message||'',c.createdAt||null]);
    }

    const settings = read(files.settings, {});
    await client.query(`INSERT INTO site_settings(key,value) VALUES('main',$1::jsonb) ON CONFLICT(key) DO NOTHING`, [JSON.stringify(settings)]);

    for (const v of read(files.analytics)) {
      const uid = await userUuid(client,v.userId);
      await client.query(`INSERT INTO page_views(id,path,section,user_id,day,created_at) VALUES($1,$2,$3,$4,COALESCE($5::date,CURRENT_DATE),COALESCE($6::timestamptz,NOW())) ON CONFLICT(id) DO NOTHING`,[String(v.id),v.path||'/',v.section||'home',uid,v.day||null,v.at||null]);
    }
    for (const a of read(files.audit)) {
      const uid = await userUuid(client,a.userId);
      await client.query(`INSERT INTO audit_logs(user_id,action,entity,entity_id,metadata,created_at) VALUES($1,$2,$3,$4,$5::jsonb,COALESCE($6::timestamptz,NOW()))`,[uid,a.action||'legacy',a.entity||null,a.entityId||null,JSON.stringify({role:a.role||'legacy',...(a.meta||{})}),a.at||null]);
    }
    await client.query("INSERT INTO legacy_migration_state(key) VALUES('json_to_postgres_v1') ON CONFLICT DO NOTHING");
    await client.query('COMMIT');
    console.log('✔ Legacy data migration completed (non-destructive, one-time).');
  } catch (e) { await client.query('ROLLBACK'); throw e; }
  finally { client.release(); }
}
module.exports = { migrateLegacyData };
