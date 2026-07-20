## Итоговый вывод

Для операционного прототипа TeachFlow — **два пользователя, два видимых курсора, совместное решение уравнения, сохранение и экспорт** — оптимальны два пути:

1. **Самый быстрый и технически цельный:**
   **`tldraw SDK + tldraw sync` → `WRAP`**, если TeachFlow принимает коммерческие/брендовые условия tldraw.
   Это лучший готовый набор по custom shapes, presence, shared cursors, touch и качеству SDK, но **tldraw больше нельзя считать OSI-open-source**: применяется собственная лицензия, production/watermark/license-key условия нужно согласовать до разработки.

2. **Строго open-source и self-hosted:**
   **`BlockSuite Edgeless + Yjs/Hocuspocus` → `WRAP/REUSE`**.
   Это сложнее, но лучше подходит для настоящего `EquationBlock` с совместно редактируемым `Y.Text`, а не для синхронизации уравнения как неделимой canvas-фигуры.

**Excalidraw** — хороший MIT-вариант для быстрой общей доски, но не имеет публичного plugin API для новых нативных типов фигур и не поставляет collaboration backend вместе с React-компонентом. Его стоит выбирать, если уравнение можно сделать отдельной DOM-панелью/sidecar-компонентом.

---

# 1. Категории решений

Красивый whiteboard UI сам по себе не означает наличие полноценной коллаборации. Следует разделять три слоя:

### Готовые доски/приложения

- Excalidraw application
- WBO/Whitebophir
- AFFiNE
- Drawnix

Они дают большую часть UI, но обычно плохо встраиваются или требуют форка для предметных образовательных блоков.

### Canvas/editor SDK

- tldraw SDK
- `@excalidraw/excalidraw`
- BlockSuite/Edgeless
- Plait
- Konva/Fabric.js
- Netless Fastboard

Они встраиваются в TeachFlow, но не всегда содержат backend и multiplayer.

### Collaboration engines

- Yjs
- Hocuspocus
- y-websocket
- Liveblocks
- PartyServer/Y-PartyServer
- Automerge

Они не рисуют доску. Presence, cursor rendering, hit-testing, coordinate transforms и UI остаются задачей canvas/editor слоя.

---

# 2. Decision matrix: готовые доски

Обозначения: **◎** — штатно; **○** — пригодно; **△** — нужна существенная обвязка; **✕** — отсутствует/непригодно.

| Решение | Лицензия | Embed | Realtime / курсоры | Persistence / export | Custom equation block | Backend | Mobile | Решение |
|---|---|---:|---|---|---:|---|---:|---|
| **Excalidraw app** | MIT | ○ React-пакет, но collab app отдельно | ◎ в официальном приложении; △ в npm-компоненте | JSON, PNG, SVG, Blob/Canvas; файлы хранятся отдельно | △ встроенные типы фиксированы; overlay/embeddable возможен | Socket.IO relay + отдельное долговременное/file storage | ◎ | **WRAP** пакет; не форкать app без необходимости |
| **WBO/Whitebophir** | AGPL-3.0 | △ преимущественно iframe/полное приложение | ◎ синхронизация операций; штатные shared cursors в проверенном коде не подтверждены | Серверная история на диске; preview/download, но не стабильный SDK export API | ✕ нет plugin API | Node/WebSocket, persistent volume | ○ базовый touch | **REJECT** для TeachFlow |
| **AFFiNE** | Core repo — permissive/open-source; cloud/enterprise проверять отдельно | ✕ тяжёлое workspace-приложение, не embedded board | ◎ на уровне полного продукта; это не доказывает готовность standalone BlockSuite provider | Local-first workspace, self-host server, app-level export | ◎ благодаря BlockSuite, но внутри большой архитектуры | Полный AFFiNE server stack | ○/◎ есть mobile-клиенты, но это не SDK-гарантия | **REJECT** как встраиваемое приложение |
| **Drawnix** | MIT | ○ есть packages/React-слой | ✕ в готовом продукте нет законченного multiplayer/presence backend | LocalForage; PNG/SVG/JSON `.drawnix` | ○ через Plait plugins | Нет collab backend | ○ заявлена и реализуется touch-адаптация | **REJECT** как готовую collab-доску; код можно изучать |

### WBO: важное лицензионное ограничение

AGPL применяется к сетевому использованию модифицированной версии. Для TeachFlow это создаёт более высокий compliance-риск, чем MIT/MPL, особенно если доска будет тесно связана с закрытым приложением. Нужна отдельная юридическая оценка границы производных компонентов.

---

# 3. Decision matrix: embedded canvas/editor SDK

