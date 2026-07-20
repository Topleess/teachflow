## Итоговый вывод

**Для composable-ядра TeachFlow лучший кандидат — Payload CMS 3.86.x + PostgreSQL, в режиме `REUSE`, без форка.** Он дает MIT-лицензированную TypeScript/Next.js основу, собственную схему данных, auth, программируемый access control, REST/GraphQL/Local API, файловое хранилище и расширяемую React-панель. На этой базе удобно реализовать именно домен TeachFlow, а не подстраиваться под чужую модель «курс как LMS».

**H5P целесообразно подключать отдельно в режиме `WRAP` как движок интерактивных activity**, но не использовать как persistence/workflow core.

**Chamilo 2 — разумный запасной путь для быстрого пилота на готовом LMS-интерфейсе**, если проверка педагогического процесса важнее собственной UX/архитектуры. Для долгоживущего кастомного TeachFlow-core он хуже Payload из-за LMS-монолита и сосуществования Symfony/API Platform с legacy PHP.

**Moodle, Open edX и Canvas не следует форкать или превращать в headless-core.** Они полноценно реализуют учебный процесс, но интеграционная и операционная масса значительно превышает требуемый scope прототипа.

---

## Методика и ограничения

Состояние проверялось на **2026-07-19** по:

- официальным GitHub-репозиториям, тегам и релизам;
- лицензиям и manifests (`composer.json`, `package.json`, route/config files), а не только README;
- официальной документации API, архитектуры, deployment и access control;
- наличию реальной модели lesson/activity/assignment/submission, а не маркетинговому заявлению «поддерживает обучение».

Инсталляции и runtime-бенчмарки не выполнялись — согласно запросу. Интеграционная сложность ниже является архитектурной оценкой.

### Значение вердиктов

- **REUSE** — использовать как основное application/content ядро.
- **WRAP** — держать отдельным сервисом или адаптером за API/embed-контрактом.
- **FORK** — поддерживать собственную расходящуюся ветку исходников.
- **REJECT** — не использовать как ядро текущего прототипа.

---

## Decision matrix

