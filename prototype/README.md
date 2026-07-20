# TeachFlow operational prototype

Первый проверяемый кодовый контур TeachFlow. Он развивается отдельно от опубликованного статического лендинга в корне репозитория.

## Текущий scope

Реализована framework-independent доменная модель `LessonSession`:

- opaque UUID;
- назначенные teacher/student;
- проверка доступа;
- переходы `scheduled → live → ended`;
- provider-neutral video room и collaboration document identifiers;
- одно immutable outcome reference после завершения.

Пока не реализованы Payload, PostgreSQL, UI, video, Yjs/Hocuspocus и приглашения. Их нельзя считать working capabilities.

## Команды

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm audit --audit-level=moderate
```

## Структура

```text
src/domain/lesson-session.ts      доменная модель без framework dependency
tests/lesson-session.test.ts      поведенческие тесты
dist/                             локальный build, не коммитится
```

## Будущий Payload mapping

Следующий persistence adapter должен отобразить доменную модель в коллекцию `lesson-sessions`:

| Domain | Payload field |
|---|---|
| `id` | document ID / UUID |
| `teacherId` | relationship → users |
| `studentId` | relationship → users |
| `status` | select: scheduled/live/ended |
| `videoRoomName` | private text |
| `collaborationDocumentId` | private text |
| `outcomeId` | optional relationship → outcomes |

Payload access rules должны вызывать ту же доменную проверку. Любой Local API-вызов от имени пользователя обязан передавать user context и `overrideAccess: false`.

## TDD evidence

Первый RED был получен до production-кода:

```text
FAIL tests/lesson-session.test.ts
Cannot find module '../src/domain/lesson-session.js'
```

После минимальной реализации все 5 тестов прошли. Следующие возможности также добавляются отдельными RED → GREEN циклами.