| SDK | Лицензия | Embeddability | Multiplayer / shared cursors | Persistence / export | Extensibility | Backend | Mobile | Интеграция | Решение |
|---|---|---|---|---|---|---|---|---:|---|
| **tldraw SDK** | Собственная tldraw license, **не OSI open-source** | ◎ React SDK | ◎ с tldraw sync: presence, users, cursors | Store snapshots; SVG/image export; assets требуют storage | ◎ `ShapeUtil`, custom tools, bindings, UI overrides | Официальный starter kit ориентирован на Cloudflare Durable Objects/R2; возможна собственная серверная интеграция | ◎ | Низкая/средняя | **WRAP**, условно после license gate |
| **`@excalidraw/excalidraw`** | MIT | ◎ React component | △ есть `onPointerUpdate`, `collaborators`, `updateScene`; транспорт не входит | ◎ `.excalidraw`, JSON, PNG, SVG, Canvas/Blob; binary files отдельно | △ можно менять UI и генерировать штатные элементы; публичного custom renderer/type API нет | Свой provider либо извлечение collab app; `excalidraw-room` — relay, не полная persistence-система | ◎ | Средняя | **WRAP** |
| **BlockSuite/Edgeless** | MPL-2.0, file-level copyleft | ◎ editor framework, но API менее узкий, чем у tldraw | ○ Yjs/awareness primitives; provider и remote-cursor UX надо проверять/подключать явно | Yjs workspace/snapshots; export зависит от block services/app | ◎ schemas, block specs, extensions, web components | Любой Yjs provider, включая Hocuspocus | △ touch есть, но edgeless mobile требует отдельного QA | Высокая | **WRAP** для OSS-варианта |
| **Plait** | MIT | ◎ core framework + React/Angular integration | △ README заявляет data model suitable for collaboration, но готового provider/cursor stack нет | Управляемая модель элементов; export реализует продукт/плагин | ◎ plugin architecture, custom nodes/shapes | Свой Yjs/Hocuspocus adapter | ○ | Высокая | **WRAP**, но не первый выбор |
| **Konva / Fabric.js** | MIT | ◎ | ✕ | ◎ Fabric: JSON/SVG/PNG/JPG; Konva — canvas serialization/export | ◎ низкоуровневые shape APIs | Полностью свой | ◎ pointer/touch | Очень высокая | **REJECT** для быстрого прототипа |
| **Netless Fastboard** | Frontend source доступен; лицензию каждого пакета и Agora ToS нужно проверять отдельно | ◎ vanilla/React | ◎ через Agora service | Зависит от managed whiteboard service | ○ Netless apps/plugins | **Проприетарный hosted Agora Interactive Whiteboard** | ◎ | Низкая при принятии vendor lock-in | **REJECT** для open-source/self-host requirement |

### tldraw: лицензионный стоп-фактор

Технически tldraw — лучший кандидат, но:

- исходный код доступен, однако лицензия не является MIT/Apache/MPL/AGPL;
- production use, watermark и license key регулируются собственной лицензией;
- нельзя приравнивать открытый GitHub-репозиторий к открытому продукту без ограничений;
- условия должны быть письменно приняты до построения TeachFlow вокруг `ShapeUtil` и sync-протокола.

### Excalidraw: что реально входит в npm-компонент

В компоненте действительно есть точки интеграции для коллаборации:

- `onPointerUpdate`;
- `isCollaborating`;
- `updateScene({ collaborators })`;
- рендеринг remote pointers;
- `onChange`, `initialData`, scene API.

Но **сетевой протокол, комнаты, auth, долговременное хранение и binary asset storage не входят в компонент как законченный backend**. Официальное приложение реализует это отдельно. `excalidraw-room` передаёт Socket.IO-сообщения, но сам по себе не превращает компонент в production collaboration service.

Также Excalidraw синхронизирует элементы, а не предоставляет character-level CRDT для одновременного редактирования одного текста. Два ученика могут добавлять шаги решения, но одновременный ввод в одно поле уравнения требует отдельной модели, например `Y.Text`.

---

# 4. Decision matrix: collaboration engines

