from calendar import c

from django.contrib import admin

# Register your models here.
class userAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role')
    search_fields = ('username', 'email', 'role')