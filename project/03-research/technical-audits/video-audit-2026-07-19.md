# Технический аудит open-source видеосвязи для TeachFlow

**Срез информации:** 2026-07-19. Проверены официальные репозитории и актуальные ветки документации. Ничего не устанавливалось.

## Краткий вывод

1. **Основная рекомендация для операционного прототипа — LiveKit.**
   Это программируемый video service, который хорошо встраивается в единый экран урока, использует backend-issued JWT, имеет screen share, webhooks, data/RPC и готовый React-компонент видеоконференции. TeachFlow при этом остаётся владельцем `lesson_session` и общего workspace.

2. **Jitsi Meet — самый быстрый путь к кликабельному iframe-демо**, но iframe останется отдельным приложением. Для глубокой синхронизации lesson workspace и полного визуального контроля LiveKit лучше.

3. **OpenVidu 3.8 / OpenVidu Meet — сильный вариант, если нужен одновременно готовый iframe/Web Component, REST API, запись и self-hosted административный слой.** Но он существенно тяжелее чистого LiveKit и сам построен вокруг LiveKit-compatible API.

4. **BigBlueButton — не просто video service, а полноценная education platform.** Его следует выбирать только если TeachFlow готов отдать ему значительную часть classroom experience: whiteboard, presentations, notes, polls, breakout rooms, analytics и recordings. Иначе получится дублирование общего workspace.

5. **Element Call и mediasoup для первого TeachFlow-прототипа не рекомендуются:** первый приносит Matrix-инфраструктуру, второй требует самостоятельно строить signaling, auth, rooms, UI и recording.

---

## 1. Классификация решений

| Решение | Что это на самом деле | Роль относительно TeachFlow |
|---|---|---|
| **LiveKit** | Программируемый WebRTC SFU/video service и SDK | Видеодвижок внутри собственной страницы урока |
| **Jitsi Meet** | Готовое приложение видеоконференции + серверная инфраструктура | Встраиваемое iframe-приложение |
| **OpenVidu Platform / Meet** | LiveKit-compatible video platform + готовый meeting UI | Промежуточный вариант между SDK и готовым iframe |
| **BigBlueButton** | Полноценная виртуальная аудитория | Альтернативная education platform, а не просто видео |
| **Element Call** | MatrixRTC-коммуникационное приложение на LiveKit SFU | Имеет смысл преимущественно в Matrix-экосистеме |
| **mediasoup** | Низкоуровневый SFU/Node.js-модуль | Компонент для постройки собственной WebRTC-платформы |

Нельзя сравнивать BigBlueButton и LiveKit только по числу функций: **BBB пытается владеть всем уроком**, а **LiveKit предоставляет медиа для урока, которым владеет TeachFlow**.

---

## 2. Decision matrix: лицензия, embedding и auth

| Решение | Лицензия на срезе | Self-hosting | Iframe / SDK | Auth / tokens | Контроль интерфейса |
|---|---|---|---|---|---|
| **LiveKit** | Apache-2.0 для server, client SDK и React Components | Да: single binary, Docker, VM, Kubernetes, distributed | Специализированного iframe нет; JS/native SDK; готовый React `VideoConference` | Backend генерирует JWT с room/participant grants; секрет не попадает в браузер | **Максимальный:** UI является частью приложения TeachFlow |
| **Jitsi Meet** | Apache-2.0 | Да: Debian/Ubuntu, Docker; JVB/Prosody/Jicofo и др. | Очень зрелый `JitsiMeetExternalAPI`; React SDK; низкоуровневый `lib-jitsi-meet` | JWT token authentication; можно ограничить создание комнаты токеном и допустить гостей после ведущего; lobby/password | Высокий при fork/config, но iframe визуально и логически остаётся отдельным приложением |
| **OpenVidu 3.8** | Core/Community repo — Apache-2.0; PRO-возможности и топологии имеют коммерческий слой | Да: Community Single Node; PRO Single Node/Elastic/HA | OpenVidu Meet: direct link, iframe, Web Component, REST, webhooks; Platform совместим с LiveKit SDK | Meet API key — backend REST; anonymous moderator/speaker links, personal identified-guest links, user accounts; Platform — LiveKit JWT | Высокий; готовый Meet UI настраивается, а через LiveKit SDK можно строить свой |
| **BigBlueButton 3.0** | LGPL-3.0 | Да, но только как крупный dedicated stack | Server-to-server REST API и signed join URL; отдельного composable JS iframe SDK уровня Jitsi нет | Shared secret и checksum для API; join URL задаёт external user, role и параметры. Shared secret нельзя выдавать браузеру | Настройки, logo/copyright, plugins и source customization; но клиент монолитный |
| **Element Call** | Актуальная MatrixRTC/LiveKit-ветка: dual license **AGPL-3.0-or-later / commercial**. Старые full-mesh/main материалы с Apache-2.0 нельзя считать текущей лицензией продукта | Да, вместе с Matrix homeserver, MatrixRTC Authorization Service, LiveKit SFU и обычно TURN | Standalone и Widget/Embedded package; widget прежде всего предназначен для Matrix-клиентов | Matrix account/guest auth; Authorization Service выдаёт LiveKit JWT | Исходники доступны, но изменения сетевой версии затрагивает AGPL; интеграция ориентирована на Matrix |
| **mediasoup** | ISC | Да, как Node.js-модуль и C++ worker | Нет готового iframe или meeting UI; есть `mediasoup-client` | Не предоставляет auth, room policy или signaling — всё реализует приложение | Абсолютный контроль ценой самостоятельной разработки всего продукта |

