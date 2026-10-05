const assert=require('assert');
const crypto=require('crypto');
process.env.AUTH_SECRET='test-secret-that-is-long-enough-for-production-style-tests-123456';
const auth=require('../src/modules/auth/auth.service');

const hash=auth.hashPassword('StrongPass!123');
assert.ok(hash.startsWith('scrypt$'));
assert.strictEqual(auth.verifyPassword('StrongPass!123',hash),true);
assert.strictEqual(auth.verifyPassword('wrong',hash),false);
const token=auth.signAdminToken(60);
const claims=auth.verify(token);
assert.strictEqual(claims.role,'admin');
assert.strictEqual(claims.type,'admin');
assert.ok(claims.exp>claims.iat);
const tampered=token.slice(0,-1)+(token.endsWith('a')?'b':'a');
assert.strictEqual(auth.verify(tampered),null);
console.log('security tests passed');
