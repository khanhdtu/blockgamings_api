/* eslint-disable @typescript-eslint/naming-convention */
import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import axios from 'axios';
import {
  GameHistoryRepository,
  MigrationFailedRepository,
  MigrationRepository,
} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class GameHistoryService {
  model = 'game-history';
  modelId = '';
  url = `${process.env.MIGRATION_URL}/migration/game-history`;
  migrationAt = 1623836497;
  currentMigrationId = '';
  currentMigrationAt = 0;
  startTime = 0;
  endTime = 0;

  step = 500;
  skip = 0;
  totalMigrated = 0;
  limit = 2000;

  constructor(
    @repository(MigrationRepository)
    public migrationRepo: MigrationRepository,

    @repository(MigrationFailedRepository)
    public migrationFailedRepo: MigrationFailedRepository,

    @repository(GameHistoryRepository)
    public gameHistoryRepo: GameHistoryRepository,
  ) {}

  /*
   * Add service methods here
   */
  async init() {
    const migrated = await this.migrationRepo.findOne({
      where: {model: this.model},
    });
    if (migrated) {
      this.modelId = migrated.id ?? '';
      await this.migrationRepo.updateById(migrated.id ?? '', {
        migratedAt: this.migrationAt,
        completed: false,
      });
    } else {
      const migration = await this.migrationRepo.create({
        model: this.model,
        migratedAt: this.migrationAt,
        completed: false,
      });
      this.modelId = migration.id ?? '';
    }
  }

  async newGameHistories() {
    try {
      const migrated = await this.migrationRepo.findOne({
        where: {model: this.model},
      });
      this.currentMigrationId = migrated?.id ?? '';
      this.startTime = migrated?.migratedAt ?? 0;
      this.endTime = this.startTime + 60;
      const historiesV2: any[] = [];
      const historiesV1 = await this.gameHistoryRepo.find({
        where: {
          time: {
            between: [this.startTime, this.endTime],
          },
        },
      });

      if (historiesV1.length) {
        historiesV1.map(history => {
          historiesV2.push({
            id: history._id,
            username: history.user_name,
            type: history.type,
            balance: history.balance,
            amount: history.amount,
            currency: history.currency,
            gameId: history.i_gameid ?? '',
            system: history.system,
            refunded: history.refunded,
            createdAt: (history.time ?? 0) * 1000,
          });
        });

        try {
          await axios.post(`${this.url}/migration/game-history`, {
            livebets: historiesV2,
          });
        } catch (error) {
          console.log('migrate GAME HISTORY error:', error.response.status);
        }
        console.log(
          `${historiesV2.length} records of GAME HISTORY was migrated successfully`,
        );
      }

      await this.migrationRepo.updateById(migrated?.id, {
        model: this.model,
        migratedAt: this.endTime,
        completed: true,
      });

      const message = `GAME HISTORY migrated at: ${new Date(
        this.endTime * 1000,
      )}`;
      console.log(message);
      return message;
    } catch (error) {
      await this.migrationRepo.updateById(this.currentMigrationId, {
        model: this.model,
        migratedAt: this.endTime,
        completed: false,
      });
    }
  }

  async migration() {
    try {
      const livebetsV2: any[] = [];
      const livebets = await this.gameHistoryRepo.find({
        limit: this.step,
        skip: this.skip * this.step,
      });
      livebets.map(bet => {
        livebetsV2.push({
          id: bet._id,
          username: bet.user_name,
          type: bet.type,
          balance: bet.balance,
          amount: bet.amount,
          currency: bet.currency,
          gameId: bet.i_gameid ?? '',
          system: bet.system,
          refunded: bet.refunded,
          createdAt: (bet.time ?? 0) * 1000,
        });
      });
      if (livebetsV2.length) {
        try {
          await axios.post(`${this.url}/migration/game-history`, {
            livebets: livebetsV2,
          });
        } catch (error) {
          console.log('migrate GAME HISTORY error:', error.response.status);
        }
      }
      console.log(
        `migrated ${livebetsV2.length} records of GAME HISTORY successfully`,
      );
      this.skip++;
      return 'success';
    } catch (error) {
      return error;
    }
  }

  async migrate() {
    try {
      const found = await this.migrationRepo.findById(this.modelId);
      if (found.locked) {
        console.log('Game History table is locked');
        return;
      } else {
        console.log('---start migration game history---');
        const unmigrations = await this.migrationFailedRepo.find({
          where: {model: this.model},
        });
        unmigrations.map(async game => {
          try {
            const _game = await axios.post(this.url, {
              game: {
                id: game._id,
                username: game.user_name,
                type: game.type,
                balance: game.balance,
                amount: game.amount,
                currency: game.currency,
                gameId: game.i_gameid ?? '',
                system: game.system,
                refunded: game.refunded,
                createdAt: (game.time ?? 0) * 1000,
              },
            });
            if (_game.data.statusCode === 200 || _game.data.code === 11000) {
              await this.migrationFailedRepo.deleteById(game._id);
              console.log(`done error game: ${game._id}`);
            } else {
              console.log('error game again:', _game.data.code);
            }
          } catch (error) {
            console.log('error game again:', game._id);
          }
        });

        this.totalMigrated = found.totalMigrated ?? 0;
        const games = await this.gameHistoryRepo.find({
          skip: this.totalMigrated,
          limit: this.limit,
        });
        games.map(async game => {
          try {
            const _game = await axios.post(this.url, {
              game: {
                id: game._id,
                username: game.user_name,
                type: game.type,
                balance: game.balance,
                amount: game.amount,
                currency: game.currency,
                gameId: game.i_gameid ?? '',
                system: game.system,
                refunded: game.refunded,
                createdAt: (game.time ?? 0) * 1000,
              },
            });
            if (_game.data.statusCode === 200) {
              console.log('done game:', game._id);
            } else {
              console.log('game error something:', _game?.data?.statusCode);
              await this.migrationFailedRepo.create({
                model: this.model,
                errorCode: _game?.data?.statusCode,
                ...game,
              });
            }
          } catch (error) {
            console.log('error  game:', game._id);
            await this.migrationFailedRepo.create({
              model: this.model,
              errorCode: error?.data?.statusCode,
              ...game,
            });
          }
          this.totalMigrated++;
          await this.migrationRepo.updateById(this.modelId, {
            totalMigrated: this.totalMigrated,
          });
        });
      }
    } catch (error) {
      return error;
    }
  }
}
