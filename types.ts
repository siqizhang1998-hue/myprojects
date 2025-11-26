import React from 'react';

export enum TileType {
  MASK = 'MASK',       // Persona
  SQUID = 'SQUID',     // Splatoon
  CUP = 'CUP',         // Cuphead
  NAIL = 'NAIL',       // Hollow Knight
  HEART = 'HEART',
  STAR = 'STAR'
}

export enum SpecialType {
  NONE = 'NONE',
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
  RAINBOW = 'RAINBOW'
}

export enum GameState {
  IDLE = 'IDLE',
  SELECTED = 'SELECTED',
  SWAPPING = 'SWAPPING',
  MATCHING = 'MATCHING',
  GAME_OVER = 'GAME_OVER'
}

export interface Tile {
  id: string;
  type: TileType;
  x: number;
  y: number;
  special?: SpecialType;
  isMatched?: boolean;
  isNew?: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  style: React.CSSProperties;
}