| Решение | Актуальность на дату аудита | Лицензия | API / SDK | Embeddability | Content/workflow model | Users / roles | Persistence / self-hosting | Сложность | Вердикт |
|---|---|---|---|---|---|---|---|---|---|
| **Payload CMS** | Стабильный `v3.86.0`, 2026-07-10; активный repo | **MIT** | Автогенерируемые REST и GraphQL; Local API; REST SDK; custom endpoints | **Высокая**: работает внутри Next.js, React Admin заменяется/расширяется компонентами | Конфигурируемые Collections, Globals, Arrays, Blocks, relations. Учебного workflow из коробки нет, но модель не навязывается | Auth-enabled collections; access functions на operation/document/field; RBAC реализуется в схеме | PostgreSQL/Drizzle, MongoDB/Mongoose, SQLite/Drizzle; self-host везде, где работает Next.js; внешнее object storage для production | **Средняя**: домен нужно реализовать, но нет LMS-балласта | **REUSE — основной кандидат** |
| **Strapi 5** | `v5.50.2`, 2026-07-15 | Community-код **MIT Expat**, `ee/` — отдельная коммерческая лицензия | Авто REST CRUD, GraphQL plugin, JS Strapi Client, OpenAPI | Высокая через API; admin — авторский back office, не student UI | Collection/single types, reusable components, dynamic zones, relations. Компоненты не имеют отдельных REST endpoints; вложенные данные требуют `populate` | Бесплатные admin RBAC и end-user JWT/ACL; Author/Editor/Super Admin | PostgreSQL, MySQL/MariaDB, SQLite; media отдельно; обычный Node self-host | **Средняя–высокая**: transactional homework/progress и ownership потребуют services/controllers | **WRAP / второй выбор** |
| **Directus 12** | `v12.1.1`, 2026-07-01 | **MSCL-1.0-GPL**, source-available; запрет Competing Use; GPL только через 4 года | Dynamic REST, GraphQL, OpenAPI, dependency-free TS SDK, realtime | Технически высокая: Data Studio + API | Collections/fields/relations поверх собственной или существующей БД | Очень детальные roles, policies, item/field filters, API-only users | PostgreSQL, MySQL, SQLite, MSSQL, Oracle, CockroachDB; Docker/self-host | Технически **низкая–средняя**, юридически повышенная | **REJECT до legal review**: не соответствует строгому OSS-критерию |
| **Moodle 5.2** | Moodle 5.2 выпущен 2026-04-20; тег `v5.2.1`; активен | GPL-3.0 | External Services/web-service functions; расширяемые plugin APIs; это не единый headless CRUD API | Средняя: LTI и плагины хороши для встраивания инструментов **в Moodle**; headless/student UI поверх Moodle неудобен | Course → sections → activities/resources; assignments, submissions, quizzes, completion — зрелые | Контекстные roles/capabilities, enrolment, groups | PostgreSQL/MySQL/MariaDB/MSSQL + файловое хранилище; обычный PHP self-host | **Высокая** для custom UX, средняя для native Moodle | **REJECT как core**; использовать только если принимается Moodle UX |
| **Open edX** | Репозиторий активен; официальные страницы конфликтуют: `Ulmo.1` отмечен supported/current, при этом уже опубликован раздел `Verawood — June 2026` | AGPL-3.0 | Набор LMS REST APIs, OAuth, extension APIs; XBlock; API покрытие неоднородно | LTI, XBlock, frontend plugin slots/MFEs; компоненты тесно связаны с платформой | Course → chapter/section → sequential/subsection → vertical/unit → XBlock; problems, grading, completion | Learner/staff/admin/course roles; сложная оргструктура и permissions | Официальный Tutor/Docker; несколько сервисов и хранилищ, очереди/кэши | **Очень высокая** | **REJECT** для прототипа |
| **Canvas LMS** | Есть датированные теги 2026, включая `release/2026-05-20.143`; GitHub Releases не ведутся | AGPL-3.0 | Один из лучших LMS REST API, OAuth2; Modules, Assignments, Submissions, Roles и др. | Сильный LTI/LTI Advantage; но это прежде всего host-platform | Course → Modules → Module Items; Pages/Files/Assignments/Quizzes; submissions/grades нативно | Account/course roles, enrollments, sections, permission overrides | PostgreSQL, Redis, file/object storage; Rails; отдельный RCE API; production docs рекомендуют ≥8 GB RAM | **Очень высокая** | **REJECT как core**; `WRAP` только при институциональной интеграции |
| **Chamilo 2** | `v2.0.3`, 2026-06-29; параллельно поддерживалась ветка 1.11 | GPL-3.0-or-later | Symfony 6.4 + Doctrine + **API Platform 3**, JWT; `/api` route подтвержден кодом | REST/JWT и LTI 1.3; можно обернуть, но UI/workflows монолитны | Courses, documents, learning paths, exercises, assignments, gradebook, sessions | Пользователи/курсы/сессии; новый roles/permissions management помечен как beta | MariaDB/MySQL; Flysystem local/S3/Azure/GCS; PHP self-host | **Средняя–высокая**; код содержит Symfony bundles и legacy classmap | **WRAP как disposable native-LMS pilot**, не основной core |
| **H5P core/editor/content types** | PHP core обновлялся в июле 2026; экосистема разбита на множество repos/tags | Смешанная: PHP core GPL-3.0; editor и многие content types MIT; проверять каждый тип | Не обычный SaaS API/SDK. PHP interfaces `H5PFrameworkInterface`, `H5peditorStorage`; JS events/xAPI | **Очень высокая**: iframe/div embed, H5P package | Интерактивные content types и их semantic schemas; нет Course/Enrollment/Homework/Submission aggregate | Собственной полноценной модели пользователей/ролей нет — предоставляет host | Host обязан реализовать DB/files/results/user state | **Средняя–высокая** при нативной интеграции; ниже через iframe | **WRAP только как activity engine** |
| **Adapt Framework + Authoring** | Framework `v5.56.2`, 2026-04-13; Authoring последний formal release `v0.11.5` от 2025-01, хотя repo менялся в 2026 | GPL-3.0 | У authoring есть внутренние APIs/permissions, но нет современного универсального public SDK | Экспорт responsive HTML5 для web/SCORM; xAPI через plugin | Course/article/block/component, assessments, locking/bookmarking; ориентирован на публикацию пакета | Authoring multi-user, super admin/permissions; runtime learner identity обычно приходит от LMS | Authoring: Node 16/18-era stack, Backbone, MongoDB; runtime — статический export, SCORM/LMS | **Высокая** из-за устаревающего authoring stack и split authoring/runtime | **WRAP только для экспортируемых длинных lessons**, иначе REJECT |

---

## Что фактически соответствует workflow TeachFlow

### Большие LMS

Moodle, Open edX, Canvas и Chamilo уже содержат:

- студентов и зачисления;
- структуру курса/уроков;
- материалы и activities;
- assignments/homework;
- submissions/attempts;
- grades/feedback/progress.

Но это не «content core». В них данные, permissions, URL, рендеринг и жизненный цикл activity привязаны к LMS runtime. Наличие REST или LTI не превращает такую систему в headless:

- **LTI обычно встраивает внешний tool внутрь LMS**, а не делает LMS удобным встраиваемым модулем TeachFlow;
- собственный student UI придется постоянно согласовывать с LMS semantics и permission model;
- fork большой LMS создаст постоянную стоимость rebasing, security fixes и migrations.

