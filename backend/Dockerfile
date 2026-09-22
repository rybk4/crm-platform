FROM ghcr.io/astral-sh/uv:0.12.17-python3.14-trixie-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_NO_DEV=1 \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends gettext \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml uv.lock ./
RUN uv sync --locked

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python manage.py compilemessages --ignore .venv --verbosity 0 && python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
