import test from 'node:test';
import assert from 'node:assert/strict';
import { demoEngine } from '../src/engine.mjs';

test('demo engine labels the source as demo and exposes no live connection claim', () => {
  const engine = demoEngine();
  assert.equal(engine.evidenceMode, 'demo');
  assert.equal(engine.projectId, 'practice-project');
});

test('demo identity keeps device compliance unknown when it is not verified', async () => {
  const identity = await demoEngine().readIdentity();
  assert.equal(identity.user.id, 'practice-user');
  assert.equal(identity.device.status, 'unknown');
  assert.equal(identity.session.status, 'active');
});

test('demo apps include enough options to demonstrate distinct access decisions', async () => {
  const engine = demoEngine();
  const apps = await engine.readApps();
  assert.equal(apps.length, 5);
  assert.equal(new Set(apps.map((app) => app.id)).size, apps.length);

  const decisions = await Promise.all(apps.map((app) => engine.decideAccess({ appId: app.id })));
  assert.deepEqual(new Set(decisions.map((row) => row.decision)), new Set(['allow', 'deny', 'challenge']));
  for (const result of decisions) {
    assert.equal(typeof result.reason, 'string');
    assert.ok(Number.isFinite(Date.parse(result.checkedAt)));
  }
});

test('demo timeline covers access and XDR examples with safe unknown states', async () => {
  const events = await demoEngine().readEvents();
  assert.ok(events.length >= 5);
  assert.ok(events.some((event) => event.kind === 'access'));
  assert.ok(events.some((event) => event.kind === 'xdr'));
  assert.ok(events.some((event) => event.state.access === 'denied'));
  assert.ok(events.some((event) => event.state.access === 'allowed'));
  assert.ok(events.some((event) => event.state.access === 'unknown'));

  const ids = events.map((event) => event.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const event of events) {
    assert.ok(Number.isFinite(Date.parse(event.at)));
    assert.ok(Array.isArray(event.evidence));
    assert.ok(Array.isArray(event.rules));
    assert.ok(['allowed', 'denied', 'unknown'].includes(event.state.access));
    assert.ok(['active', 'expired', 'revoked', 'unknown'].includes(event.state.session));
    assert.ok(['compliant', 'noncompliant', 'unknown'].includes(event.state.device));
  }

  const newestFirst = [...events].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  assert.equal(newestFirst[0].id, 'demo-event-06');
  assert.notEqual(events[0].id, newestFirst[0].id);
});

test('demo returns fresh copies and rejects an unknown application instead of guessing', async () => {
  const engine = demoEngine();
  const first = await engine.readEvents();
  first[0].summary = 'mutated by test';
  assert.notEqual((await engine.readEvents())[0].summary, 'mutated by test');

  await assert.rejects(
    engine.decideAccess({ appId: 'not-in-demo-catalog' }),
    (error) => error.code === 'APP_NOT_FOUND' && error.status === 404,
  );
});
