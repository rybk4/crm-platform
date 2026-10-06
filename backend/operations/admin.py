from django.contrib import admin

from .models import (
    Appointment, Bill, Campaign, Client, ClientLoyalty, Deal,
    LoyaltyProgram, PaymentMethod,
)


for model in (Client, Appointment, Deal, Bill, PaymentMethod, LoyaltyProgram, ClientLoyalty, Campaign):
    admin.site.register(model)
