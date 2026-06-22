const fs = require('fs');

const files = [
  'apps/api/src/modules/members/gamification.service.ts',
  'apps/api/src/modules/members/gamification.service.test.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`').replace(/\\\$\{/g, '${');
  fs.writeFileSync(file, content);
}