Из готовых LMS **Chamilo 2 ближе всего к допустимому wrapper**, потому что новая архитектура уже использует Symfony, Doctrine, API Platform, JWT и Flysystem. Однако код `v2.0.3` одновременно содержит современные bundles и большие legacy classmaps. Это серьезный сигнал против превращения Chamilo в долгосрочный headless-core.

### Headless CMS

Strapi, Directus и Payload не содержат homework workflow из коробки. Их преимущество — возможность моделировать TeachFlow напрямую.

- **Strapi** удобен для редакционного content model, но student users отделены от admin authors, а сложные правила «студент видит только свои submission/attempt» потребуют собственного service/policy слоя.
- **Directus** технически особенно силен по row/field permissions и existing-database model. Но версия 12 распространяется не под OSI-лицензией. Для проприетарного TeachFlow SaaS применение может оказаться разрешенным, если продукт не конкурирует с Directus, но это должен подтвердить юрист; называть Directus 12 безусловно open-source нельзя.
- **Payload** лучше совпадает с application-core: schema, auth, workflow code и UI находятся в одной TypeScript/Next.js кодовой базе, а доступ можно задавать функциями вплоть до документа и поля.

### Lesson/activity authoring

- **H5P** — лучший дополнительный движок для quiz/interactive video/course presentation и подобных activity. Он не заменяет Assignment, Submission, Feedback или Enrollment.
- **Adapt** хорош для автономного длинного responsive lesson, экспортируемого как web/SCORM bundle. Это publication toolchain, а не live multi-user application core.

---

## Рекомендуемая архитектура прототипа

### 1. Основное ядро: Payload + PostgreSQL

Минимальные Collections:

1. `users`
   - роли: `student`, `teacher`, `content_editor`, `admin`;
2. `courses` или `classes`;
3. `enrollments`
   - связь user ↔ course, роль и статус;
4. `lessons`
   - порядок, publication status, prerequisites;
5. `lessonItems`
   - discriminated/Blocks-модель:
     - text,
     - material/file/link/video,
     - embedded activity,
     - homework;
6. `activities`
   - тип, definition/config, scoring policy;
7. `assignments`
   - due date, instructions, allowed submission types;
8. `submissions`
   - student, assignment, attempt number, files/text/status;
9. `activityAttempts`;
10. `feedback` / `grades`;
11. `progress`;
12. `assets`.

### 2. Access control

- student читает только доступные lessons и свои attempts/submissions;
- teacher видит материалы и работы только своих classes;
- content editor меняет definitions, но не student submissions;
- admin управляет схемой и пользователями.

**Критическая оговорка Payload:** Local API по умолчанию может обходить access control. Для любых вызовов от имени пользователя необходимо передавать user context и явно использовать `overrideAccess: false`; privileged server jobs должны быть отделены и аудироваться.

### 3. H5P через адаптер

Хранить в TeachFlow:

- идентификатор/версию H5P content;
- launch/embed URL;
- mapping activity → H5P;
- нормализованные `attempt`, `score`, `completion`;
- исходные xAPI/event payloads для аудита.

Не делать H5P источником истины для enrollment, deadline, homework submission или grade workflow.

### 4. Не форкать

Для прототипа **нет кандидата, который следует форкать**:

- Payload расширяется schema/hooks/endpoints/components;
- H5P изолируется адаптером;
- большие LMS должны либо использоваться неизмененными как отдельные продукты, либо не использоваться.

---

## Альтернативная ветка для очень быстрого операционного пилота

Если приоритет — за несколько недель проверить действия преподавателя и студента, а фирменный интерфейс пока не важен:

- развертывать **Chamilo 2 без форка**;
- использовать его native course/learning path/assignment/gradebook;
- интеграции вести через JWT/API Platform/LTI;
- считать это **disposable pilot**, не закладывать его DB/entities как контракт будущего TeachFlow.

Moodle также способен на такой пилот, но его более широкая plugin/capability model даст меньше пользы при данном узком scope.

---

## Ключевые официальные источники

### Moodle

