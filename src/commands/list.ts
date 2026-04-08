import type { Command } from 'commander';

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .description('등록된 프로필 목록을 출력합니다')
    .action(async () => {
      // Phase 4에서 구현
      console.log('list: not yet implemented');
    });
}
