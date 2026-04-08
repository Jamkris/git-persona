import type { Command } from 'commander';

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('~/.gh-persona 디렉토리와 초기 설정 파일을 생성합니다')
    .action(async () => {
      // Phase 2에서 구현
      console.log('init: not yet implemented');
    });
}