- [Repository](https://github.com/moodle/moodle)
- [Moodle 5.2 release — 20 April 2026](https://moodledev.io/general/releases/5.2)
- [External Services API](https://moodledev.io/docs/5.2/apis/subsystems/external)
- [API guides](https://moodledev.io/docs/5.2/apis)

### Open edX

- [edx-platform repository](https://github.com/openedx/edx-platform)
- [Platform release notes](https://docs.openedx.org/en/latest/community/release_notes/index.html)
- [Named release branches/tags](https://docs.openedx.org/en/latest/community/release_notes/named_release_branches_and_tags.html)
- [LMS APIs](https://docs.openedx.org/projects/edx-platform/en/latest/references/lms_apis.html)
- [Tutor — official Docker distribution](https://docs.tutor.edly.io/)

### Canvas

- [canvas-lms repository](https://github.com/instructure/canvas-lms)
- [REST API overview](https://developerdocs.instructure.com/services/canvas)
- [Modules API](https://developerdocs.instructure.com/services/canvas/resources/modules)
- [Assignments API](https://developerdocs.instructure.com/services/canvas/resources/assignments)
- [Submissions API](https://developerdocs.instructure.com/services/canvas/resources/submissions)
- [LTI](https://developerdocs.instructure.com/services/canvas/external-tools/lti)
- [Production installation](https://github.com/instructure/canvas-lms/wiki/Production-Start)

### Chamilo

- [Repository / v2.0.3](https://github.com/chamilo/chamilo-lms/tree/v2.0.3)
- [Release v2.0.3](https://github.com/chamilo/chamilo-lms/releases/tag/v2.0.3)
- [Chamilo 2 developer guide](https://docs.chamilo.org/developer-guide/)
- [Teacher workflow guide](https://docs.chamilo.org/teacher-guide/)
- [Composer manifest](https://github.com/chamilo/chamilo-lms/blob/v2.0.3/composer.json)
- [API Platform route](https://github.com/chamilo/chamilo-lms/blob/v2.0.3/config/routes/api_platform.yaml)

### Strapi

- [Repository / releases](https://github.com/strapi/strapi/releases)
- [License](https://github.com/strapi/strapi/blob/v5.50.2/LICENSE)
- [REST API](https://docs.strapi.io/cms/api/rest)
- [Strapi Client](https://docs.strapi.io/cms/api/client)
- [Content-type Builder](https://docs.strapi.io/cms/features/content-type-builder)
- [Admin RBAC](https://docs.strapi.io/cms/features/rbac)
- [End-user permissions](https://docs.strapi.io/cms/features/users-permissions)
- [Database support](https://docs.strapi.io/cms/configurations/database)

### Directus

- [Repository / releases](https://github.com/directus/directus/releases)
- [MSCL license](https://github.com/directus/directus/blob/v12.1.1/license)
- [Architecture](https://directus.io/docs/getting-started/architecture)
- [API reference](https://directus.io/docs/api)
- [TypeScript SDK](https://directus.io/docs/guides/connect/sdk)
- [Access control](https://directus.io/docs/guides/auth/access-control)
- [Database configuration](https://directus.io/docs/configuration/database)

### Payload

- [Repository / releases](https://github.com/payloadcms/payload/releases)
- [MIT license](https://github.com/payloadcms/payload/blob/main/LICENSE.md)
- [Architecture overview](https://payloadcms.com/docs/getting-started/what-is-payload)
- [REST API](https://payloadcms.com/docs/rest-api/overview)
- [GraphQL](https://payloadcms.com/docs/graphql/overview)
- [Local API](https://payloadcms.com/docs/local-api/overview)
- [Access control](https://payloadcms.com/docs/access-control/overview)
- [Database adapters](https://payloadcms.com/docs/database/overview)
- [Custom React components](https://payloadcms.com/docs/custom-components/overview)
- [Deployment](https://payloadcms.com/docs/production/deployment)

### H5P и Adapt

- [H5P PHP core](https://github.com/h5p/h5p-php-library)
- [H5P editor library](https://github.com/h5p/h5p-editor-php-library)
- [H5P platform integration guide](https://h5p.org/creating-your-own-h5p-plugin)
- [Adapt Authoring repository](https://github.com/adaptlearning/adapt_authoring)
- [Adapt Framework repository](https://github.com/adaptlearning/adapt_framework)
- [Adapt Framework v5.56.2](https://github.com/adaptlearning/adapt_framework/releases/tag/v5.56.2)

---

## Краткий отчет о выполнении

- Проверены **9 решений**: Moodle, Open edX, Canvas, Chamilo, Strapi, Directus, Payload, H5P и Adapt.
- Сопоставлены лицензии, фактическая активность/релизы, API, embedding, content model, roles, persistence, self-hosting и интеграционная сложность.
- Основная рекомендация: **Payload `REUSE` + H5P `WRAP`**, PostgreSQL как source of truth; **не форкать**.
- Запасной disposable pilot: **Chamilo 2 без форка**, если можно принять native LMS UX.
- Файлы не создавались и не изменялись.
- Ограничения при исследовании: GitHub API исчерпал анонимный rate limit, browser proxy был недоступен; проверка продолжена через официальные HTML/raw GitHub страницы и документацию. В документации Open edX обнаружено расхождение между `Ulmo` как current/supported и опубликованным разделом `Verawood — June 2026`; поэтому стабильным подтвержденным baseline указан Ulmo.