### Лицензионная оговорка по OpenVidu

Корневой OpenVidu repo и Community core имеют Apache-2.0; PRO-функции коммерческие. Перед production-закреплением следует отдельно подтвердить лицензионный scope конкретного **OpenVidu Meet container/image**, а не делать вывод только по корневому `LICENSE`.

---

## 3. Decision matrix: функции и эксплуатация

Обозначения сложности: **Н** — низкая, **С** — средняя, **В** — высокая, **ОВ** — очень высокая.

| Решение | Recording | Screen share | Data channels / events | Сложность эксплуатации | 1:1 урок | Синхронизация с lesson workspace | Решение |
|---|---|---|---|---|---|---|---|
| **LiveKit** | Отдельный Egress: MP4/HLS, room composite, web page, participant, track, auto-egress; при self-host разворачивается отдельно | Да, нативный track на web/mobile; возможен tab audio там, где разрешает браузер | Reliable/lossy packets, text/byte streams, RPC, room/participant metadata, SDK events, подписанные webhooks | **С** без recording; **В** с Egress/storage/HA. Встроенный TURN, Redis рекомендуется production | **Отлично** | **Лучше всех:** медиа и workspace находятся в одном приложении | **Победитель** |
| **Jitsi Meet** | Server recording через Jibri, streaming/transcription; local recording. Один Jibri обслуживает одну одновременную запись | Да; iframe command и события состояния | Богатые iframe events; endpoint text messages через data channel; нет гарантированной долговременной доставки | **С** для базового сервера; **В/ОВ** с recording/scaling. Jibri требует отдельные ресурсы | **Отлично** | **Средне:** события доступны, но iframe — отдельная state/UI boundary | Лучший fallback для быстрого iframe |
| **OpenVidu 3.8** | Egress и storage входят в deployment; OpenVidu Meet управляет recording через UI/REST и permissions | Да | В low-level режиме — LiveKit data/events. Web Component наружу даёт только `joined`, `left`, `closed` и несколько команд; Meet webhooks сообщают meeting/recording lifecycle | **В:** даже Community Single Node включает OpenVidu Server, Egress, Ingress, Redis, MinIO, MongoDB, Caddy, Dashboard и опционально Meet/observability | **Отлично** | **Высоко через SDK**, средне через готовый iframe/Web Component | Сильный второй кандидат |
| **BigBlueButton** | Встроенная event-aware запись и playback; API для list/publish/delete; запись включает classroom artifacts | Да | Опциональный `bbb-webhooks` публикует много server events; публичного host-oriented DataChannel API нет | **ОВ:** dedicated Ubuntu 22.04; production minimum 8 CPU, 16 GB RAM, 500 GB с recording или 50 GB без него, 250 Mbps, большой набор сервисов | Функционально отлично, но избыточно | **Средне-низко**, если TeachFlow уже создаёт свой whiteboard/notes/chat | Только при выборе BBB как education platform |
| **Element Call** | В текущих просмотренных официальных материалах нет first-class встроенного recording workflow; можно отдельно интегрировать underlying LiveKit Egress | Есть | Matrix room state, Matrix Client-Server API и Widget API; хорошие E2EE/federation semantics | **ОВ:** Synapse/Matrix, MatrixRTC auth service, LiveKit SFU, TURN; guest setup может требовать отдельный homeserver/ESS instance | Хорошо | Низко, если TeachFlow не строится на Matrix | Не для первого прототипа |
| **mediasoup** | Не предоставляет. Нужны FFmpeg/GStreamer, PlainTransport, storage и собственный orchestration | Это просто дополнительный video track, полностью реализуется приложением | SCTP DataProducer/DataConsumer и низкоуровневые события | Media plane — **С**; готовый продукт — **ОВ**: signaling, auth, reconnect, TURN, moderation, recording, webhooks и UI пишутся самостоятельно | Технически да | Может быть любой, но только после большой разработки | Противоречит цели «не строить WebRTC с нуля» |

