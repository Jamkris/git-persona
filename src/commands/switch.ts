import type { Command } from 'commander';

export function registerSwitchCommand(program: Command): void {
  program
    .command('switch <profile>')
    .description('전역 기본 프로필을 변경합니다')
    .action(async (_profile: string) => {
      // Phase 4에서 구현
      console.log('switch: not yet implemented');
    });
}
