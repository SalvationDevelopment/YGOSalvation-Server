import React, { useEffect, useReducer } from 'react';
import { MountedZoneSelector } from './zone.selection.component';
import styles from './field.selection.component.module.scss';

function resolveCanonicalZonePlayer(player, query = {}) {
    const normalizedPlayer = Number(player);

    if (query?.command === 'MSG_SELECT_PLACE' && Number.isInteger(Number(query?.player))) {
        const promptPlayer = Number(query.player);
        return window.orientation ? (promptPlayer ? 0 : 1) : promptPlayer;
    }

    if (normalizedPlayer !== 0 && normalizedPlayer !== 1) {
        return 0;
    }

    return window.orientation ? (normalizedPlayer ? 0 : 1) : normalizedPlayer;
}

function setupFieldSelectorZones(zoneType, count) {
    const selectors = [];
    for (let player = 0; player <= 1; player++) {
        for (let index = 0; index <= count; index++) {
            selectors.push({
                index,
                location: zoneType,
                player,
                uid: `selector-player_${player}-${zoneType}-${index}`
            });
        }
    }
    return selectors;
}

const FIELD_SELECTOR_ZONES = [
    ...setupFieldSelectorZones('SPELLZONE', 7),
    ...setupFieldSelectorZones('MONSTERZONE', 7),
    ...setupFieldSelectorZones('DECK', 1),
    ...setupFieldSelectorZones('EXTRA', 1),
    ...setupFieldSelectorZones('GRAVE', 1),
    ...setupFieldSelectorZones('BANISHED', 1)
];

function forceFieldSelectionRender(controller) {
    controller?.store?.emit?.({ action: 'RENDER' });
}

function useFieldSelectionVersion(controller) {
    const [, forceRender] = useReducer((value) => value + 1, 0);

    useEffect(() => {
        if (!controller?.store?.on) {
            return undefined;
        }

        return controller.store.on('RENDER', () => {
            forceRender();
        });
    }, [controller]);
}

export function disableFieldSelection(controller) {
    if (!controller?.state) {
        return;
    }

    controller.state.activeZones = [];
    forceFieldSelectionRender(controller);
}

export function selectFieldZones(controller, query) {
    if (!controller?.state) {
        return;
    }

    controller.state.activeZones = (query?.zones || []).reduce((activeZones, zone) => {
        const player = resolveCanonicalZonePlayer(zone.player, query),
            uuid = `selector-player_${player}-${zone.location}-${zone.index}`;

        if (FIELD_SELECTOR_ZONES.some((fieldZone) => fieldZone.uid === uuid)) {
            activeZones.push(uuid);
        }

        return activeZones;
    }, []);

    forceFieldSelectionRender(controller);
}

export function FieldSelector({ controller }) {
    useFieldSelectionVersion(controller);

    if (!controller) {
        return null;
    }

    const activeZones = new Set(controller.state?.activeZones || []);

    return (
        <div className={styles.root} id="selectionsystem">
            {FIELD_SELECTOR_ZONES.map((zone) => (
                <MountedZoneSelector
                    active={activeZones.has(zone.uid)}
                    key={zone.uid}
                    store={controller.store}
                    zone={zone}
                />
            ))}
        </div>
    );
}

export function MountedFieldSelector({ controller }) {
    return <FieldSelector controller={controller} />;
}

export default FieldSelector;
