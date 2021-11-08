/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Column, Entity, ManyToOne, UpdateDateColumn } from 'typeorm';

import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';

@Entity()
export class HistoryEntry {
  @ManyToOne((_) => User, (user) => user.historyEntries, {
    onDelete: 'CASCADE',
    primary: true,
  })
  user: User;

  @ManyToOne((_) => Note, (note) => note.historyEntries, {
    onDelete: 'CASCADE',
    primary: true,
  })
  note: Note;

  @Column()
  pinStatus: boolean;

  @UpdateDateColumn()
  updatedAt: Date;

  public static create(
    user: User,
    note: Note,
  ): Omit<HistoryEntry, 'updatedAt'> {
    const newHistoryEntry = new HistoryEntry();
    newHistoryEntry.user = user;
    newHistoryEntry.note = note;
    newHistoryEntry.pinStatus = false;
    return newHistoryEntry;
  }
}
