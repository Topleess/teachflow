# ADR-001 · стек первого операционного прототипа

**Статус:** accepted for tracer-bullet implementation
**Дата:** 2026-07-20

## Контекст

Рабочего прототипа TeachFlow нет. Нужен минимальный end-to-end срез, который проверяет собственную `Lesson Session`, две роли, видео, совместное действие, presence, persistence и outcome. Стек должен сохранять возможность self-hosting и не подменять продукт чужой LMS.

## Решение

### Application/content core

- **Payload CMS + PostgreSQL** — `REUSE`.
- Payload хранит users, lesson sessions, access rules, activity document references и outcome.
- Не форкать Payload.

### Video

- **LiveKit** — `WRAP` через `VideoAdapter`.
- Для первого локального/CI среза допускается fake adapter, но acceptance требует реального двухстороннего подключения.
- Recording исключён из v0.
- Managed LiveKit допустим только как временная инфраструктура; API должен оставаться совместимым с self-hosted server.

### Collaboration

- **Yjs + Hocuspocus** — `REUSE`.
- Hocuspocus аутентифицирует room через TeachFlow session token и хранит durable Yjs document.
- Awareness/pointers эфемерны и не сохраняются.

### Shared activity

- v0 использует маленький собственный subject-neutral activity вместо универсальной доски.
- Тестовый объект: `2x + 3 = 11` и последовательность шагов.
- Два курсора, авторство шагов и сохранение состояния обязательны.

### Canvas candidates after v0

- **BlockSuite Edgeless** — первый кандидат на runtime spike для строгого OSS canvas.
- **Excalidraw** — fallback для общей MIT-доски, если предметный блок остаётся отдельной DOM-панелью.
- **tldraw** — не использовать до отдельного license/commercial gate.

### Interactive content later

- **H5P** — будущий `ActivityAdapter`, не source of truth.

## Отвергнуто для ядра v0

- Moodle, Open edX, Canvas: слишком тяжёлые LMS-монолиты.
- Chamilo: только disposable native-LMS pilot, не core.
- Directus: source-available license требует legal review.
- BigBlueButton: конкурирующая education platform.
- Jitsi: iframe fallback, но не основной video layer.
- WBO/AFFiNE app/Drawnix: не подходят как embedded extensible collaboration foundation.
- mediasoup/Konva/Fabric: слишком много базовой инфраструктуры пришлось бы строить самим.

## Архитектурные границы

```text
TeachFlow web app
├── Payload domain/API + PostgreSQL
│   ├── users
│   ├── lesson_sessions
│   ├── activity_documents
│   └── outcomes
├── VideoAdapter → LiveKit
└── CollaborationAdapter → Hocuspocus/Yjs
                         └── v0 SharedEquationActivity
```

`lesson_session_id` является общей связью. Ни LiveKit room, ни Yjs document не являются источником истины всей session.

## Security baseline

- opaque UUID без ФИО в room/document names;
- short-lived role-scoped tokens;
- backend-only LiveKit secrets;
- Hocuspocus ACL проверяет user + session + role;
- Payload Local API от имени пользователя всегда с `overrideAccess: false`;
- no recording in v0;
- presence не хранится как durable user tracking.

## Acceptance v0

1. Teacher создаёт/открывает session.
2. Student входит по invitation link.
3. Оба подключаются только к назначенной session.
4. Оба видят video surface и общий activity.
5. Видны два имени/курсора.
6. Разные шаги можно изменять без потери обновлений.
7. После reload документ восстанавливается.
8. После disconnect presence исчезает.
9. Завершение session создаёт outcome snapshot.
10. Нет console errors и horizontal overflow на desktop/mobile.
