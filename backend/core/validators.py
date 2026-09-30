from django.core.validators import RegexValidator


phone_validator = RegexValidator(
    regex=r"^\+[1-9]\d{7,14}$",
    message="Введите номер в международном формате, например +77001234567.",
)
