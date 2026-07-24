import test from 'node:test';
import assert from 'node:assert/strict';
import { formatInventoryMileage, normalizeInventoryBadge, parseInventoryMileage } from './inventoryDisplay';

test('normalizeInventoryBadge suppresses fallback and generic badges', () => {
  assert.equal(normalizeInventoryBadge('Fallback Inventory'), null);
  assert.equal(normalizeInventoryBadge('Available'), null);
  assert.equal(normalizeInventoryBadge('Low Miles'), 'Low Miles');
});

test('formatInventoryMileage treats suspiciously low values as unavailable', () => {
  assert.equal(formatInventoryMileage('17'), 'Mileage TBD');
  assert.equal(formatInventoryMileage(4086), '4,086');
});

test('parseInventoryMileage uses zero for suspicious mileage values', () => {
  assert.equal(parseInventoryMileage('17'), 0);
  assert.equal(parseInventoryMileage(4086), 4086);
});
