
from django.contrib import admin
from .models import Task, LifeCategory, PlayerProfile, Achievement


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "priority",
        "is_completed",
        "xp_reward",
        "created_at",
    )

    list_filter = (
        "is_completed",
        "priority",
        "category",
    )

    search_fields = ("title", "description")

    list_editable = ("is_completed", "priority")

    ordering = ("is_completed", "-created_at")







@admin.register(LifeCategory)
class LifeCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "color", "icon")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(PlayerProfile)
class PlayerProfileAdmin(admin.ModelAdmin):
    list_display = ("nickname", "total_xp", "created_at")


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ("name", "required_xp")