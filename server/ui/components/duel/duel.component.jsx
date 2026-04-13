import React, { useEffect } from 'react';
import styles from './duel.component.module.scss';
/*global Store, Field, CardInfo, SideChat, Flasher, Revealer, ControlButtons, LifepointDisplay */
/*global SelectPosition, DeckDialog, YesNoDialog, SelectOptionDialog, SelectAttributes, AnnounceCardDialog, Chainer, ExtraControls*/
import { MountedAttackAnimationLayer } from './attack.animation.component';
import { MountedSelectAttributes } from './attribute.component';
import { MountedPhaseBanner } from './phase.banner.component';
import { MountedChainer } from './chain.component';
import { MountedExtraControls } from './extracontrols.component';
import { MountedFieldRevealOverlay } from './field.reveal.component';
import { MountedIdleExtraDeckViewer } from './idle.extra.viewer.component';
import { MountedField } from './field.component';
import { MountedSideChat } from './sidechat.component';
import { MountedCardInfo } from './cardinfo.component';
import { MountedLifepointDisplay } from './lifepoint.component';
import { AnnounceCardDialog } from './announce.card.component';
import { MountedControlButtons } from './controls.component';
import { MountedSelectPosition } from './position.component';
import { MountedRevealer } from './reveal.component';
import { MountedSelectOptionDialog } from './select.option.component';
import { MountedDeckDialog } from './view_decks.component';
import { MountedFlasher } from './anouncement.component';
import { MountedYesNoDialog } from './yesno.component';
import { defaultDuelFieldDomEffectsService } from '../../services/duel-field-dom-effects.service';
import { createDuelScreenController } from '../../services/duel-screen-controller.service';

const defaultFieldDomEffectsService = defaultDuelFieldDomEffectsService;

function LegacyControllerSlot({ id, className, children }) {
    return (
        <div id={id} className={className}>
            {children}
        </div>
    );
}

export function DuelRuntimeScene({
    duel,
    fieldDomEffectsService = defaultFieldDomEffectsService
}) {
    useEffect(() => {
        fieldDomEffectsService.layoutHand(0);
        fieldDomEffectsService.layoutHand(1);
    });

    if (!duel) {
        return null;
    }

    return (
        <div className={styles.root}>
            <LegacyControllerSlot id="sidechat" key="sidechat"><MountedSideChat controller={duel.sidechat} /></LegacyControllerSlot>
            <LegacyControllerSlot id="extracontrols" key="extracontrols">
                <MountedExtraControls
                    controls={duel.controls}
                    databaseSystem={duel.databaseSystem}
                    chainController={duel.chainer}
                />
            </LegacyControllerSlot>
            <LegacyControllerSlot id="actions" key="actions"><MountedControlButtons controller={duel.controls} /></LegacyControllerSlot>
            <LegacyControllerSlot id="ingamecardimage" key="ingamecardimage"><MountedCardInfo controller={duel.info} /></LegacyControllerSlot>
            <LegacyControllerSlot id="lifepoints" key="lifepoints"><MountedLifepointDisplay controller={duel.lifepoints} /></LegacyControllerSlot>
            <LegacyControllerSlot id="phasebanner" key="phasebanner"><MountedPhaseBanner store={duel.store} /></LegacyControllerSlot>
            <LegacyControllerSlot id="fieldreveal" key="fieldreveal"><MountedFieldRevealOverlay store={duel.store} /></LegacyControllerSlot>
            <LegacyControllerSlot id="attacklayer" key="attacklayer"><MountedAttackAnimationLayer store={duel.store} /></LegacyControllerSlot>
            <LegacyControllerSlot id="revealer" key="revealer"><MountedRevealer store={duel.store} /></LegacyControllerSlot>
            <LegacyControllerSlot id="idleExtraDeckViewer" key="idleExtraDeckViewer"><MountedIdleExtraDeckViewer store={duel.store} /></LegacyControllerSlot>
            <LegacyControllerSlot id="chain" key="chain"><MountedChainer controller={duel.chainer} /></LegacyControllerSlot>
            <LegacyControllerSlot id="positionDialog" key="positionDialog"><MountedSelectPosition store={duel.store} /></LegacyControllerSlot>
            <LegacyControllerSlot id="yesnoDialog" key="yesnoDialog"><MountedYesNoDialog store={duel.store} /></LegacyControllerSlot>
            <LegacyControllerSlot id="optionDialog" key="optionDialog"><MountedSelectOptionDialog store={duel.store} /></LegacyControllerSlot>
            <LegacyControllerSlot id="announceCardDialog" key="announceCardDialog"><AnnounceCardDialog store={duel.store} database={duel.databaseSystem} /></LegacyControllerSlot>
            <LegacyControllerSlot id="viewDecks" key="viewDecks"><MountedDeckDialog store={duel.store} /></LegacyControllerSlot>
            <LegacyControllerSlot id="announcer" key="announcer"><MountedFlasher store={duel.store} /></LegacyControllerSlot>
            <LegacyControllerSlot id="attributes" key="attributes"><MountedSelectAttributes store={duel.store} /></LegacyControllerSlot>
            <LegacyControllerSlot className="field newfield" key="field-newfield">
                <div
                    id="automationduelfield"
                    className="fieldimage"
                    style={{
                        display: 'block'
                    }}
                >
                    <MountedField controller={duel.field} />
                </div>
            </LegacyControllerSlot>
        </div>
    );
}

export function DuelScreenState(store, chat, databaseSystem, dependencies = {}) {
    return createDuelScreenController(store, chat, databaseSystem, dependencies);
}

export function DuelScreen(store, chat, databaseSystem, dependencies = {}) {
    return DuelScreenState(store, chat, databaseSystem, dependencies);
}
