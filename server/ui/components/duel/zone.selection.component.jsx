import React, { useRef } from 'react';
import { createSelectPlaceAnswer } from '../../services/duel-response.service';
import styles from './zone.selection.component.module.scss';

export function getZoneSelectorViewerPlayer(zone) {
    return window.orientation ? (zone.player ? 0 : 1) : zone.player;
}

export function hoverZoneSelector(store, zone, hoveredRef) {
    if (!store || !zone || hoveredRef.current) {
        return;
    }

    hoveredRef.current = true;
    store.emit?.({
        action: 'ZONE_HOVER',
        player: zone.player,
        location: zone.location,
        index: zone.index
    });
}

export function unhoverZoneSelector(hoveredRef) {
    hoveredRef.current = false;
}

export function clickZoneSelector(store, zone) {
    if (!store || !zone) {
        return;
    }

    store.emit?.({
        action: 'ZONE_CLICK',
        manual: {
            choice: zone.index,
            location: zone.location
        },
        automatic: createSelectPlaceAnswer(
            getZoneSelectorViewerPlayer(zone),
            zone.location,
            zone.index
        )
    });
}

export function getZoneSelectorProperties(zone, active, store, hoveredRef) {
    const viewerPlayer = getZoneSelectorViewerPlayer(zone),
        className = ['cardselectionzone', 'p' + viewerPlayer, zone.location, 'i' + zone.index],
        style = {
            pointerEvents: active ? 'auto' : 'none',
            background: active ? 'rgba(255,0,0,.5)' : 'none'
        },
        count = Object.keys(app.duel.field.state.cards).reduce((total, uid) => {
            const card = app.duel.field.state.cards[uid];
            if (card.state.location === zone.location && zone.player === card.state.player) {
                return total + 1;
            }
            return total;
        }, 0);

    return {
        className: className.join(' '),
        'data-position': zone.position,
        'data-id': zone.id,
        'data-uid': zone.uid,
        'data-index': zone.index,
        'data-count': count ? count : '',
        reloaded: zone.reloaded,
        key: zone.uid,
        onError: function (event) {
            event.target.src = 'img/textures/unknown.jpg';
        },
        onMouseEnter: () => hoverZoneSelector(store, zone, hoveredRef),
        onMouseLeave: () => unhoverZoneSelector(hoveredRef),
        onClick: () => clickZoneSelector(store, zone),
        style
    };
}

export function ZoneSelector({ zone, active, store }) {
    const hoveredRef = useRef(false);

    if (!zone) {
        return null;
    }

    const properties = getZoneSelectorProperties(zone, active, store, hoveredRef);

    return <div {...properties} className={`${properties.className} ${styles.root}`.trim()} />;
}

export function MountedZoneSelector({ zone, active, store }) {
    return <ZoneSelector zone={zone} active={active} store={store} />;
}

export default ZoneSelector;
