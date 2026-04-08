import type { Command } from 'commander';

export function registerAddCommand(program: Command): void {
  program
    .command('add <profile>')
    .description('새 프로필을 대화형 프롬프트로 추가합니다')
    .action(async (_profile: string) => {
      // Phase 3에서 구현
      console.log('add: not yet implemented');
    });
}
