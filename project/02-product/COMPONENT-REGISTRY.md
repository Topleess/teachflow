# Реестр компонентов операционного прототипа

**Статус:** technical discovery in progress.

## Правило принятия решения

Каждый внешний проект получает одно решение:

- `REUSE` — использовать почти как есть;
- `WRAP` — использовать через собственный адаптер TeachFlow;
- `FORK` — ответвить и поддерживать свою версию;
- `REFERENCE` — использовать идеи/форматы, но не код;
- `REJECT` — не использовать.

Fork — крайний вариант: он создаёт постоянную стоимость обновлений и безопасности.

## Матрица

| Контур | Кандидат | Тип | Лицензия | Встраивание | Совместная работа | Persistence | Self-hosting | Решение | Proof artifact |
|---|---|---|---|---|---|---|---|---|---|
| Контент/CMS/LMS | research pending |  |  |  |  |  |  | PENDING | technical audit |
| Видеосвязь | research pending |  |  |  |  |  |  | PENDING | 2-party room |
| Canvas/доска | research pending |  |  |  |  |  |  | PENDING | 2 cursors + shared object |
| Collaboration engine | research pending |  |  |  |  |  |  | PENDING | concurrent state test |
| TeachFlow session core | собственный код | domain core | — | API/UI | оркестрация | authoritative | да | BUILD | end-to-end tracer bullet |

## Критерии

### Обязательные

- лицензия совместима с предполагаемой моделью распространения;
- есть официальный self-hosting path или чётко допустимый hosted dependency;
- интеграция не требует выдавать модулю роль источника истины всего продукта;
- можно связать external ID с `lesson_session_id`;
- можно проверить работу автоматически или двумя браузерами;
- проект поддерживается и имеет проверяемую документацию.

### Желательные

- typed SDK/API;
- webhooks/events;
- экспорт данных;
- кастомный branding;
- мобильная пригодность;
- простая локальная разработка;
- возможность заменить компонент через адаптер.

## Антипаттерны

- выбрать Moodle/Open edX только потому, что это известная LMS;
- выбрать Jitsi только потому, что есть iframe;
- выбрать красивую доску без multiplayer/persistence backend;
- использовать hosted-only функцию, считая её open-source;
- смешать authentication внешнего модуля с доменной моделью TeachFlow;
- форкнуть крупный проект до tracer-bullet проверки;
- строить WebRTC или CRDT с нуля.

## Целевая граница адаптеров

```text
TeachFlow Session API
├── VideoAdapter
│   ├── createRoom(session)
│   ├── issueParticipantToken(session, user)
│   └── receiveRoomEvent(event)
├── ContentAdapter
│   ├── createLessonDocument(session)
│   ├── loadLessonDocument(id)
│   └── snapshotLessonDocument(id)
└── CollaborationAdapter
    ├── joinDocument(session, user)
    ├── persistState(document)
    └── exportOutcome(document)
```

Выбор поставщика не должен протекать во всю бизнес-логику.
