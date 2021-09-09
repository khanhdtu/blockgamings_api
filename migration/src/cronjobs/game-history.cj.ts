import {inject} from '@loopback/core';
import {CronJob, cronJob} from '@loopback/cron';
import {KeyBindings} from '../keys';
import {GameHistoryService} from '../services';

@cronJob()
export class GameHistoryMigrationCronJob extends CronJob {
  constructor(
    @inject(KeyBindings.GAME_HISTORY_MIGRATION_SERVICE)
    public gameHistoryService: GameHistoryService,
  ) {
    super({
      name: 'job-game-history-migration',
      cronTime: '*/90 * * * * *',
      onTick: async () => {
        // await this.gameHistoryService.newGameHistories();
        await this.gameHistoryService.migrate();
      },
      start: true,
    });

    this.gameHistoryService
      .init()
      .then(() => {
        console.log('Initialized GAME HISTORY migration successfully');
      })
      .catch(err => {
        console.log('GAME HISTORY migration failed', err);
      });
  }
}