---

## 4. Важные эксплуатационные различия

### Jitsi Meet

- Для небольшого сервера официально рекомендуются примерно **4 dedicated CPU cores и 8 GB RAM**; для очень маленького теста возможно меньше.
- Recording — существенная архитектурная цена: **одна Jibri instance = одна одновременно записываемая встреча**. Для одной 720p-записи официально указывается минимум около 8 GB RAM для Jibri.
- External IFrame API зрелый: команды screen sharing, mute, recording, moderator actions; события participant join/left, content sharing и data-channel messages.
- Лучший выбор, если критерий — «показать видеокомнату внутри страницы максимально быстро», но не лучший фундамент для глубоко связанного workspace.

### LiveKit

- Основной сервер — компактнее полного Jitsi/OpenVidu/BBB stack; поддерживает UDP, TCP и встроенный TURN.
- Production всё равно требует домен, TLS, корректный public IP, firewall и обычно Redis.
- Recording/Egress является отдельным сервисом на Chrome/GStreamer и должен планироваться независимо от media server.
- React `VideoConference` уже даёт grid/focus, basic chat, screen share и controls, но состоит из заменяемых компонентов. Это позволяет начать почти как с готового приложения, не запирая TeachFlow в iframe.
- Reliable data packets — только best effort: они не буферизуются для временно отключившихся пользователей. Их нельзя использовать как каноническое хранилище урока.

### OpenVidu 3.8

- На дату среза актуален **OpenVidu 3.8.0 от 2026-07-09**.
- OpenVidu Platform сохраняет совместимость с LiveKit APIs и SDK.
- Community Single Node требует минимум **4 CPU / 4 GB RAM**, public IP и рекомендует около 100 GB при recording.
- Это удобный «batteries included» пакет: installer, recording, object storage, dashboard, ready Meet UI, iframe/Web Component и REST.
- Обратная сторона — много сервисов и более крупная operational surface, чем у прямого LiveKit.
- PRO/mediasoup performance и Elastic/HA нельзя автоматически считать бесплатными Community-возможностями.

### BigBlueButton

- Аудитировалась текущая стабильная линия **3.0**; 4.0 на дату среза ещё помечена как development.
- Встроены presentations, multi-user whiteboard, polls, shared notes, breakout rooms и learning analytics.
- Это сильные преимущества только в том случае, если они **заменяют** TeachFlow workspace. Если TeachFlow строит собственные материалы и collaboration, функции BBB превращаются в конкурирующую модель состояния.
- `bbb-webhooks` устанавливается отдельно и может потерять события, если сервис был выключен в момент создания meeting.

### Element Call

- Современная версия перешла от full mesh к MatrixRTC поверх LiveKit.
- Старые статьи 2022 года называют Apache-2.0; актуальная ветка содержит AGPL-3.0 и коммерческую лицензию. Для текущего решения нужно ориентироваться именно на dual licensing.
- Widget mode предполагает, что authentication, Matrix events и room state контролирует hosting Matrix client. Для обычного TeachFlow iframe это не готовый универсальный контракт.
- Имеет смысл, только если Matrix уже является основой identity/chat/workspace.

### mediasoup