| Engine | Лицензия | Что предоставляет | Cursors/presence | Persistence / scaling | Backend | Решение |
|---|---|---|---|---|---|---|
| **Yjs** | MIT | CRDT shared types, transactions, undo, provider ecosystem | Awareness protocol хранит ephemeral user state; UI курсора нужно рисовать отдельно | IndexedDB/local-first; persistence зависит от provider/server | Не предписывает конкретный backend | **REUSE** |
| **Hocuspocus 4.x** | MIT | Yjs WebSocket server, hooks, auth, extensions | Передаёт Yjs awareness; renderer не входит | Generic DB `fetch/store`; SQLite/S3; Redis для horizontal scaling | Node.js `>=22` на проверенной версии | **REUSE** |
| **y-websocket** | MIT | Минимальный Yjs WebSocket provider/reference server | Awareness | Простая persistence возможна; auth/scaling/operations ограничены | Node WebSocket | **REUSE только для spike**, не production |
| **Liveblocks** | Client packages Apache-2.0; server AGPL-3.0-or-later | Managed rooms, presence, storage, comments и Yjs | ◎ | Managed service | Open server package прямо говорит, что production self-hosting пока не рекомендуется | **REJECT** при self-host requirement |
| **PartyServer / Y-PartyServer** | ISC | WebSocket rooms и Yjs на Durable Objects | ○ awareness через Yjs | Durable Objects + external storage hooks | Cloudflare Workers/DO | **WRAP**, только если Cloudflare допустим |
| **Automerge** | MIT | CRDT и sync protocol | Не готовый cursor layer | Local-first persistence/sync | Свой provider/server | **REJECT** здесь: Yjs ecosystem практичнее |

### Hocuspocus: подтверждённые operational-возможности

В проверенном Hocuspocus 4.4.0:

- `@hocuspocus/server` — MIT, Node.js `>=22`;
- `onAuthenticate` и lifecycle hooks позволяют привязать room/document к TeachFlow ACL;
- `@hocuspocus/extension-database` принимает собственные `fetch`/`store` и сохраняет бинарный Yjs update;
- есть SQLite и S3 persistence extensions;
- Redis extension предназначен для горизонтального масштабирования и синхронизации состояния открытого документа между инстансами;
- Hocuspocus не предоставляет canvas, equation renderer или cursor UI.

---

# 5. Рекомендации `reuse / wrap / fork / reject`

| Кандидат | Решение | Обоснование |
|---|---|---|
| tldraw SDK + sync | **WRAP** | Лучший technical fit; не форкать. Использовать только после принятия лицензии |
| Excalidraw component | **WRAP** | MIT и отличный canvas UX; collaboration и equation model добавить снаружи |
| Excalidraw app | **REJECT/FORK только в крайнем случае** | Форк тащит Firebase/file-storage/protocol/UI внутренности и стоимость обновлений |
| WBO | **REJECT** | Standalone, AGPL, слабая предметная расширяемость, shared cursor не доказан |
| AFFiNE app | **REJECT** | Слишком большой workspace-продукт для embedded exercise |
| BlockSuite | **WRAP** | Лучший строгий OSS fit для block-first educational editor |
| Yjs | **REUSE** | CRDT-модель уравнения и шагов |
| Hocuspocus | **REUSE** | Authenticated self-hosted transport/persistence |
| y-websocket | **REUSE только в прототипе** | Не брать как production backend без hardening |
| Plait | **WRAP как резерв** | Сильные plugins/MIT, но collab integration придётся строить |
| Drawnix | **REJECT как foundation** | Можно заимствовать UX-подходы, но готовой коллаборации нет |
| Konva/Fabric | **REJECT** | Слишком много базовой editor/collab логики придётся написать |
| Fastboard | **REJECT** | Hosted Agora dependency и vendor lock-in |
| Liveblocks | **REJECT** для self-host | Managed production path; OSS server официально не рекомендован для production |
| PartyServer | **WRAP условно** | Удобно, но привязывает backend к Cloudflare |

---

# 6. Архитектура рекомендуемого прототипа

## Вариант A — наиболее быстрый

```text
TeachFlow React shell
  └─ tldraw Editor
       ├─ EquationStepShapeUtil
       ├─ TeacherHint / StudentAnswer shapes
       ├─ presence + remote cursors
       └─ PNG/SVG + JSON snapshot

tldraw sync client
  └─ self-managed sync worker / official starter architecture
       ├─ room auth from TeachFlow token
       ├─ room/store persistence
       └─ object storage for images/assets
```

`EquationStepShape` должен хранить:

- исходное выражение/LaTeX;
- номер шага;
- автора;
- тип преобразования;
- validation status;
- ссылку на предыдущий шаг;
- display value для SVG export.

Не стоит одновременно добавлять Yjs поверх tldraw sync для тех же объектов: это создаст две конкурирующие модели порядка, undo и разрешения конфликтов.

## Вариант B — строгий open-source

