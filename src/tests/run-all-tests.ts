/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * CLI Test Runner Script
 */

import { TestRunner } from '../../server/tests/testRunner.js';

async function main() {
  console.log('====================================================');
  console.log('SUTRADHAR: RUNNING AUTOMATED INVARIANT TEST SUITE');
  console.log('====================================================\n');

  const report = await TestRunner.runAllTests();

  for (const item of report.results) {
    const symbol = item.status === 'passed' ? '✅ PASS' : '❌ FAIL';
    console.log(`${symbol} [${item.category}] ${item.name} (${item.executionTimeMs}ms)`);
    console.log(`       Assertion: ${item.assertion}`);
    if (item.error) {
      console.log(`       Error: ${item.error}`);
    }
  }

  console.log('\n----------------------------------------------------');
  console.log(`SUMMARY: ${report.passedCount}/${report.totalCount} passed. (${report.failedCount} failed)`);
  console.log('----------------------------------------------------');

  if (report.failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal test execution failure:', err);
  process.exit(1);
});
