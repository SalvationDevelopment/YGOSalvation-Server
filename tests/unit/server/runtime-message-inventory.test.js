const assert = require('node:assert/strict');
const test = require('node:test');

const {
  CANONICAL_ROOM_MESSAGE_INVENTORY,
  LEGACY_LOBBY_ACTION_INVENTORY,
  LEGACY_ROOM_ACTION_INVENTORY
} = require('../../../server/runtime-message-inventory');
const {
  translateIncomingRuntimeMessage
} = require('../../../server/runtime-translation');
const {
  getMessageOwner
} = require('../../../server/runtime-dispatcher');

test('runtime message inventory keeps action and type entries unique', () => {
  const legacyActions = [
      ...LEGACY_LOBBY_ACTION_INVENTORY.map((entry) => entry.action),
      ...LEGACY_ROOM_ACTION_INVENTORY.map((entry) => entry.action)
    ],
    canonicalTypes = CANONICAL_ROOM_MESSAGE_INVENTORY.map((entry) => entry.type);

  assert.equal(new Set(legacyActions).size, legacyActions.length);
  assert.equal(new Set(canonicalTypes).size, canonicalTypes.length);
});

test('runtime message inventory marks all canonical room packets as room-owned keep messages', () => {
  CANONICAL_ROOM_MESSAGE_INVENTORY.forEach((entry) => {
    assert.equal(entry.owner, 'room');
    assert.equal(entry.disposition, 'keep');
    assert.equal(getMessageOwner({ type: entry.type }), 'room');
  });
});

test('runtime message inventory classifies legacy lobby and room actions explicitly', () => {
  LEGACY_LOBBY_ACTION_INVENTORY.forEach((entry) => {
    assert.equal(entry.owner, 'lobby');
    assert.match(entry.disposition, /^(keep|translate)$/);
    assert.equal(getMessageOwner({ action: entry.action }), 'lobby');
  });

  LEGACY_ROOM_ACTION_INVENTORY.forEach((entry) => {
    assert.equal(entry.owner, 'room');
    assert.match(entry.disposition, /^(translate|delete)$/);

    if (entry.disposition === 'translate') {
      assert.equal(getMessageOwner({ action: entry.action }), 'room');
      assert.equal(
        translateIncomingRuntimeMessage({ action: entry.action }).protocolMode,
        'legacy-room'
      );
    }

    if (entry.disposition === 'delete') {
      assert.equal(getMessageOwner({ action: entry.action }), null);
      assert.equal(
        translateIncomingRuntimeMessage({ action: entry.action }).protocolMode,
        'deleted-room-action'
      );
    }
  });
});