- Официально позиционируется как минималистичный, signaling-agnostic, low-level SFU.
- Не навязывает signaling — потому что signaling нужно разработать самостоятельно.
- Recording возможен через интеграцию с FFmpeg/GStreamer, но mediasoup не предоставляет готовый recording product.
- Это хорошая технология для компании с отдельной WebRTC-командой, но плохой выбор для быстрого TeachFlow-прототипа.

---

## 5. Рекомендация для TeachFlow

### Основной выбор: LiveKit как video service

Для TeachFlow выгоднее выбрать **video service**, а не готовую education platform:

- TeachFlow владеет пользователями, расписанием и `lesson_session`.
- LiveKit отвечает за camera, microphone, screen share, сетевое качество и recording transport.
- Lesson workspace, материалы, курсор, заметки, задания и история остаются моделью TeachFlow.
- Видео отображается в той же DOM/UI-композиции, а не внутри автономного meeting iframe.

### Быстрый operational path

Для первого реально работающего прототипа:

1. Использовать **managed LiveKit Cloud** как временный media backend. Это не self-hosted стадия, но клиентские SDK, token model и API остаются совместимы с open-source LiveKit.
2. На backend TeachFlow добавить только:
   - создание/получение video room;
   - короткоживущий JWT;
   - проверку, что teacher/student имеют доступ к конкретному `lesson_session`;
   - endpoint подписанных webhooks.
3. На frontend:
   - React: `LiveKitRoom` + `VideoConference`;
   - либо JS SDK, если выбран другой frontend stack.
4. Self-hosting проверять отдельным production spike после того, как продуктовая модель урока подтверждена.

Если использование managed-сервиса запрещено, тот же контракт можно направить на self-hosted LiveKit, но TURN, TLS, firewall и Egress уже становятся отдельным DevOps-проектом.

### Fallback-варианты

- **Нужен только iframe-демо за минимальное время:** Jitsi IFrame API.
- **Self-hosted ready-made UI, recording и REST нужны раньше собственной UI-разработки:** OpenVidu Meet 3.8 Community.
- **Нужна готовая виртуальная аудитория вместо TeachFlow workspace:** BigBlueButton.
- **Не выбирать сейчас:** Element Call и mediasoup.

---

## 6. Предлагаемая модель `lesson_session`

TeachFlow должен хранить каноническую связь независимо от провайдера:

```text
lesson_session
- id
- teacher_id
- student_id
- scheduled_start_at
- status: scheduled | live | ended | cancelled
- video_provider
- video_room_name
- video_started_at
- video_ended_at
- recording_status
- recording_asset_id / storage_url
```

Рекомендуемый media flow:

```text
TeachFlow frontend
    -> POST /lesson-sessions/{id}/video-token
    -> TeachFlow проверяет user/session/role
    -> выдаёт короткоживущий JWT
    -> frontend подключается к LiveKit room

LiveKit signed webhook
    -> TeachFlow webhook endpoint
    -> idempotent event log
    -> обновляет live/attendance/recording state
```

Практические правила:

- Room name строить из **opaque session UUID**, без ФИО и другой PII.
- Teacher/student permissions задавать в token grants; recording API оставлять только backend.
- Durable workspace state хранить в TeachFlow DB/CRDT/WebSocket, а не в LiveKit packets.
- Data/RPC использовать только для эфемерных сигналов: pointer, «перейти на страницу», focus, reaction.
- Webhooks обрабатывать идемпотентно по event ID.
- Запись подключать вторым этапом после решения вопросов consent, retention и storage.
- Проверить конфликт требований **E2EE vs server-side recording**: серверная запись обычно требует доступного для recorder медиапотока или ключа.

### Минимальные acceptance criteria прототипа

- teacher и student подключаются только к назначенному уроку;
- camera/mic и screen share работают;
- reconnect после refresh/network switch;
- join/leave/room-ended отражаются в TeachFlow;
- TURN проверен из ограниченной корпоративной/мобильной сети;
- видео не блокирует взаимодействие с lesson workspace;
- recording либо явно выключен, либо запускается только после согласия.

---

## 7. Проверенные официальные источники

### Jitsi Meet

