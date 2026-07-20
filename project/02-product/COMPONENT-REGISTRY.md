# Реестр компонентов операционного прототипа

**Статус:** audit complete; v0 stack accepted 2026-07-20.
**Полные отчёты:** `../03-research/technical-audits/`.

## Решения v0

| Контур | Кандидат | Тип | Лицензия | Решение | Причина | Proof artifact |
|---|---|---|---|---|---|---|
| Domain/content core | Payload CMS 3.86.x + PostgreSQL | application/headless core | MIT | `REUSE` | TypeScript/Next.js, auth/access, configurable schema, REST/GraphQL/Local API | session CRUD + role access test |
| Video | LiveKit | programmable video service | Apache-2.0 | `WRAP` | JWT grants, React SDK, screen share, webhooks, same-page composition | 2-party room + reconnect |
| Collaboration | Yjs | CRDT engine | MIT | `REUSE` | shared types, transactions, awareness ecosystem | concurrent update test |
| Collaboration server | Hocuspocus 4.x | Yjs WebSocket/auth/persistence | MIT | `REUSE` | auth hooks, DB persistence, Redis later | ACL + reload + disconnect presence |
| Shared activity v0 | собственный минимальный Equation Activity | domain UI | own | `BUILD` | проверяет product boundary без зависимости от универсальной доски | 2 cursors + shared steps + snapshot |
| Interactive activities later | H5P | activity engine | mixed by package | `WRAP LATER` | зрелые интерактивные типы, но не workflow core | adapter spike after v0 |

## Canvas gate после v0

| Кандидат | Решение | Плюсы | Стоп-фактор / условие |
|---|---|---|---|
| BlockSuite Edgeless | `SPIKE / WRAP` | MPL-2.0, Yjs, custom blocks, strict OSS path | высокая интеграционная сложность; mobile и cursor UX проверить runtime |
| Excalidraw component | `FALLBACK / WRAP` | MIT, хороший canvas/export/mobile | нет готового collab backend и plugin API для native EquationBlock |
| tldraw SDK + sync | `HOLD` | лучший SDK/custom shapes/presence | не OSI open-source; нужен license/commercial gate |
| Plait | `RESERVE` | MIT, plugin architecture | collaboration stack строить самостоятельно |

## Отвергнуто как core

| Кандидат | Решение | Причина |
|---|---|---|
| Moodle | `REJECT` | зрелая LMS, но тяжёлый и навязанный runtime/model |
| Open edX | `REJECT` | очень высокая операционная масса |
| Canvas LMS | `REJECT` | Rails/LMS stack и институциональный runtime |
| Chamilo 2 | `DISPOSABLE ONLY` | возможен быстрый native-LMS pilot, но не долгосрочный core |
| Strapi | `SECOND CHOICE` | слабее Payload для application-domain/access logic |
| Directus 12 | `REJECT PENDING LEGAL` | source-available MSCL, не строгий OSS |
| BigBlueButton | `REJECT AS VIDEO` | полноценная classroom platform, дублирует TeachFlow workspace |
| Jitsi | `IFRAME FALLBACK` | быстрый embed, но отдельная UI/state boundary |
| OpenVidu | `SECOND CHOICE` | batteries included, но тяжелее LiveKit; license scope Meet проверить |
| Element Call | `REJECT` | Matrix infrastructure и актуальный AGPL/commercial contour |
| mediasoup | `REJECT` | signaling/auth/rooms/UI приходится строить самим |
| WBO | `REJECT` | standalone AGPL board, слабая предметная расширяемость |
| AFFiNE app | `REJECT` | слишком большой workspace product |
| Drawnix | `REFERENCE` | нет законченного multiplayer backend |
| Konva/Fabric | `REJECT` | слишком низкий уровень для быстрого prototype |

## Архитектурный контракт

```text
LessonSession {
  id, teacherId, studentId,
  status, scheduledStartAt,
  video: { provider, roomName },
  collaboration: { provider, documentId },
  outcomeId
}
```

```text
VideoAdapter
  createRoom(session)
  issueParticipantToken(session, user)
  receiveRoomEvent(event)

CollaborationAdapter
  issueDocumentToken(session, user)
  persistDocument(documentId, update)
  snapshotDocument(documentId)
```

## Неизменяемые правила

- fork ни одного внешнего проекта в v0;
- external room/document IDs привязаны к opaque `lesson_session_id`;
- LiveKit data packets не используются как durable storage;
- Yjs awareness не сохраняется;
- recording выключен;
- универсальная доска не блокирует первый subject-neutral tracer bullet;
- смена provider должна проходить через адаптер, а не менять доменную модель.
