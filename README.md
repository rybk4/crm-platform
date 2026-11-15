# CRM Platform

Django-бэкенд и React-фронтенд для внутренней CRM.

```
backend/   Django + DRF: модели на общем BaseMixin (UUID, мягкое удаление)
crm/       React 19 + TypeScript + Vite
```

## Запуск одной командой

```bash
cp .env.example .env
docker compose up
```

Поднимутся четыре сервиса:

| Сервис     | Адрес                 | Что это                                   |
| ---------- | --------------------- | ----------------------------------------- |
| `frontend` | http://localhost:5173 | vite с горячей перезагрузкой              |
| `backend`  | http://localhost:8000 | django runserver, миграции накатятся сами |
| `db`       | localhost:5432        | PostgreSQL                                |
| `redis`    | localhost:6379        | Redis                                     |

Открывать нужно **http://localhost:5173** — фронтенд проксирует `/api` на бэкенд,
поэтому браузер видит один источник и CORS не нужен.

Исходники смонтированы внутрь контейнеров: правки в `backend/` и `crm/`
подхватываются без пересборки. Пересборка нужна только после изменения
зависимостей:

```bash
docker compose up --build
```

Полезное:

```bash
docker compose logs -f backend          # логи одного сервиса
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py test
docker compose exec frontend npm test
docker compose down                     # остановить
docker compose down -v                  # остановить и стереть данные БД
```

Платформа работает через реальный Django API: вход по одноразовому коду,
организации и филиалы, специалисты, услуги, клиенты, журнал, сделки и оплаты,
финансы, лояльность, рассылки, аналитика и настройки. Для автономной демонстрации
можно включить встроенные данные: `VITE_DEMO_DATA=on`.

Вход доступен только существующим активным пользователям: неизвестный номер
отклоняется при запросе кода. Аккаунт и организацию создают заранее через админку.
При `DEBUG=true` после запроса кода принимается любой четырёхзначный код.
При `DEBUG=false` проверяется выданный код и срок его действия. Код не возвращается
в ответе API и не отображается в интерфейсе.

Фронтенд стартует, не дожидаясь готовности бэкенда: пока тот поднимается,
в интерфейсе висит плашка «сервер недоступен», которая сама снимется, как
только `/api/health/` ответит.

### Админка

При старте контейнера создаётся суперпользователь **`admin` / `admin`** —
http://localhost:8000/admin/. Телефон и остальные поля заполняются там же.

Команда идемпотентна: существующего пользователя не трогает и пароль не
перезаписывает. Вручную — `docker compose exec backend python manage.py createdevadmin`.

При `DEBUG=false` она ничего не делает, чтобы слабый пароль не уехал на прод.
Если суперпользователь нужен и там:

```bash
docker compose exec backend python manage.py createdevadmin --force --password <свой-пароль>
```

Логины и пароли настраиваются переменными `DJANGO_ADMIN_USERNAME` и
`DJANGO_ADMIN_PASSWORD` либо флагами `--username` / `--password`.

## Запуск без docker

Бэкенд:

```bash
cd backend
uv sync
cp ../.env.example .env        # без DATABASE_URL возьмётся локальный sqlite
uv run python manage.py migrate
uv run python manage.py runserver
```

Фронтенд:

```bash
cd crm
npm install
npm run dev
```

По умолчанию vite проксирует `/api` на `http://127.0.0.1:8000`.

## Тестовые данные журнала

```bash
docker compose exec backend python manage.py seedjournal
```

Команда работает при `DEBUG=true` и добавляет данные в активные филиалы: шесть
специалистов, 12 услуг, 24 клиента и 24 записи в день за период от трёх дней назад
до семи дней вперёд. Создаются расписания, сделки и способы оплаты. Повторный
запуск не перезаписывает существующие данные и не восстанавливает удалённые записи.
Для одного филиала передайте `--branch <UUID>`, для другой даты — `--date YYYY-MM-DD`.

## Проверки здоровья

- `GET /api/health/` — готовность: проверяет базу, отвечает 503, если она недоступна.
  Её опрашивают docker healthcheck и фронтенд.
- `GET /api/health/live/` — живость процесса, отвечает всегда.

## Основные API

- `/api/auth/otp/request/`, `/api/auth/otp/verify/`, `/api/auth/token/refresh/` — сессия;
- `/api/clients/`, `/api/specialists/`, `/api/services/`, `/api/appointments/`;
- `/api/deals/`, `/api/bills/`, `/api/payment-methods/`;
- `/api/loyalty/programs/`, `/api/loyalty/accounts/`, `/api/campaigns/`;
- `/api/analytics/summary/`, `/api/organization/profile/`, `/api/branches/`.

Для реальной доставки рассылок укажите `CRM_CAMPAIGN_WEBHOOK_URL` и, при
необходимости, `CRM_CAMPAIGN_WEBHOOK_TOKEN`. Без webhook рассылка сохраняется
со статусом «Ожидает отправки», без фиктивного счётчика доставок.

## Правила разработки

Соглашения по фронтенду обязательны и лежат в [crm/RULES.md](crm/RULES.md).