- [Apache-2.0 license](https://github.com/jitsi/jitsi-meet/blob/master/LICENSE)
- [IFrame API](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/)
- [IFrame commands](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe-commands/)
- [IFrame events и data channel events](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe-events/)
- [JWT token authentication](https://jitsi.github.io/handbook/docs/devops-guide/token-authentication/)
- [Deployment/resource requirements и Jibri](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-requirements/)

### LiveKit

- [Apache-2.0 license](https://github.com/livekit/livekit/blob/master/LICENSE)
- [Authentication и JWT flow](https://docs.livekit.io/home/get-started/authentication/)
- [Self-hosted deployment](https://docs.livekit.io/home/self-hosting/deployment/)
- [Ports and firewall](https://docs.livekit.io/home/self-hosting/ports-firewall/)
- [Egress recording](https://docs.livekit.io/home/egress/overview/)
- [Screen sharing](https://docs.livekit.io/home/client/tracks/screenshare/)
- [Data packets](https://docs.livekit.io/home/client/data/packets/)
- [RPC](https://docs.livekit.io/home/client/data/rpc/)
- [Webhooks and SDK events](https://docs.livekit.io/home/server/webhooks/)
- [React VideoConference](https://docs.livekit.io/reference/components/react/component/videoconference/)

### BigBlueButton

- [LGPL-3.0 license](https://github.com/bigbluebutton/bigbluebutton/blob/v3.0.x-release/LICENSE)
- [BigBlueButton 3.0 installation requirements](https://docs.bigbluebutton.org/administration/install/)
- [API and security model](https://docs.bigbluebutton.org/development/api/)
- [Webhooks](https://docs.bigbluebutton.org/development/webhooks/)
- [Server customization](https://docs.bigbluebutton.org/administration/customize/)
- [Official classroom feature set](https://bigbluebutton.org/teachers/features/)

### OpenVidu

- [OpenVidu repository license](https://github.com/OpenVidu/openvidu/blob/v3.8.0/LICENSE)
- [Developing an OpenVidu app / LiveKit compatibility](https://openvidu.io/latest/docs/developing-your-openvidu-app/)
- [Deployment types](https://openvidu.io/latest/docs/self-hosting/deployment-types/)
- [Community Single Node requirements](https://openvidu.io/latest/docs/self-hosting/single-node/on-premises/install/)
- [OpenVidu Meet Embedded](https://openvidu.io/latest/meet/embedded/intro/)
- [Iframe reference](https://openvidu.io/latest/meet/embedded/reference/iframe/)
- [Web Component commands/events](https://openvidu.io/latest/meet/embedded/reference/webcomponent/)
- [Meet REST API](https://openvidu.io/latest/meet/embedded/reference/rest-api/)
- [Meet webhooks](https://openvidu.io/latest/meet/embedded/reference/webhooks/)
- [OpenVidu releases, включая 3.8.0](https://openvidu.io/latest/docs/releases/)

### Element Call

- [Актуальный MatrixRTC/LiveKit README](https://github.com/element-hq/element-call/tree/livekit)
- [AGPL-3.0 license](https://github.com/element-hq/element-call/blob/livekit/LICENSE-AGPL-3.0)
- [Self-hosting guide](https://github.com/element-hq/element-call/blob/livekit/docs/self_hosting.md)
- [Element server-side deployment documentation](https://docs.element.io/latest/element-server-suite-classic/integrations/setting-up-element-call/)

### mediasoup

- [ISC license](https://github.com/versatica/mediasoup/blob/v3/LICENSE)
- [Architecture and low-level positioning](https://mediasoup.org/documentation/overview/)
- [Client/server signaling responsibilities](https://mediasoup.org/documentation/v3/communication-between-client-and-server/)
- [Installation requirements](https://mediasoup.org/documentation/v3/mediasoup/installation/)
- [Scaling model](https://mediasoup.org/documentation/v3/scalability/)

---

## Итог выполнения

- Проверены шесть решений: Jitsi Meet, LiveKit, BigBlueButton, OpenVidu, Element Call и mediasoup.
- Сформированы классификация, decision matrix и архитектурная рекомендация.
- **Результат:** LiveKit — основной video service для прототипа; Jitsi — iframe fallback; BBB — только как отдельная education platform.
- Файлы не создавались и не изменялись.
- Установки и изменения системы не выполнялись.
- Существенных блокирующих проблем не было; для OpenVidu отмечена необходимость отдельно подтвердить лицензионный scope OpenVidu Meet image перед production.