```text
TeachFlow
  └─ BlockSuite Edgeless
       └─ custom EquationBlock
            ├─ Y.Text для совместного ввода
            ├─ LaTeX/MathML renderer
            └─ validation metadata

Yjs provider
  └─ Hocuspocus
       ├─ TeachFlow ACL via onAuthenticate
       ├─ Postgres/S3 binary document state
       └─ Redis только при масштабировании
```

Для awareness хранить:

```ts
{
  userId,
  displayName,
  color,
  pointer: { x, y },
  selectedBlockId,
  activeEquationRange
}
```

Курсоры надо рисовать поверх edgeless viewport с учётом zoom/pan. Сам факт наличия Yjs awareness не означает, что это UI уже реализован.

---

# 7. Минимальные acceptance criteria прототипа

1. Два браузера входят в одну room по TeachFlow token.
2. Оба видят имя, цвет и курсор другого пользователя.
3. Начальная задача, например `2x + 3 = 11`, загружается как структурированный объект.
4. Пользователи создают и переставляют шаги решения.
5. После reconnect восстанавливаются документ и авторство шагов.
6. Presence исчезает после disconnect и не попадает в persisted document.
7. Конкурентные изменения разных шагов не теряются.
8. Если разрешён одновременный ввод в одно уравнение — он тестируется отдельно как `Y.Text`; element-level last-write-wins недостаточен.
9. JSON snapshot повторно открывается.
10. PNG/SVG экспорт включает custom equation rendering.
11. Touch test проводится минимум на iOS Safari и Android Chrome.

---

# 8. Официальные источники

Проверка проводилась по официальным репозиториям, LICENSE, документации и исходному коду с cutoff **2026-07-19**:

- [tldraw repository, pinned revision](https://github.com/tldraw/tldraw/tree/203a83b1942cd2bc79c88e68d03cb2e4a2b12c14)
- [tldraw license](https://github.com/tldraw/tldraw/blob/203a83b1942cd2bc79c88e68d03cb2e4a2b12c14/LICENSE.md)
- [tldraw sync docs](https://tldraw.dev/docs/sync)
- [tldraw custom shapes](https://tldraw.dev/docs/shapes)
- [Excalidraw, pinned revision](https://github.com/excalidraw/excalidraw/tree/5cf547650b700b35507e83773695098150b810d2)
- [Excalidraw component API](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/props/)
- [Excalidraw export utilities](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils/export)
- [excalidraw-room](https://github.com/excalidraw/excalidraw-room)
- [WBO/Whitebophir, pinned revision](https://github.com/lovasoa/whitebophir/tree/1c7631e18948491092112cb78608310b59a4a529)
- [AFFiNE, pinned revision](https://github.com/toeverything/AFFiNE/tree/81df4751a367f2795bc0d165586650dbe8db73d6)
- [BlockSuite](https://github.com/toeverything/blocksuite)
- [Hocuspocus, pinned revision](https://github.com/ueberdosis/hocuspocus/tree/7303d4f0fb6afc65da08d5dacea0de204429e8b5)
- [Hocuspocus persistence](https://tiptap.dev/docs/hocuspocus/guides/persistence)
- [Yjs](https://github.com/yjs/yjs)
- [Yjs awareness](https://docs.yjs.dev/getting-started/adding-awareness)
- [y-websocket](https://github.com/yjs/y-websocket)
- [Plait](https://github.com/worktile/plait)
- [Drawnix](https://github.com/plait-board/drawnix)
- [Liveblocks self-host server statement](https://github.com/liveblocks/liveblocks/tree/main/packages/liveblocks-server)
- [PartyServer/Y-PartyServer](https://github.com/cloudflare/partykit)
- [Netless Fastboard](https://github.com/netless-io/fastboard)

---

## Что выполнено

- Проверены обязательные кандидаты и дополнительные SDK/engines.
- Разделены готовые доски, canvas SDK и collaboration infrastructure.
- Проверены лицензии, embedding, presence/cursors, persistence/export, расширяемость, backend и mobile.
- Сформированы decision matrix и стратегии `reuse/wrap/fork/reject`.
- Ничего не устанавливалось и не запускалось.

## Файлы

- Файлы TeachFlow и `/opt/data` не изменялись.
- Для статического анализа создавались только временные распакованные копии официальных репозиториев в `/tmp/teachflow-audit`.

## Ограничения аудита

- Точный SHA временно загруженных BlockSuite, Yjs и y-websocket не сохранился; ключевые выводы по ним привязаны к официальным репозиториям/документации, но для formal procurement review эти три ревизии следует перепинить.
- Аудит был статическим: пакеты не устанавливались, серверы и mobile device tests не запускались.
- Лицензионные выводы являются технической оценкой, не юридическим заключением.
