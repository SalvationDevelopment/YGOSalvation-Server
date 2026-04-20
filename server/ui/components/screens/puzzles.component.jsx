'use client';

import React, { startTransition, useEffect, useState } from 'react';
import { emit } from '../../services/listener.service';
import styles from './puzzles.component.module.scss';

function describeStartingPlayer(slot) {
  return Number(slot) === 1 ? 'Player 2 / Team 2' : 'Player 1 / Team 1';
}

export default function PuzzlesScreen() {
  const [puzzles, setPuzzles] = useState([]);
  const [selectedPuzzleId, setSelectedPuzzleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadPuzzles() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/puzzles', {
          cache: 'no-store'
        });
        const payload = await response.json();
        const nextPuzzles = Array.isArray(payload?.puzzles) ? payload.puzzles : [];

        if (cancelled) {
          return;
        }

        setPuzzles(nextPuzzles);
        setSelectedPuzzleId((current) => current || nextPuzzles[0]?.id || '');
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(loadError?.message || 'Failed to load puzzles.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPuzzles();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPuzzle =
    puzzles.find((puzzle) => puzzle.id === selectedPuzzleId) || puzzles[0] || null;

  function selectPuzzle(puzzleId) {
    startTransition(() => {
      setSelectedPuzzleId(puzzleId);
    });
  }

  function startPuzzle() {
    if (!selectedPuzzle?.hostConfig) {
      return;
    }

    emit({
      action: 'HOST',
      hostConfig: selectedPuzzle.hostConfig
    });
  }

  return (
    <section className={styles.root} id='puzzles-screen'>
      <header className={styles.hero}>
        <h1>Puzzles</h1>
        <p>
          Puzzle rooms skip the regular lobby setup. Pick a scripted duel, launch
          it, and the room will advance straight into the puzzle state.
        </p>
      </header>
      {loading ? <div className={styles.emptyState}>Loading puzzles...</div> : null}
      {!loading && error ? <div className={styles.error}>{error}</div> : null}
      {!loading && !error && !selectedPuzzle ? (
        <div className={styles.emptyState}>No puzzles are available right now.</div>
      ) : null}
      {!loading && !error && selectedPuzzle ? (
        <div className={styles.layout}>
          <div className={styles.list} id='puzzle-list'>
            {puzzles.map((puzzle) => (
              <button
                key={puzzle.id}
                type='button'
                className={styles.puzzleButton}
                data-puzzle-id={puzzle.id}
                data-selected={String(puzzle.id === selectedPuzzle.id)}
                onClick={() => selectPuzzle(puzzle.id)}
              >
                <span className={styles.puzzleName}>{puzzle.name}</span>
                <span className={styles.puzzleMeta}>{puzzle.opponentName}</span>
              </button>
            ))}
          </div>
          <article className={styles.panel}>
            <h2 id='selected-puzzle-name'>{selectedPuzzle.name}</h2>
            <p id='selected-puzzle-description'>{selectedPuzzle.description}</p>
            <dl className={styles.facts}>
              <div>
                <dt>Deck</dt>
                <dd id='selected-puzzle-deck'>{selectedPuzzle.deck?.name || 'Puzzle Deck'}</dd>
              </div>
              <div>
                <dt>Opponent</dt>
                <dd id='selected-puzzle-opponent'>{selectedPuzzle.opponentName || 'AI Opponent'}</dd>
              </div>
              <div>
                <dt>Starting player</dt>
                <dd id='selected-puzzle-starting-player'>
                  {describeStartingPlayer(selectedPuzzle.startingPlayerSlot)}
                </dd>
              </div>
            </dl>
            <button
              id='startpuzzle'
              type='button'
              className={styles.startButton}
              onClick={startPuzzle}
            >
              Start Puzzle
            </button>
          </article>
        </div>
      ) : null}
    </section>
  );
}
